// Review-only HTML from the real components. No API calls or squad persistence.
// Run after `npm run build`: node scripts/export-design-preview.mjs (from frontend).
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = await createServer({ root, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const load = async (file, name) => (await server.ssrLoadModule(`/src/components/${file}.tsx`))[name ?? file];
  const Welcome = await load('StudioWelcome');
  const Setup = await load('Onboarding');
  const Home = await load('CommandCenter');
  const Squad = await load('SquadOverview');
  const Analysis = await load('SquadEvaluation');
  const Header = await load('StudioHeader');
  const Nav = await load('BottomNavigation');
  const PlayerCard = await load('PlayerCompactCard');
  const config = { teamName: 'Rosa di esempio', participants: 8, mode: 'Classic', budget: 500, goal: 'Arrivare almeno in Top 3' };
  const sample = [['P',12],['P',3],['D',8],['D',24],['D',15],['C',35],['C',21],['C',30],['A',66],['A',42]];
  const squad = sample.map(([role, price], index) => ({ player: {
    id: index + 1, name: `${{P:'Portiere',D:'Difensore',C:'Centrocampista',A:'Attaccante'}[role]} ${index + 1}`,
    source_name: 'Fixture di revisione', team: 'Club esempio', role_classic: role, roles_mantra: [role], aliases: [],
    current_quotation: 15, initial_quotation: 12, quotation_delta: 3, current_quotation_mantra: 15, initial_quotation_mantra: 12, quotation_delta_mantra: 3,
    fvm: price * 2, fvm_mantra: price * 2, statistics: [],
  }, paidPrice: price, addedAt: `2026-09-01T12:${String(index).padStart(2,'0')}:00Z` }));
  const noop = () => {};
  const props = {config, squad, onOpenPlayers:noop, onOpenSquad:noop, onOpenDossier:noop, onRemove:noop, onAdd:noop, onOpen:noop};
  const shell = (content, active) => h('main', {className:'app-shell'}, h(Header,{teamName:config.teamName}), h(Nav,{active,onNavigate:noop,onSettings:noop}), h('div',{className:'dashboard-content',id:'studio-content'},content));
  const screens = {
    'Ingresso': h(Welcome,{onStart:noop}),
    'Configurazione': h(Setup,{onCancel:noop,onComplete:noop,initialConfig:config}),
    'Home': shell(h(Home,props),'home'),
    'Rosa': shell(h(Squad,props),'squad'),
    'Listone (righe)': shell(h('section',null,h('h1',null,'Listone giocatori'),h('p',null,'Esempio visivo delle righe — giocatori sintetici, nessuna ricerca attiva.'),h('div',{className:'compact-player-list'},...squad.map(entry=>h(PlayerCard,{key:entry.player.id,player:entry.player,config,compared:false,compareDisabled:false,owned:false,favorite:false,onOpen:noop,onToggleCompare:noop,onToggleFavorite:noop})))),'listone'),
    'Analisi': shell(h(Analysis,props),'evaluation'),
  };
  const assets = await readdir(path.join(root,'dist/assets'));
  const css = await readFile(path.join(root,'dist/assets',assets.find(file=>file.endsWith('.css'))),'utf8');
  // Embed the original artwork so the exported review works outside Vite.
  const imageDirectory = path.join(root, 'src/assets/agent');
  const imageData = Object.fromEntries(await Promise.all((await readdir(imageDirectory)).filter(file => file.endsWith('.webp')).map(async file => [file, `data:image/webp;base64,${(await readFile(path.join(imageDirectory,file))).toString('base64')}`])));
  const embedArtwork = html => html.replace(/\/src\/assets\/agent\/([a-z0-9.-]+\.webp)/gi, (url, file) => imageData[file] ?? url);
  const documents = Object.fromEntries(Object.entries(screens).map(([name,component]) => [name, `<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><style>.reveal{opacity:1!important;transform:none!important}body{margin:0}</style><body><div class="studio-ui">${embedArtwork(renderToStaticMarkup(component)).replaceAll('Connessione…','Anteprima statica')}</div></body></html>`]));
  const html = `<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fanta 007 — anteprima locale</title><style>body{margin:0;background:#080e13;color:#edf3f5;font:15px system-ui}header{padding:16px 24px;background:#1e2b33;display:flex;align-items:center;gap:16px;flex-wrap:wrap}header p{width:100%;margin:0;color:#b4c3cc;font-size:13px}select{padding:10px;background:#10171d;color:#edf3f5;border:1px solid #637783;border-radius:6px}label{display:flex;align-items:center;gap:8px}.canvas{overflow:auto;padding:20px}iframe{display:block;margin:auto;border:1px solid #34434c;height:1100px;background:#10171d;max-width:none}</style><header><strong>Fanta 007 · revisione del design</strong><label>Schermata<select id="screen">${Object.keys(screens).map(name=>`<option>${name}</option>`).join('')}</select></label><label>Larghezza<select id="width"><option value="1440">Desktop · 1440 px</option><option value="1024">Tablet · 1024 px</option><option value="768">Tablet · 768 px</option><option value="390">Telefono · 390 px</option></select></label><p>Anteprima statica dai componenti reali. Dati sintetici. I pulsanti dell’app non sono operativi; usa i selettori qui sopra. Non è il sito Vercel e non salva dati.</p></header><div class="canvas"><iframe title="Anteprima della schermata" id="preview" sandbox="allow-same-origin"></iframe></div><script>const pages=${JSON.stringify(documents).replaceAll('<','\\u003c')};const screen=document.getElementById('screen'),width=document.getElementById('width'),frame=document.getElementById('preview');function draw(){frame.style.width=width.value+'px';frame.srcdoc=pages[screen.value]}screen.addEventListener('change',draw);width.addEventListener('change',draw);draw();</script></html>`;
  const directory = path.resolve(root,'../docs/previews');
  await mkdir(directory,{recursive:true});
  await writeFile(path.join(directory,'studio-review.html'),html);
  console.log(`Exported ${Object.keys(screens).length} screens to docs/previews/studio-review.html`);
} finally { await server.close(); }
