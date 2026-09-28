import os
import unittest
from unittest.mock import patch

from app.services import football_cache
from app.services.serie_a_feed import TEAM_NAMES, _select_matchday, match_detail, serie_a_feed


def fixture(match_id, day, date, status, home, away, goals=None):
    return {"fixture": {"id": match_id, "date": date, "status": {"short": status}}, "league": {"round": day}, "teams": {"home": {"name": home}, "away": {"name": away}}, "goals": goals or {"home": None, "away": None}}


class SerieAFeedTests(unittest.TestCase):
    def tearDown(self):
        football_cache.clear()

    def test_demo_is_explicit_and_does_not_invent_scores(self):
        with patch.dict(os.environ, {}, clear=True):
            feed = serie_a_feed()
        self.assertEqual(feed["mode"], "demo")
        self.assertEqual(len(feed["standings"]), 20)
        self.assertEqual(len(feed["nextMatches"]), 10)
        self.assertIsNone(feed["standings"][0]["points"])
        self.assertIsNone(feed["lastMatches"][0]["homeScore"])
        self.assertEqual(feed["lastMatches"][0]["status"], "N/D")
        self.assertTrue({"Monza", "Venezia", "Frosinone"}.issubset(TEAM_NAMES))
        self.assertFalse({"Verona", "Pisa", "Cremonese"}.intersection(TEAM_NAMES))

    def test_full_matchday_and_standings_are_normalized(self):
        standings = [{"league": {"standings": [[{"rank": 1, "team": {"name": "Inter"}, "points": 22, "all": {"played": 10, "win": 7, "draw": 1, "lose": 2, "goals": {"for": 18, "against": 8}}, "goalsDiff": 10}]]}}]
        fixtures = [fixture(1, "Regular Season - 4", "2026-09-01T18:00:00Z", "FT", "Roma", "Milan", {"home": 1, "away": 0}), fixture(2, "Regular Season - 5", "2026-09-26T18:00:00Z", "NS", "Inter", "Napoli"), fixture(3, "Regular Season - 5", "2026-09-27T18:00:00Z", "NS", "Lazio", "Bologna"), fixture(4, "Regular Season - 6", "2026-10-01T18:00:00Z", "NS", "Juventus", "Como")]
        with patch.dict(os.environ, {"API_FOOTBALL_KEY": "sample", "API_FOOTBALL_SEASON": "2026"}), patch("app.services.football_provider.request", side_effect=[standings, fixtures]) as request:
            feed = serie_a_feed()
        self.assertEqual(request.call_count, 2)
        self.assertEqual(feed["mode"], "live")
        self.assertEqual(feed["standings"][0]["goalDifference"], 10)
        self.assertEqual(len(feed["nextMatches"]), 2)
        self.assertEqual(feed["lastMatches"][0]["homeScore"], 1)

    def test_provider_failure_uses_last_snapshot_then_demo(self):
        with patch.dict(os.environ, {"API_FOOTBALL_KEY": "sample", "API_FOOTBALL_SEASON": "2026"}), patch("app.services.football_provider.request", side_effect=OSError("offline")):
            self.assertEqual(serie_a_feed()["mode"], "demo")
            football_cache.put("snapshot:2026", {"mode": "live", "source": "API-Football", "updatedAt": "2026-09-01", "standings": [{"team": "Inter"}], "nextMatches": [], "lastMatches": []}, 0)
            self.assertEqual(serie_a_feed()["mode"], "stale")

    def test_match_detail_uses_embedded_events_and_no_demo_invention(self):
        self.assertEqual(match_detail("demo-next-0")["events"], [])
        sample = fixture(55, "Regular Season - 5", "2026-09-26T18:00:00Z", "FT", "Inter", "Roma", {"home": 1, "away": 0})
        sample["events"] = [{"time": {"elapsed": 90, "extra": 4}, "team": {"name": "Inter"}, "player": {"name": "Tester"}, "type": "Goal", "detail": "Normal Goal"}]
        with patch.dict(os.environ, {"API_FOOTBALL_KEY": "sample"}), patch("app.services.football_provider.request", return_value=[sample]):
            detail = match_detail("55")
        self.assertEqual(detail["events"][0]["minute"], 90)
        self.assertEqual(detail["events"][0]["extraMinute"], 4)
        self.assertEqual(detail["match"]["homeScore"], 1)
        football_cache.put("match:55", detail, 0)
        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual(match_detail("55")["mode"], "stale")

    def test_only_eligible_matches_are_in_selected_round(self):
        matches = [
            {"status": "NS", "date": "2026-09-27", "matchday": "Round 5"},
            {"status": "FT", "date": "2026-09-26", "matchday": "Round 5"},
            {"status": "NS", "date": "2026-09-28", "matchday": "Round 5"},
        ]
        self.assertEqual(len(_select_matchday(matches, True)), 2)
        self.assertEqual(len(_select_matchday(matches, False)), 1)

    def test_team_logos_are_limited_to_provider_media_host(self):
        standings = [{"league": {"standings": [[{"rank": 1, "team": {"name": "Inter", "logo": "https://media.api-sports.io/football/teams/505.png"}}]]}}]
        game = fixture(55, "Round 5", "2026-09-26T18:00:00Z", "NS", "Inter", "Roma")
        game["teams"]["home"]["logo"] = "https://media.api-sports.io/football/teams/505.png"
        game["teams"]["away"]["logo"] = "https://example.com/untrusted.png"
        with patch.dict(os.environ, {"API_FOOTBALL_KEY": "sample", "API_FOOTBALL_SEASON": "2026"}), patch("app.services.football_provider.request", side_effect=[standings, [game]]):
            feed = serie_a_feed()
        self.assertEqual(feed["standings"][0]["teamLogo"], "https://media.api-sports.io/football/teams/505.png")
        self.assertEqual(feed["nextMatches"][0]["homeLogo"], "https://media.api-sports.io/football/teams/505.png")
        self.assertIsNone(feed["nextMatches"][0]["awayLogo"])

    def test_partial_live_response_preserves_available_section(self):
        game = fixture(55, "Round 5", "2026-09-26T18:00:00Z", "NS", "Inter", "Roma")
        with patch.dict(os.environ, {"API_FOOTBALL_KEY": "sample", "API_FOOTBALL_SEASON": "2026"}), patch("app.services.football_provider.request", side_effect=[[], [game]]):
            feed = serie_a_feed()
        self.assertEqual(feed["mode"], "live")
        self.assertEqual(feed["standings"], [])
        self.assertEqual(len(feed["nextMatches"]), 1)

    def test_empty_match_detail_uses_stale_cached_detail(self):
        football_cache.put("match:55", {"match": {"id": 55}, "events": [], "lineups": [], "statistics": [], "mode": "live"}, 0)
        with patch.dict(os.environ, {"API_FOOTBALL_KEY": "sample"}), patch("app.services.football_provider.request", return_value=[]):
            self.assertEqual(match_detail("55")["mode"], "stale")

    def test_malformed_provider_rows_fall_back_without_crashing(self):
        with patch.dict(os.environ, {"API_FOOTBALL_KEY": "sample", "API_FOOTBALL_SEASON": "2026"}), patch("app.services.football_provider.request", return_value=[None]):
            self.assertEqual(serie_a_feed()["mode"], "demo")
            self.assertIsNone(match_detail("55"))


if __name__ == "__main__":
    unittest.main()
