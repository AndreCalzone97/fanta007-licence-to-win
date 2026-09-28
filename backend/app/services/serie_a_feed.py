"""Serie A snapshot and match detail with stale/demo fallbacks."""
import os
from datetime import datetime, timezone
from urllib.parse import urlparse

from app.services import football_cache, football_provider

FINISHED = {"FT", "AET", "PEN"}
UPCOMING = {"NS", "TBD", "PST"}
LIVE = {"1H", "HT", "2H", "ET", "BT", "P", "INT", "LIVE"}
TEAM_NAMES = ["Inter", "Napoli", "Roma", "Milan", "Juventus", "Atalanta", "Bologna", "Lazio", "Fiorentina", "Torino", "Como", "Udinese", "Genoa", "Sassuolo", "Parma", "Cagliari", "Lecce", "Monza", "Venezia", "Frosinone"]


def _season():
    configured = os.getenv("API_FOOTBALL_SEASON", "").strip()
    if configured.isdigit():
        return int(configured)
    now = datetime.now(timezone.utc)
    return now.year if now.month >= 7 else now.year - 1


def _logo(value):
    if not isinstance(value, str):
        return None
    try:
        parsed = urlparse(value)
    except ValueError:
        return None
    return value if parsed.scheme == "https" and parsed.hostname == "media.api-sports.io" else None


def _standings(raw):
    league = (raw[0].get("league") or {}) if raw else {}
    table = next(iter(league.get("standings") or []), [])
    return [{"position": row.get("rank"), "team": (row.get("team") or {}).get("name") or "—", "teamLogo": _logo((row.get("team") or {}).get("logo")), "played": (row.get("all") or {}).get("played"), "won": (row.get("all") or {}).get("win"), "drawn": (row.get("all") or {}).get("draw"), "lost": (row.get("all") or {}).get("lose"), "goalsFor": ((row.get("all") or {}).get("goals") or {}).get("for"), "goalsAgainst": ((row.get("all") or {}).get("goals") or {}).get("against"), "goalDifference": row.get("goalsDiff"), "points": row.get("points")} for row in table]


def _match(raw):
    fixture, league, teams = raw.get("fixture") or {}, raw.get("league") or {}, raw.get("teams") or {}
    goals = raw.get("goals") or {}
    return {"id": fixture.get("id"), "matchday": league.get("round") or "Giornata da definire", "date": fixture.get("date"), "status": ((fixture.get("status") or {}).get("short") or "TBD"), "homeTeam": (teams.get("home") or {}).get("name") or "—", "awayTeam": (teams.get("away") or {}).get("name") or "—", "homeLogo": _logo((teams.get("home") or {}).get("logo")), "awayLogo": _logo((teams.get("away") or {}).get("logo")), "homeScore": goals.get("home"), "awayScore": goals.get("away")}


def _select_matchday(matches, upcoming):
    eligible = [m for m in matches if (m["status"] in UPCOMING if upcoming else m["status"] in FINISHED)]
    eligible.sort(key=lambda m: m.get("date") or "", reverse=not upcoming)
    if not eligible:
        return []
    selected = [m for m in eligible if m["matchday"] == eligible[0]["matchday"]]
    return sorted(selected, key=lambda m: m.get("date") or "")


def _demo():
    standings = [{"position": i + 1, "team": team, "teamLogo": None, "played": None, "won": None, "drawn": None, "lost": None, "goalsFor": None, "goalsAgainst": None, "goalDifference": None, "points": None} for i, team in enumerate(TEAM_NAMES)]
    pairs = [(TEAM_NAMES[i], TEAM_NAMES[-i - 1]) for i in range(10)]
    upcoming = [{"id": f"demo-next-{i}", "matchday": "Giornata illustrativa", "date": None, "status": "TBD", "homeTeam": home, "awayTeam": away, "homeLogo": None, "awayLogo": None, "homeScore": None, "awayScore": None} for i, (home, away) in enumerate(pairs)]
    past = [{**m, "id": f"demo-last-{i}", "status": "N/D"} for i, m in enumerate(upcoming)]
    return {"mode": "demo", "source": "Dati illustrativi: nessuna classifica o risultato attuale", "standings": standings, "nextMatches": upcoming, "lastMatches": past, "updatedAt": None}


def _load_section(name, path, params, key, ttl):
    cache_key = f"{name}:{_season()}"
    cached = football_cache.get(cache_key)
    if cached is not None:
        return cached["response"]
    rows = football_provider.request(path, params, key)
    football_cache.put(cache_key, {"response": rows}, ttl)
    return rows


def serie_a_feed():
    key = os.getenv("API_FOOTBALL_KEY", "").strip()
    if not key:
        stale = football_cache.get(f"snapshot:{_season()}", allow_stale=True)
        return {**stale, "mode": "stale", "source": "Ultimi dati API-Football salvati · chiave non configurata"} if stale else _demo()
    season = _season()
    params = {"league": football_provider.SERIE_A_LEAGUE_ID, "season": season}
    try:
        table = _standings(_load_section("standings", "standings", params, key, 6 * 3600))
        fixtures = [_match(row) for row in _load_section("fixtures", "fixtures", params, key, 30 * 60)]
        if not table and not fixtures:
            raise ValueError("Empty Serie A response")
        result = {"mode": "live", "source": "API-Football", "updatedAt": datetime.now(timezone.utc).isoformat(), "standings": table, "nextMatches": _select_matchday(fixtures, True), "lastMatches": _select_matchday(fixtures, False)}
        football_cache.put(f"snapshot:{season}", result, 30 * 60)
        return result
    except (OSError, ValueError, KeyError, TypeError, AttributeError):
        stale = football_cache.get(f"snapshot:{season}", allow_stale=True)
        return {**stale, "mode": "stale", "source": "Ultimi dati API-Football salvati · aggiornamento non disponibile"} if stale else _demo()


def match_detail(match_id):
    if match_id.startswith("demo-"):
        demo = _demo()
        match = next((m for m in [*demo["nextMatches"], *demo["lastMatches"]] if m["id"] == match_id), None)
        return {"match": match, "events": [], "lineups": [], "statistics": [], "mode": "demo"} if match else None
    if not match_id.isdigit():
        return None
    cache_key = f"match:{match_id}"
    cached = football_cache.get(cache_key)
    if cached is not None:
        return cached
    key = os.getenv("API_FOOTBALL_KEY", "").strip()
    if not key:
        stale = football_cache.get(cache_key, allow_stale=True)
        return {**stale, "mode": "stale"} if stale else None
    try:
        rows = football_provider.request("fixtures", {"id": int(match_id)}, key)
        if not rows:
            raise ValueError("Match detail unavailable")
        raw = rows[0]
        detail = {"match": _match(raw), "mode": "live", "events": [{"minute": (e.get("time") or {}).get("elapsed"), "extraMinute": (e.get("time") or {}).get("extra"), "team": (e.get("team") or {}).get("name"), "player": (e.get("player") or {}).get("name"), "type": e.get("type"), "detail": e.get("detail")} for e in raw.get("events") or []], "lineups": [{"team": (lineup.get("team") or {}).get("name"), "formation": lineup.get("formation"), "players": [(p.get("player") or {}).get("name") for p in lineup.get("startXI") or []]} for lineup in raw.get("lineups") or []], "statistics": [{"team": (stat.get("team") or {}).get("name"), "items": stat.get("statistics") or []} for stat in raw.get("statistics") or []]}
        status = detail["match"]["status"]
        ttl = 90 if status in LIVE else 6 * 3600 if status in FINISHED else 30 * 60
        football_cache.put(cache_key, detail, ttl)
        return detail
    except (OSError, ValueError, KeyError, TypeError, AttributeError):
        stale = football_cache.get(cache_key, allow_stale=True)
        return {**stale, "mode": "stale"} if stale else None
