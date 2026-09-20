import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test, before, after } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server;
let StudioWelcome;

before(async () => {
  server = await createServer({ cacheDir: `node_modules/.vite-tests/${process.pid}`, optimizeDeps: { noDiscovery: true, include: [] },
    root: process.cwd(),
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
  });
  ({ StudioWelcome } = await server.ssrLoadModule("/src/components/StudioWelcome.tsx"));
});

after(async () => server?.close());

function renderLanding(props = {}) {
  return renderToStaticMarkup(createElement(StudioWelcome, { onStart() {}, ...props }));
}

function headingText(markup, tagName) {
  const match = markup.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`, "i"));
  assert.ok(match, `expected a ${tagName} in the landing markup`);
  return match[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function imageSources(markup) {
  return [...markup.matchAll(/\b(?:src|srcSet)="([^"]+)"/gi)].map((match) => match[1]);
}

test("landing exposes FANTA007 copy and the existing brand", () => {
  const html = renderLanding();
  assert.match(headingText(html, "h1"), /Il mercato è tuo\. Giocalo bene\./);
  assert.match(html, /aria-labelledby="welcome-title"/);
  assert.match(html, /FANTA007/);
  assert.match(html, /Licence to Win/);
  assert.match(html, /src="\/src\/assets\/agent\/agent-brand-360\.webp"/);
});

test("landing offers working setup and resume actions", () => {
  const html = renderLanding();
  assert.match(html, /<button[^>]*class="reuno-action"[^>]*>Costruisci la tua rosa/);
  assert.match(html, /<footer[^>]*class="landing-footer"[\s\S]*?<button[^>]*>Configura la tua squadra/);
  const resumed = renderLanding({ onResume() {} });
  assert.match(resumed, /<button[^>]*class="reuno-action"[^>]*>Torna alla tua squadra/);
});

test("landing anchors point to real in-page targets", () => {
  const html = renderLanding();
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const anchors = [...html.matchAll(/\bhref="#([^"]+)"/g)].map((match) => match[1]);
  assert.ok(anchors.length >= 3);
  for (const target of anchors) assert.ok(ids.has(target), `missing anchor target #${target}`);
});

test("FAQ renders six chevrons without the removed plus glyph or final-dossier wording", async () => {
  const html = renderLanding();
  assert.equal((html.match(/class="landing-faq-trigger"/g) ?? []).length, 6);
  assert.equal((html.match(/class="landing-faq-chevron"/g) ?? []).length, 6);
  assert.doesNotMatch(html, />\s*\+\s*</);

  // Radix keeps closed answer bodies out of SSR markup, so assert the source contract too.
  const faqSource = await readFile(new URL("../src/components/ui/FantaFaq.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(faqSource, /dossier\s+finale/i);
});

test("landing uses local brand/agent media without a remote image dependency", () => {
  const sources = imageSources(renderLanding());
  assert.ok(sources.length > 0);
  assert.ok(sources.every(source => !/^https?:\/\//i.test(source)));
});

test("landing CSS remains scoped and preserves reduced-motion fallback", async () => {
  const css = await readFile(new URL("../src/styles/landing.css", import.meta.url), "utf8");
  assert.match(css, /\.fanta-welcome/);
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /animation: none !important/);
});
