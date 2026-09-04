from pydantic import BaseModel, ConfigDict, Field

from app.domain.player import Player


class PlayerSearchResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    player: Player
    score: float = Field(ge=0, le=100)
    matched_on: str


class PlayerListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[Player]
    total: int = Field(ge=0)
    offset: int = Field(ge=0)
    limit: int = Field(ge=1)
