from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.domain.player import Player


class LeagueConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")
    teamName: str = Field(min_length=2, max_length=40)
    participants: int = Field(strict=True, ge=2, le=100)
    mode: Literal["Classic", "Mantra", "Classic con Trequartisti"]
    budget: int = Field(strict=True, ge=25, le=100000)
    goal: Literal["Vincere e umiliare tutti", "Arrivare almeno in Top 3", "Fare una stagione dignitosa", "Non arrivare ultimo"]


    @field_validator("teamName")
    @classmethod
    def valid_name(cls, value: str) -> str:
        if len(value.strip()) < 2:
            raise ValueError("Nome squadra non valido")
        return value.strip()


class SquadEntry(BaseModel):
    model_config = ConfigDict(extra="forbid")
    player_id: int = Field(strict=True, gt=0)
    paidPrice: int = Field(strict=True, ge=1, le=100000)
    addedAt: str

    @field_validator("addedAt")
    @classmethod
    def valid_date(cls, value: str) -> str:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            raise ValueError("addedAt deve includere il fuso orario")
        return value


class StoredSquad(BaseModel):
    model_config = ConfigDict(extra="forbid")
    version: Literal[2]
    config: LeagueConfig
    players: list[SquadEntry] = Field(max_length=25)


class ResolvedEntry(BaseModel):
    player: Player
    paidPrice: int
    addedAt: str


class ResolvedSquad(BaseModel):
    config: LeagueConfig
    squad: list[ResolvedEntry]
