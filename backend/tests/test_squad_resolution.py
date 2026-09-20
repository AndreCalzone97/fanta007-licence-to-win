import copy

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.repositories.json_player_repository import JsonPlayerRepository


@pytest.fixture
def saved_squad():
    return {"version": 2, "config": {"teamName": "Test", "participants": 8, "mode": "Classic", "budget": 500, "goal": "Arrivare almeno in Top 3"}, "players": [{"player_id": 827, "paidPrice": 12, "addedAt": "2026-09-01T12:00:00Z"}]}


@pytest.fixture
def canonical_path(player_dataset, tmp_path):
    path = tmp_path / "canonical.json"
    path.write_text(player_dataset.model_dump_json(), encoding="utf-8")
    return path


@pytest.fixture
def client(canonical_path):
    with TestClient(create_app(JsonPlayerRepository(canonical_path))) as client:
        yield client


def test_resolve_preserves_purchase_and_does_not_write(client, canonical_path, saved_squad, tmp_path):
    before = canonical_path.read_bytes()
    response = client.post("/api/v1/squads/resolve", json=saved_squad)
    assert response.status_code == 200
    entry = response.json()["squad"][0]
    assert entry["player"]["name"] == "Manuel Locatelli"
    assert entry["paidPrice"] == 12
    assert entry["addedAt"] == saved_squad["players"][0]["addedAt"]
    assert canonical_path.read_bytes() == before
    assert not (tmp_path / "isolated-reviews.json").exists()


def test_reload_uses_new_canonical_snapshot(canonical_path, saved_squad, player_dataset):
    from app.domain.player import PlayerSeasonStats
    with TestClient(create_app(JsonPlayerRepository(canonical_path))) as client:
        old = client.post("/api/v1/squads/resolve", json=saved_squad).json()
    player = player_dataset.players[0]
    player.name = "Corrected Name"
    player.team = "Roma"
    player.role_classic = "D"
    player.current_quotation = 8
    player.quotation_delta = -2
    player.statistics = [PlayerSeasonStats(season="2026/27", competition="Serie A", source="Test", goals=3)]
    canonical_path.write_text(player_dataset.model_dump_json(), encoding="utf-8")
    # JsonPlayerRepository loads its snapshot at backend startup, as elsewhere.
    with TestClient(create_app(JsonPlayerRepository(canonical_path))) as client:
        new = client.post("/api/v1/squads/resolve", json=saved_squad).json()
    assert old["squad"][0]["player"]["name"] != new["squad"][0]["player"]["name"]
    entry = new["squad"][0]
    assert (entry["player"]["team"], entry["player"]["role_classic"], entry["player"]["current_quotation"]) == ("Roma", "D", 8)
    assert entry["player"]["statistics"][0]["goals"] == 3
    assert entry["paidPrice"] == 12


@pytest.mark.parametrize("price", [0, -1, 1.5, True, "12", None, 100001])
def test_invalid_purchase_price(client, saved_squad, price):
    saved_squad["players"][0]["paidPrice"] = price
    assert client.post("/api/v1/squads/resolve", json=saved_squad).status_code == 422


@pytest.mark.parametrize("budget", [0, 10, 24, 500.5, "500", True, None, 100001])
def test_invalid_budget(client, saved_squad, budget):
    saved_squad["config"]["budget"] = budget
    assert client.post("/api/v1/squads/resolve", json=saved_squad).status_code == 422


@pytest.mark.parametrize("change", ["duplicate", "unknown", "version", "structure", "timestamp", "extra", "boolean_id", "fractional_id", "overspend", "reserve"])
def test_invalid_saved_data(client, saved_squad, change):
    if change == "duplicate": saved_squad["players"] *= 2
    elif change == "unknown": saved_squad["players"][0]["player_id"] = 999999
    elif change == "version": saved_squad["version"] = 99
    elif change == "structure": saved_squad["players"] = {}
    elif change == "timestamp": saved_squad["players"][0]["addedAt"] = "yesterday"
    elif change == "extra": saved_squad["players"][0]["player"] = {"name": "stale"}
    elif change == "boolean_id": saved_squad["players"][0]["player_id"] = True
    elif change == "fractional_id": saved_squad["players"][0]["player_id"] = 827.1
    elif change == "overspend": saved_squad["players"][0]["paidPrice"] = 501
    else: saved_squad["players"][0]["paidPrice"] = 477
    assert client.post("/api/v1/squads/resolve", json=saved_squad).status_code == 422


def test_maximum_bid_and_removal(client, saved_squad):
    saved_squad["players"][0]["paidPrice"] = 476
    assert client.post("/api/v1/squads/resolve", json=saved_squad).status_code == 200
    saved_squad["players"] = []
    response = client.post("/api/v1/squads/resolve", json=saved_squad)
    assert response.status_code == 200
    assert response.json()["squad"] == []


@pytest.mark.parametrize("mode, status", [("Classic", 422), ("Classic con Trequartisti", 422), ("Mantra", 200)])
def test_role_limits_use_canonical_roles(player_dataset, canonical_path, saved_squad, mode, status):
    player_dataset.players = [player_dataset.players[0].model_copy(update={"id": i + 1, "role_classic": "P"}) for i in range(4)]
    player_dataset.metadata.player_count = 4
    canonical_path.write_text(player_dataset.model_dump_json(), encoding="utf-8")
    saved_squad["config"]["mode"] = mode
    saved_squad["players"] = [{**saved_squad["players"][0], "player_id": i + 1} for i in range(4)]
    with TestClient(create_app(JsonPlayerRepository(canonical_path))) as client:
        assert client.post("/api/v1/squads/resolve", json=saved_squad).status_code == status


def test_more_than_25_slots_rejected(client, saved_squad):
    saved_squad["players"] = [copy.deepcopy(saved_squad["players"][0]) for _ in range(26)]
    assert client.post("/api/v1/squads/resolve", json=saved_squad).status_code == 422


def test_browser_post_preflight(client):
    response = client.options("/api/v1/squads/resolve", headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST"})
    assert response.status_code == 200
    assert "POST" in response.headers["access-control-allow-methods"]
