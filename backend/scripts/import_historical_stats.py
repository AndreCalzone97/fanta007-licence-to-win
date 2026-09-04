from __future__ import annotations

import argparse
import json
from pathlib import Path

from app.data.historical_importer import read_historical_csv
from app.domain.player import PlayerDataset
from app.services.player_identity import PlayerIdentityResolver


def main() -> None:
    parser = argparse.ArgumentParser(description="Importa un CSV storico autorizzato nel dataset Fanta007.")
    parser.add_argument("--dataset", required=True, type=Path)
    parser.add_argument("--csv", required=True, type=Path)
    parser.add_argument("--season", required=True)
    parser.add_argument("--source-url", required=True)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--report", type=Path, default=Path("data/reports/unmatched_players.json"))
    args = parser.parse_args()

    dataset = PlayerDataset.model_validate_json(args.dataset.read_text(encoding="utf-8"))
    resolver = PlayerIdentityResolver(dataset.players)
    by_id = {player.id: player for player in dataset.players}
    report = []
    matched = 0
    for name, team, stats in read_historical_csv(args.csv, args.season, args.source_url):
        result = resolver.resolve(name, team)
        if result.status == "matched" and result.player_id is not None:
            player = by_id[result.player_id]
            retained = [entry for entry in player.statistics if entry.season != stats.season]
            by_id[player.id] = player.model_copy(update={"statistics": [stats, *retained]})
            matched += 1
        else:
            report.append({"name": name, "team": team, "status": result.status, "candidate_id": result.player_id, "confidence": result.confidence})

    updated = dataset.model_copy(update={"players": [by_id[player.id] for player in dataset.players]})
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(updated.model_dump(mode="json"), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Importati {matched} record; {len(report)} casi richiedono revisione. Output: {args.output}")


if __name__ == "__main__":
    main()
