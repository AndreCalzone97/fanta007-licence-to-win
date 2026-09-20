from app.data.dataset_audit import audit_dataset
from app.data.normalizer import normalize_dataset
from app.domain.player import PlayerSeasonStats
from app.domain.team import TeamCatalog
from app.services.team_catalog import TeamCatalogService


def test_candidate_audit_checks_hash_teams_and_team_ids(raw_players, player_dataset, source_path):
    names = sorted({row.team for row in raw_players})
    catalog = TeamCatalogService(TeamCatalog.model_validate({
        "metadata": {"season": "2026/27", "competition": "Test", "verified_at": "2026-01-01T00:00:00Z", "source_urls": [], "team_count": 4},
        "teams": [{"id": name.lower(), "code": name[:3].upper(), "name": name, "official_name": name, "season": "2026/27"} for name in names],
    }))
    source = source_path
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
    assert report["summary"]["players"] == 9
    assert report["summary"]["teams"] == 4
    assert report["summary"]["source_hash_matches"] is True


def test_candidate_composition_preserves_enrichments(raw_players, player_dataset, source_path):
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
    source = source_path

    candidate = normalize_dataset(raw_players, source, existing_dataset=enriched_dataset)

    composed = next(player for player in candidate.players if player.id == existing.id)
    assert composed.external_ids == existing.external_ids
    assert composed.image == existing.image
    assert composed.statistics == existing.statistics
