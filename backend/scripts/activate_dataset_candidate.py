from __future__ import annotations

import argparse
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

from app.domain.player import PlayerDataset


def activate_candidate(
    current_path: Path,
    candidate_path: Path,
    archive_dir: Path,
    *,
    expected_source_sha256: str | None = None,
) -> tuple[PlayerDataset, Path]:
    current_path = Path(current_path)
    candidate_path = Path(candidate_path)
    archive_dir = Path(archive_dir)
    current = PlayerDataset.model_validate_json(current_path.read_text(encoding="utf-8"))
    candidate = PlayerDataset.model_validate_json(candidate_path.read_text(encoding="utf-8"))

    if candidate.metadata.status != "candidate":
        raise ValueError("Il file indicato non è marcato come dataset candidato.")
    if expected_source_sha256 and candidate.metadata.source_sha256 != expected_source_sha256.casefold():
        raise ValueError("Checksum sorgente del candidato diverso da quello approvato.")

    archive_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup_path = archive_dir / f"players.{current.metadata.source_sha256[:12]}.{stamp}.json"
    shutil.copy2(current_path, backup_path)

    active = candidate.model_copy(
        update={"metadata": candidate.metadata.model_copy(update={"status": "active"})}
    )
    temporary = current_path.with_suffix(current_path.suffix + ".tmp")
    temporary.write_text(
        json.dumps(active.model_dump(mode="json"), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    PlayerDataset.model_validate_json(temporary.read_text(encoding="utf-8"))
    temporary.replace(current_path)
    return active, backup_path


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Attiva atomicamente un candidato già approvato e archivia il dataset corrente."
    )
    parser.add_argument("--current", required=True, type=Path)
    parser.add_argument("--candidate", required=True, type=Path)
    parser.add_argument("--archive-dir", required=True, type=Path)
    parser.add_argument("--expected-source-sha256")
    args = parser.parse_args()

    active, backup = activate_candidate(
        args.current,
        args.candidate,
        args.archive_dir,
        expected_source_sha256=args.expected_source_sha256,
    )
    print(
        f"Dataset attivato: {active.metadata.player_count} giocatori, "
        f"SHA256 {active.metadata.source_sha256}. Backup: {backup}"
    )


if __name__ == "__main__":
    main()
