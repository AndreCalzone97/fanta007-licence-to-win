from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path

from app.data.historical_importer import (
    merge_player_statistics,
    read_fantacalcio_xlsx,
)
from app.domain.player import PlayerDataset


SOURCE_URLS = {
    "serie-a-2025-26": "https://www.fantacalcio.it/statistiche-serie-a/2025-26/fantacalcio/riepilogo",
    "serie-a-2026-27": "https://www.fantacalcio.it/statistiche-serie-a/2026-27/fantacalcio/riepilogo",
    "euroleghe-2025-26": "https://www.fantacalcio.it/statistiche-euro-leghe/2025-26/fantacalcio",
}


def _source_rows(path: Path, season: str, source: str, default_competition: str, confidence: str, updated_at: date):
    return read_fantacalcio_xlsx(
        path,
        season,
        SOURCE_URLS[source],
        source="Fantacalcio.it EuroLeghe" if source.startswith("euro") else "Fantacalcio.it",
        default_competition=default_competition,
        confidence=confidence,  # type: ignore[arg-type]
        updated_at=updated_at,
    )


def _coverage(dataset: PlayerDataset) -> dict[str, int]:
    current = previous = euro_only = no_previous = 0
    for player in dataset.players:
        seasons = {entry.season: entry for entry in player.statistics}
        if "2026/27" in seasons:
            current += 1
        previous_entry = seasons.get("2025/26")
        if previous_entry is None:
            no_previous += 1
        elif previous_entry.source == "Fantacalcio.it EuroLeghe":
            euro_only += 1
        else:
            previous += 1
    return {
        "players": len(dataset.players),
        "players_with_current_season": current,
        "players_with_previous_serie_a": previous,
        "players_with_previous_euroleghe_fallback": euro_only,
        "players_without_previous_stats": no_previous,
        "season_records": sum(len(player.statistics) for player in dataset.players),
    }


def _scoring_reference(dataset: PlayerDataset) -> dict[str, object]:
    """Build deterministic role/season distributions for the frontend engine."""
    roles: dict[str, dict[str, object]] = {}
    for role in ("P", "D", "C", "A"):
        peers = [player for player in dataset.players if player.role_classic == role]
        role_ref: dict[str, object] = {
            "fvm": sorted(player.fvm for player in peers),
            "fvm_mantra": sorted(player.fvm_mantra for player in peers),
            "qa": sorted(player.current_quotation for player in peers),
            "qa_mantra": sorted(player.current_quotation_mantra for player in peers),
            "seasons": {},
        }
        seasons: dict[str, dict[str, list[float]]] = {}
        for player in peers:
            for entry in player.statistics:
                if (entry.appearances or 0) <= 0:
                    continue
                bucket = seasons.setdefault(entry.season, {"fantasy_average": [], "average_rating": []})
                if entry.fantasy_average is not None:
                    bucket["fantasy_average"].append(float(entry.fantasy_average))
                if entry.average_rating is not None:
                    bucket["average_rating"].append(float(entry.average_rating))
        for season, values in seasons.items():
            role_ref["seasons"][season] = {key: sorted(items) for key, items in values.items()}
        roles[role] = role_ref
    return {"version": 1, "source": "data/normalized/players.json", "roles": roles}


def main() -> None:
    parser = argparse.ArgumentParser(description="Unisce le statistiche Fantacalcio per ID nel dataset Fanta007.")
    parser.add_argument("--dataset", type=Path, required=True)
    parser.add_argument("--serie-a-2025-26", type=Path, required=True)
    parser.add_argument("--serie-a-2026-27", type=Path, required=True)
    parser.add_argument("--euroleghe-2025-26", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    parser.add_argument("--scoring-reference", type=Path)
    parser.add_argument("--updated-at", default=date.today().isoformat())
    args = parser.parse_args()
    updated_at = date.fromisoformat(args.updated_at)

    dataset = PlayerDataset.model_validate_json(args.dataset.read_text(encoding="utf-8"))
    previous_primary = _source_rows(args.serie_a_2025_26, "2025/26", "serie-a-2025-26", "Serie A", "HIGH", updated_at)
    current = _source_rows(args.serie_a_2026_27, "2026/27", "serie-a-2026-27", "Serie A", "HIGH", updated_at)
    previous_fallback = _source_rows(args.euroleghe_2025_26, "2025/26", "euroleghe-2025-26", "EuroLeghe", "MEDIUM", updated_at)
    merged = merge_player_statistics(dataset, [(200, previous_fallback), (300, previous_primary), (300, current)])
    merged = merged.model_copy(update={"metadata": merged.metadata.model_copy(update={"status": "candidate"})})

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(merged.model_dump(mode="json"), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report = {
        "status": "candidate",
        "identity_key": "Fantacalcio Id",
        "priority": ["Fantacalcio Serie A", "Fantacalcio EuroLeghe", "existing verified fallback"],
        "sources": {
            "serie_a_2025_26": {"rows": len(previous_primary), "matched_ids": sum(row.player_id in {p.id for p in dataset.players} for row in previous_primary)},
            "serie_a_2026_27": {"rows": len(current), "matched_ids": sum(row.player_id in {p.id for p in dataset.players} for row in current)},
            "euroleghe_2025_26": {"rows": len(previous_fallback), "matched_ids": sum(row.player_id in {p.id for p in dataset.players} for row in previous_fallback)},
        },
        "coverage": _coverage(merged),
        "unresolved_ids": sorted({row.player_id for row in [*previous_primary, *current, *previous_fallback]} - {p.id for p in dataset.players}),
        "updated_at": args.updated_at,
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if args.scoring_reference:
        args.scoring_reference.parent.mkdir(parents=True, exist_ok=True)
        args.scoring_reference.write_text(json.dumps(_scoring_reference(merged), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output), "coverage": report["coverage"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
