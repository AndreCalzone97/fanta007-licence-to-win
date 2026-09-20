import hashlib
from pathlib import Path

import pytest

from app.data.normalizer import load_aliases, normalize_dataset
from app.domain.player import PlayerImage


PROJECT_ROOT = Path(__file__).resolve().parents[2]


@pytest.fixture
def normalized_dataset(raw_players, source_path, aliases):
    return normalize_dataset(raw_players, source_path, aliases)


def test_aliases_preserve_source_name(normalized_dataset):
    nico_paz = next(player for player in normalized_dataset.players if player.id == 6875)
    assert nico_paz.source_name == "Paz N."
    assert nico_paz.name == "Nico Paz"
    assert "Paz N." in nico_paz.aliases
    assert nico_paz.roles_mantra == ["T", "A"]


def test_images_are_optional_and_licensed(normalized_dataset):
    locatelli = next(player for player in normalized_dataset.players if player.id == 827)
    generic_player = next(player for player in normalized_dataset.players if player.id == 5841)
    assert locatelli.image is not None
    assert locatelli.image.source == "Wikimedia Commons"
    assert locatelli.image.license == "CC BY-SA 4.0"
    assert generic_player.image is None
    assert generic_player.statistics == []


def test_dataset_metadata_is_auditable(normalized_dataset, source_path):
    assert normalized_dataset.metadata.player_count == 9
    assert normalized_dataset.metadata.sheet == "Tutti"
    assert normalized_dataset.metadata.source_sha256 == hashlib.sha256(source_path.read_bytes()).hexdigest()


def test_curated_image_set_has_complete_attribution():
    aliases = load_aliases(PROJECT_ROOT / "data/manual/player_aliases.json")
    images = [PlayerImage.model_validate(entry["image"]) for entry in aliases.values() if entry.get("image")]
    assert len(images) >= 7
    assert sum(image.portrait_approved for image in images) >= 6
    assert all(image.url and image.source and image.author for image in images)
    assert all(image.license and image.attribution_url for image in images)
