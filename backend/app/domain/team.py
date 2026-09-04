from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


TeamAssetStatus = Literal["fallback", "pending", "approved", "rejected"]


class TeamAsset(BaseModel):
    """Logo metadata. Missing or unapproved assets must render as a fallback."""

    model_config = ConfigDict(extra="forbid")

    status: TeamAssetStatus = "fallback"
    url: str | None = None
    source: str | None = None
    source_url: str | None = None
    license: str | None = None
    attribution: str | None = None
    reviewed_at: datetime | None = None


class Team(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(pattern=r"^[a-z0-9-]+$")
    code: str = Field(min_length=2, max_length=4)
    name: str = Field(min_length=1)
    official_name: str = Field(min_length=1)
    aliases: list[str] = Field(default_factory=list)
    season: str = Field(min_length=1)
    asset: TeamAsset = Field(default_factory=TeamAsset)


class TeamCatalogMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    season: str
    competition: str
    verified_at: datetime
    source_urls: list[str]
    team_count: int = Field(ge=0)


class TeamCatalog(BaseModel):
    model_config = ConfigDict(extra="forbid")

    metadata: TeamCatalogMetadata
    teams: list[Team]
