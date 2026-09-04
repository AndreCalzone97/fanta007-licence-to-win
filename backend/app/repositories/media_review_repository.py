from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from threading import Lock

from app.domain.media import PlayerMediaReview
from app.domain.player import MediaReviewStatus, Player


class JsonMediaReviewRepository:
    """Manual review decisions stored separately from generated player data."""

    def __init__(self, path: Path):
        self.path = Path(path)
        self._lock = Lock()
        self._reviews = json.loads(self.path.read_text(encoding="utf-8")) if self.path.is_file() else {}

    def _status_for(self, player: Player) -> MediaReviewStatus:
        override = self._reviews.get(str(player.id), {})
        if override.get("status"):
            return override["status"]
        if player.image is None:
            return "fallback"
        return player.image.status if player.image.status else ("approved" if player.image.portrait_approved else "pending")

    def get(self, player: Player) -> PlayerMediaReview:
        override = self._reviews.get(str(player.id), {})
        status = self._status_for(player)
        default_confidence = 1.0 if status == "approved" else 0.0 if status == "fallback" else 0.5
        return PlayerMediaReview(
            player_id=player.id,
            player_name=player.name,
            team=player.team,
            image=player.image,
            status=status,
            identity_confidence=override.get("identity_confidence", player.image.identity_confidence if player.image else None) or default_confidence,
            review_notes=override.get("review_notes", player.image.review_notes if player.image else None),
            reviewed_at=override.get("reviewed_at", player.image.reviewed_at if player.image else None),
        )

    def list(self, players: list[Player]) -> list[PlayerMediaReview]:
        records = [self.get(player) for player in players if player.image is not None or str(player.id) in self._reviews]
        return sorted(records, key=lambda record: ({"pending": 0, "approved": 1, "rejected": 2, "fallback": 3}[record.status], record.player_name.casefold()))

    def update(self, player: Player, status: MediaReviewStatus, review_notes: str | None) -> PlayerMediaReview:
        if status in {"approved", "rejected"} and player.image is None:
            raise ValueError("Nessuna immagine candidata per questo giocatore")
        now = datetime.now(UTC).isoformat()
        confidence = 1.0 if status == "approved" else 0.0 if status == "fallback" else 0.5
        with self._lock:
            self._reviews[str(player.id)] = {
                "status": status,
                "identity_confidence": confidence,
                "review_notes": review_notes,
                "reviewed_at": now,
            }
            self.path.parent.mkdir(parents=True, exist_ok=True)
            self.path.write_text(json.dumps(self._reviews, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        return self.get(player)

    def apply(self, player: Player) -> Player:
        review = self.get(player)
        if player.image is None:
            return player
        image = player.image.model_copy(update={
            "status": review.status,
            "portrait_approved": review.status == "approved",
            "identity_confidence": review.identity_confidence,
            "review_notes": review.review_notes,
            "reviewed_at": review.reviewed_at,
        })
        return player.model_copy(update={"image": image})
