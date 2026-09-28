import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server;
let SquadEvaluation, EvaluationPlayerMedia;
const config = { teamName: "Test", participants: 8, mode: "Classic", budget: 500, goal: "Arrivare almeno in Top 3" };
const player = { id: 1, name: "Profilo test", team: "Roma", role_classic: "C", roles_mantra: ["C"], current_quotation: 12, initial_quotation: 10, quotation_delta: 2, current_quotation_mantra: 17, initial_quotation_mantra: 16, quotation_delta_mantra: 1, fvm: 100, fvm_mantra: 120, statistics: [] };
const render = (league, squad) => renderToStaticMarkup(createElement(SquadEvaluation, { config: league, squad, onOpenPlayers() {} }));

before(async () => {
  server = await createServer({ cacheDir: `node_modules/.vite-tests/${process.pid}`, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom" });
  ({ SquadEvaluation } = await server.ssrLoadModule("/src/components/SquadEvaluation.tsx"));
  ({ EvaluationPlayerMedia } = await server.ssrLoadModule("/src/components/EvaluationPlayerMedia.tsx"));
});
after(async () => server?.close());

test("evaluation presents an honest provisional empty state", () => {
  const html = render(config, []);
  assert.match(html, /aria-label="Completamento della rosa"[^>]*aria-valuenow="0"/);
  assert.match(html, /0 \/ 25 giocatori/);
  assert.match(html, /<span aria-label="500">/);
  assert.match(html, /Segnali in attesa/);
  assert.match(html, /Prezzi da valutare/);
  assert.doesNotMatch(html, /07 \/ OBIETTIVO/);
  assert.equal((html.match(/Apri dettaglio /g) ?? []).length, 4);
});

test("evaluation reuses saved price and player count without changing the input", () => {
  const squad = [{ player, paidPrice: 23, addedAt: "2026-09-13" }];
  const before = JSON.stringify(squad);
  const html = render(config, squad);
  assert.match(html, /aria-label="Completamento della rosa"[^>]*aria-valuenow="1"/);
  assert.match(html, /1 \/ 25 giocatori/);
  assert.match(html, /23 investiti su 500/);
  assert.match(html, /<span aria-label="477">/);
  assert.equal(JSON.stringify(squad), before);
});

test("evaluation player media reserves one stable slot for crest or future avatar", () => {
  const crest = renderToStaticMarkup(createElement(EvaluationPlayerMedia, { team: "Roma" }));
  assert.match(crest, /class="evaluation-player-media" data-media="crest"/);
  assert.match(crest, /AS_Roma_logo/);
  const avatar = renderToStaticMarkup(createElement(EvaluationPlayerMedia, { team: "Roma", avatar: { src: "/player-face.webp", alt: "Volto del giocatore" } }));
  assert.match(avatar, /class="evaluation-player-media" data-media="avatar"/);
  assert.match(avatar, /src="\/player-face.webp" alt="Volto del giocatore"/);
});

test("Mantra evaluation keeps the Classic grouping caveat", () => {
  const html = render({ ...config, mode: "Mantra" }, []);
  assert.match(html, /Raggruppamento Classic indicativo/);
  assert.match(html, /vincoli Mantra dipendono dal regolamento/);
});

test("objective verdict appears only when all 25 slots are filled", () => {
  const roles = ["P", "P", "P", ...Array(8).fill("D"), ...Array(8).fill("C"), ...Array(6).fill("A")];
  const squad = roles.map((role, index) => ({ player: { ...player, id: index + 1, name: `Profilo ${index + 1}`, role_classic: role }, paidPrice: 1, addedAt: "2026-09-13" }));
  const html = render(config, squad);
  assert.match(html, /aria-label="Completamento della rosa"[^>]*aria-valuenow="25"/);
  assert.match(html, /VALUTAZIONE COMPLETA/);
  assert.match(html, /07 \/ OBIETTIVO/);
  assert.match(html, /Migliori acquisti/);
  assert.match(html, /Acquisti da rivedere/);
});
