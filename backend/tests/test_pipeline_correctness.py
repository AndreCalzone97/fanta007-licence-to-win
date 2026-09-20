import json
from pathlib import Path
from dataclasses import replace

import pytest

from app.data.historical_importer import ImportedPlayerStats, merge_player_statistics
from app.data.normalizer import normalize_dataset
from app.domain.player import PlayerSeasonStats
from backend.scripts.activate_dataset_candidate import activate_candidate
from backend.scripts.diff_player_datasets import build_diff


def with_stats(dataset, **values):
    stats = PlayerSeasonStats(season="2025/26", competition="Serie A", source="Fantacalcio.it", appearances=30, goals=0)
    stats = stats.model_copy(update=values)
    player = dataset.players[0].model_copy(update={"statistics": [stats]})
    return dataset.model_copy(update={"players": [player, *dataset.players[1:]]})


def test_statistical_correction_is_visible(player_dataset):
    current = with_stats(player_dataset)
    candidate = with_stats(player_dataset, goals=1)
    report = build_diff(current, candidate)
    assert report["summary"]["changed"] == 1
    assert "statistics" in report["changed"][0]["changes"]
    assert "statistics" in report["changed"][0]["categories"]
    json.dumps(report)  # Nested models must be JSON serializable.


@pytest.mark.parametrize("correction", [{"goals": 1}, {"appearances": 29}, {"goals": None}])
def test_same_priority_correction_replaces_old_record(player_dataset, correction):
    current = with_stats(player_dataset)
    player = current.players[0]
    incoming = player.statistics[0].model_copy(update=correction)
    row = ImportedPlayerStats(player.id, player.name, player.role_classic, incoming)
    merged = merge_player_statistics(current, [(300, [row])])
    assert merged.players[0].statistics == [incoming]
    assert current.players[0].statistics[0].goals == 0


def test_duplicate_ids_cannot_be_activated(player_dataset, tmp_path):
    current_path, candidate_path = tmp_path / "current.json", tmp_path / "candidate.json"
    current_path.write_text(player_dataset.model_dump_json(), encoding="utf-8")
    candidate = player_dataset.model_copy(update={
        "players": [player_dataset.players[0], *player_dataset.players[:-1]],
        "metadata": player_dataset.metadata.model_copy(update={"status": "candidate"}),
    })
    candidate_path.write_text(candidate.model_dump_json(), encoding="utf-8")
    before = current_path.read_bytes()
    with pytest.raises(ValueError, match="duplicat"):
        activate_candidate(current_path, candidate_path, tmp_path / "archive")
    assert current_path.read_bytes() == before
    assert not (tmp_path / "archive").exists()


def test_normalizer_rejects_inconsistent_delta(raw_players, source_path):
    rows = [replace(raw_players[0], quotation_delta=99), *raw_players[1:]]
    with pytest.raises(ValueError, match="Diff"):
        normalize_dataset(rows, source_path)


def test_csv_import_produces_candidate(player_dataset, tmp_path, monkeypatch):
    from backend.scripts.import_historical_stats import main
    current = tmp_path / "current.json"
    csv = tmp_path / "stats.csv"
    output = tmp_path / "candidate.json"
    dataset = player_dataset.model_copy(update={"metadata": player_dataset.metadata.model_copy(update={"status": "active"})})
    current.write_text(dataset.model_dump_json(), encoding="utf-8")
    before = current.read_bytes()
    csv.write_text("Calciatore;Sq;PV;MV;FM;Gol;Ass\nLocatelli;Juventus;30;6,5;7;1;2\n", encoding="utf-8")
    monkeypatch.setattr("sys.argv", ["import_historical_stats", "--dataset", str(current), "--csv", str(csv), "--season", "2025/26", "--source-url", "https://example.test", "--output", str(output), "--report", str(tmp_path / "report.json")])
    main()
    assert json.loads(output.read_text())["metadata"]["status"] == "candidate"
    assert current.read_bytes() == before


def test_fractional_statistic_is_rejected(write_workbook):
    from app.data.historical_importer import read_fantacalcio_xlsx
    source = write_workbook("fraction.xlsx", ["Id", "R", "Nome", "Pv"], [[827, "C", "Locatelli", 1.5]])
    with pytest.raises(ValueError, match="intero"):
        read_fantacalcio_xlsx(source, "2025/26", "https://example.test")


@pytest.mark.parametrize("defect, message", [("ids", "duplicat"), ("count", "player_count"), ("delta", "Diff"), ("seasons", "duplicate"), ("negative", "greater than or equal")])
def test_invalid_candidate_never_changes_files(player_dataset, tmp_path, defect, message):
    dataset = with_stats(player_dataset)
    payload = dataset.model_dump(mode="json")
    payload["metadata"]["status"] = "candidate"
    if defect == "ids":
        payload["players"][-1]["id"] = payload["players"][0]["id"]
    elif defect == "count":
        payload["metadata"]["player_count"] += 1
    elif defect == "delta":
        payload["players"][0]["quotation_delta_mantra"] = 999
    elif defect == "seasons":
        payload["players"][0]["statistics"] *= 2
    else:
        payload["players"][0]["statistics"][0]["goals"] = -1
    current, candidate = tmp_path / "current.json", tmp_path / "candidate.json"
    current.write_text(dataset.model_dump_json(), encoding="utf-8")
    candidate.write_text(json.dumps(payload), encoding="utf-8")
    before = (current.read_bytes(), candidate.read_bytes())
    with pytest.raises(ValueError, match=message):
        activate_candidate(current, candidate, tmp_path / "archive")
    assert (current.read_bytes(), candidate.read_bytes()) == before
    assert not (tmp_path / "archive").exists()
    assert not current.with_suffix(".json.tmp").exists()


@pytest.mark.parametrize("operation", ["diff", "merge", "normalize"])
def test_duplicate_existing_ids_rejected_before_reconciliation(player_dataset, raw_players, source_path, operation):
    bad = player_dataset.model_copy(update={"players": [player_dataset.players[0], *player_dataset.players[:-1]]})
    with pytest.raises(ValueError, match="duplicat"):
        if operation == "diff":
            build_diff(player_dataset, bad)
        elif operation == "merge":
            merge_player_statistics(bad, [])
        else:
            normalize_dataset(raw_players, source_path, existing_dataset=bad)


def test_normalizer_rejects_duplicate_incoming_ids(raw_players, source_path):
    with pytest.raises(ValueError, match="duplicat"):
        normalize_dataset([raw_players[0], *raw_players], source_path)


def test_merge_priority_order_and_final_validity(player_dataset):
    from app.data.validation import validate_dataset
    current = with_stats(player_dataset)
    player = current.players[0]
    def row(goals, source="Fantacalcio.it"):
        return ImportedPlayerStats(player.id, player.name, player.role_classic, player.statistics[0].model_copy(update={"goals": goals, "source": source}))
    corrected = row(2)
    fallback = row(99, "Fantacalcio.it EuroLeghe")
    merged = merge_player_statistics(current, [(300, [row(1)]), (300, [corrected]), (200, [fallback])])
    assert merged.players[0].statistics == [corrected.stats]
    assert merged.players[1:] == current.players[1:]
    assert validate_dataset(merged) == merged
    assert merge_player_statistics(merged, [(300, [corrected])]) == merged


def test_duplicate_keys_in_one_stats_batch_are_rejected(player_dataset):
    current = with_stats(player_dataset)
    p = current.players[0]
    row = ImportedPlayerStats(p.id, p.name, p.role_classic, p.statistics[0])
    with pytest.raises(ValueError, match="duplicato nel batch"):
        merge_player_statistics(current, [(300, [row, row])])


def test_invalid_stats_model_copy_cannot_enter_merge(player_dataset):
    current = with_stats(player_dataset)
    p = current.players[0]
    row = ImportedPlayerStats(p.id, p.name, p.role_classic, p.statistics[0].model_copy(update={"goals": -1}))
    with pytest.raises(ValueError):
        merge_player_statistics(current, [(300, [row])])


@pytest.mark.parametrize("field, value", [("aliases", ["New alias"]), ("image", None), ("external_ids", {"fantacalcio": "corrected"})])
def test_enrichment_changes_are_visible(player_dataset, field, value):
    from app.domain.player import PlayerDataset
    payload = player_dataset.model_dump(mode="json")
    payload["players"][0][field] = value
    report = build_diff(player_dataset, PlayerDataset.model_validate(payload))
    assert report["summary"]["changed"] == 1
    assert field in report["changed"][0]["changes"]
    json.dumps(report)


def test_json_formatting_and_player_order_do_not_create_changes(player_dataset):
    from app.domain.player import PlayerDataset
    payload = player_dataset.model_dump(mode="json")
    payload["players"].reverse()
    candidate = PlayerDataset.model_validate_json(json.dumps(payload, indent=4, sort_keys=True))
    report = build_diff(player_dataset, candidate)
    assert report["summary"]["changed"] == 0
    assert report["summary"]["added"] == report["summary"]["removed"] == 0


def test_valid_correction_diff_and_activation(player_dataset, tmp_path):
    from app.data.validation import validate_dataset
    current = with_stats(player_dataset)
    candidate = with_stats(player_dataset, goals=1)
    candidate.metadata.status = "candidate"
    assert build_diff(current, candidate)["summary"]["changed"] == 1
    current_path, candidate_path = tmp_path / "current.json", tmp_path / "candidate.json"
    current_path.write_text(current.model_dump_json(), encoding="utf-8")
    candidate_path.write_text(candidate.model_dump_json(), encoding="utf-8")
    before = current_path.read_bytes()
    active, backup = activate_candidate(current_path, candidate_path, tmp_path / "archive", expected_source_sha256=candidate.metadata.source_sha256)
    assert active.players[0].statistics[0].goals == 1
    assert active.metadata.status == "active"
    assert validate_dataset(active) == active
    assert backup.read_bytes() == before
    assert json.loads(current_path.read_text())["players"][0]["statistics"][0]["goals"] == 1


def test_candidate_failed_audit_is_not_written(player_dataset, quotation_source, tmp_path, monkeypatch):
    from backend.scripts.prepare_dataset_candidate import main
    PROJECT_ROOT = Path(__file__).resolve().parents[2]
    current, aliases, output = tmp_path / "current.json", tmp_path / "aliases.json", tmp_path / "candidate.json"
    current.write_text(player_dataset.model_dump_json(), encoding="utf-8")
    aliases.write_text("{}", encoding="utf-8")
    output.write_text("existing candidate must survive", encoding="utf-8")
    monkeypatch.setattr("sys.argv", ["prepare", "--source", str(quotation_source), "--current", str(current), "--aliases", str(aliases), "--teams", str(PROJECT_ROOT / "data/manual/teams.2026-27.json"), "--output", str(output), "--audit-json", str(tmp_path / "audit.json"), "--audit-markdown", str(tmp_path / "audit.md")])
    with pytest.raises(ValueError, match="Candidato non valido"):
        main()  # Four synthetic teams cannot satisfy the full twenty-team catalog.
    assert output.read_text() == "existing candidate must survive"
    assert json.loads((tmp_path / "audit.json").read_text())["status"] == "invalid"


@pytest.mark.parametrize("invalid", [False, True])
def test_stats_workbook_is_closed_on_early_return_and_error(write_workbook, monkeypatch, invalid):
    import app.data.historical_importer as importer
    source = write_workbook("close.xlsx", [], [])
    if invalid:
        source = write_workbook("close.xlsx", ["Id", "Nome", "Pv"], [[827, "Test", 1.5]])
    workbook = importer.load_workbook(source, read_only=True, data_only=True)
    closed = []
    original_close = workbook.close
    def close():
        closed.append(True)
        original_close()
    monkeypatch.setattr(workbook, "close", close)
    monkeypatch.setattr(importer, "load_workbook", lambda *args, **kwargs: workbook)
    if invalid:
        with pytest.raises(ValueError):
            importer.read_fantacalcio_xlsx(source, "2025/26", "https://example.test")
    else:
        assert importer.read_fantacalcio_xlsx(source, "2025/26", "https://example.test") == []
    assert closed == [True]
