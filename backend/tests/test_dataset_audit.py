from pathlib import Path

from app.data.dataset_audit import audit_dataset
from app.data.normalizer import normalize_dataset
from app.domain.player import PlayerSeasonStats
from app.services.team_catalog import TeamCatalogService


PROJECT_ROOT = Path(__file__).resolve().parents[2]


def test_candidate_audit_checks_hash_teams_and_team_ids(raw_players, player_dataset):
    catalog = TeamCatalogService.from_path(PROJECT_ROOT / "data" / "manual" / "teams.2026-27.json")
    source = PROJECT_ROOT / "data" / "source" / "Quotazioni_Fantacalcio_Stagione_2026_27_2026-09-03.xlsx"
    candidate = normalize_dataset(
        raw_players,
        source,
        existing_dataset=player_dataset,
        team_ids={team.name.casefold(): team.id for team in catalog.all()},
        status="candidate",
    )

    report = audit_dataset(candidate, catalog, source_path=source, require_team_ids=True)

    assert report["status"] == "valid"
    assert report["activation"] == "pending_manual_approval"
    assert report["summary"]["players"] == 533
    assert report["summary"]["teams"] == 20
    assert report["summary"]["source_hash_matches"] is True


def test_candidate_composition_preserves_enrichments(raw_players, player_dataset):
    locatelli = next(player for player in player_dataset.players if player.id == 827)
    existing = locatelli.model_copy(
        update={
            "statistics": [
                PlayerSeasonStats(
                    season="2025/26",
                    competition="Serie A",
                    source="authorized-test-export",
                    appearances=30,
                )
            ],
            "external_ids": locatelli.external_ids.model_copy(
                update={"fantacalcio": "827"}
            ),
        }
    )
    players = [existing if player.id == existing.id else player for player in player_dataset.players]
    enriched_dataset = player_dataset.model_copy(
        update={"players": players}
    )
    source = PROJECT_ROOT / "data" / "source" / "Quotazioni_Fantacalcio_Stagione_2026_27_2026-09-03.xlsx"

    candidate = normalize_dataset(raw_players, source, existing_dataset=enriched_dataset)

    composed = next(player for player in candidate.players if player.id == existing.id)
    assert composed.external_ids == existing.external_ids
    assert composed.image == existing.image
    assert composed.statistics == existing.statistics
