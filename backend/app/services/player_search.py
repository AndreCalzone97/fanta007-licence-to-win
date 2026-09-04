from __future__ import annotations

import re
import unicodedata
from difflib import SequenceMatcher

from app.domain.player import ClassicRole, Player
from app.domain.search import PlayerSearchResult
from app.repositories.player_repository import PlayerRepository


NON_ALPHANUMERIC = re.compile(r"[^a-z0-9]+")


def normalize_search_text(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value)
    ascii_like = "".join(
        character for character in decomposed if not unicodedata.combining(character)
    ).casefold()
    return NON_ALPHANUMERIC.sub(" ", ascii_like).strip()


def _score(query: str, candidate: str) -> float:
    if not candidate:
        return 0
    if query == candidate:
        return 100
    if candidate.startswith(query):
        return 94
    candidate_tokens = candidate.split()
    query_tokens = query.split()
    if query_tokens and all(
        any(token.startswith(query_token) for token in candidate_tokens)
        for query_token in query_tokens
    ):
        return 90
    if query in candidate:
        return 84
    ratio = SequenceMatcher(None, query, candidate).ratio()
    return round(ratio * 78, 2) if ratio >= 0.62 else 0


class PlayerSearchService:
    def __init__(self, repository: PlayerRepository):
        self.repository = repository

    def search(
        self,
        query: str,
        *,
        role: ClassicRole | None = None,
        team: str | None = None,
        limit: int = 10,
    ) -> list[PlayerSearchResult]:
        normalized_query = normalize_search_text(query)
        if not normalized_query:
            return []

        results: list[PlayerSearchResult] = []
        for player in self.repository.all():
            if role and player.role_classic != role:
                continue
            if team and player.team.casefold() != team.casefold():
                continue

            searchable = list(
                dict.fromkeys([player.name, player.source_name, *player.aliases])
            )
            scored = [
                (_score(normalized_query, normalize_search_text(label)), label)
                for label in searchable
            ]
            best_score, matched_on = max(scored, key=lambda item: item[0])
            if best_score:
                results.append(
                    PlayerSearchResult(
                        player=player,
                        score=best_score,
                        matched_on=matched_on,
                    )
                )

        # If the query has direct prefix/token/substring matches, do not dilute
        # autocomplete with weaker fuzzy suggestions. Fuzzy matching remains a
        # fallback for genuine misspellings.
        if any(result.score >= 84 for result in results):
            results = [result for result in results if result.score >= 84]

        results.sort(
            key=lambda result: (
                -result.score,
                -result.player.fvm,
                normalize_search_text(result.player.name),
            )
        )
        return results[:limit]
