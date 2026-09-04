from __future__ import annotations

from dataclasses import dataclass
from difflib import SequenceMatcher

from app.domain.player import Player
from app.services.player_search import normalize_search_text


@dataclass(frozen=True)
class IdentityMatch:
    player_id: int | None
    confidence: float
    status: str
    matched_on: str | None = None


class PlayerIdentityResolver:
    """Resolves external rows without silently accepting ambiguous identities."""

    AUTO_THRESHOLD = 0.95
    REVIEW_THRESHOLD = 0.80

    def __init__(self, players: list[Player]):
        self.players = players

    def resolve(self, name: str, team: str | None = None, official_id: int | None = None) -> IdentityMatch:
        if official_id is not None:
            direct = next((player for player in self.players if player.id == official_id), None)
            if direct:
                return IdentityMatch(direct.id, 1.0, "matched", "official_id")

        normalized_name = normalize_search_text(name)
        normalized_team = normalize_search_text(team or "")
        scored: list[tuple[float, Player, str]] = []
        for player in self.players:
            labels = list(dict.fromkeys([player.name, player.source_name, *player.aliases]))
            name_score, label = max(
                (SequenceMatcher(None, normalized_name, normalize_search_text(value)).ratio(), value)
                for value in labels
            )
            if normalized_name == normalize_search_text(label):
                name_score = 1.0
            team_matches = normalized_team and normalized_team == normalize_search_text(player.team)
            combined = min(1.0, name_score + (0.02 if team_matches else 0.0))
            scored.append((combined, player, label))

        scored.sort(key=lambda item: item[0], reverse=True)
        if not scored:
            return IdentityMatch(None, 0.0, "unmatched")
        confidence, player, label = scored[0]
        second = scored[1][0] if len(scored) > 1 else 0.0
        if confidence >= self.AUTO_THRESHOLD and confidence - second >= 0.03:
            return IdentityMatch(player.id, round(confidence, 4), "matched", label)
        if confidence >= self.REVIEW_THRESHOLD:
            return IdentityMatch(player.id, round(confidence, 4), "review", label)
        return IdentityMatch(None, round(confidence, 4), "unmatched")
