from __future__ import annotations

import argparse
import json
from pathlib import Path

from app.data.dataset_audit import audit_dataset, render_audit_markdown
from app.data.excel_parser import parse_players
from app.data.normalizer import load_aliases, normalize_dataset
from app.domain.player import PlayerDataset
from app.services.team_catalog import TeamCatalogService


OFFICIAL_SOURCE_URL = "https://www.fantacalcio.it/quotazioni-fantacalcio/2026-27"


def _write_json_atomic(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Compone e verifica un dataset candidato senza sostituire quello attivo."
    )
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--current", required=True, type=Path)
    parser.add_argument("--aliases", required=True, type=Path)
    parser.add_argument("--teams", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--audit-json", required=True, type=Path)
    parser.add_argument("--audit-markdown", required=True, type=Path)
    parser.add_argument("--sheet", default="Tutti")
    parser.add_argument("--season", default="2026/27")
    args = parser.parse_args()

    current = PlayerDataset.model_validate_json(args.current.read_text(encoding="utf-8"))
    team_catalog = TeamCatalogService.from_path(args.teams)
    rows = parse_players(args.source, args.sheet)
    team_ids = {
        row.team.casefold(): team_catalog.require(row.team).id
        for row in rows
    }
    candidate = normalize_dataset(
        rows,
        args.source,
        load_aliases(args.aliases),
        sheet_name=args.sheet,
        season=args.season,
        existing_dataset=current,
        team_ids=team_ids,
        status="candidate",
        official_source_url=OFFICIAL_SOURCE_URL,
    )
    report = audit_dataset(
        candidate,
        team_catalog,
        source_path=args.source,
        require_team_ids=True,
    )

    _write_json_atomic(args.output, candidate.model_dump(mode="json"))
    _write_json_atomic(args.audit_json, report)
    args.audit_markdown.parent.mkdir(parents=True, exist_ok=True)
    args.audit_markdown.write_text(render_audit_markdown(report), encoding="utf-8")
    print(
        f"Candidato creato: {len(candidate.players)} giocatori; "
        f"audit {report['status']}; attivazione {report['activation']}."
    )


if __name__ == "__main__":
    main()
