import json

import pytest

from backend.scripts.activate_dataset_candidate import activate_candidate


def test_activation_is_atomic_and_keeps_backup(tmp_path, player_dataset):
    current_path = tmp_path / "players.json"
    candidate_path = tmp_path / "candidate.json"
    archive_dir = tmp_path / "archive"
    current_path.write_text(
        json.dumps(player_dataset.model_dump(mode="json")), encoding="utf-8"
    )
    candidate = player_dataset.model_copy(
        update={
            "metadata": player_dataset.metadata.model_copy(update={"status": "candidate"})
        }
    )
    candidate_path.write_text(
        json.dumps(candidate.model_dump(mode="json")), encoding="utf-8"
    )

    active, backup = activate_candidate(
        current_path,
        candidate_path,
        archive_dir,
        expected_source_sha256=candidate.metadata.source_sha256,
    )

    assert active.metadata.status == "active"
    assert backup.is_file()
    assert json.loads(backup.read_text(encoding="utf-8"))["metadata"]["player_count"] == 533
    assert json.loads(current_path.read_text(encoding="utf-8"))["metadata"]["status"] == "active"
    assert json.loads(candidate_path.read_text(encoding="utf-8"))["metadata"]["status"] == "candidate"


def test_activation_rejects_unapproved_checksum(tmp_path, player_dataset):
    current_path = tmp_path / "players.json"
    candidate_path = tmp_path / "candidate.json"
    current_path.write_text(json.dumps(player_dataset.model_dump(mode="json")), encoding="utf-8")
    candidate = player_dataset.model_copy(
        update={"metadata": player_dataset.metadata.model_copy(update={"status": "candidate"})}
    )
    candidate_path.write_text(json.dumps(candidate.model_dump(mode="json")), encoding="utf-8")

    with pytest.raises(ValueError, match="Checksum"):
        activate_candidate(
            current_path,
            candidate_path,
            tmp_path / "archive",
            expected_source_sha256="0" * 64,
        )

    assert not (tmp_path / "archive").exists()
