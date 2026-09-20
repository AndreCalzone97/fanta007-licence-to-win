from collections import Counter

from fastapi import APIRouter, HTTPException, Request

from app.domain.squad import ResolvedEntry, ResolvedSquad, StoredSquad

router = APIRouter(prefix="/squads", tags=["squads"])
ROLE_LIMITS = {"P": 3, "D": 8, "C": 8, "A": 6}


@router.post("/resolve", response_model=ResolvedSquad)
def resolve_squad(saved: StoredSquad, request: Request) -> ResolvedSquad:
    """Validate browser-owned persistence and hydrate it; no server-side write."""
    ids = [entry.player_id for entry in saved.players]
    if len(ids) != len(set(ids)):
        raise HTTPException(422, "ID giocatori duplicati nella rosa")
    squad = []
    for entry in saved.players:
        player = request.app.state.player_repository.get(entry.player_id)
        if player is None:
            raise HTTPException(422, f"Giocatore non disponibile nel dataset: {entry.player_id}")
        player = request.app.state.media_review_repository.apply(player)
        squad.append(ResolvedEntry(player=player, paidPrice=entry.paidPrice, addedAt=entry.addedAt))
    counts = Counter(entry.player.role_classic for entry in squad)
    if saved.config.mode != "Mantra" and any(counts[role] > limit for role, limit in ROLE_LIMITS.items()):
        raise HTTPException(422, "Limiti di reparto superati con i ruoli attuali")
    spent = sum(entry.paidPrice for entry in squad)
    if spent + (25 - len(squad)) > saved.config.budget:
        raise HTTPException(422, "Budget insufficiente: conservare almeno 1 credito per slot libero")
    return ResolvedSquad(config=saved.config, squad=squad)
