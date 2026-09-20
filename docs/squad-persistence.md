# Mission #05 — Squad persistence

## Actual architecture

Squads live in browser localStorage, not in backend squad files. Previously
`fanta007.squad.v1` stored an array of `{player, paidPrice, addedAt}` and
`fanta007.league.v2` stored the config separately. Every Player field was copied:
name/source_name, aliases, club/team_id, Classic/Mantra roles, quotations/deltas,
FVM values, image, statistics and external IDs. Reads were unchecked TypeScript
casts. A changed canonical dataset did not refresh the copied objects.

The existing browser storage is retained. No shared server squad file is created:
without identities/authentication that would risk mixing different users' squads.
FastAPI provides `POST /api/v1/squads/resolve`, a stateless validation/resolution
operation. It does not persist anything or enable Media Review administration.
CORS adds POST for the existing configured origins.

## Version 2

`fanta007.squad.v2` contains one atomic localStorage value:

```json
{
  "version": 2,
  "config": {
    "teamName": "Test", "participants": 8, "mode": "Classic", "budget": 500,
    "goal": "Arrivare almeno in Top 3"
  },
  "players": [
    {"player_id": 827, "paidPrice": 12, "addedAt": "2026-09-01T12:00:00Z"}
  ]
}
```

Membership is represented by presence in the list. Price and purchase timestamp
belong to the squad; all Player attributes come from the canonical repository.
Totals, remaining budget and scores are derived, never persisted independently.
The response remains `{config, squad: [{player, paidPrice, addedAt}]}` so existing
views can continue consuming enriched objects. The frontend does not join players.

Flow: read browser value → FastAPI validation → resolve canonical IDs and apply
Media Review overlays → enriched response → persist minimal references → render.
Save/add/remove/undo/config changes use the same validation before committing the
single browser value. A success notification follows successful persistence.

The backend loads its canonical JSON snapshot at startup, as the other player APIs
do. After activating a new dataset, restart the backend and reload the frontend.
Squad resolution also occurs on each save; there is no live ingestion or polling.

## Validation and compatibility

- Strict positive integer IDs and purchase prices; no numeric strings, booleans,
  fractional prices, NaN or infinity. Client acquisition guards give early feedback;
  backend validation is authoritative.
- No duplicate/unknown player IDs; at most 25 entries.
- Classic and Classic con Trequartisti retain limits P=3, D=8, C=8, A=6.
  Mantra retains only the total-size/budget constraints, as previously implemented.
- Price >=1; budget is an integer from 25 to 100000; remaining budget must fund
  every empty slot with at least one credit. The previous minimum of 10 could
  never fund 25 slots and is now rejected explicitly.
- Config modes/goals, participants 2–100, team name and timestamp are validated.
- New canonical roles are used for validation. If a role change invalidates the
  squad, the load fails visibly; no entries are silently removed.

When v2 is absent, the loader extracts only ID, price and timestamp from v1 and
submits them with the old league config. It writes v2 only after successful API
validation. Both old keys are retained as a backup. If v2 exists, it is authoritative:
malformed/unknown versions never silently fall back to older purchases.

Offline/API errors, malformed saves, unknown IDs, invalid prices/config and storage
quota errors preserve existing saved values. Initial load errors block use of an
unresolved squad and offer retry; failed updates retain the previous resolved
state. Reset requires an explicit confirmation and removes both formats.

There is no snapshot fallback for offline squad display, because it would restore
the stale-data problem. Export/copy saved values before manually repairing unknown
IDs or role conflicts; an automatic roster-repair UI is outside this mission.

## Manual verification

With backend and frontend running:

1. Create a league and purchase a player. Inspect localStorage in browser DevTools:
   v2 must contain config, player_id, paidPrice and addedAt, but no Player snapshot.
2. Reload: verify membership, price and date persist. Remove and undo the removal.
3. In an isolated test copy of the canonical dataset, change the player's name or
   statistics; restart the backend using that copy and reload. Verify updated
   canonical attributes and unchanged purchase price. Do not edit tracked data.
4. Test a legacy value in a separate browser profile; successful load creates v2
   and keeps both legacy keys. Corrupt v2 or stop the backend: loading must fail
   visibly without replacing the stored data with an empty squad.

```bash
python -m pytest backend/tests/test_squad_resolution.py -q
python -m pytest backend/tests -q -rs
npm test --prefix frontend
npm run build --prefix frontend
```

Tests use synthetic players, temporary canonical JSON and in-memory browser storage.
Remaining limits: localStorage remains device/browser-local, without cross-tab
conflict handling or cloud backup. API availability is required to resolve a saved
squad; canonical refresh follows backend startup/reload semantics. Rule constants
exist in Python (authoritative) and TypeScript (UX feedback); tests cover boundaries.

Future relational mapping: Player.id is a primary key; FantasyTeam holds config;
SquadPlayer associates a team with player_id and purchase metadata. A unique
(team_id, player_id) pair prevents duplicates, with foreign keys enforcing existing
teams/players. No database, authentication or global squad ownership is introduced.
