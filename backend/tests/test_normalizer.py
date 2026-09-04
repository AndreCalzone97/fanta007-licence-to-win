def test_aliases_preserve_source_name(player_dataset):
    nico_paz = next(player for player in player_dataset.players if player.id == 6875)
    assert nico_paz.source_name == "Paz N."
    assert nico_paz.name == "Nico Paz"
    assert "Paz N." in nico_paz.aliases
    assert nico_paz.roles_mantra == ["T", "A"]


def test_images_are_optional_and_licensed(player_dataset):
    locatelli = next(player for player in player_dataset.players if player.id == 827)
    generic_player = next(player for player in player_dataset.players if player.id == 5841)
    assert locatelli.image is not None
    assert locatelli.image.source == "Wikimedia Commons"
    assert locatelli.image.license == "CC BY-SA 4.0"
    assert generic_player.image is None
    assert generic_player.statistics == []


def test_dataset_metadata_is_auditable(player_dataset):
    assert player_dataset.metadata.player_count == 533
    assert player_dataset.metadata.sheet == "Tutti"
    assert len(player_dataset.metadata.source_sha256) == 64


def test_curated_image_set_has_complete_attribution(player_dataset):
    images = [player.image for player in player_dataset.players if player.image]
    assert len(images) >= 7
    assert sum(image.portrait_approved for image in images) >= 6
    assert all(image.url and image.source and image.author for image in images)
    assert all(image.license and image.attribution_url for image in images)
