# Phase 3 — MCP, CLI e automazione (2026-09-29)

Questo registro descrive lo stato osservato su Windows dalla root `publish-v2`. `ACTIVE` significa che il tool ha risposto in questa sessione; `AVAILABLE_ON_DEMAND` indica un percorso d'uso definito, non necessariamente un'installazione; `DEFERRED_READY` è una scelta documentata senza integrazione. Nessun tool di questa pagina è una dipendenza dell'applicazione.

## Ambiente e livelli di attivazione

- Root: `publish-v2`; Node 24.21.0, npm/npx 11.19.0, uv/uvx 0.11.28, Git 2.55.0, Python della `.venv` 3.12.14. `python` nel PATH punta all'alias Windows Store; usare `.venv\Scripts\python.exe` per il backend. Serena 1.7.0, Gitleaks 8.30.1 e Ruff 0.16.9 rispondono da PATH; Repomix 1.18.1 risponde via npx dopo il ripristino della cache. Docker non è nel PATH; WinGet sì. Nessuna ExecutionPolicy modificata.
- **CORE registrato:** Serena e Playwright MCP; usarli solo quando servono navigazione simbolica o browser QA. Context7 e i tool Codex già disponibili restano selezionabili. `codex mcp list` mostra Serena/Playwright abilitati; in questa sessione i tool di entrambi sono rilevati e hanno risposto.
- **ON DEMAND:** Schemathesis per contratti API, Gitleaks per segreti, Inspector per diagnosi MCP, Trivy per scansioni ampie, k6 per performance, Promptfoo per valutazioni AI. Nessuno è una routine automatica per ogni task.
- **FUTURE / SPECIALIST:** Langfuse, n8n, Browser Use e MCP aggiuntivi. Selezionare una skill primaria FANTA007 e 1–5 skill/tool secondari: in totale 2–6 strumenti pertinenti, con eccezioni motivate. Non attivare Domain Pack interi.

## Tool e confini

### Stato degli MCP esistenti

| Componente | INSTALLED | DETECTED | RESPONDS | SCOPE |
| --- | --- | --- | --- | --- |
| Serena MCP | CLI 1.7.0 e registrazione Codex | Sì, `codex mcp list` e catalogo tool corrente | Sì, `get_current_config`: progetto `publish-v2`, LSP ready | User scope; opera sulla root attiva |
| Playwright MCP | Pacchetto user-level 0.0.83 e browser headless ripristinato | Sì, `codex mcp list` e catalogo tool corrente | Sì, `browser_navigate(about:blank)` | User scope; browser headless isolato |
| MCP Inspector tooling | Pacchetto risolto on demand via npx, non server registrato | Sì, CLI `--help` | Sì, help CLI; nessun nuovo `tools/list` eseguito in Phase 3 | Cache npm utente; diagnosi manuale |

La prima chiamata a Playwright fallì perché il browser configurato mancava. Il download ufficiale lo ha ripristinato; non è stata cambiata la registrazione MCP. `npx --no-install` non trovava inizialmente Inspector nella cache: il successivo `--yes @latest --help` è riuscito. Questa distinzione evita di chiamare «installato globalmente» un tool solo risolto da npx.

| Tool e fonte | Tipo · stato · scope | Scopo e trigger | Overlap | Installazione / aggiornamento | Rischio · disponibilità · auth |
| --- | --- | --- | --- | --- | --- |
| [Serena](https://github.com/oraios/serena) | MCP + CLI · **ACTIVE** · user scope | Simboli e riferimenti quando `rg` non basta. | `rg`, navigazione IDE. | Già installato con `uv tool`; aggiornare solo dopo verifica versione. | Accesso al repository e tool di modifica: limitare scope. Locale gratuito; nessuna auth. |
| [Playwright MCP](https://github.com/microsoft/playwright-mcp) | MCP · **ACTIVE** · user scope | Browser QA di UI/flussi; `about:blank` verificato dopo ripristino del browser headless configurato. | Browser Codex, Browser Use. | Pacchetto user-level già presente; browser ufficiale ripristinato tramite CLI Playwright. Aggiornare pacchetto e browser insieme. | Browser con accesso a pagine/sessioni: usare un solo browser surface. Locale gratuito; auth solo per siti protetti. |
| [MCP Inspector](https://github.com/modelcontextprotocol/inspector) | CLI · **AVAILABLE_ON_DEMAND** · cache npm utente | Diagnosi avvio, `tools/list`, schema MCP; `--help` risponde via `npx.cmd`. | Tool MCP già callable. | `npx.cmd --yes @modelcontextprotocol/inspector@latest --cli ...`; aggiornamento alla prossima invocazione, meglio pin per probe ripetibili. | Può lanciare server e aprire UI: non esporre token. Gratuito; auth dipende dal server. |
| [Schemathesis](https://github.com/schemathesis/schemathesis) | CLI · **ACTIVE** (`ACTIVE_CLI`) · cache uv utente | Test OpenAPI/FastAPI quando un contratto cambia. `uvx schemathesis --version` = 4.28.0; parser ha letto lo schema FANTA007 con 13 path. | pytest/OpenAPI test: aggiunge generazione di casi, non li sostituisce. | `uvx schemathesis`; pin versione per uso ripetibile, aggiornare il pin dopo smoke. Nessuna dependency production. | `run` invia richieste e può mutare dati: solo backend locale/fixture, con filtri, limiti e approvazione dello scope. Locale gratuito; auth solo per API protette. |
| [Gitleaks](https://github.com/gitleaks/gitleaks) | CLI · **ACTIVE** · user scope | Scansione segreti su working tree, history o pre-release. Versione 8.30.1 verificata. | Codex Security e Trivy secret scan. | Binario Windows già installato; aggiornare da release verificando hash. | Usare `--redact`; classificare finding prima di allowlist. Locale gratuito; nessuna auth. |
| [Trivy](https://github.com/aquasecurity/trivy) | CLI · **AVAILABLE_ON_DEMAND** · non installato | Vulnerabilità filesystem, misconfig, secret secondario, immagini container quando il rischio lo richiede. | Gitleaks e audit dipendenze. | [ZIP Windows ufficiale](https://github.com/aquasecurity/trivy/releases) da release verificata, poi `trivy --version`; aggiornare sostituendo il binario verificato. | Scarica database, possibili finding rumorosi; scansioni mirate, niente default gate. CLI locale gratuito; auth solo per registry privati. Docker non presente ora. |
| [k6](https://github.com/grafana/k6) | CLI · **AVAILABLE_ON_DEMAND** · non installato | Latenza/concorrenza FastAPI quando esistono obiettivi di performance e target locale. | Profiling e benchmark API. | [WinGet `GrafanaLabs.k6`](https://github.com/grafana/k6) o release ufficiale; aggiornare via WinGet/release verificata. | Carico potenzialmente intenso: solo ambiente locale/staging autorizzato, mai produzione per default. k6 OSS locale gratuito; cloud/auth opzionali. |
| [Promptfoo](https://github.com/promptfoo/promptfoo) | CLI · **AVAILABLE_ON_DEMAND** · non installato | Eval prompt/modelli/output/RAG/agenti e red team quando Fantagente esiste. | Skill `prompt-regression-testing`, future eval Langfuse. | `npx.cmd promptfoo@<version> --help` dopo revisione/pin; aggiornare il pin, senza package production. | Eval possono inviare dati a modelli e costare; nessuna chiave nel repo. CLI locale gratuita; provider remoti richiedono auth/costi. |
| [Langfuse](https://github.com/langfuse/langfuse) | Piattaforma · **DEFERRED_READY** · futuro AI | Tracce, costi, sessioni ed eval di una feature AI effettiva. | PostHog per analytics prodotto; Datadog per APM generale. | Cloud o [self-host Docker/infra](https://langfuse.com/self-hosting); aggiornamenti solo con piano di esercizio. | Telemetria può contenere prompt/dati: retention e privacy prima dell'uso. OSS self-host gratuito con costo infra; Cloud Hobby con limiti, piani pagati; auth necessaria. Nessuna integrazione ora. |
| [Browser Use](https://github.com/browser-use/browser-use) | CLI/libreria · **SKIPPED_OVERLAP** (`OPTIONAL_SPECIALIST`) · non installato | Solo browser agent autonomo o workflow web lunghi fuori dal browser QA corrente. | Playwright MCP primario. | Se nasce il caso, `uv` user/isolato dopo verifica; aggiornare versione isolata. | Agente può navigare e agire su siti; possibili modelli/servizi a pagamento e auth. Non aggiungere al prodotto. |
| [n8n](https://github.com/n8n-io/n8n) | Piattaforma · **DEFERRED_READY** · futuro automation | Webhook, schedule, messaggistica e ingestion solo con un evento/integrazione esterna concreta. | Cron, GitHub Actions, automazioni esistenti. | [Self-host](https://docs.n8n.io/deploy/host-n8n/) o Cloud; aggiornare con backup e release note. Non avviare un servizio persistente ora. | Workflow/credenziali possono eseguire azioni esterne; decidere ownership e privacy. Community self-host gratuita con limiti di funzioni; Cloud a pagamento; auth per istanza e provider. [MCP instance-level](https://docs.n8n.io/connect/connect-to-n8n-mcp-server/) e [MCP Server Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcptrigger/) disponibili, non configurati qui. |
| [Official MCP Registry](https://registry.modelcontextprotocol.io/) | Directory/API · **AVAILABLE_ON_DEMAND** · web | Discovery e verifica metadata dei candidati MCP. | Non sostituisce audit del repository né probe del server. | Nessuna installazione; consultare registry e sorgente upstream al momento della scelta. | Listing non prova sicurezza o compatibilità. Lettura pubblica gratuita; auth per pubblicazione. |

### Decisione n8n

- **N8N_STATUS:** `DEFERRED_READY`; nessuna istanza o workflow avviato.
- **MCP_SUPPORT:** n8n offre sia accesso MCP a livello di istanza sia MCP Server Trigger per singoli workflow; entrambi richiedono configurazione e permessi espliciti.
- **SELF_HOST_OPTION:** Community Edition locale gratuita con responsabilità di host, backup e aggiornamenti; Docker non è disponibile in questo host al momento del probe.
- **CLOUD_OPTION / FREE/PAID BOUNDARIES:** Cloud gestito con piani a pagamento; la Community Edition self-host è gratuita ma non include ogni funzione dei piani pagati. Verificare prezzi e termini correnti prima di scegliere.
- **WHEN_TO_ACTIVATE:** solo quando esistono un workflow esterno concreto, proprietario, evento, credenziali e regole per i dati.

### Uso sicuro di Gitleaks

Dal repo root, per il working tree: `gitleaks dir . --redact --no-banner` (limitare i path se possibile). Per la history: `gitleaks git . --redact --no-banner --log-opts="-n 15"` come primo campione, poi ampliare se richiesto. Prima di una release: controllare working tree e commit in scope; `gitleaks git . --staged --redact --no-banner` copre gli staged, non gli untracked. Non pubblicare report con segreti; non creare allowlist prima di classificare i finding. Il campione storico di Phase 1 aveva tre match `generic-api-key` su identificatori browser-storage, da rivalutare se riemergono.

### Shortlist MCP futura (nessuna installazione)

Il [Registry ufficiale](https://registry.modelcontextprotocol.io/) è la fonte di discovery, non un server da installare. Ogni candidato richiede revisione di sorgente, permessi, auth e probe isolato prima dell'uso.

| Area | Candidato | Trigger / overlap |
| --- | --- | --- |
| Database | [`io.github.contextflo/postgres-mcp`](https://registry.modelcontextprotocol.io/?q=io.github.contextflo%2Fpostgres-mcp) | Solo con un PostgreSQL reale; preferire accesso read-only e confrontare il plugin Supabase già disponibile. |
| GitHub/dev | [`io.github.github/github-mcp-server`](https://registry.modelcontextprotocol.io/?q=io.github.github%2Fgithub-mcp-server) | Solo per workflow GitHub che superano `git`/`gh`; richiede token con scope minimo. |
| Observability | [`io.github.getsentry/sentry-mcp`](https://registry.modelcontextprotocol.io/?q=io.github.getsentry%2Fsentry-mcp) | Solo se Sentry è adottato; accesso a errori e dati utente. |
| Observability | [`io.github.grafana/mcp-grafana`](https://registry.modelcontextprotocol.io/?q=io.github.grafana%2Fmcp-grafana) | Solo se esiste Grafana; dashboard/telemetria con auth. |
| Browser | [`io.github.microsoft/playwright-mcp`](https://registry.modelcontextprotocol.io/?q=io.github.microsoft%2Fplaywright-mcp) | Già attivo: riferimento del Registry, non seconda installazione. |
| Filesystem | [`io.github.domdomegg/filesystem-mcp`](https://registry.modelcontextprotocol.io/?q=io.github.domdomegg%2Ffilesystem-mcp) | Solo sandbox specializzata; oggi sovrapposto a CLI e accesso file esistente. |
| Data/research | [`io.github.YawLabs/fetch-mcp`](https://registry.modelcontextprotocol.io/?q=io.github.YawLabs%2Ffetch-mcp) | Solo se le fonti web correnti non bastano; verificare rete/SSRF e diritti dei dati. |
| AI evaluation | [Promptfoo MCP](https://github.com/promptfoo/promptfoo) | Candidato dalla documentazione upstream; verificare listing nel Registry e bisogno reale prima di aggiungerlo. |

## Routing operativo

La skill FANTA007 decide il percorso; gli strumenti sono chiamati solo quando il passaggio esiste. BUG → `fanta-bug`/debugging → Serena se servono simboli → test mirato → Playwright se UI. API FEATURE → `fanta-feature` + `fanta-data-api` quando tocca il provider → test backend → Schemathesis solo per contratti. SECURITY → `fanta-security`/Codex Security → Gitleaks → Trivy solo se rischio dipendenze/config/container. RELEASE → test pertinenti → Gitleaks → Trivy opzionale → browser smoke, senza autorizzazione implicita al deploy. PERFORMANCE → profiling → k6 solo su target controllato. AI FEATURE → skill AI → Promptfoo quando ci sono prompt/eval → sicurezza → Langfuse quando serve osservabilità. AUTOMATION → n8n solo per integrazioni evento esterne concrete.

## Probe e limiti

- Serena 1.7.0: `get_current_config` ha restituito `publish-v2` e language server ready. Playwright MCP: `browser_navigate(about:blank)` riuscito dopo il download del browser headless ufficiale mancante. Inspector: `npx.cmd --yes @modelcontextprotocol/inspector@latest --help` riuscito; `--no-install` inizialmente non trovava il pacchetto nella cache. Lo stesso valeva per Repomix, poi verificato con `npx.cmd --yes repomix@latest --version` = 1.18.1. Questi probe non equivalgono a QA del prodotto.
- Schemathesis 4.28.0: CLI e parser verificati sullo schema generato da `app.openapi()` (13 path), senza avviare server né inviare richieste. Un futuro test deve usare solo backend locale/fixture e parametri limitati.
- Gitleaks 8.30.1, Ruff 0.16.9 e CLI Serena già presenti. Trivy, k6, Promptfoo, Langfuse, Browser Use e n8n non sono stati installati. Nessuna nuova dipendenza product o API key.
