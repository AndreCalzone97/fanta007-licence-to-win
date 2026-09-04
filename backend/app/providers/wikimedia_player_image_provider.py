from __future__ import annotations

import json
import re
import time
import unicodedata
from datetime import UTC, datetime
from html import unescape
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from app.domain.player import PlayerImage


COMMONS_API = "https://commons.wikimedia.org/w/api.php"
SERIE_A_CATEGORY = "Category:Players of Serie A (association football, Italy)"
SERIE_A_CATEGORY_URL = "https://commons.wikimedia.org/wiki/Category:Players_of_Serie_A_(association_football,_Italy)"
ALLOWED_LICENSE_PREFIXES = ("CC0", "CC BY", "CC-BY", "Public domain", "PD-")


def _plain(value: Any) -> str | None:
    if not value:
        return None
    text = value.get("value") if isinstance(value, dict) else str(value)
    return re.sub(r"<[^>]+>", "", unescape(text)).strip()


def _searchable(value: str | None) -> str:
    if not value:
        return ""
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = "".join(char for char in normalized if not unicodedata.combining(char))
    return " ".join(re.findall(r"[a-z0-9]+", ascii_value.casefold()))


def _identity_score(page: dict[str, Any], player_name: str, team: str | None = None) -> float:
    """Conservative metadata match; candidates always remain pending review."""
    info = (page.get("imageinfo") or [{}])[0]
    metadata = info.get("extmetadata") or {}
    haystack = _searchable(" ".join(filter(None, (
        page.get("title"),
        _plain(metadata.get("ObjectName")),
        _plain(metadata.get("ImageDescription")),
        _plain(metadata.get("Categories")),
    ))))
    haystack_tokens = haystack.split()
    name_tokens = [token for token in _searchable(player_name).split() if len(token) > 2]
    if not name_tokens or not all(token in haystack_tokens for token in name_tokens):
        return 0.0
    team_tokens = [token for token in _searchable(team).split() if len(token) > 3]
    team_match = any(token in haystack_tokens for token in team_tokens)
    if len(name_tokens) >= 2:
        return 0.92 if team_match else 0.84
    return 0.72 if team_match else 0.58


def image_from_page(
    page: dict[str, Any],
    *,
    identity_confidence: float = 0.5,
    review_notes: str | None = None,
) -> PlayerImage | None:
    info = (page.get("imageinfo") or [None])[0]
    if not info:
        return None
    metadata = info.get("extmetadata") or {}
    license_name = _plain(metadata.get("LicenseShortName"))
    copyrighted = _plain(metadata.get("Copyrighted"))
    non_free = (_plain(metadata.get("NonFree")) or "").casefold() == "true"
    deletion_reason = _plain(metadata.get("DeletionReason"))
    if not license_name or non_free or deletion_reason:
        return None
    if copyrighted and copyrighted.casefold() == "true" and not license_name.startswith(ALLOWED_LICENSE_PREFIXES):
        return None
    if not license_name.startswith(ALLOWED_LICENSE_PREFIXES):
        return None
    author = _plain(metadata.get("Artist"))
    source_page = info.get("descriptionurl")
    attribution = _plain(metadata.get("Attribution")) or " · ".join(value for value in (author, license_name) if value)
    return PlayerImage(
        url=info.get("url"), thumbnail_url=info.get("thumburl"), source="Wikimedia Commons",
        author=author, license=license_name, attribution_url=source_page, source_page=source_page,
        attribution_text=attribution, portrait_approved=False, identity_confidence=identity_confidence,
        status="pending", review_notes=review_notes, verified_at=datetime.now(UTC),
    )


class WikimediaPlayerImageProvider:
    """Commons discovery with per-file license validation and JSON caching."""

    def __init__(self, cache_path: Path, timeout: int = 15, retries: int = 3):
        self.cache_path = Path(cache_path)
        self.timeout = timeout
        self.retries = retries
        self.cache = json.loads(self.cache_path.read_text(encoding="utf-8")) if self.cache_path.is_file() else {}

    def _request(self, params: dict[str, str]) -> dict[str, Any]:
        url = f"{COMMONS_API}?{urlencode(params)}"
        request = Request(url, headers={"User-Agent": "Fanta007/0.2 (licensed-media-discovery)"})
        for attempt in range(self.retries + 1):
            try:
                with urlopen(request, timeout=self.timeout) as response:
                    return json.load(response)
            except HTTPError as exc:
                if exc.code != 429 or attempt >= self.retries:
                    raise
                retry_after = exc.headers.get("Retry-After")
                wait_seconds = float(retry_after) if retry_after and retry_after.isdigit() else 2 ** attempt
                time.sleep(min(max(wait_seconds, 1), 30))
        raise RuntimeError("Wikimedia request retries exhausted")

    def find(self, player_id: int, player_name: str, team: str | None = None) -> PlayerImage | None:
        cache_key = str(player_id)
        if cache_key in self.cache:
            payload = self.cache[cache_key].get("image")
            return PlayerImage.model_validate(payload) if payload else None
        data = self._request({
            "action": "query", "format": "json", "generator": "search", "gsrnamespace": "6",
            "gsrsearch": f'"{player_name}" association football', "gsrlimit": "8", "prop": "imageinfo",
            "iiprop": "url|extmetadata", "iiurlwidth": "480", "iiextmetadatalanguage": "en",
        })
        scored_pages = sorted(
            ((_identity_score(page, player_name, team), page) for page in (data.get("query", {}).get("pages", {}) or {}).values()),
            key=lambda item: item[0],
            reverse=True,
        )
        image = None
        for confidence, page in scored_pages:
            if confidence <= 0:
                continue
            image = image_from_page(
                page,
                identity_confidence=confidence,
                review_notes="Licenza Commons verificata automaticamente; identita da confermare nel pannello Media Review.",
            )
            if image:
                break
        self.cache[cache_key] = {
            "player_name": player_name, "team": team, "discovery_source": SERIE_A_CATEGORY_URL,
            "checked_at": datetime.now(UTC).isoformat(), "image": image.model_dump(mode="json") if image else None,
        }
        self.cache_path.parent.mkdir(parents=True, exist_ok=True)
        self.cache_path.write_text(json.dumps(self.cache, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        return image

    def find_many(self, players: list[tuple[int, str, str | None]]) -> dict[int, PlayerImage | None]:
        """Resolve several players with one Commons search while caching every outcome."""
        results: dict[int, PlayerImage | None] = {}
        uncached: list[tuple[int, str, str | None]] = []
        for player_id, player_name, team in players:
            cached = self.cache.get(str(player_id))
            if cached is None:
                uncached.append((player_id, player_name, team))
            else:
                payload = cached.get("image")
                results[player_id] = PlayerImage.model_validate(payload) if payload else None
        if not uncached:
            return results

        quoted_names = [f'"{name.replace(chr(34), "")}"' for _, name, _ in uncached]
        search = f"({' OR '.join(quoted_names)}) association football"
        data = self._request({
            "action": "query", "format": "json", "generator": "search", "gsrnamespace": "6",
            "gsrsearch": search, "gsrlimit": "50", "prop": "imageinfo",
            "iiprop": "url|extmetadata", "iiurlwidth": "480", "iiextmetadatalanguage": "en",
        })
        pages = list((data.get("query", {}).get("pages", {}) or {}).values())
        checked_at = datetime.now(UTC).isoformat()
        for player_id, player_name, team in uncached:
            scored_pages = sorted(
                ((_identity_score(page, player_name, team), page) for page in pages),
                key=lambda item: item[0], reverse=True,
            )
            image = None
            for confidence, page in scored_pages:
                if confidence <= 0:
                    continue
                image = image_from_page(
                    page, identity_confidence=confidence,
                    review_notes="Licenza Commons verificata automaticamente; identita da confermare nel pannello Media Review.",
                )
                if image:
                    break
            self.cache[str(player_id)] = {
                "player_name": player_name, "team": team, "discovery_source": SERIE_A_CATEGORY_URL,
                "checked_at": checked_at, "image": image.model_dump(mode="json") if image else None,
            }
            results[player_id] = image
        self.cache_path.parent.mkdir(parents=True, exist_ok=True)
        self.cache_path.write_text(json.dumps(self.cache, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        return results
