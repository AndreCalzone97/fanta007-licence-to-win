from pathlib import Path

from app.domain.player import PlayerDataset


PROJECT_ROOT = Path(__file__).resolve().parents[2]
ACTIVE_DATASET = PROJECT_ROOT / "data" / "normalized" / "players.json"


def _active_dataset() -> PlayerDataset:
    return PlayerDataset.model_validate_json(ACTIVE_DATASET.read_text(encoding="utf-8"))


def test_every_non_goalkeeper_season_record_has_goals_and_assists() -> None:
    dataset = _active_dataset()
    records = [
        (player, season)
        for player in dataset.players
        if player.role_classic != "P"
        for season in player.statistics
    ]

    assert records
    assert all(season.goals is not None for _, season in records)
    assert all(season.assists is not None for _, season in records)


def test_dimarco_2025_26_official_bonus_are_present() -> None:
    dataset = _active_dataset()
    dimarco = next(player for player in dataset.players if player.name == "Federico Dimarco")
    season = next(item for item in dimarco.statistics if item.season == "2025/26")

    assert season.goals == 7
    assert season.assists == 17
