import json

from app.repositories.media_review_repository import JsonMediaReviewRepository


def test_media_review_is_persisted_separately(player_dataset, tmp_path):
    player = next(item for item in player_dataset.players if item.image)
    path = tmp_path / "reviews.json"
    repository = JsonMediaReviewRepository(path)

    updated = repository.update(player, "rejected", "Inquadratura non adatta")

    assert updated.status == "rejected"
    assert repository.apply(player).image.portrait_approved is False
    assert json.loads(path.read_text(encoding="utf-8"))[str(player.id)]["status"] == "rejected"


def test_fallback_is_valid_without_an_image(player_dataset, tmp_path):
    player = next(item for item in player_dataset.players if item.image is None)
    repository = JsonMediaReviewRepository(tmp_path / "reviews.json")

    updated = repository.update(player, "fallback", "Usare lo scudo Fanta007")

    assert updated.status == "fallback"
    assert updated.identity_confidence == 0
