from app.services.player_identity import PlayerIdentityResolver


def test_identity_resolver_uses_aliases_and_flags_uncertain(player_dataset):
    resolver = PlayerIdentityResolver(player_dataset.players)
    exact = resolver.resolve("Paz N.", "Como")
    typo = resolver.resolve("Nico Pas", "Como")
    missing = resolver.resolve("Giocatore Inesistente", "Roma")

    assert exact.status == "matched"
    assert exact.player_id == 6875
    assert typo.status in {"review", "matched"}
    assert missing.status == "unmatched"
