from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.domain.player import MediaReviewStatus, PlayerImage


class PlayerMediaReview(BaseModel):
    model_config = ConfigDict(extra="forbid")

    player_id: int
    player_name: str
    team: str
    image: PlayerImage | None = None
    status: MediaReviewStatus
    identity_confidence: float = Field(ge=0, le=1)
    review_notes: str | None = None
    reviewed_at: datetime | None = None


class MediaReviewUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    action: Literal["approve", "reject", "fallback"]
    review_notes: str | None = Field(default=None, max_length=500)
