import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server, HomeExploration, BrandLogo, MatchdayPanel, TeamBadge, isFeed;
const config = { teamName: "Test UX", participants: 8, mode: "Classic", budget: 500, goal: "Arrivare almeno in Top 3" };
const player = { id: 1, name: "Profilo Test", team: "Roma", role_classic: "C", roles_mantra: ["C"], current_quotation: 15, initial_quotation: 14, quotation_delta: 1, current_quotation_mantra: 15, initial_quotation_mantra: 14, quotation_delta_mantra: 1, fvm: 100, fvm_mantra: 100, statistics: [] };
const entry = { player, paidPrice: 12, addedAt: "2026-09-01T12:00:00Z" };
const render = (squad, league = config) => renderToStaticMarkup(createElement(HomeExploration, { config: league, squad, onOpenPlayers() {}, onOpenSquad() {}, onOpenDossier() {} }));

before(async () => {
  server = await createServer({ cacheDir: `node_modules/.vite-tests/${process.pid}`, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom" });
  ({ HomeExploration } = await server.ssrLoadModule("/src/components/HomeExploration.tsx"));
  ({ BrandLogo } = await server.ssrLoadModule("/src/components/BrandLogo.tsx"));
  ({ MatchdayPanel } = await server.ssrLoadModule("/src/components/serie-a/MatchdayPanel.tsx"));
  ({ TeamBadge } = await server.ssrLoadModule("/src/components/serie-a/TeamBadge.tsx"));
  ({ isFeed } = await server.ssrLoadModule("/src/components/serie-a/types.ts"));
});
after(async () => server?.close());

test("approved Home remains the production Home", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  assert.match(app, /const HomeExploration = lazy\(/);
  assert.doesNotMatch(app, /import\.meta\.env\.DEV/);
  assert.doesNotMatch(app, /<CommandCenter/);
});

test("exploration integrates the approved visual roles with real empty-roster values", () => {
  const html = render([]);
  for (const reference of ["Spotlight New / Background Beams", "Kokonut Bento Grid", "Progress Metric Card / HyperUI Progress Bars", "Moving Border / Encrypted Text", "Kokonut Spotlight Cards / Animated Group / In View", "HyperUI Stats", "Aceternity Terminal"]) assert.ok(html.includes(`data-reference="${reference}"`), reference);
  assert.match(html, /class="home-lab-side-paths"/);
  assert.match(html, /FEED \/ 007/);
  assert.match(html, /DA INIZIARE/);
  assert.match(html, /IL TUO MARGINE/);
  assert.match(html, /aria-label="PROSSIMA MOSSA"/);
  assert.match(html, /500<.*? crediti/);
  assert.match(html, /476/);
  assert.match(html, /Appetibilità media<\/span><strong>N\/D/);
  assert.match(html, /Nessun acquisto registrato/);
  assert.match(html, /Nessuna previsione sulle prossime partite/);
});

test("exploration derives spending, maximum bid and recent purchase from existing metadata", () => {
  const html = render([entry]);
  assert.match(html, /IN CORSO/);
  assert.match(html, /488/);
  assert.match(html, /465/);
  assert.match(html, /12 investiti su 500/);
  assert.match(html, /Profilo Test/);
  assert.match(html, /aria-label="Completamento della rosa"/);
});

test("exploration does not present a bid when every slot is occupied", () => {
  const roles = [...Array(3).fill("P"), ...Array(8).fill("D"), ...Array(8).fill("C"), ...Array(6).fill("A")];
  const full = roles.map((role, index) => ({ ...entry, player: { ...player, id: index + 1, role_classic: role }, paidPrice: 1 }));
  const html = render(full);
  assert.match(html, /ROSA COMPLETA/);
  assert.match(html, /COMPLETA/);
  assert.match(html, /Nessuno slot libero/);
  assert.match(html, /Rivedi la rosa/);
  assert.doesNotMatch(html, /Confronta i profili/);
});

test("Home rail exposes three modes, a scrollable panel and a mobile entry", () => {
  const html = render([]);
  assert.match(html, /SERIE A INTELLIGENCE/);
  assert.match(html, /role="tablist"/);
  assert.match(html, /role="tab" aria-selected="true"[^>]*>CLASSIFICA/);
  assert.match(html, /role="tab" aria-selected="false"[^>]*>PROSSIMO/);
  assert.match(html, /role="tab" aria-selected="false"[^>]*>ULTIMO/);
  assert.match(html, /role="tabpanel"[^>]*tabindex="0"/);
  assert.match(html, /class="serie-a-mobile-trigger"/);
  assert.match(html, /DATI ILLUSTRATIVI/);
  assert.doesNotMatch(html, /DEMO ·/);
});

test("Home header uses only the canonical symbol and wordmark", () => {
  const html = renderToStaticMarkup(createElement(BrandLogo, { compact: true, withoutTagline: true }));
  assert.match(html, /<svg[^>]*aria-label="FANTA007"/);
  assert.doesNotMatch(html, /Licence to Win/);
  assert.match(html, /fanta-home-logo-crop/);
});

test("Serie A badge reuses the shared crest and falls back only when no logo exists", () => {
  const known = renderToStaticMarkup(createElement(TeamBadge, { name: "Roma" }));
  assert.match(known, /class="team-crest team-crest-sm serie-a-team-badge"/);
  assert.match(known, /AS_Roma_logo/);
  const provider = renderToStaticMarkup(createElement(TeamBadge, { name: "Club non censito", logo: "https://example.test/crest.svg" }));
  assert.match(provider, /example\.test\/crest\.svg/);
  const missing = renderToStaticMarkup(createElement(TeamBadge, { name: "Club non censito" }));
  assert.match(missing, /<b>CNC<\/b>/);
  const live = renderToStaticMarkup(createElement(TeamBadge, { name: "Roma", logo: "https://media.api-sports.io/football/teams/497.png" }));
  assert.match(live, /media\.api-sports\.io\/football\/teams\/497\.png/);
  for (const team of ["Inter", "Napoli", "Roma", "Milan", "Juventus", "Atalanta", "Bologna", "Lazio", "Fiorentina", "Torino", "Como", "Udinese", "Genoa", "Sassuolo", "Parma", "Cagliari", "Lecce", "Monza", "Venezia", "Frosinone"]) {
    const crest = renderToStaticMarkup(createElement(TeamBadge, { name: team }));
    assert.match(crest, /<img/);
    assert.doesNotMatch(crest, /<b>/);
  }
});

test("Serie A match cards retain team and status when logos or score are unavailable", () => {
  const match = { id: "demo-next-0", matchday: "Giornata illustrativa", date: null, status: "TBD", homeTeam: "Inter", awayTeam: "Roma", homeLogo: null, awayLogo: null, homeScore: null, awayScore: null };
  const html = renderToStaticMarkup(createElement(MatchdayPanel, { matches: [match], empty: "Nessuna partita", onSelect() {} }));
  assert.match(html, /Inter/);
  assert.match(html, /Roma/);
  assert.match(html, /Data da definire/);
  assert.match(html, /serie-a-team-badge/);
  assert.match(html, /FC_Internazionale_Milano_2021/);
  assert.match(html, /AS_Roma_logo/);
  assert.doesNotMatch(html, /0 : 0/);
});

test("incomplete Serie A responses are rejected before rendering", () => {
  assert.equal(isFeed({ mode: "live", source: "API-Football", standings: [{ position: 1 }], nextMatches: [], lastMatches: [] }), false);
  assert.equal(isFeed({ mode: "live", source: "API-Football", standings: [], nextMatches: [{ id: 1, homeTeam: "Inter" }], lastMatches: [] }), false);
});
