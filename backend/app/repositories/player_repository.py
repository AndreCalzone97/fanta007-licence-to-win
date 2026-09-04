from __future__ import annotations

from typing import Protocol

from app.domain.player import Player


class PlayerRepository(Protocol):
    def all(self) -> list[Player]: ...

    def get(self, player_id: int) -> Player | None: ...

