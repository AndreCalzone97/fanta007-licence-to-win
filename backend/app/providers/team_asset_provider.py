from __future__ import annotations

from typing import Protocol

from app.domain.team import Team, TeamAsset


class TeamAssetProvider(Protocol):
    """Boundary for future, explicitly licensed team assets."""

    def find(self, team: Team) -> TeamAsset | None:
        ...
