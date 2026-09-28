import assert from "node:assert/strict";
import { test, before, after } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server, PlayerCompactCard, PlayerSearch, PlayerPreview, PlayerModal, SeasonComparisonTable, SquadOverview, ListoneRails;
const config = { teamName:"Test", participants:8, mode:"Classic", budget:500, goal:"Arrivare almeno in Top 3" };
const player = { id:1, name:"Profilo test", team:"Roma", role_classic:"C", roles_mantra:["C"], current_quotation:12, initial_quotation:10, quotation_delta:2, current_quotation_mantra:17, initial_quotation_mantra:16, quotation_delta_mantra:1, fvm:100, fvm_mantra:120, statistics:[] };
const render = (component, props) => renderToStaticMarkup(createElement(component, props));
before(async () => {
  server = await createServer({ cacheDir: `node_modules/.vite-tests/${process.pid}`, optimizeDeps: { noDiscovery: true, include: [] }, server:{middlewareMode:true,hmr: false, ws: false}, appType:"custom" });
  ({ PlayerCompactCard } = await server.ssrLoadModule("/src/components/PlayerCompactCard.tsx"));
  ({ PlayerSearch } = await server.ssrLoadModule("/src/components/PlayerSearch.tsx"));
  ({ PlayerPreview } = await server.ssrLoadModule("/src/components/PlayerPreview.tsx"));
  ({ PlayerModal, SeasonComparisonTable } = await server.ssrLoadModule("/src/components/PlayerModal.tsx"));
  ({ SquadOverview } = await server.ssrLoadModule("/src/components/SquadOverview.tsx"));
  ({ ListoneRails } = await server.ssrLoadModule("/src/components/ListoneRails.tsx"));
});
after(async () => server?.close());
test("decision row keeps favorite and detail actions for owned players without the redundant exchange control", () => {
  const html = render(PlayerCompactCard,{player,config,owned:true,favorite:true,onOpen(){},onToggleFavorite(){}});
  assert.equal((html.match(/<button/g)??[]).length,2);
  assert.match(html,/In rosa/);
  assert.match(html,/FVM lega/);
  assert.match(html,/<b>50<\/b>/);
  assert.match(html,/aria-pressed="true"/);
  assert.doesNotMatch(html,/ops-row-compare|dal confronto/);
});
test("Listone renders no exchange action or floating comparison banner", () => {
  const html = render(PlayerSearch, { open:true, onClose(){}, onSelect(){}, excludedIds:[], config, variant:"page" });
  assert.doesNotMatch(html,/ops-row-compare|compare-tray|comparison-view/);
  assert.doesNotMatch(html,/<svg[^>]*aria-label="Confronta"/);
});
test("Listone rails reuse real squad totals and do not invent Mantra role limits", () => {
  const entry = { player, paidPrice: 23, addedAt: "2026-09-13" };
  const classic = render(ListoneRails, { config, squad: [entry] });
  assert.match(classic, /477<small> cr\.<\/small>/);
  assert.match(classic, /1<small> \/ 25<\/small>/);
  assert.match(classic, /24<\/strong>/);
  assert.match(classic, /1<small> \/ 8<\/small>/);
  const mantra = render(ListoneRails, { config: { ...config, mode: "Mantra" }, squad: [entry] });
  assert.match(mantra, /In Mantra la copertura dipende dal regolamento/);
  assert.doesNotMatch(mantra, /1<small> \/ 8<\/small>/);
});
test("decision row uses the active league quotation and delta, without changing player data", () => {
  const snapshot=JSON.stringify(player);
  const html=render(PlayerCompactCard,{player,config:{...config,mode:"Mantra"},owned:false,favorite:false,onOpen(){},onToggleFavorite(){}});
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
test("dossier purchase comparison uses saved price and existing normalized FVM", () => {
  const snapshot = JSON.stringify(player);
  const html = render(PlayerModal,{player,config,purchasePrice:60,onClose(){}});
  assert.match(html,/PREZZO PAGATO/);
  assert.match(html,/FVM PER LA LEGA/);
  assert.match(html,/aria-label="Prezzo pagato rispetto al FVM della lega"/);
  assert.match(html,/60 \/ 50 crediti · oltre il riferimento/);
  assert.equal(JSON.stringify(player),snapshot);
});
test("season comparison shows only verified fields relevant to the player's role", () => {
  const historical = [
    { season:"2026/27", competition:"Serie A", source:"Test", appearances:2, average_rating:7.25, goals:1, assists:0, penalties_scored:0, goals_conceded:0 },
    { season:"2025/26", competition:"Serie A", source:"Test", appearances:18, average_rating:6.5, goals:8, assists:null, penalties_scored:2, goals_conceded:0 },
  ];
  const attacker = render(SeasonComparisonTable,{historical,role:"A"});
  assert.match(attacker,/Stagioni a confronto/);
  assert.match(attacker,/Gol segnati/);
  assert.match(attacker,/Rigori segnati/);
  assert.match(attacker,/N\/D/);
  assert.doesNotMatch(attacker,/Gol subiti/);
  const keeper = render(SeasonComparisonTable,{historical,role:"P"});
  assert.match(keeper,/Gol subiti/);
  assert.doesNotMatch(keeper,/Gol segnati/);
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

test("empty squad exposes real zero values, four departments and an actionable empty state", () => {
  const html=render(SquadOverview,{config,squad:[],onAdd(){},onOpen(){},onRemove(){}});
  assert.match(html,/La mia rosa/);
  assert.match(html,/Aggiungi un giocatore/);
  assert.match(html,/Costruisci la tua rosa/);
  assert.match(html,/Apri il Listone/);
  assert.equal((html.match(/class="squad-department"/g)??[]).length,4);
  assert.match(html,/aria-label="Completamento della rosa"[^>]*aria-valuenow="0"/);
  assert.match(html,/aria-label="Budget investito"[^>]*aria-valuenow="0"/);
  assert.match(html,/aria-pressed="true">Reparti/);
  assert.match(html,/aria-pressed="false">Elenco/);
});

test("squad dashboard derives coverage and budget from purchases without inventing Mantra slots", () => {
  const entry={player,paidPrice:23,addedAt:"2026-09-13"};
  const html=render(SquadOverview,{config,squad:[entry],onAdd(){},onOpen(){},onRemove(){}});
  assert.match(html,/aria-label="Completamento della rosa"[^>]*aria-valuenow="1"/);
  assert.match(html,/aria-label="Budget investito"[^>]*aria-valuenow="23"/);
  assert.match(html,/Centrocampisti: 1 slot su 8/);
  assert.match(html,/23 cr.<\/b> investiti/);
  const mantra=render(SquadOverview,{config:{...config,mode:"Mantra"},squad:[entry],onAdd(){},onOpen(){},onRemove(){}});
  assert.match(mantra,/Raggruppamento Classic indicativo/);
  assert.doesNotMatch(mantra,/Centrocampisti: 1 slot su 8/);
});
