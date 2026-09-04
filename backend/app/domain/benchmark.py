from pydantic import BaseModel, ConfigDict, Field

from app.domain.player import ClassicRole


class PlayerBenchmark(BaseModel):
    model_config = ConfigDict(extra="forbid")

    player_id: int
    role: ClassicRole
    role_total: int = Field(ge=1)
    fvm_rank: int = Field(ge=1)
    fvm_percentile: float = Field(ge=0, le=100)
    fvm_top_percent: int = Field(ge=1, le=100)
    qa_rank: int = Field(ge=1)
    qa_percentile: float = Field(ge=0, le=100)
    qa_top_percent: int = Field(ge=1, le=100)
    methodology: str
