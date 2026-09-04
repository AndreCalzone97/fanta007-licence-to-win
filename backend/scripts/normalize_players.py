from __future__ import annotations

import argparse
import json
from pathlib import Path

from app.data.excel_parser import parse_players
from app.data.normalizer import load_aliases, normalize_dataset


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Normalizza il listone Excel di Fanta007 in JSON."
    )
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument(
        "--aliases",
        type=Path,
        default=Path("data/manual/player_aliases.json"),
    )
    parser.add_argument("--sheet", default="Tutti")
    parser.add_argument("--season", default="2026/27")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    rows = parse_players(args.source, args.sheet)
    aliases = load_aliases(args.aliases)
    dataset = normalize_dataset(
        rows,
        args.source,
        aliases,
        sheet_name=args.sheet,
        season=args.season,
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(dataset.model_dump(mode="json"), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        f"Creato {args.output} con {dataset.metadata.player_count} giocatori "
        f"dal foglio {dataset.metadata.sheet}."
    )


if __name__ == "__main__":
    main()

