import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server;
let SettingsDialog;
const config = { teamName: "Squadra test", participants: 8, mode: "Classic", budget: 500, goal: "Vincere" };
const render = (open, league = config) => renderToStaticMarkup(createElement(SettingsDialog, { config: league, open, onClose() {}, onEdit() {}, onReset() {} }));

before(async () => {
  server = await createServer({ cacheDir: `node_modules/.vite-tests/${process.pid}`, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom" });
  ({ SettingsDialog } = await server.ssrLoadModule("/src/components/SettingsDialog.tsx"));
});
after(async () => server?.close());

test("Settings center keeps real mission and league values without fake controls", () => {
  const html = render(true);
  assert.match(html, /id="settings-mission-title">Missione/);
  assert.match(html, /id="settings-config-title">Configurazione/);
  assert.match(html, /id="settings-data-title">Dati/);
  assert.match(html, /Squadra test/);
  assert.match(html, /Vincere/);
  assert.match(html, /Classic/);
  assert.match(html, /500/);
  assert.match(html, /Modifica nome e obiettivo/);
  assert.match(html, /Resetta la missione/);
  assert.doesNotMatch(html, /role="switch"|type="checkbox"/);
  assert.doesNotMatch(html, /Sì, elimina i dati/);
});

test("Settings center stays unmounted while closed", () => {
  assert.equal(render(false), "");
});
