import assert from "node:assert/strict";
import { test, before, after } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server, PlayerCompactCard, PlayerPreview, PlayerModal, SquadOverview, PlayerComparisonView;
const config = { teamName:"Test", participants:8, mode:"Classic", budget:500, goal:"Arrivare almeno in Top 3" };
const player = { id:1, name:"Profilo test", team:"Roma", role_classic:"C", roles_mantra:["C"], current_quotation:12, initial_quotation:10, quotation_delta:2, current_quotation_mantra:17, initial_quotation_mantra:16, quotation_delta_mantra:1, fvm:100, fvm_mantra:120, statistics:[] };
const render = (component, props) => renderToStaticMarkup(createElement(component, props));
before(async () => {
  server = await createServer({ cacheDir: `node_modules/.vite-tests/${process.pid}`, optimizeDeps: { noDiscovery: true, include: [] }, server:{middlewareMode:true,hmr: false, ws: false}, appType:"custom" });
  ({ PlayerCompactCard } = await server.ssrLoadModule("/src/components/PlayerCompactCard.tsx"));
  ({ PlayerPreview } = await server.ssrLoadModule("/src/components/PlayerPreview.tsx"));
  ({ PlayerModal } = await server.ssrLoadModule("/src/components/PlayerModal.tsx"));
  ({ SquadOverview } = await server.ssrLoadModule("/src/components/SquadOverview.tsx"));
  ({ PlayerComparisonView } = await server.ssrLoadModule("/src/components/PlayerComparisonView.tsx"));
});
after(async () => server?.close());
test("decision row keeps independent favorite, detail and comparison actions for owned players", () => {
  const html = render(PlayerCompactCard,{player,config,owned:true,favorite:true,compared:false,compareDisabled:false,onOpen(){},onToggleCompare(){},onToggleFavorite(){}});
  assert.equal((html.match(/<button/g)??[]).length,3);
  assert.match(html,/In rosa/);
  assert.match(html,/FVM lega/);
  assert.match(html,/<b>50<\/b>/);
  assert.match(html,/aria-pressed="true"/);
});
test("decision row uses the active league quotation and delta, without changing player data", () => {
  const snapshot=JSON.stringify(player);
  const html=render(PlayerCompactCard,{player,config:{...config,mode:"Mantra"},onOpen(){},onToggleCompare(){},onToggleFavorite(){}});
  assert.match(html,/<b>17<\/b>/);
  assert.match(html,/<b>120<\/b>/);
  assert.match(html,/<b>60<\/b>/);
  assert.match(html,/>\+1<\/b>/);
  assert.equal(JSON.stringify(player),snapshot);
});
test("owned player preview shows saved price rather than another purchase form", () => {
  const html=render(PlayerPreview,{player,config,squad:[{player,paidPrice:23,addedAt:"2026-09-13"}],onClose(){},onAdd(){},onDossier(){}});
  assert.match(html,/Acquisto registrato/);
  assert.match(html,/>23 <small>crediti/);
  assert.doesNotMatch(html,/id="paid-price"/);
  assert.match(html,/role="dialog"/);
});
test("new player preview keeps acquisition validation and explicit price label", () => {
  const html=render(PlayerPreview,{player,config,squad:[],onClose(){},onAdd(){},onDossier(){}});
  assert.match(html,/for="paid-price"/);
  assert.match(html,/aria-describedby="bid-guidance"/);
  assert.match(html,/disabled=""/);
  assert.match(html,/476 cr\./);
});
test("dossier labels its panel with the selected tab and keeps the zero quotation", () => {
  const html=render(PlayerModal,{player:{...player,current_quotation:0},config,onClose(){}});
  const panel=html.match(/role="tabpanel"[^>]*aria-labelledby="([^"]+)"/);
  assert.ok(panel);
  assert.ok(html.includes(`id="${panel[1]}"`));
  assert.equal((html.match(/role="tab"/g)??[]).length,4);
  assert.match(html,/Consiglio/);
  assert.match(html,/<strong>0<\/strong>/);
});
test("squad ledger preserves purchase price and normalized reference independently", () => {
  const entry={player,paidPrice:23,addedAt:"2026-09-13"};
  const html=render(SquadOverview,{config,squad:[entry],onAdd(){},onOpen(){},onRemove(){}});
  assert.match(html,/477/);
  assert.match(html,/FVM lega/);
  assert.match(html,/<b>23<\/b>/);
  assert.match(html,/<span>50<\/span>/);
  assert.match(html,/Rimuovi dalla rosa/);
  assert.equal(entry.paidPrice,23);
});
