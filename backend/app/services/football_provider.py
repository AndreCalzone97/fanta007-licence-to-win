"""Server-only API-Football adapter; credentials never reach the browser."""
import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen

BASE_URL = "https://v3.football.api-sports.io"
SERIE_A_LEAGUE_ID = 135


def request(path, params, key):
    url = f"{BASE_URL}/{path}?{urlencode(params)}"
    req = Request(url, headers={"x-apisports-key": key, "Accept": "application/json"})
    with urlopen(req, timeout=8) as response:
        payload = json.load(response)
    if payload.get("errors") or not isinstance(payload.get("response"), list):
        raise ValueError("Invalid API-Football response")
    return payload["response"]
