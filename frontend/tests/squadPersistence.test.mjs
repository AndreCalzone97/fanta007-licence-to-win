import assert from "node:assert/strict";
import { test, before, after } from "node:test";
import { createServer } from "vite";

let server, persistence, acquisitionBlockReason;
const config = { teamName: "Test", participants: 8, mode: "Classic", budget: 500, goal: "Arrivare almeno in Top 3" };
const canonical = { id: 1, name: "Current", team: "Roma", role_classic: "C", current_quotation: 10, statistics: [{ goals: 3 }] };
const entry = { player: canonical, paidPrice: 12, addedAt: "2026-09-01T12:00:00Z" };
function memoryStorage(values = {}) {
  const data = new Map(Object.entries(values));
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}
const resolver = async (saved) => ({ config: saved.config, squad: saved.players.map((p) => ({ player: canonical, paidPrice: p.paidPrice, addedAt: p.addedAt })) });
before(async () => {
  server = await createServer({ cacheDir: `node_modules/.vite-tests/${process.pid}`, optimizeDeps: { noDiscovery: true, include: [] }, root: process.cwd(), server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom" });
  persistence = await server.ssrLoadModule("/src/lib/squadPersistence.ts");
  ({ acquisitionBlockReason } = await server.ssrLoadModule("/src/lib/squad.ts"));
});
after(async () => server?.close());

test("save persists only references and purchase metadata; load hydrates fresh canonical data", async () => {
  const store = memoryStorage();
  await persistence.saveSquad(store, config, [entry], resolver);
  const saved = JSON.parse(store.getItem(persistence.SQUAD_KEY));
  assert.deepEqual(saved, { version: 2, config, players: [{ player_id: 1, paidPrice: 12, addedAt: entry.addedAt }] });
  const nextCanonical = { ...canonical, name: "Corrected", team: "Como", statistics: [{ goals: 4 }] };
  const loaded = await persistence.loadSquad(store, async (stored) => ({ config: stored.config, squad: [{ ...entry, player: nextCanonical }] }));
  assert.equal(loaded.squad[0].player.name, "Corrected");
  assert.equal(loaded.squad[0].player.statistics[0].goals, 4);
  assert.equal(loaded.squad[0].paidPrice, 12);
  assert.equal(JSON.stringify(JSON.parse(store.getItem(persistence.SQUAD_KEY))).includes("Corrected"), false);
});

test("legacy snapshot migrates after resolution; originals remain unchanged", async () => {
  const legacy = JSON.stringify([{ ...entry, player: { ...canonical, name: "Stale" } }]);
  const store = memoryStorage({ [persistence.LEGACY_SQUAD_KEY]: legacy, [persistence.LEGACY_LEAGUE_KEY]: JSON.stringify(config) });
  const loaded = await persistence.loadSquad(store, resolver);
  assert.equal(loaded.squad[0].player.name, "Current");
  assert.equal(store.getItem(persistence.LEGACY_SQUAD_KEY), legacy);
  assert.deepEqual(JSON.parse(store.getItem(persistence.SQUAD_KEY)).players[0], { player_id: 1, paidPrice: 12, addedAt: entry.addedAt });
});

test("failed canonical resolution leaves legacy data untouched and creates no v2", async () => {
  const legacy = JSON.stringify([entry]);
  const store = memoryStorage({ [persistence.LEGACY_SQUAD_KEY]: legacy, [persistence.LEGACY_LEAGUE_KEY]: JSON.stringify(config) });
  await assert.rejects(persistence.loadSquad(store, async () => { throw new Error("Unknown ID"); }), /Unknown ID/);
  assert.equal(store.getItem(persistence.SQUAD_KEY), null);
  assert.equal(store.getItem(persistence.LEGACY_SQUAD_KEY), legacy);
});

test("failed update preserves the last saved squad", async () => {
  const store = memoryStorage();
  await persistence.saveSquad(store, config, [entry], resolver);
  const before = store.getItem(persistence.SQUAD_KEY);
  await assert.rejects(persistence.saveSquad(store, config, [{ ...entry, paidPrice: -1 }], async () => { throw new Error("invalid"); }));
  assert.equal(store.getItem(persistence.SQUAD_KEY), before);
});

test("storage failures propagate instead of reporting success", async () => {
  const store = { getItem: () => null, setItem: () => { throw new Error("quota"); } };
  await assert.rejects(persistence.saveSquad(store, config, [entry], resolver), /quota/);
});

for (const raw of ["{", "null", "[]", '{"version":99}']) {
  test(`invalid current storage is not replaced by a legacy fallback: ${raw}`, async () => {
    const store = memoryStorage({ [persistence.SQUAD_KEY]: raw, [persistence.LEGACY_LEAGUE_KEY]: JSON.stringify(config) });
    await assert.rejects(persistence.loadSquad(store, resolver));
    assert.equal(store.getItem(persistence.SQUAD_KEY), raw);
  });
}

test("malformed legacy structure is rejected", async () => {
  for (const raw of ["{}", "[null]", '[{"paidPrice":12}]']) {
    const store = memoryStorage({ [persistence.LEGACY_SQUAD_KEY]: raw, [persistence.LEGACY_LEAGUE_KEY]: JSON.stringify(config) });
    await assert.rejects(persistence.loadSquad(store, resolver));
    assert.equal(store.getItem(persistence.LEGACY_SQUAD_KEY), raw);
  }
});

test("empty browser does not require an API call", async () => {
  assert.equal(await persistence.loadSquad(memoryStorage(), async () => { throw new Error("must not run"); }), null);
});

test("empty API error responses become a useful error instead of a JSON parse failure", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response(null, { status: 502 });
    await assert.rejects(
      persistence.resolveSquad({ version: 2 }, "/api/v1"),
      /Errore API nella rosa \(HTTP 502\)/,
    );
  } finally { globalThis.fetch = originalFetch; }
});

test("empty successful API responses are reported as an unavailable roster", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response(null, { status: 200 });
    await assert.rejects(
      persistence.resolveSquad({ version: 2 }, "/api/v1"),
      /Risposta API vuota nella rosa \(HTTP 200\)/,
    );
  } finally { globalThis.fetch = originalFetch; }
});

test("remove and undo preserve purchase metadata", async () => {
  const store = memoryStorage();
  await persistence.saveSquad(store, config, [entry], resolver);
  assert.deepEqual((await persistence.saveSquad(store, config, [], resolver)).squad, []);
  const restored = await persistence.saveSquad(store, config, [entry], resolver);
  assert.deepEqual(restored.squad, [entry]);
});

for (const price of [NaN, Infinity, -Infinity, 1.5, 0, -1]) {
  test(`acquisition rejects invalid numeric price ${price}`, () => assert.ok(acquisitionBlockReason(config, [], canonical, price)));
}
test("valid acquisition still respects duplicates and remaining-slot reserve", () => {
  assert.equal(acquisitionBlockReason(config, [], canonical, 476), null);
  assert.ok(acquisitionBlockReason(config, [], canonical, 477));
  assert.ok(acquisitionBlockReason(config, [entry], canonical, 1));
  assert.ok(acquisitionBlockReason({ ...config, budget: NaN }, [], canonical, 1));
});
