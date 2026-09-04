from pathlib import Path

import pytest

from app.data.excel_parser import parse_players
from app.data.normalizer import load_aliases, normalize_dataset


PROJECT_ROOT = Path(__file__).resolve().parents[2]
SOURCE = PROJECT_ROOT / "data" / "source" / "Quotazioni_Fantacalcio_Stagione_2026_27_2026-09-03.xlsx"
ALIASES = PROJECT_ROOT / "data" / "manual" / "player_aliases.json"


@pytest.fixture(scope="session")
def raw_players():
    return parse_players(SOURCE)


@pytest.fixture(scope="session")
def player_dataset(raw_players):
    return normalize_dataset(raw_players, SOURCE, load_aliases(ALIASES))
