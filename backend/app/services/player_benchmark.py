from __future__ import annotations

from math import ceil

from app.domain.benchmark import PlayerBenchmark
from app.domain.player import Player
from app.repositories.player_repository import PlayerRepository


class PlayerBenchmarkService:
    """Role-relative ranks derived only from the active player dataset."""

    methodology = "Competition rank; percentile uses midpoint ties (below + half equal) among players in the same role."

    def __init__(self, repository: PlayerRepository):
        self.repository = repository

    @staticmethod
    def _metric(values: list[int], value: int) -> tuple[int, float, int]:
        total = len(values)
        rank = 1 + sum(candidate > value for candidate in values)
        less = sum(candidate < value for candidate in values)
        equal = sum(candidate == value for candidate in values)
        percentile = 100.0 if value == max(values) else round((less + equal / 2) / total * 100, 1)
        top_percent = max(1, min(100, ceil(rank / total * 100)))
        return rank, percentile, top_percent

    def for_player(self, player: Player) -> PlayerBenchmark:
        peers = [candidate for candidate in self.repository.all() if candidate.role_classic == player.role_classic]
        fvm_rank, fvm_percentile, fvm_top = self._metric([candidate.fvm for candidate in peers], player.fvm)
        qa_rank, qa_percentile, qa_top = self._metric([candidate.current_quotation for candidate in peers], player.current_quotation)
        return PlayerBenchmark(
            player_id=player.id,
            role=player.role_classic,
            role_total=len(peers),
            fvm_rank=fvm_rank,
            fvm_percentile=fvm_percentile,
            fvm_top_percent=fvm_top,
            qa_rank=qa_rank,
            qa_percentile=qa_percentile,
            qa_top_percent=qa_top,
            methodology=self.methodology,
        )
