import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server;
let Onboarding;

before(async () => {
  server = await createServer({
    cacheDir: `node_modules/.vite-tests/${process.pid}`,
    optimizeDeps: { noDiscovery: true, include: [] },
    root: process.cwd(),
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
  });
  ({ Onboarding } = await server.ssrLoadModule("/src/components/Onboarding.tsx"));
});

after(async () => server?.close());

test("onboarding preserves the five-step flow and exposes live mission context", () => {
  const html = renderToStaticMarkup(createElement(Onboarding, { onCancel() {}, onComplete() {} }));
  assert.match(html, /class="studio-setup onboarding-shell"/);
  assert.equal((html.match(/<li(?=[ >])/g) ?? []).length, 5);
  for (const label of ["Squadra", "Partecipanti", "Regole", "Budget", "Obiettivo"]) assert.match(html, new RegExp(label));
  assert.match(html, /Configurazione live/i);
  assert.match(html, /Setup missione/i);
  assert.match(html, /fanta007-logo-v2\.webp/);
  assert.match(html, /fantagente-hero-v2\.webp/);
  assert.doesNotMatch(html, /agent-(?:thinking|positive|warning)-/);
  assert.match(html, /role="progressbar"/);
  assert.match(html, /data-state="current"/);
  assert.match(html, /Passaggio 1 di 5/);
  assert.match(html, /Inserisci un nome di almeno 2 caratteri/);
});

test("onboarding visual system is scoped, responsive and reduced-motion safe", async () => {
  const css = await readFile(new URL("../src/styles/onboarding.css", import.meta.url), "utf8");
  assert.match(css, /\.onboarding-shell/);
  assert.match(css, /#030806/);
  assert.match(css, /#42e2a6/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /budget-control/);

  const onboarding = await readFile(new URL("../src/components/Onboarding.tsx", import.meta.url), "utf8");
  assert.match(onboarding, /AnimatePresence/);
  assert.match(onboarding, /type="range"/);
  assert.match(onboarding, /aria-describedby="budget-help budget-range-note"/);
  assert.match(onboarding, /variant="companion"/);

  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  assert.match(app, /La missione<br \/>inizia adesso\./);
  assert.match(app, /ENTRA NELLA HOME/);
  assert.match(app, /variant="companion"/);

  const brand = await readFile(new URL("../src/components/BrandLogo.tsx", import.meta.url), "utf8");
  assert.match(brand, /fanta007-logo-v2\.webp/);
  assert.doesNotMatch(brand, /agent-brand-/);
});
