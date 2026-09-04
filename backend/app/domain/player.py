from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


ClassicRole = Literal["P", "D", "C", "A"]
MediaReviewStatus = Literal["pending", "approved", "rejected", "fallback"]
StatsConfidence = Literal["HIGH", "MEDIUM", "LOW"]


class PlayerImage(BaseModel):
    """Licensed image metadata. Every field is optional by design."""

    model_config = ConfigDict(extra="forbid")

    url: str | None = None
    thumbnail_url: str | None = None
    source: str | None = None
    author: str | None = None
    license: str | None = None
    attribution_url: str | None = None
    source_page: str | None = None
    attribution_text: str | None = None
    portrait_approved: bool = True
    identity_confidence: float | None = Field(default=None, ge=0, le=1)
    status: MediaReviewStatus = "approved"
    review_notes: str | None = None
    reviewed_at: datetime | None = None
    verified_at: datetime | None = None


class ExternalIds(BaseModel):
    model_config = ConfigDict(extra="forbid")

    fantacalcio: str | None = None
    api_football: int | None = None
    wikidata: str | None = None


class PlayerSeasonStats(BaseModel):
    """Provider-backed season totals. Missing metrics stay null, never inferred."""

    model_config = ConfigDict(extra="forbid")

    season: str
    competition: str
    club: str | None = None
    source: str
    source_url: str | None = None
    updated_at: date | datetime | None = None
    confidence: StatsConfidence | None = None
    appearances: int | None = Field(default=None, ge=0)
    starts: int | None = Field(default=None, ge=0)
    minutes: int | None = Field(default=None, ge=0)
    goals: int | None = Field(default=None, ge=0)
    assists: int | None = Field(default=None, ge=0)
    yellow_cards: int | None = Field(default=None, ge=0)
    red_cards: int | None = Field(default=None, ge=0)
    average_rating: float | None = Field(default=None, ge=0, le=10)
    fantasy_average: float | None = Field(default=None, ge=0, le=20)
    goals_conceded: int | None = Field(default=None, ge=0)
    penalties_taken: int | None = Field(default=None, ge=0)
    penalties_scored: int | None = Field(default=None, ge=0)
    penalties_missed: int | None = Field(default=None, ge=0)
    penalties_saved: int | None = Field(default=None, ge=0)
    own_goals: int | None = Field(default=None, ge=0)


class Player(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: int = Field(gt=0)
    source_name: str = Field(min_length=1)
    name: str = Field(min_length=1)
    aliases: list[str] = Field(default_factory=list)
    team: str = Field(min_length=1)
    team_id: str | None = None
    role_classic: ClassicRole
    roles_mantra: list[str] = Field(min_length=1)
    current_quotation: int = Field(ge=0)
    initial_quotation: int = Field(ge=0)
    quotation_delta: int
    current_quotation_mantra: int = Field(ge=0)
    initial_quotation_mantra: int = Field(ge=0)
    quotation_delta_mantra: int
    fvm: int = Field(ge=0)
    fvm_mantra: int = Field(ge=0)
    image: PlayerImage | None = None
    statistics: list[PlayerSeasonStats] = Field(default_factory=list)
    external_ids: ExternalIds = Field(default_factory=ExternalIds)


class DatasetMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    season: str
    source_file: str
    source_sha256: str
    sheet: str
    player_count: int = Field(ge=0)
    generated_at: datetime | None = None
    status: Literal["active", "candidate"] | None = None
    official_source_url: str | None = None


class PlayerDataset(BaseModel):
    model_config = ConfigDict(extra="forbid")

    metadata: DatasetMetadata
    players: list[Player]
