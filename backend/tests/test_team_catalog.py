import json

import pytest
from fastapi.testclient import TestClient

from app.domain.team import TeamCatalog
from app.main import create_app
from app.services.team_catalog import TeamCatalogError, TeamCatalogService


def test_official_team_catalog_resolves_all_dataset_teams(player_dataset):
    service = TeamCatalogService.from_path(
        __import__("pathlib").Path(__file__).resolve().parents[2]
        / "data"
        / "manual"
        / "teams.2026-27.json"
    )

    assert len(service.all()) == 20
    assert service.resolve("INT").name == "Inter"
    assert service.resolve("FC Internazionale Milano").id == "inter"
    assert service.unknown_names({player.team for player in player_dataset.players}) == []


def test_team_catalog_rejects_alias_collisions():
    payload = {
        "metadata": {
            "season": "2026/27",
            "competition": "Serie A",
            "verified_at": "2026-09-03T00:00:00Z",
            "source_urls": ["https://example.test"],
            "team_count": 2,
        },
        "teams": [
            {"id": "one", "code": "ONE", "name": "One", "official_name": "Club One", "aliases": ["Shared"], "season": "2026/27"},
            {"id": "two", "code": "TWO", "name": "Two", "official_name": "Club Two", "aliases": ["Shared"], "season": "2026/27"},
        ],
    }

    with pytest.raises(TeamCatalogError, match="ambiguo"):
        TeamCatalogService(TeamCatalog.model_validate(payload))


def test_teams_api_exposes_structured_fallback_assets(player_dataset):
    class Repository:
        def all(self):
            return player_dataset.players

        def get(self, player_id):
            return next((player for player in player_dataset.players if player.id == player_id), None)

    with TestClient(create_app(Repository())) as client:
        response = client.get("/api/v1/teams")
        detail = client.get("/api/v1/teams/inter")
        missing = client.get("/api/v1/teams/not-a-team")

    assert response.status_code == 200
    assert len(response.json()) == 20
    assert detail.json()["code"] == "INT"
    assert detail.json()["asset"]["status"] == "fallback"
    assert missing.status_code == 404
