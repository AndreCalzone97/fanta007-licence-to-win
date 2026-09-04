from __future__ import annotations

import os
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BACKEND_DIR.parent


def dataset_path() -> Path:
    configured = os.getenv("FANTA007_DATASET_PATH")
    if configured:
        path = Path(configured)
        return path if path.is_absolute() else PROJECT_ROOT / path
    return PROJECT_ROOT / "data" / "normalized" / "players.json"


def media_review_path() -> Path:
    configured = os.getenv("FANTA007_MEDIA_REVIEW_PATH")
    if configured:
        path = Path(configured)
        return path if path.is_absolute() else PROJECT_ROOT / path
    return PROJECT_ROOT / "data" / "manual" / "player_media_reviews.json"


def team_catalog_path() -> Path:
    configured = os.getenv("FANTA007_TEAM_CATALOG_PATH")
    if configured:
        path = Path(configured)
        return path if path.is_absolute() else PROJECT_ROOT / path
    return PROJECT_ROOT / "data" / "manual" / "teams.2026-27.json"


def allowed_origins() -> list[str]:
    raw = os.getenv(
        "FANTA007_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )
    return [origin.strip() for origin in raw.split(",") if origin.strip()]
