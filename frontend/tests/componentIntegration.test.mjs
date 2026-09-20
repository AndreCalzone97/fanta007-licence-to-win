import assert from "node:assert/strict";
import { test, before, after } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server, AgentReaction, reactionVariants, TeamSelector, FantaFaq, AppearText, DossierTabs, BottomNavigation, expandable;
before(async () => {
  server = await createServer({ cacheDir: `node_modules/.vite-tests/${process.pid}`, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom" });
  ({ AgentReaction, reactionVariants } = await server.ssrLoadModule("/src/components/AgentReaction.tsx"));
  ({ TeamSelector } = await server.ssrLoadModule("/src/components/TeamSelector.tsx"));
  ({ FantaFaq } = await server.ssrLoadModule("/src/components/ui/FantaFaq.tsx"));
  ({ AppearText } = await server.ssrLoadModule("/src/components/ui/AppearText.tsx"));
  ({ DossierTabs } = await server.ssrLoadModule("/src/components/ui/DossierTabs.tsx"));
  ({ BottomNavigation } = await server.ssrLoadModule("/src/components/BottomNavigation.tsx"));
  expandable = await server.ssrLoadModule("/src/components/ui/ExpandableTabs.tsx");
});
after(async () => server?.close());
test("Expandable Tabs preserves the supplied animation contract and initially collapsed labels", () => {
  assert.deepEqual(expandable.transition, {delay: .1, type: "spring", bounce: 0, duration: .6});
  assert.deepEqual(expandable.buttonVariants.animate(true), {gap: ".5rem", paddingLeft: "1rem", paddingRight: "1rem"});
  assert.deepEqual(expandable.buttonVariants.animate(false), {gap: 0, paddingLeft: ".5rem", paddingRight: ".5rem"});
  assert.deepEqual(expandable.spanVariants.exit, {width: 0, opacity: 0});
  const html = renderToStaticMarkup(createElement(DossierTabs, {value: "overview", id: "test-dossier", onChange() {}}));
  assert.match(html, /expandable-tabs/);
  assert.doesNotMatch(html, /class="expandable-label"/);
  assert.doesNotMatch(html, /ops-tab-selection/);
  assert.equal((html.match(/aria-label="(Scheda|Statistiche|Analisi|Consiglio)"/g) ?? []).length, 4);
});
test("N1 dock exposes five named destinations, current page and a closed mobile menu", () => {
  for (const settingsOpen of [false, true]) {
    const html = renderToStaticMarkup(createElement(BottomNavigation, {
      active: "listone", settingsOpen, onNavigate() {}, onSettings() {},
    }));
    assert.match(html, /class="fanta-floating-nav"/);
    assert.match(html, /n1-desktop/);
    assert.match(html, /n1-mobile/);
    for (const name of ["Home", "La mia rosa", "Listone", "Valutazione", "Impostazioni"]) {
      assert.match(html, new RegExp(`aria-label="${name}"`));
    }
    assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
    assert.match(html, new RegExp(`aria-label="${settingsOpen ? "Impostazioni" : "Listone"}" aria-current="page"`));
    assert.match(html, /aria-expanded="false"/);
  }
});
test("all appeal levels use existing FANTA007 reaction assets without changing ratings", () => {
  assert.deepEqual(Object.values(reactionVariants), ["critical", "warning", "thinking", "positive", "positive"]);
  for (let level = 1; level <= 5; level++) {
    const appeal = { level, rating: 3.2, label: "TEST" };
    const html = renderToStaticMarkup(createElement(AgentReaction, { appeal }));
    assert.match(html, new RegExp(`data-variant="${reactionVariants[level]}"`));
    assert.match(html, /3.2\/5/);
    assert.match(html, /Non è una previsione/);
    assert.deepEqual(appeal, { level, rating: 3.2, label: "TEST" });
  }
});
test("selected team shows its existing crest alongside the name", () => {
  const html = renderToStaticMarkup(createElement(TeamSelector, { teams: [{id:"roma",name:"Roma",aliases:[],colors:[]}], value:"Roma", onChange() {} }));
  assert.match(html, /role="combobox"/);
  assert.match(html, /Filtra per squadra/);
  assert.match(html, /team-crest/);
  assert.match(html, /<img/);
  assert.match(html, /Roma/);
});
test("FAQ exposes accessible controls and real product questions", () => {
  const html = renderToStaticMarkup(createElement(FantaFaq));
  assert.equal((html.match(/aria-expanded="false"/g) ?? []).length, 6);
  assert.match(html, /id="domande-frequenti"/);
  assert.match(html, /rosa ancora incompleta/);
  assert.match(html, /QA e FVM/);
  assert.match(html, /N\/D/);
});
test("animated heading preserves the full accessible text", () => {
  const html = renderToStaticMarkup(createElement(AppearText, { text: "La tua squadra." }));
  assert.match(html, /aria-label="La tua squadra\."/);
  assert.equal((html.match(/club-word-mask/g) ?? []).length, 3);
});
test("dossier tabs expose one keyboard stop and the current selection", () => {
  for (const value of ["overview", "performance", "intelligence", "advice"]) {
    const html = renderToStaticMarkup(createElement(DossierTabs, { value, id: "test-dossier", onChange() {} }));
    assert.equal((html.match(/role="tab"/g) ?? []).length, 4);
    assert.equal((html.match(/tabindex="0"/g) ?? []).length, 1);
    assert.equal((html.match(/tabindex="-1"/g) ?? []).length, 3);
    assert.equal((html.match(/aria-selected="true"/g) ?? []).length, 1);
    assert.match(html, /aria-controls="test-dossier-panel"/);
    assert.match(html, /Consiglio/);
  }
});
