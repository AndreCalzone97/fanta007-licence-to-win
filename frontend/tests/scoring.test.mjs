import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test, before, after } from "node:test";
import { createServer } from "vite";

const config = { teamName: "Test", participants: 8, mode: "Classic", budget: 500, goal: "Arrivare almeno in Top 3" };
let server;
let getPlayerAppeal;
let players;

before(async () => {
  server = await createServer({ root: process.cwd(), server: { middlewareMode: true }, appType: "custom" });
  ({ getPlayerAppeal } = await server.ssrLoadModule("/src/lib/appeal.ts"));
  const dataset = JSON.parse(await readFile(new URL("../../data/normalized/players.json", import.meta.url), "utf8"));
  players = dataset.players;
});

after(async () => server?.close());

test("appetibilità is deterministic and bounded for every role", () => {
  const summary = [];
  for (const role of ["P", "D", "C", "A"]) {
    const rolePlayers = players.filter((player) => player.role_classic === role);
    assert.ok(rolePlayers.length > 0);
    const scores = rolePlayers.map((player) => getPlayerAppeal(player, config).score);
    assert.ok(scores.every((score) => score >= 0 && score <= 100));
    assert.ok(new Set(scores).size > 1);
    const sorted = [...scores].sort((a, b) => a - b);
    summary.push(`${role}: media ${(scores.reduce((sum, score) => sum + score, 0) / scores.length / 20).toFixed(2)}/5 · p90 ${(sorted[Math.floor(sorted.length * .9)] / 20).toFixed(2)}/5`);
  }
  console.log(`SCORE DISTRIBUTION — ${summary.join(" | ")}`);
});

test("same player and context always use the same score", () => {
  const player = players.find((candidate) => candidate.name === "Malen") ?? players[0];
  assert.deepEqual(getPlayerAppeal(player, config), getPlayerAppeal(player, config));
});

test("missing history does not become a fake zero", () => {
  const noHistory = { ...players[0], statistics: [] };
  const appeal = getPlayerAppeal(noHistory, config);
  assert.ok(appeal.score > 0);
  assert.equal(appeal.confidence, "LOW");
});
