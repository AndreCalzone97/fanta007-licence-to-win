from fastapi import APIRouter, HTTPException, Request

from app.domain.media import MediaReviewUpdate, PlayerMediaReview


router = APIRouter(prefix="/admin/media-review", tags=["media-review"])


@router.get("", response_model=list[PlayerMediaReview])
def list_media_reviews(request: Request) -> list[PlayerMediaReview]:
    return request.app.state.media_review_repository.list(request.app.state.player_repository.all())


@router.patch("/{player_id}", response_model=PlayerMediaReview)
def update_media_review(request: Request, player_id: int, update: MediaReviewUpdate) -> PlayerMediaReview:
    player = request.app.state.player_repository.get(player_id)
    if player is None:
        raise HTTPException(status_code=404, detail="Giocatore non trovato")
    status = {"approve": "approved", "reject": "rejected", "fallback": "fallback"}[update.action]
    try:
        return request.app.state.media_review_repository.update(player, status, update.review_notes)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
