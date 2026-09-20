import assert from "node:assert/strict";
import { test, before, after } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server, CommandCenter;
const config = { teamName: "Studio Test", participants: 8, mode: "Classic", budget: 500, goal: "Arrivare almeno in Top 3" };
const player = { id: 1, name: "Giocatore Test", team: "Roma", role_classic: "C", fvm: 100, fvm_mantra: 100, roles_mantra: ["C"], statistics: [] };
const entry = { player, paidPrice: 12, addedAt: "2026-09-01T12:00:00Z" };
function render(squad, league = config) {
  return renderToStaticMarkup(createElement(CommandCenter, { config: league, squad, onOpenPlayers() {}, onOpenSquad() {}, onOpenDossier() {}, onRemove() {} }));
}
before(async () => {
  server = await createServer({ cacheDir: `node_modules/.vite-tests/${process.pid}`, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom" });
  ({ CommandCenter } = await server.ssrLoadModule("/src/components/CommandCenter.tsx"));
});
after(async () => server?.close());

test("empty Home reports real budget, reserve and empty purchases, without match predictions", () => {
  const html = render([]);
  assert.match(html, /<dd>500<small> crediti/);
  assert.match(html, /<dd>476<small> crediti/);
  assert.match(html, /25 posti da completare/);
  assert.match(html, /Nessun acquisto registrato/);
  assert.match(html, /Nessuna previsione sulle prossime partite/);
});
test("Home recalculates spending and reserved credits from purchase metadata", () => {
  const html = render([entry]);
  assert.match(html, /<dd>488<small> crediti/);
  assert.match(html, /<dd>465<small> crediti/);
  assert.match(html, /12 investiti su 500/);
  assert.match(html, /24 posti da completare/);
  assert.match(html, /Giocatore Test/);
});
test("full roster does not offer another purchase or show a misleading maximum bid", () => {
  const roles = [...Array(3).fill("P"), ...Array(8).fill("D"), ...Array(8).fill("C"), ...Array(6).fill("A")];
  const html = render(roles.map((role, index) => ({ ...entry, player: { ...player, id: index + 1, role_classic: role }, paidPrice: 1 })));
  assert.match(html, /Tutti i posti occupati/);
  assert.match(html, /Rosa completa: nessun posto disponibile/);
  assert.match(html, /Rivedi la rosa/);
  assert.doesNotMatch(html, /Trova un giocatore/);
});
test("Mantra composition discloses that Classic grouping is indicative", () => {
  const html = render([], { ...config, mode: "Mantra" });
  assert.match(html, /Distribuzione Classic indicativa/);
  assert.match(html, /I vincoli Mantra dipendono dalla tua lega/);
});
