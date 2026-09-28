from fastapi import APIRouter, HTTPException

from app.services.serie_a_feed import match_detail, serie_a_feed

router = APIRouter(prefix="/serie-a-intelligence", tags=["serie-a"])


@router.get("")
def get_serie_a_feed() -> dict:
    return serie_a_feed()


@router.get("/matches/{match_id}")
def get_match_detail(match_id: str) -> dict:
    detail = match_detail(match_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Dettaglio partita non disponibile")
    return detail
