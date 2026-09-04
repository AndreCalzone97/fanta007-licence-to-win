from app.repositories.player_repository import PlayerRepository
from app.services.player_search import PlayerSearchService, normalize_search_text


class MemoryPlayerRepository:
    def __init__(self, players):
        self.players = players

    def all(self):
        return list(self.players)

    def get(self, player_id):
        return next((player for player in self.players if player.id == player_id), None)


def service(player_dataset):
    return PlayerSearchService(MemoryPlayerRepository(player_dataset.players))


def test_partial_search_finds_locatelli(player_dataset):
    results = service(player_dataset).search("loca")
    assert results[0].player.id == 827
    assert results[0].player.name == "Manuel Locatelli"


def test_full_alias_search_finds_nico_paz(player_dataset):
    results = service(player_dataset).search("Nico Paz")
    assert results[0].player.id == 6875


def test_martinez_returns_multiple_players(player_dataset):
    results = service(player_dataset).search("martinez")
    ids = {result.player.id for result in results}
    assert {2764, 5116}.issubset(ids)


def test_role_filter_is_optional(player_dataset):
    unfiltered = service(player_dataset).search("martinez")
    attackers = service(player_dataset).search("martinez", role="A")
    assert len(unfiltered) >= 2
    assert [result.player.id for result in attackers] == [2764]


def test_normalization_ignores_accents_and_punctuation():
    assert normalize_search_text("Çalhanoğlu") == "calhanoglu"
    assert normalize_search_text("Paz N.") == "paz n"


def test_fuzzy_search_is_used_as_fallback(player_dataset):
    results = service(player_dataset).search("locateli")
    assert results[0].player.id == 827
