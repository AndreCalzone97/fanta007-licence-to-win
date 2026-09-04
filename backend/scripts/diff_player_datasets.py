from __future__ import annotations

import argparse
import json
from pathlib import Path

from app.domain.player import PlayerDataset


TRACKED_FIELDS = (
    "source_name",
    "name",
    "team",
    "team_id",
    "role_classic",
    "roles_mantra",
    "current_quotation",
    "initial_quotation",
    "quotation_delta",
    "current_quotation_mantra",
    "initial_quotation_mantra",
    "quotation_delta_mantra",
    "fvm",
    "fvm_mantra",
)


def _categories(changes: dict) -> list[str]:
    categories: list[str] = []
    fields = set(changes)
    if "team" in fields:
        categories.append("transfer")
    if "team_id" in fields:
        categories.append("team_identity")
    if "role_classic" in fields:
        categories.append("classic_role")
    if "roles_mantra" in fields:
        categories.append("mantra_role")
    if fields & {"source_name", "name"}:
        categories.append("name")
    if fields & {
        "current_quotation", "initial_quotation", "quotation_delta",
        "current_quotation_mantra", "initial_quotation_mantra",
        "quotation_delta_mantra", "fvm", "fvm_mantra",
    }:
        categories.append("valuation")
    return categories


def build_diff(current: PlayerDataset, candidate: PlayerDataset) -> dict:
    old = {player.id: player for player in current.players}
    new = {player.id: player for player in candidate.players}
    added = [new[player_id].model_dump(mode="json") for player_id in sorted(new.keys() - old.keys())]
    removed = [old[player_id].model_dump(mode="json") for player_id in sorted(old.keys() - new.keys())]
    changed = []
    category_counts = {
        "transfers": 0,
        "team_identity_changes": 0,
        "classic_role_changes": 0,
        "mantra_role_changes": 0,
        "name_changes": 0,
        "valuation_changes": 0,
    }
    for player_id in sorted(old.keys() & new.keys()):
        changes = {field: {"before": getattr(old[player_id], field), "after": getattr(new[player_id], field)} for field in TRACKED_FIELDS if getattr(old[player_id], field) != getattr(new[player_id], field)}
        if changes:
            categories = _categories(changes)
            changed.append({"player_id": player_id, "player_name": new[player_id].name, "categories": categories, "changes": changes})
            category_counts["transfers"] += "transfer" in categories
            category_counts["team_identity_changes"] += "team_identity" in categories
            category_counts["classic_role_changes"] += "classic_role" in categories
            category_counts["mantra_role_changes"] += "mantra_role" in categories
            category_counts["name_changes"] += "name" in categories
            category_counts["valuation_changes"] += "valuation" in categories
    return {
        "status": "pending_manual_approval",
        "current_source": current.metadata.model_dump(mode="json"),
        "candidate_source": candidate.metadata.model_dump(mode="json"),
        "summary": {
            "added": len(added),
            "removed": len(removed),
            "changed": len(changed),
            **category_counts,
        },
        "added": added,
        "removed": removed,
        "changed": changed,
    }


def render_markdown(report: dict) -> str:
    summary = report["summary"]
    lines = [
        "# Fanta007 — Dataset Diff",
        "",
        f"Stato: **{report['status']}**",
        "",
        "## Riepilogo",
        "",
        *[f"- {key}: {value}" for key, value in summary.items()],
        "",
        "## Modifiche rilevate",
        "",
    ]
    if not report["changed"] and not report["added"] and not report["removed"]:
        lines.append("- Nessuna modifica.")
    else:
        visible_changes = report["changed"][:50]
        lines.extend(
            f"- #{item['player_id']} {item['player_name']}: {', '.join(item['categories'])}"
            for item in visible_changes
        )
        remaining = len(report["changed"]) - len(visible_changes)
        if remaining:
            lines.append(f"- …altri {remaining} record nel report JSON completo.")
        lines.extend(f"- Nuovo: #{item['id']} {item['name']}" for item in report["added"])
        lines.extend(f"- Rimosso: #{item['id']} {item['name']}" for item in report["removed"])
    lines.extend(["", "> Il report non attiva il dataset candidato.", ""])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Genera un report di confronto senza attivare il dataset candidato.")
    parser.add_argument("--current", required=True, type=Path)
    parser.add_argument("--candidate", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--markdown-output", type=Path)
    args = parser.parse_args()
    current = PlayerDataset.model_validate_json(args.current.read_text(encoding="utf-8"))
    candidate = PlayerDataset.model_validate_json(args.candidate.read_text(encoding="utf-8"))
    report = build_diff(current, candidate)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if args.markdown_output:
        args.markdown_output.parent.mkdir(parents=True, exist_ok=True)
        args.markdown_output.write_text(render_markdown(report), encoding="utf-8")
    print(f"Diff creato: {report['summary']}. Nessun dataset è stato attivato.")


if __name__ == "__main__":
    main()
