from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.domain.player import DatasetMetadata, ExternalIds, Player, PlayerDataset, PlayerImage
from app.data.excel_parser import RawPlayerRow


AliasMap = dict[int, dict[str, Any]]


def load_aliases(path: Path | None) -> AliasMap:
    if path is None:
        return {}
    path = Path(path)
    if not path.is_file():
        raise FileNotFoundError(f"File alias non trovato: {path}")
    payload = json.loads(path.read_text(encoding="utf-8"))
    aliases: AliasMap = {}
    for raw_id, entry in payload.items():
        player_id = int(raw_id)
        if not isinstance(entry, dict):
            raise ValueError(f"Alias non valido per l'Id {player_id}.")
        aliases[player_id] = entry
    return aliases


def normalize_player(
    raw: RawPlayerRow,
    aliases: AliasMap | None = None,
    *,
    existing: Player | None = None,
    team_id: str | None = None,
) -> Player:
    alias_entry = (aliases or {}).get(raw.id, {})
    display_name = str(
        alias_entry.get("display_name")
        or raw.source_name
    ).strip()
    configured_aliases = [
        str(alias).strip()
        for alias in alias_entry.get("aliases", existing.aliases if existing else [])
        if str(alias).strip()
    ]
    all_aliases = list(dict.fromkeys([raw.source_name, display_name, *configured_aliases]))
    image_payload = alias_entry.get("image") if "image" in alias_entry else (
        existing.image.model_dump(mode="json") if existing and existing.image else None
    )
    if image_payload and image_payload.get("portrait_approved") is False and "status" not in image_payload:
        image_payload = {**image_payload, "status": "pending"}
    image = PlayerImage.model_validate(image_payload) if image_payload else None
    external_ids_payload = alias_entry.get("external_ids") if "external_ids" in alias_entry else (
        existing.external_ids.model_dump(mode="json") if existing else {}
    )
    external_ids = ExternalIds.model_validate(external_ids_payload)

    return Player(
        id=raw.id,
        source_name=raw.source_name,
        name=display_name,
        aliases=all_aliases,
        team=raw.team,
        team_id=team_id,
        role_classic=raw.role_classic,
        roles_mantra=[role.strip() for role in raw.role_mantra_raw.split(";") if role.strip()],
        current_quotation=raw.current_quotation,
        initial_quotation=raw.initial_quotation,
        quotation_delta=raw.quotation_delta,
        current_quotation_mantra=raw.current_quotation_mantra,
        initial_quotation_mantra=raw.initial_quotation_mantra,
        quotation_delta_mantra=raw.quotation_delta_mantra,
        fvm=raw.fvm,
        fvm_mantra=raw.fvm_mantra,
        image=image,
        statistics=list(existing.statistics) if existing else [],
        external_ids=external_ids,
    )


def normalize_dataset(
    rows: list[RawPlayerRow],
    source: Path,
    aliases: AliasMap | None = None,
    *,
    sheet_name: str = "Tutti",
    season: str = "2026/27",
    existing_dataset: PlayerDataset | None = None,
    team_ids: dict[str, str] | None = None,
    status: str | None = None,
    official_source_url: str | None = None,
) -> PlayerDataset:
    source = Path(source)
    existing_by_id = {
        player.id: player for player in existing_dataset.players
    } if existing_dataset else {}
    players = [
        normalize_player(
            row,
            aliases,
            existing=existing_by_id.get(row.id),
            team_id=(team_ids or {}).get(row.team.casefold()),
        )
        for row in rows
    ]
    return PlayerDataset(
        metadata=DatasetMetadata(
            season=season,
            source_file=source.name,
            source_sha256=hashlib.sha256(source.read_bytes()).hexdigest(),
            sheet=sheet_name,
            player_count=len(players),
            generated_at=datetime.now(timezone.utc),
            status=status,
            official_source_url=official_source_url,
        ),
        players=players,
    )
