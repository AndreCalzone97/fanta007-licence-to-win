from app.services.player_benchmark import PlayerBenchmarkService


class MemoryPlayerRepository:
    def __init__(self, players):
        self.players = players

    def all(self):
        return list(self.players)

    def get(self, player_id):
        return next((player for player in self.players if player.id == player_id), None)


def test_benchmark_is_role_relative_and_deterministic(player_dataset):
    repository = MemoryPlayerRepository(player_dataset.players)
    player = max((item for item in player_dataset.players if item.role_classic == "C"), key=lambda item: item.fvm)
    benchmark = PlayerBenchmarkService(repository).for_player(player)

    assert benchmark.role == "C"
    assert benchmark.role_total == sum(
        item.role_classic == player.role_classic for item in player_dataset.players
    )
    assert benchmark.fvm_rank == 1
    assert benchmark.fvm_percentile == 100
    assert benchmark.fvm_top_percent == 1


def test_benchmark_ties_share_the_same_rank(player_dataset):
    repository = MemoryPlayerRepository(player_dataset.players)
    peers = [item for item in player_dataset.players if item.role_classic == "D"]
    first = next(item for item in peers if sum(peer.fvm == item.fvm for peer in peers) > 1)
    same_value = next(item for item in peers if item.id != first.id and item.fvm == first.fvm)

    service = PlayerBenchmarkService(repository)
    assert service.for_player(first).fvm_rank == service.for_player(same_value).fvm_rank
