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
