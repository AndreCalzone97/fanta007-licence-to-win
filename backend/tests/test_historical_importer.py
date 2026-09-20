from openpyxl import Workbook

from app.data.historical_importer import ImportedPlayerStats, merge_player_statistics, read_fantacalcio_xlsx, read_historical_csv


def test_historical_csv_preserves_missing_values(tmp_path):
    source = tmp_path / "stats.csv"
    source.write_text("Calciatore;Sq;PV;MV;FM;Gol;Ass\nPaz N.;COM;34;6,48;7,12;9;7\nTest;ROM;1;;;0;\n", encoding="utf-8")
    rows = read_historical_csv(source, "2025/26", "https://example.test")

    assert rows[0][0] == "Paz N."
    assert rows[0][2].average_rating == 6.48
    assert rows[0][2].fantasy_average == 7.12
    assert rows[1][2].fantasy_average is None


def test_fantacalcio_xlsx_uses_exact_id_and_preserves_unknown_rating(tmp_path, player_dataset):
    source = tmp_path / "stats.xlsx"
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Tutti"
    sheet.append(["Statistiche"])
    sheet.append(["Id", "R", "Nome", "Squadra", "Pv", "Mv", "Fm", "Gf", "Ass"])
    target = player_dataset.players[0]
    sheet.append([target.id, target.role_classic, target.name, target.team, 0, 0, 0, 0, 0])
    sheet.append([999999, "A", "Nome omonimo", "ROM", 10, 7, 8, 2, 1])
    workbook.save(source)
    rows = read_fantacalcio_xlsx(source, "2026/27", "https://example.test")

    assert [row.player_id for row in rows] == [target.id, 999999]
    assert rows[0].stats.average_rating is None
    assert rows[0].stats.fantasy_average is None
    assert rows[0].stats.goals == 0
    assert rows[0].stats.source == "Fantacalcio.it"


def test_merge_prefers_serie_a_over_euroleghe(player_dataset):
    target = player_dataset.players[0]
    from app.domain.player import PlayerSeasonStats
    fallback = PlayerSeasonStats(season="2025/26", competition="EuroLeghe", source="Fantacalcio.it EuroLeghe", appearances=3, fantasy_average=5)
    primary = PlayerSeasonStats(season="2025/26", competition="Serie A", source="Fantacalcio.it", appearances=3, fantasy_average=8)
    merged = merge_player_statistics(player_dataset, [(200, [ImportedPlayerStats(target.id, target.name, target.role_classic, fallback)]), (300, [ImportedPlayerStats(target.id, target.name, target.role_classic, primary)])])
    record = next(entry for entry in merged.players[0].statistics if entry.season == "2025/26")
    assert record.source == "Fantacalcio.it"
    assert record.fantasy_average == 8


def test_synthetic_excel_stats_round_trip_all_fields(write_workbook, player_dataset, tmp_path):
    from app.domain.player import PlayerDataset

    headers = ["Id", "R", "Nome", "Squadra", "Pv", "Mv", "Fm", "Gf", "Gs",
               "Rp", "Rc", "R+", "R-", "Ass", "Amm", "Esp", "Au"]
    # Distinct values catch column swaps; repeated ID checks largest sample selection.
    path = write_workbook("all-stats.xlsx", headers, [
        [827, "C", "Locatelli", "Juventus", 1, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [827, "C", "Locatelli", "Juventus", 30, 6.25, 7.5, 8, 9, 2, 7, 4, 3, 6, 5, 1, 10],
        [6875, "C", "Paz N.", "Como", 0, 0, 0, 0, None, None, None, None, None, 0, None, None, None],
        [999999, "A", "Unknown", "Roma", 10, 6, 7, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    ])
    imported = read_fantacalcio_xlsx(path, "2026/27", "https://example.test")
    merged = merge_player_statistics(player_dataset, [(300, imported)])
    output = tmp_path / "players.json"
    output.write_text(merged.model_dump_json(), encoding="utf-8")
    reloaded = PlayerDataset.model_validate_json(output.read_text(encoding="utf-8"))
    active = {(p.id, s.season): s for p in reloaded.players for s in p.statistics}
    assert set(active) == {(827, "2026/27"), (6875, "2026/27")}
    expected = {
        "appearances": 30, "average_rating": 6.25, "fantasy_average": 7.5,
        "goals": 8, "goals_conceded": 9, "penalties_saved": 2, "penalties_taken": 7,
        "penalties_scored": 4, "penalties_missed": 3, "assists": 6,
        "yellow_cards": 5, "red_cards": 1, "own_goals": 10,
    }
    for field, value in expected.items():
        assert getattr(active[(827, "2026/27")], field) == value, field
    no_sample = active[(6875, "2026/27")]
    assert no_sample.appearances == 0
    assert no_sample.average_rating is None
    assert no_sample.fantasy_average is None
    assert no_sample.goals == no_sample.assists == 0
    assert no_sample.goals_conceded is None
    assert all(player.statistics == [] for player in player_dataset.players)
