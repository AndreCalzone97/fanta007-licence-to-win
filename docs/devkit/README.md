# AVENGERS DEVKIT v1.0 — FANTA007 extension

Stato: **checkpoint DevKit v1.0 (2026-09-29)**, separato dalla baseline applicativa FANTA007 v0.5.0. Le fasi 1–4 e le sei missioni Phase 4 sono documentate; non è un rilascio del prodotto. Per stato e confini usa [V1_CHECKPOINT.md](V1_CHECKPOINT.md); per ripristino usa [BOOTSTRAP.md](BOOTSTRAP.md). Inventario: [TOOL_REGISTRY.md](TOOL_REGISTRY.md), [SKILL_LIBRARY.md](SKILL_LIBRARY.md) e [WORKFLOWS.md](WORKFLOWS.md).

## Scopo e confini

Il DevKit supporta lo sviluppo della baseline FANTA007 v0.5.0 senza alterare UI, comportamento, dati, API o dipendenze di produzione. Le capacità generali restano nel livello utente/Codex già disponibile; il repository contiene soltanto le convenzioni FANTA007. Una missione seleziona una skill principale e pochi strumenti pertinenti (indicativamente 2–6), non un insieme fisso attivato a ogni richiesta.

L'instradamento è **guidato**, tramite descrizioni delle skill e istruzioni brevi in `AGENTS.md`: non è un processo automatico in background, né un nuovo runtime o framework di agenti.

## Evidenza dell'audit iniziale

- Repository `publish-v2`, branch `main`, commit `6a28881b9fe986434eea7b003ec03742dd6cb7c5`, working tree pulita all'inizio della proposta.
- Frontend React/TypeScript/Vite v0.5.0; comandi `npm test` e `npm run build`. Backend FastAPI/Python v0.5.0; test `pytest` in CI.
- CI esistente: frontend test/build/audit, backend pytest e dependency review per PR. Nessuna configurazione DevKit nel repository e nessun `AGENTS.md` esistente.
- Codex Security è disponibile nel runtime corrente (skill e strumenti MCP del plugin). Superpowers, skill Codex/OpenAI e tooling browser sono già accessibili: niente reinstallazioni.
- `codex mcp list` ha confermato i server registrati e abilitati `serena` e `playwright`. MCP Inspector ha verificato l'avvio di entrambi con `tools/list` e Playwright ha aperto `about:blank` con Chromium headless. La sessione successiva ha rilevato entrambi direttamente; il catalogo espone Context7 e Codex Security.

## Architettura implementata

| Livello | Contenuto | Regola |
| --- | --- | --- |
| General DevKit | Plugin/skill già disponibili in Codex; tool CLI/MCP selezionati e verificati | Riutilizzabile tra progetti; installazioni user/global o on-demand, mai dipendenze runtime dell'app |
| FANTA007 Extension Pack | Otto skill brevi in `.agents/skills/fanta-*/SKILL.md` | Solo decisioni e verifiche specifiche del progetto; nessuna logica applicativa |
| Routing | `AGENTS.md` alla root del repository | Baseline v0.5.0, limiti di autorizzazione, mappa missione→skill; non imporre letture o test irrilevanti |
| Documentazione | `docs/devkit/` | Stato osservato, ripristino e checkpoint separati da proposta o rinvio; link ufficiali dove utili |

Le otto skill hanno trigger distinti: `fanta-feature` (nuove funzionalità), `fanta-bug` (regressioni), `fanta-release` (rilasci autorizzati), `fanta-research` (decisioni informate), `fanta-data-api` (provider sportivi), `fanta-ui-qa` (verifica della UI locked), `fanta-security` (audit mirati), `fanta-handoff` (riepilogo copiabile per missioni sostanziali). Ogni skill richiama strumenti già presenti solo se servono. In particolare, release non implica push/deploy senza mandato; data/API non implica scraping; security non implica scansioni invasive di routine; UI QA non autorizza redesign.

## Selezione degli strumenti

`TOOL_REGISTRY.md` censisce **ogni candidato del brief** con decisione `KEEP / ADAPT / DEFER / SKIP`, stato operativo, livello di installazione, trigger, sovrapposizioni e note. Scelte Phase 1:

- **KEEP operativo:** Superpowers, skill/plugin OpenAI, Codex Security, Context7, Repomix, Serena, Playwright MCP, browser Codex già presente e MCP Inspector on-demand. Il Registry MCP ufficiale resta una fonte di discovery, non un server locale.
- **Qualità mirata:** Gitleaks e Ruff installati a livello utente e verificati. Schemathesis è attivo on demand e ha letto lo schema OpenAPI locale; axe-core resta un'opzione per test futuri. Biome non aggiunto. Trivy, Renovate, Qodo e CodeRabbit differiti o esclusi per ora.
- **ADAPT:** convenzioni Spec Kit come riferimento per feature complesse, senza inizializzare `.specify/` in questa fase.
- **DEFER:** tooling AI di produzione, automazioni e integrazioni chat finché la relativa feature non viene autorizzata.

Il registry distingue `ACTIVE`, `AVAILABLE`, `MANUAL AUTH REQUIRED`, `DEFERRED` e `SKIPPED` in base alle prove raccolte. Nessun tool nuovo entra in `package.json`, `pyproject.toml` o nel runtime di produzione. Serena e Playwright sono configurati nell'MCP utente e verificati con Inspector, senza cambiare la configurazione dell'applicazione.

## Verifica e accettazione delle fasi implementative

1. Scrivere una skill alla volta con descrizione di attivazione discriminante; validare frontmatter e comportamento su scenari rappresentativi prima di passare alla successiva.
2. Verificare che `AGENTS.md` e routing non forzino tutte le skill; documentare cosa è disponibile, cosa è differito e cosa richiede autenticazione.
3. Controllare diff e assenza di segreti; nessuna dipendenza di produzione o file applicativo modificato.
4. Per modifiche al prodotto eseguire i test frontend, build frontend e test backend previsti dal progetto. Il checkpoint Phase 5, limitato al DevKit, usa i controlli mirati descritti in [V1_CHECKPOINT.md](V1_CHECKPOINT.md).
5. Consegnare un handoff sintetico con stato, test, problemi, decisioni PM e prossimo passo. Niente push, merge o deploy senza richiesta esplicita.

## Regola di esecuzione

Il PM ha autorizzato piano conciso e implementazione Phase 1 senza un'altra approvazione, finché non emergano modifiche alla production architecture, costi/servizi esterni obbligatori, credenziali, conflitti sostanziali o operazioni irreversibili. Tali casi richiedono uno stop e una decisione esplicita.
