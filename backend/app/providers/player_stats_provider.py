from __future__ import annotations

from typing import Protocol

from app.domain.player import PlayerSeasonStats


class HistoricalFantasyStatsProvider(Protocol):
    """Contract for a future licensed historical-statistics integration."""

    def get_seasons(self, player_id: int) -> list[PlayerSeasonStats]: ...


PlayerStatsProvider = HistoricalFantasyStatsProvider
