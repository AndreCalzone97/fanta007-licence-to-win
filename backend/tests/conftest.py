from dataclasses import astuple
import hashlib
from pathlib import Path

import pytest
from openpyxl import Workbook

from app.data.excel_parser import RawPlayerRow
from app.data.normalizer import normalize_player
from app.domain.player import DatasetMetadata, PlayerDataset


PROJECT_ROOT = Path(__file__).resolve().parents[2]


@pytest.fixture
def raw_players():
    """Small invented valuations; familiar identities retain search regression cases."""
    return [
        RawPlayerRow(827, "C", "M;C", "Locatelli", "Juventus", 9, 10, -1, 10, 10, 0, 33, 38),
        RawPlayerRow(6875, "C", "T;A", "Paz N.", "Como", 20, 18, 2, 21, 19, 2, 100, 110),
        RawPlayerRow(2764, "A", "Pc", "Martinez L.", "Inter", 30, 28, 2, 30, 28, 2, 150, 150),
        RawPlayerRow(5116, "P", "Por", "Martinez J.", "Inter", 5, 5, 0, 5, 5, 0, 10, 10),
        RawPlayerRow(5841, "D", "Dc", "Test Defender", "Roma", 4, 5, -1, 4, 5, -1, 20, 20),
        RawPlayerRow(9001, "D", "Ds", "Other Defender", "Roma", 5, 5, 0, 5, 5, 0, 20, 20),
        RawPlayerRow(9002, "A", "Pc", "Malen", "Roma", 15, 12, 3, 15, 12, 3, 60, 60),
        RawPlayerRow(9003, "A", "Pc", "Test Striker", "Inter", 8, 8, 0, 8, 8, 0, 30, 30),
        RawPlayerRow(9004, "A", "Pc", "Other Striker", "Inter", 7, 8, -1, 7, 8, -1, 25, 25),
    ]


@pytest.fixture
def aliases():
    def image(license):
        return dict(url="https://example.test/portrait.jpg", source="Wikimedia Commons",
                    author="Test Author", license=license,
                    attribution_url="https://example.test/attribution")
    return {
        827: {"display_name": "Manuel Locatelli", "image": image("CC BY-SA 4.0")},
        6875: {"display_name": "Nico Paz", "image": image("CC0 1.0")},
        2764: {"display_name": "Lautaro Martinez"},
        5116: {"display_name": "Josep Martinez"},
        9002: {"display_name": "Donyell Malen"},
    }


@pytest.fixture
def source_path(tmp_path):
    """Normalization hashes bytes; it does not parse the source format."""
    source = tmp_path / "source.txt"
    source.write_bytes(b"deterministic synthetic source\n")
    return source


@pytest.fixture
def player_dataset(raw_players, aliases):
    # No parser or filesystem involved in service/API fixture setup.
    players = [normalize_player(row, aliases) for row in raw_players]
    return PlayerDataset(metadata=DatasetMetadata(
        season="2026/27", source_file="synthetic", source_sha256=hashlib.sha256(b"synthetic").hexdigest(),
        sheet="Tutti", player_count=len(players),
    ), players=players)


@pytest.fixture
def write_workbook(tmp_path):
    """Exercise real XLSX I/O only in file integration tests."""
    def write(name, headers, rows, sheet_name="Tutti"):
        path = tmp_path / name
        workbook = Workbook()
        sheet = workbook.active
        sheet.title = sheet_name
        sheet.append(["Synthetic test export"])
        sheet.append(headers)
        for row in rows:
            sheet.append(row)
        workbook.save(path)
        workbook.close()
        return path
    return write


@pytest.fixture
def quotation_source(raw_players, write_workbook):
    # Literal contract, intentionally independent of production EXPECTED_HEADERS.
    headers = ["Id", "R", "RM", "Nome", "Squadra", "Qt.A", "Qt.I", "Diff.",
               "Qt.A M", "Qt.I M", "Diff.M", "FVM", "FVM M"]
    return write_workbook("quotations.xlsx", headers, [astuple(row) for row in raw_players])


@pytest.fixture(autouse=True)
def isolated_api_paths(monkeypatch, tmp_path):
    # Never read local review decisions or write to tracked data from API tests.
    monkeypatch.setenv("FANTA007_MEDIA_REVIEW_PATH", str(tmp_path / "isolated-reviews.json"))
    monkeypatch.setenv("FANTA007_TEAM_CATALOG_PATH", str(PROJECT_ROOT / "data/manual/teams.2026-27.json"))


@pytest.fixture
def active_dataset():
    return PlayerDataset.model_validate_json(
        (PROJECT_ROOT / "data/normalized/players.json").read_text(encoding="utf-8")
    )
