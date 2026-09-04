from __future__ import annotations

import json
from pathlib import Path

from app.domain.player import Player, PlayerDataset


class JsonPlayerRepository:
    def __init__(self, dataset_path: Path):
        self.dataset_path = Path(dataset_path)
        if not self.dataset_path.is_file():
            raise FileNotFoundError(
                f"Dataset normalizzato non trovato: {self.dataset_path}. "
                "Eseguire prima backend/scripts/normalize_players.py."
            )
        payload = json.loads(self.dataset_path.read_text(encoding="utf-8"))
        self.dataset = PlayerDataset.model_validate(payload)
        self._players = self.dataset.players
        self._by_id = {player.id: player for player in self._players}

    def all(self) -> list[Player]:
        return list(self._players)

    def get(self, player_id: int) -> Player | None:
        return self._by_id.get(player_id)

