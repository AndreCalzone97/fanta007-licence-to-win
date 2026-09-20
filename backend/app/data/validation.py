"""Structural invariants shared by pipeline entry points and final outputs."""
from collections import Counter

from app.domain.player import PlayerDataset


def validate_dataset(dataset: PlayerDataset) -> PlayerDataset:
    # model_copy(update=...) does not validate updates, including nested models.
    checked = PlayerDataset.model_validate(dataset.model_dump(mode="python"))
    errors = []
    duplicates = sorted(key for key, count in Counter(p.id for p in checked.players).items() if count > 1)
    if duplicates:
        errors.append(f"ID giocatori duplicati: {duplicates}")
    if checked.metadata.player_count != len(checked.players):
        errors.append("metadata.player_count non coincide con il numero di record")
    for player in checked.players:
        if player.quotation_delta != player.current_quotation - player.initial_quotation:
            errors.append(f"Diff. Classic incoerente per ID {player.id}")
        if player.quotation_delta_mantra != player.current_quotation_mantra - player.initial_quotation_mantra:
            errors.append(f"Diff. Mantra incoerente per ID {player.id}")
        seasons = Counter(stats.season for stats in player.statistics)
        repeated = sorted(season for season, count in seasons.items() if count > 1)
        if repeated:
            errors.append(f"Stagioni duplicate per ID {player.id}: {repeated}")
    if errors:
        raise ValueError("Dataset non valido: " + "; ".join(errors))
    return checked
