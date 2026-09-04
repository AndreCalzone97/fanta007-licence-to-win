from fastapi.testclient import TestClient

from app.main import create_app


class MemoryPlayerRepository:
    def __init__(self, players):
        self.players = players
        self.by_id = {player.id: player for player in players}

    def all(self):
        return list(self.players)

    def get(self, player_id):
        return self.by_id.get(player_id)


def test_health_and_search_endpoints(player_dataset):
    app = create_app(MemoryPlayerRepository(player_dataset.players))
    with TestClient(app) as client:
        health = client.get("/api/v1/health")
        response = client.get("/api/v1/players/search", params={"q": "loca"})

    assert health.status_code == 200
    assert health.json()["status"] == "ok"
    assert response.status_code == 200
    assert response.json()[0]["player"]["id"] == 827


def test_player_detail_returns_404(player_dataset):
    app = create_app(MemoryPlayerRepository(player_dataset.players))
    with TestClient(app) as client:
        existing = client.get("/api/v1/players/6875")
        missing = client.get("/api/v1/players/999999")

    assert existing.status_code == 200
    assert existing.json()["name"] == "Nico Paz"
    assert existing.json()["image"]["license"] == "CC0 1.0"
    assert existing.json()["statistics"] == []
    assert missing.status_code == 404


def test_player_list_supports_team_role_and_pagination(player_dataset):
    app = create_app(MemoryPlayerRepository(player_dataset.players))
    with TestClient(app) as client:
        teams = client.get("/api/v1/players/teams")
        page = client.get(
            "/api/v1/players",
            params={"team": "Inter", "role": "A", "limit": 2, "offset": 0},
        )

    assert teams.status_code == 200
    assert "Inter" in teams.json()
    assert page.status_code == 200
    payload = page.json()
    assert payload["limit"] == 2
    assert payload["offset"] == 0
    assert payload["total"] >= len(payload["items"])
    assert all(item["team"] == "Inter" and item["role_classic"] == "A" for item in payload["items"])


def test_search_can_be_filtered_by_team(player_dataset):
    app = create_app(MemoryPlayerRepository(player_dataset.players))
    with TestClient(app) as client:
        response = client.get(
            "/api/v1/players/search",
            params={"q": "la", "team": "Inter", "limit": 25},
        )

    assert response.status_code == 200
    assert response.json()
    assert all(result["player"]["team"] == "Inter" for result in response.json())


def test_player_list_supports_every_sort_and_query(player_dataset):
    app = create_app(MemoryPlayerRepository(player_dataset.players))
    with TestClient(app) as client:
        ascending = client.get("/api/v1/players", params={"sort": "qa_asc", "limit": 20}).json()
        descending = client.get("/api/v1/players", params={"sort": "delta_desc", "limit": 20}).json()
        queried = client.get("/api/v1/players", params={"q": "Malen", "sort": "name_asc"}).json()

    assert [item["current_quotation"] for item in ascending["items"]] == sorted(item["current_quotation"] for item in ascending["items"])
    assert [item["quotation_delta"] for item in descending["items"]] == sorted((item["quotation_delta"] for item in descending["items"]), reverse=True)
    assert queried["items"][0]["name"] == "Donyell Malen"


def test_benchmark_endpoint(player_dataset):
    app = create_app(MemoryPlayerRepository(player_dataset.players))
    with TestClient(app) as client:
        response = client.get("/api/v1/players/6875/benchmark")

    assert response.status_code == 200
    assert response.json()["player_id"] == 6875
    assert response.json()["role"] == "C"
