from backend.scripts.diff_player_datasets import build_diff, render_markdown


def test_dataset_diff_never_activates_candidate(player_dataset):
    player = player_dataset.players[0]
    candidate = player_dataset.model_copy(update={"players": [player.model_copy(update={"fvm": player.fvm + 1}), *player_dataset.players[1:]]})

    report = build_diff(player_dataset, candidate)

    assert report["status"] == "pending_manual_approval"
    assert report["summary"]["changed"] == 1
    assert report["changed"][0]["changes"]["fvm"]["before"] == player.fvm
    assert report["summary"]["valuation_changes"] == 1
    assert "valuation" in report["changed"][0]["categories"]
    assert "pending_manual_approval" in render_markdown(report)


def test_dataset_diff_classifies_transfer_and_role_change(player_dataset):
    player = player_dataset.players[0]
    changed = player.model_copy(update={"team": "Inter", "role_classic": "D"})
    candidate = player_dataset.model_copy(
        update={"players": [changed, *player_dataset.players[1:]]}
    )

    report = build_diff(player_dataset, candidate)

    assert report["summary"]["transfers"] == 1
    assert report["summary"]["classic_role_changes"] == 1
