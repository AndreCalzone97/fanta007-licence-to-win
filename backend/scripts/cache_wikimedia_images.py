from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from urllib.error import HTTPError, URLError

from app.domain.player import PlayerDataset
from app.providers.wikimedia_player_image_provider import WikimediaPlayerImageProvider


def main() -> None:
    parser = argparse.ArgumentParser(description="Cerca foto Commons e applica solo file con licenza allowlist.")
    parser.add_argument("--dataset", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--cache", type=Path, default=Path("data/cache/wikimedia_player_media.json"))
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--delay", type=float, default=0.0, help="Secondi di pausa tra richieste non in cache.")
    parser.add_argument("--retries", type=int, default=3, help="Retry con backoff per risposte HTTP 429.")
    parser.add_argument("--batch-size", type=int, default=1, help="Giocatori cercati per richiesta Commons (massimo consigliato: 10).")
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()

    dataset = PlayerDataset.model_validate_json(args.dataset.read_text(encoding="utf-8"))
    provider = WikimediaPlayerImageProvider(args.cache, retries=args.retries)
    updated_by_id = {player.id: player for player in dataset.players}
    missing = [player for player in dataset.players if player.image is None][:args.limit]
    checked = len(missing)
    errors: list[dict[str, str | int]] = []
    batch_size = max(1, min(args.batch_size, 10))
    for start in range(0, len(missing), batch_size):
        batch = missing[start:start + batch_size]
        try:
            images = provider.find_many([(player.id, player.name, player.team) for player in batch])
            for player in batch:
                updated_by_id[player.id] = player.model_copy(update={"image": images.get(player.id)})
        except (HTTPError, URLError, TimeoutError, OSError) as exc:
            for player in batch:
                errors.append({"player_id": player.id, "player_name": player.name, "error": str(exc)})
        if args.delay > 0:
            time.sleep(args.delay)
    updated = [updated_by_id[player.id] for player in dataset.players]
    output = dataset.model_copy(update={"players": updated})
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output.model_dump(mode="json"), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    found = sum(1 for player in updated if player.image)
    pending = sum(1 for player in updated if player.image and player.image.status == "pending")
    summary = {
        "dataset_players": len(dataset.players),
        "checked_missing_players": checked,
        "images_total": found,
        "images_pending_review": pending,
        "fallback_total": len(dataset.players) - found,
        "request_errors": errors,
        "players": [
            {
                "player_id": player.id,
                "player_name": player.name,
                "team": player.team,
                "result": "candidate" if player.image else "fallback",
                "status": player.image.status if player.image else "fallback",
                "source": player.image.source if player.image else None,
                "license": player.image.license if player.image else None,
                "source_page": player.image.source_page if player.image else None,
                "identity_confidence": player.image.identity_confidence if player.image else 0.0,
            }
            for player in updated
        ],
    }
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()
