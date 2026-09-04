from __future__ import annotations

import hashlib
from collections import Counter
from pathlib import Path

from app.domain.player import PlayerDataset
from app.services.team_catalog import TeamCatalogService


def audit_dataset(
    dataset: PlayerDataset,
    team_catalog: TeamCatalogService,
    *,
    source_path: Path | None = None,
    require_team_ids: bool = False,
) -> dict:
    errors: list[str] = []
    warnings: list[str] = []
    ids = [player.id for player in dataset.players]
    source_names = [player.source_name.casefold() for player in dataset.players]
    teams = {player.team for player in dataset.players}

    if dataset.metadata.player_count != len(dataset.players):
        errors.append("metadata.player_count non coincide con il numero di record.")
    duplicate_ids = sorted(player_id for player_id, count in Counter(ids).items() if count > 1)
    if duplicate_ids:
        errors.append(f"ID duplicati: {duplicate_ids}")
    duplicate_names = sorted(name for name, count in Counter(source_names).items() if count > 1)
    if duplicate_names:
        warnings.append(f"Nomi sorgente duplicati da verificare: {duplicate_names}")

    unknown_teams = team_catalog.unknown_names(teams)
    if unknown_teams:
        errors.append(f"Squadre non presenti nel catalogo: {unknown_teams}")
    if len(teams) != team_catalog.catalog.metadata.team_count:
        errors.append(
            f"Il dataset contiene {len(teams)} squadre, il catalogo ne dichiara "
            f"{team_catalog.catalog.metadata.team_count}."
        )

    team_id_mismatches: list[int] = []
    for player in dataset.players:
        resolved = team_catalog.resolve(player.team)
        if resolved and require_team_ids and player.team_id != resolved.id:
            team_id_mismatches.append(player.id)
        if player.quotation_delta != player.current_quotation - player.initial_quotation:
            errors.append(f"Diff. Classic incoerente per ID {player.id}.")
        if player.quotation_delta_mantra != (
            player.current_quotation_mantra - player.initial_quotation_mantra
        ):
            errors.append(f"Diff. Mantra incoerente per ID {player.id}.")
    if team_id_mismatches:
        errors.append(f"team_id assente o incoerente per {len(team_id_mismatches)} giocatori.")

    source_hash_matches = None
    if source_path is not None:
        source_path = Path(source_path)
        if not source_path.is_file():
            errors.append(f"File sorgente non trovato: {source_path}")
        else:
            source_hash_matches = hashlib.sha256(source_path.read_bytes()).hexdigest() == dataset.metadata.source_sha256
            if not source_hash_matches:
                errors.append("SHA256 del file sorgente diverso da quello dichiarato nei metadata.")

    role_counts = Counter(player.role_classic for player in dataset.players)
    media_counts = Counter(
        player.image.status if player.image else "missing" for player in dataset.players
    )
    stats_players = sum(bool(player.statistics) for player in dataset.players)
    external_id_players = sum(
        any(
            value is not None
            for value in (
                player.external_ids.fantacalcio,
                player.external_ids.api_football,
                player.external_ids.wikidata,
            )
        )
        for player in dataset.players
    )

    return {
        "status": "valid" if not errors else "invalid",
        "activation": "blocked" if errors else "pending_manual_approval",
        "errors": errors,
        "warnings": warnings,
        "summary": {
            "players": len(dataset.players),
            "teams": len(teams),
            "roles": dict(sorted(role_counts.items())),
            "players_with_statistics": stats_players,
            "players_with_external_ids": external_id_players,
            "media": dict(sorted(media_counts.items())),
            "source_hash_matches": source_hash_matches,
        },
        "dataset_metadata": dataset.metadata.model_dump(mode="json"),
        "team_catalog_metadata": team_catalog.catalog.metadata.model_dump(mode="json"),
    }


def render_audit_markdown(report: dict) -> str:
    summary = report["summary"]
    errors = report["errors"] or ["Nessun errore bloccante."]
    warnings = report["warnings"] or ["Nessun avviso."]
    lines = [
        "# Fanta007 — Dataset Candidate Audit",
        "",
        f"- Stato validazione: **{report['status']}**",
        f"- Attivazione: **{report['activation']}**",
        f"- Giocatori: **{summary['players']}**",
        f"- Squadre: **{summary['teams']}**",
        f"- Ruoli: **{summary['roles']}**",
        f"- SHA256 sorgente verificato: **{summary['source_hash_matches']}**",
        f"- Giocatori con statistiche: **{summary['players_with_statistics']}**",
        f"- Giocatori con ID esterni: **{summary['players_with_external_ids']}**",
        "",
        "## Errori",
        "",
        *[f"- {item}" for item in errors],
        "",
        "## Avvisi",
        "",
        *[f"- {item}" for item in warnings],
        "",
        "## Media nel JSON candidato",
        "",
        *[f"- {status}: {count}" for status, count in summary["media"].items()],
        "",
        "> Il candidato non viene attivato automaticamente. Serve approvazione manuale.",
        "",
    ]
    return "\n".join(lines)
