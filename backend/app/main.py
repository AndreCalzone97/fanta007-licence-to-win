from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.players import router as players_router
from app.api.routes.media_review import router as media_review_router
from app.api.routes.teams import router as teams_router
from app.core.config import allowed_origins, dataset_path, media_review_path, team_catalog_path
from app.repositories.media_review_repository import JsonMediaReviewRepository
from app.repositories.json_player_repository import JsonPlayerRepository
from app.repositories.player_repository import PlayerRepository
from app.services.team_catalog import TeamCatalogService


def create_app(repository: PlayerRepository | None = None) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.player_repository = repository or JsonPlayerRepository(dataset_path())
        app.state.media_review_repository = JsonMediaReviewRepository(media_review_path())
        app.state.team_catalog = TeamCatalogService.from_path(team_catalog_path())
        yield

    app = FastAPI(
        title="Fanta007 API",
        description="Data layer e ricerca giocatori per Fanta007 — Licence to Win.",
        version="0.1.0",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins(),
        allow_credentials=False,
        allow_methods=["GET", "PATCH"],
        allow_headers=["*"],
    )
    app.include_router(players_router, prefix="/api/v1")
    app.include_router(media_review_router, prefix="/api/v1")
    app.include_router(teams_router, prefix="/api/v1")

    @app.get("/api/v1/health", tags=["system"])
    def health() -> dict[str, str]:
        return {"status": "ok", "service": "fanta007-api"}

    return app


app = create_app()
