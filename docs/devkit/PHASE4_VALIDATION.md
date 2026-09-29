# Phase 4 — end-to-end operational validation

Data: **2026-09-29**. Root: `C:\Users\Andry\Desktop\Progetto FANTA007\publish-v2`. Scopo: provare routing → skill → tool → esecuzione → verifica → handoff senza cambiare il prodotto. Nessun nuovo tool, dependency, commit, push o deploy.

## Ambiente

- Skill rilevate: **23/23 globali** e **8/8 `fanta-*` locali** (`SKILL.md` presenti e nomi nel catalogo della sessione). Otto Domain Pack catalogati, nessun pack installato in blocco.
- Serena MCP ha risposto su progetto `publish-v2` con LSP TypeScript pronto. Playwright MCP ha caricato la pagina FANTA007 locale. Schemathesis via `uvx` ha letto OpenAPI; Gitleaks 8.30.1 e Ruff 0.16.9 hanno eseguito controlli. Repomix 1.18.1 e MCP Inspector hanno risposto via `npx` dalla cache. Nessuna reinstallazione in Phase 4.
- Backend e Vite sono stati avviati su `127.0.0.1`, poi arrestati. Una configurazione di lega di prova è stata salvata soltanto nel browser isolato di Playwright per accedere a `/players`; l'API locale l'ha validata. Non è stata creata una rosa prodotto né usata un'API remota.

## Missioni

### 1. Repository / code intelligence — PASS

Routing: `fanta-data-api` per il confine API FANTA007, `analyze` per la spiegazione read-only, Serena per i simboli TypeScript, `rg` per i punti Python. Serena ha restituito `PlayerSearch` e `PlayerModal`; il suo LSP attivo non estrae simboli Python, quindi i file backend sono stati letti in modo mirato.

**Evidenza:** [app startup](../../backend/app/main.py) crea `JsonPlayerRepository(dataset_path())`; [players route](../../backend/app/api/routes/players.py) filtra, ordina, applica media review e restituisce `PlayerListResponse`. [PlayerSearch](../../frontend/src/components/PlayerSearch.tsx) richiede `/api/v1/players`, conserva `page.items` e passa il record selezionato a [PlayersPage](../../frontend/src/pages/PlayersPage.tsx), che apre `PlayerPreview` e poi [PlayerModal](../../frontend/src/components/PlayerModal.tsx). Il dossier riceve il `Player` della lista; richiede separatamente `/players/{id}/benchmark` e legge le stagioni dal provider embedded. Non è stato necessario leggere l'intero repository. **Limite:** il probe non prova ogni campo del dossier, ma conferma il percorso principale.

### 2. Frontend bug workflow — PASS

Routing: `fanta-bug` → `fanta-ui-qa` → systematic debugging → ispezione mirata → Playwright. Scenario simulato, senza difetto concreto da correggere. Backend locale ha risposto 200 a resolve/health/teams/players; `/players` ha mostrato **533 giocatori**. A **390×844**, console errori **0**, `documentElement.scrollWidth = 390`, **nessun overflow orizzontale**; 40 card nel primo page load e nessun alert. Screenshot del viewport ispezionato: nessuna rottura evidente. A **1280×800**, larghezza documento 1280 e nessun overflow. Il probe non equivale a regressione visiva completa né conferma un bug mobile specifico. Artefatti Playwright temporanei rimossi dopo la verifica.

### 3. Backend / API QA — PASS

Routing: `fanta-data-api` → Schemathesis; nessun server necessario per il probe schema-only. Lo schema generato da `app.openapi()` è stato passato al parser `schemathesis.openapi.from_dict`, che ha restituito **FANTA007 API, 13 path**. Nessuna richiesta generata verso endpoint. Per un test futuro sicuro: avviare backend locale con fixture/dati isolati, verificare prima lo schema e limitare `schemathesis run http://127.0.0.1:8000/openapi.json --include-path /api/v1/health --phases examples --max-examples 1 --workers 1`; ampliare solo dopo aver classificato endpoint e mutazioni. Il comando indicato è un percorso futuro, **non eseguito** qui.

### 4. Security / quality — PASS

Routing: `fanta-security` → Gitleaks → Ruff; scansione Codex Security completa non necessaria per questo controllo rapido. `gitleaks dir backend` è pulito. `gitleaks dir frontend/src` e `gitleaks git . --log-opts '-n 15'` segnalano **2 match** ciascuno: regola `generic-api-key` su `SQUAD_KEY` e `LEGACY_SQUAD_KEY` in `frontend/src/lib/squadPersistence.ts:3-4`. Sono chiavi statiche di localStorage, **probabili falsi positivi**, severità informativa; non sono state create allowlist. La history ha esaminato 8 commit disponibili. Gitleaks sul solo DevKit è pulito.

`ruff check backend --no-cache` segnala **41 rilievi**: I001 32, F401 3, e uno ciascuno di DTZ011, UP037, C408, UP035, TRY004, RUF022. Prevalentemente qualità/stile a severità bassa; DTZ011 (data senza timezone) e TRY004 (tipo d'eccezione) meritano revisione contestuale prima di considerarli problemi funzionali. Nessuna correzione automatica, nessuna evidenza che questi rilievi siano stati introdotti da Phase 4.

### 5. Research / architecture — PASS

Routing: `fanta-research` → `fanta-data-api` per i vincoli di una futura integrazione → `acceptance-criteria-mapper`. Nessun provider scelto o contattato; Context7/web non necessari perché qui si valida il metodo, senza affermazioni correnti su prezzi o licenze.

| Criterio | Evidenza da raccogliere per ogni candidato | Gate |
| --- | --- | --- |
| Coverage | Campionati, stagioni, rose, eventi e identificativi coperti nei documenti ufficiali | Corrisponde ai dati richiesti da FANTA007 |
| Freshness | Frequenza dichiarata, timestamp reali, latenze osservate in prova autorizzata | Dati datati e stato stale espliciti |
| Pricing | Piano, overage, costo di test e produzione, data del listino | PM approva qualunque spesa |
| Rate limits | Quote, burst, 429, retry e headers | Budget richieste sostenibile |
| Licensing | Diritti di mostrare, memorizzare e ridistribuire dati/immagini | Uso FANTA007 consentito per iscritto |
| API quality | OpenAPI, schema, errori, SLA, changelog, supporto | Adapter tipizzato e testabile |
| Fallback | Comportamento in outage e dati mancanti | Nessun mock etichettato come live |
| Caching | TTL per tipo dato, invalidazione, timezone e provenance | Freschezza leggibile dall'utente |

### 6. Outside FANTA007 / Godot — PASS

Routing: global `superpowers:brainstorming` + `acceptance-criteria-mapper`; `game-dev` Domain Pack **selezionato dal catalogo**, con `game-content-design` e `game-playtesting-usability` come specialisti solo se il prototipo diventa un lavoro reale. Nessuna skill `fanta-*` attivata. Il pack non contiene un Godot specialist installato: non viene presentato come disponibile.

**Piano di esempio**, assumendo un gioco 2D a schermata singola: muovi il personaggio, raccogli oggetti per aumentare il punteggio, evita un ostacolo; collisione o timer di 60 secondi chiude il round; un comando riavvia. In Godot, separare scene `Main`, `Player`, `Pickup`, `Hazard`, `HUD`; usare segnali per punteggio/fine round e un timer. Verificare input, incremento punteggio una sola volta per oggetto, fine round e restart ripetibile. Nessun gioco o file Godot creato.

## Routing audit

Il conteggio considera capacità selezionate per missione, non il numero di chiamate interne. Le skill sono istruzioni applicate; la colonna «usati» nomina i tool eseguiti o i documenti consultati.

| Mission | Primary skill | Secondary skills/tools | Tools actually used | Count | Status |
| --- | --- | --- | --- | ---: | --- |
| 1 Code intelligence | `fanta-data-api` | `analyze`, Serena, `rg` | Serena `get_symbols_overview`/`find_symbol`, `rg`, letture mirate | 4 | PASS |
| 2 Mobile bug workflow | `fanta-bug` | `fanta-ui-qa`, systematic debugging, `rg`, Playwright | `rg`, Playwright navigate/resize/snapshot/console/metriche/screenshot | 5 | PASS |
| 3 API QA | `fanta-data-api` | Schemathesis, OpenAPI locale | `uvx` parser Schemathesis, `app.openapi()` | 3 | PASS |
| 4 Security/quality | `fanta-security` | Gitleaks, Ruff | `gitleaks dir/git`, `ruff check --no-cache` | 3 | PASS |
| 5 Provider method | `fanta-research` | `fanta-data-api`, `acceptance-criteria-mapper` | Skill locali/globali e documentazione DevKit consultate | 3 | PASS |
| 6 Godot plan | `superpowers:brainstorming` | `acceptance-criteria-mapper`, game-dev catalog | Skill/global guidance e catalogo pack consultati | 3 | PASS |

Le skill locali guidano i cinque casi FANTA007; le globali supportano dove pertinenti. Il caso esterno usa solo globali e un pack catalogato. Nessun tool soup; nessun Domain Pack attivato interamente.

## Problemi e readiness

Nessuna missione `PARTIAL` o `FAIL`, quindi nessuna causa bloccante. Limiti osservati: Serena offre simboli TypeScript ma non Python in questa configurazione; il caso mobile era simulato; Schemathesis è stato provato schema-only; i due finding Gitleaks sono probabili falsi positivi; Ruff ha 41 rilievi preesistenti. Questi limiti non impediscono il percorso DevKit, ma non sono una dichiarazione di release readiness del prodotto.

**DEVKIT READINESS: READY.** Routing, tool core, workflow FANTA007 ed esterno funzionano senza nuove dipendenze. Il controllo finale deve confermare solo questo documento tra le nuove modifiche Phase 4, nessuna modifica a source/manifests, Gitleaks pulito sui documenti e stato Git invariato salvo il file di validazione.
