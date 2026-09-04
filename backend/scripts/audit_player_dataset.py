from __future__ import annotations

import argparse
import json
from pathlib import Path

from app.data.dataset_audit import audit_dataset, render_audit_markdown
from app.domain.player import PlayerDataset
from app.services.team_catalog import TeamCatalogService


def main() -> None:
    parser = argparse.ArgumentParser(description="Verifica un dataset giocatori senza modificarlo.")
    parser.add_argument("--dataset", required=True, type=Path)
    parser.add_argument("--teams", required=True, type=Path)
    parser.add_argument("--source", type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--markdown-output", type=Path)
    parser.add_argument("--require-team-ids", action="store_true")
    args = parser.parse_args()

    dataset = PlayerDataset.model_validate_json(args.dataset.read_text(encoding="utf-8"))
    catalog = TeamCatalogService.from_path(args.teams)
    report = audit_dataset(
        dataset,
        catalog,
        source_path=args.source,
        require_team_ids=args.require_team_ids,
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if args.markdown_output:
        args.markdown_output.parent.mkdir(parents=True, exist_ok=True)
        args.markdown_output.write_text(render_audit_markdown(report), encoding="utf-8")
    print(f"Audit {report['status']}: {len(report['errors'])} errori, {len(report['warnings'])} avvisi.")


if __name__ == "__main__":
    main()
