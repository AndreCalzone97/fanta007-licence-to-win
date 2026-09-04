# Fanta007 — Licence to Win

Fanta007 è una web app mobile-first e data-driven per il Fantacalcio italiano. Il listone Excel viene normalizzato ed esposto da FastAPI; l'interfaccia React permette di configurare la lega, cercare giocatori, costruire la rosa e controllare il budget.

## Stato attuale

- parser e validazione del foglio `Tutti`;
- modello Player estendibile;
- normalizzazione di ruoli Classic e Mantra;
- alias verificati per i nomi abbreviati;
- ricerca case-insensitive, accent-insensitive, partial e fuzzy;
- API FastAPI;
- applicazione React/Vite mobile-first;
- landing e Mission Briefing persistente;
- dashboard operativa, Squad Builder e budget persistente;
- Listone completo con filtri persistenti, sette ordinamenti e paginazione;
- confronto verificabile fino a tre giocatori, con `N/D` per metriche assenti;
- Player Preview e Dossier con Scheda, Statistiche e Analisi giocatore;
- Appetibilità Fanta007 deterministica e spiegabile, distinta dalla valutazione del prezzo;
- benchmark deterministico per ruolo con rank e percentili;
- insight Agent 007 con verdict, evidence, threshold e next action;
- badge Value Pick/Fair Price/Overpay/Budget Risk deterministici;
- archivio media mantenuto per revisione interna, ma nessuna foto giocatore nelle UI operative: viene usato il Team Crest;
- workflow locale `/admin/media-review` con stati pending/approved/rejected/fallback;
- importer CSV offline per statistiche stagionali autorizzate;
- identity resolver con soglie di confidenza e report dei casi ambigui;
- provider Wikimedia Commons con allowlist licenze, cache metadata, scansione batch e retry rispettosi dei rate limit;
- test automatici per parser, normalizzazione, ricerca e API;
- baseline Git ripristinabile e dipendenze frontend bloccate a versioni precise;
- catalogo verificato delle 20 squadre di Serie A 2026/27, con identità stabile e asset in fallback;
- pipeline candidato → audit → confronto → approvazione manuale, senza sovrascrittura automatica del dataset attivo;
- listone attivo aggiornato il 3 settembre 2026: 533 giocatori, sorgente verificata tramite SHA256 e precedente versione archiviata per rollback.

Il prototipo originale è conservato in `fanta007_step1/` e non viene usato dal nuovo runtime.

## Avvio rapido (PowerShell)

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e ".\backend[dev]"

.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir .\backend --reload --port 8000
```

In un secondo terminale:

```powershell
npm install --prefix .\frontend
npm run dev --prefix .\frontend
```

Frontend: `http://localhost:5173`  
Listone: `http://localhost:5173/players`  
Media review locale: `http://localhost:5173/admin/media-review`  
Documentazione API: `http://127.0.0.1:8000/docs`

## Test

```powershell
.\.venv\Scripts\python.exe -m pytest .\backend\tests -q
npm run build --prefix .\frontend
```

## Preparazione sicura di un nuovo listone

Il comando genera un candidato separato e un audit; non modifica il JSON attivo:

```powershell
.\.venv\Scripts\python.exe .\backend\scripts\prepare_dataset_candidate.py `
  --source .\data\source\Quotazioni_Fantacalcio_Stagione_2026_27_2026-09-03.xlsx `
  --current .\data\normalized\players.json `
  --aliases .\data\manual\player_aliases.json `
  --teams .\data\manual\teams.2026-27.json `
  --output .\data\candidates\players.2026-27.candidate.json `
  --audit-json .\data\reports\dataset_candidate_audit.json `
  --audit-markdown .\data\reports\dataset_candidate_audit.md
```

Il confronto completo si trova in `data/reports/dataset_candidate_diff.json`. L'attivazione resta una decisione manuale.

## Principio architetturale

```text
Excel originale → candidato → audit e diff → approvazione → JSON attivo → API → frontend
```

Lo scoring è deterministico e le soglie sono centralizzate. Le statistiche storiche non vengono inventate: la UI mostra `N/D` o un empty state finché non viene eseguito un import autorizzato. Vedi `docs/data-sources.md`.
