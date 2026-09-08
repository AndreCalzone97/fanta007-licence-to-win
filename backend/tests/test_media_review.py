import json

import pytest
from fastapi.testclient import TestClient

from app.domain.player import Player, PlayerImage
from app.main import create_app
from app.repositories.media_review_repository import JsonMediaReviewRepository


@pytest.fixture
def review_player():
    return Player(
        id=1,
        source_name="Test Player",
        name="Test Player",
        team="Test Team",
        role_classic="C",
        roles_mantra=["C"],
        current_quotation=10,
        initial_quotation=10,
        quotation_delta=0,
        current_quotation_mantra=10,
        initial_quotation_mantra=10,
        quotation_delta_mantra=0,
        fvm=20,
        fvm_mantra=20,
        image=PlayerImage(
            url="https://example.test/player.jpg",
            status="pending",
            portrait_approved=False,
        ),
    )


@pytest.fixture
def media_client(monkeypatch, tmp_path, review_player):
    monkeypatch.delenv("FANTA007_ENABLE_MEDIA_REVIEW_ADMIN", raising=False)
    monkeypatch.setenv("FANTA007_MEDIA_REVIEW_PATH", str(tmp_path / "reviews.json"))
    catalog_path = tmp_path / "teams.json"
    catalog_path.write_text(json.dumps({
        "metadata": {
            "season": "2026/27",
            "competition": "Test",
            "verified_at": "2026-01-01T00:00:00Z",
            "source_urls": [],
            "team_count": 1,
        },
        "teams": [{
            "id": "test-team",
            "code": "TST",
            "name": "Test Team",
            "official_name": "Test Team",
            "season": "2026/27",
        }],
    }), encoding="utf-8")
    monkeypatch.setenv("FANTA007_TEAM_CATALOG_PATH", str(catalog_path))

    class MemoryPlayerRepository:
        def all(self):
            return [review_player]

        def get(self, player_id):
            return review_player if player_id == review_player.id else None

    with TestClient(create_app(MemoryPlayerRepository())) as client:
        yield client


def test_media_review_is_persisted_separately(review_player, tmp_path):
    player = review_player
    path = tmp_path / "reviews.json"
    repository = JsonMediaReviewRepository(path)

    updated = repository.update(player, "rejected", "Inquadratura non adatta")

    assert updated.status == "rejected"
    assert repository.apply(player).image.portrait_approved is False
    assert json.loads(path.read_text(encoding="utf-8"))[str(player.id)]["status"] == "rejected"


def test_fallback_is_valid_without_an_image(review_player, tmp_path):
    player = review_player.model_copy(update={"image": None})
    repository = JsonMediaReviewRepository(tmp_path / "reviews.json")

    updated = repository.update(player, "fallback", "Usare lo scudo Fanta007")

    assert updated.status == "fallback"
    assert updated.identity_confidence == 0


def test_admin_mutation_is_disabled_by_default(media_client, tmp_path):
    response = media_client.patch("/api/v1/admin/media-review/1", json={"action": "approve"})

    assert response.status_code == 403
    assert response.json() == {"detail": "Operazione non consentita"}
    assert not (tmp_path / "reviews.json").exists()
    assert media_client.get("/api/v1/admin/media-review").json()[0]["status"] == "pending"


@pytest.mark.parametrize("value", ["false", "FALSE", "", "0", "1", "yes", "on", "tru"])
def test_disabled_or_unrecognized_flag_rejects_mutation(media_client, monkeypatch, tmp_path, value):
    monkeypatch.setenv("FANTA007_ENABLE_MEDIA_REVIEW_ADMIN", value)
    response = media_client.patch("/api/v1/admin/media-review/1", json={"action": "reject"})

    assert response.status_code == 403
    assert not (tmp_path / "reviews.json").exists()


@pytest.mark.parametrize("value", ["true", "TRUE", " true "])
@pytest.mark.parametrize("action,status", [("approve", "approved"), ("reject", "rejected"), ("fallback", "fallback")])
def test_explicit_enablement_preserves_review_workflow(media_client, monkeypatch, tmp_path, value, action, status):
    monkeypatch.setenv("FANTA007_ENABLE_MEDIA_REVIEW_ADMIN", value)
    response = media_client.patch(
        "/api/v1/admin/media-review/1",
        json={"action": action, "review_notes": "Local review"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == status
    assert response.json()["review_notes"] == "Local review"
    assert json.loads((tmp_path / "reviews.json").read_text(encoding="utf-8"))["1"]["status"] == status
    assert media_client.get("/api/v1/admin/media-review").json()[0]["status"] == status
    image = media_client.get("/api/v1/players/1").json()["image"]
    assert image["status"] == status
    assert image["portrait_approved"] is (status == "approved")


@pytest.mark.parametrize("payload", [{"action": "delete"}, {}, {"action": "approve", "review_notes": "x" * 501}, {"action": "approve", "extra": True}])
def test_enabled_admin_still_rejects_invalid_input(media_client, monkeypatch, tmp_path, payload):
    monkeypatch.setenv("FANTA007_ENABLE_MEDIA_REVIEW_ADMIN", "true")
    response = media_client.patch("/api/v1/admin/media-review/1", json=payload)

    assert response.status_code == 422
    assert not (tmp_path / "reviews.json").exists()


def test_enabled_admin_unknown_player_returns_404(media_client, monkeypatch, tmp_path):
    monkeypatch.setenv("FANTA007_ENABLE_MEDIA_REVIEW_ADMIN", "true")
    response = media_client.patch("/api/v1/admin/media-review/999", json={"action": "approve"})

    assert response.status_code == 404
    assert not (tmp_path / "reviews.json").exists()


def test_disabled_admin_preserves_saved_reviews_and_public_reads(media_client, monkeypatch, tmp_path):
    monkeypatch.setenv("FANTA007_ENABLE_MEDIA_REVIEW_ADMIN", "true")
    assert media_client.patch("/api/v1/admin/media-review/1", json={"action": "approve"}).status_code == 200
    before = (tmp_path / "reviews.json").read_bytes()
    monkeypatch.setenv("FANTA007_ENABLE_MEDIA_REVIEW_ADMIN", "false")

    assert media_client.patch("/api/v1/admin/media-review/1", json={"action": "reject"}).status_code == 403
    assert (tmp_path / "reviews.json").read_bytes() == before
    reviews = media_client.get("/api/v1/admin/media-review")
    assert reviews.status_code == 200
    assert reviews.json()[0]["status"] == "approved"
    assert media_client.get("/api/v1/players/1").json()["image"]["status"] == "approved"
    assert media_client.get("/api/v1/health").status_code == 200
    assert media_client.get("/api/v1/players").status_code == 200
    assert media_client.get("/api/v1/teams").status_code == 200
