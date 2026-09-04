from collections import Counter


def test_parser_reads_complete_active_list(raw_players):
    assert len(raw_players) == 533
    assert Counter(player.role_classic for player in raw_players) == {
        "P": 65,
        "D": 188,
        "C": 193,
        "A": 87,
    }
    assert len({player.id for player in raw_players}) == 533


def test_parser_reads_locatelli_from_real_dataset(raw_players):
    locatelli = next(player for player in raw_players if player.id == 827)
    assert locatelli.source_name == "Locatelli"
    assert locatelli.team == "Juventus"
    assert locatelli.role_classic == "C"
    assert locatelli.current_quotation == 9
    assert locatelli.fvm == 33
    assert locatelli.fvm_mantra == 38


def test_all_quotation_deltas_are_consistent(raw_players):
    assert all(
        player.quotation_delta
        == player.current_quotation - player.initial_quotation
        for player in raw_players
    )
    assert all(
        player.quotation_delta_mantra
        == player.current_quotation_mantra - player.initial_quotation_mantra
        for player in raw_players
    )
