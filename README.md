# FANTA007

**Il tuo agente personale per il fantacalcio.**

FANTA007 ti aiuta a seguire l'asta con crediti, ruoli e valore dei giocatori sempre a portata di mano. Configura la lega, registra gli acquisti e consulta i dati che spiegano i suggerimenti. Non serve un account: la missione e la rosa restano salvate nel browser che usi.

**Stato del progetto:** baseline UI/UX locale **v0.5.0**. La [demo pubblica attuale](https://fanta007-licence-to-win.vercel.app/) è una versione precedente: la v0.5.0 non è ancora stata distribuita.

I dati e i consigli sono un supporto alle decisioni, non previsioni o garanzie di risultato.

## Cosa puoi fare

- configurare nome, modalità, partecipanti, budget e obiettivo della lega;
- cercare e filtrare i giocatori nel Listone;
- aprire un dossier con quotazioni, statistiche e spiegazioni;
- registrare i tuoi acquisti e il prezzo realmente pagato;
- controllare crediti, posti liberi e distribuzione della spesa nella Home e nella Rosa;
- consultare la rail Serie A Intelligence: classifica, ultimo e prossimo turno; senza credenziali del provider, i dati sono dichiarati illustrativi;
- aprire Valutazione per leggere avanzamento, reparti e giudizio motivato;
- aggiornare la configurazione e gestire i dati locali da Impostazioni;
- ricevere un consiglio leggibile, accompagnato dai dati che lo motivano.

## Come si usa, in 4 passi

1. **Configura la lega.** Segui le cinque domande iniziali.
2. **Apri il Listone.** Cerca un giocatore per nome, squadra o ruolo.
3. **Registra l'acquisto.** Inserisci il prezzo pagato durante l'asta.
4. **Controlla la rosa.** Guarda budget, reparti e prossima decisione suggerita.

La rosa resta salvata nel browser che stai usando. Se cancelli i dati del browser o cambi dispositivo, non viene trasferita automaticamente.

## Schermate della baseline

La configurazione guidata ha cinque passaggi: squadra, partecipanti, regole, budget e obiettivo. La Home mostra il budget e la prossima decisione; il Listone serve a cercare i profili; La mia rosa raccoglie gli acquisti. Il Dossier mantiene quattro viste — Scheda, Statistiche, Analisi e Consiglio — mentre Valutazione riassume lo stato della rosa.

Gli screenshot conservati in `docs/images/v2/` documentano la V2 pubblicata in precedenza e **non rappresentano la baseline v0.5.0**. Prima di mostrarli come immagini correnti, acquisire nuove schermate di: landing, configurazione, Home con entrambe le rail, Listone, Rosa, quattro tab del Dossier, Valutazione e Impostazioni. Servono una vista desktop e una mobile delle sezioni principali.

## Due parole che trovi spesso

- **QI**: quotazione iniziale del giocatore.
- **QA**: quotazione attuale.
- **FVM**: FantaValore di Mercato, usato come riferimento per l'asta.
- **FVM lega**: FVM adattato al budget della tua lega.
- **PV**: presenze a voto.
- **MV**: media voto.
- **FM**: fantamedia.
- **Appetibilità FANTA007**: indice che riassume quanto il profilo è interessante nei dati disponibili. Non è un prezzo e non è una promessa di rendimento.

---

# Dietro le quinte

Da qui in poi trovi le informazioni tecniche utili a sviluppatori, reviewer e a chi vuole capire come è costruito il progetto.

## Cosa comprende la v0.5.0

La baseline attuale rende più chiaro il percorso completo:

- onboarding guidato in cinque passaggi;
- landing e presentazione del prodotto aggiornate;
- navigazione flottante coerente tra le aree principali;
- Home orientata alla prossima decisione, con rail Fantagente e Serie A Intelligence;
- Listone più leggibile e confrontabile;
- rosa organizzata per reparti;
- Player Dossier con quattro tab;
- analisi con regola applicata e spiegazione del consiglio;
- visual system dark/graphite/emerald, incluso il trattamento glass;
- layout responsive per desktop e mobile;
- stati di focus e aree cliccabili più accessibili.

Le interazioni selezionate da 21st.dev sono state adattate al linguaggio visivo di FANTA007:

- [Hero Section — reuno-ui](https://21st.dev/@reuno-ui/components/hero-section)
- [Bento Features — larsen66](https://21st.dev/@larsen66/components/bento-features)
- [Floating Dock — manuarora700](https://21st.dev/@manuarora700/components/floating-dock)
- [Expandable Tabs — victorwelander](https://21st.dev/@victorwelander/components/expandable-tabs)
- [Stats Card — ravikatiyar162](https://21st.dev/@ravikatiyar162/components/stats-card-1)
- [Bar Chart — bklitai](https://21st.dev/@bklitai/components/bar-chart)

## Architettura

```text
Dataset normalizzato
        ↓
FastAPI REST API
        ↓
React + TypeScript + Vite
        ↓
Scoring e benchmark deterministici
        ↓
Listone, Dossier, Rosa e Analisi
```

### Frontend

- React 19 e TypeScript;
- Vite per sviluppo e build;
- Motion per le animazioni;
- componenti Radix, Lucide e Tabler per controlli e icone;
- stato della missione salvato nel browser; non esistono ancora account o sincronizzazione tra dispositivi.

### Backend

- Python 3.11+;
- FastAPI e Pydantic;
- API REST per giocatori, statistiche, squadre e risoluzione dei dati salvati;
- import, normalizzazione e controlli di integrità sul dataset.

### Perché il salvataggio viene “risolto” di nuovo

Nel browser vengono conservati gli identificativi dei giocatori e i dati inseriti dall'utente, come il prezzo d'acquisto. Quando l'app si riapre, il backend recupera le informazioni canoniche aggiornate. In questo modo la rosa non dipende da una vecchia copia completa del giocatore salvata nel browser.

## Dati e trasparenza

Il dataset attivo della stagione 2026/27 contiene:

- **533 giocatori**;
- **921 record stagionali** complessivi;
- 533 record Serie A 2026/27;
- 365 record Serie A 2025/26;
- 23 record EuroLeghe 2025/26 usati come fallback verificato.

Se un dato verificabile non è disponibile, l'interfaccia mostra **N/D** invece di inventare un valore. I controlli finali sono documentati in [`docs/stats_integrity_final.md`](docs/stats_integrity_final.md).

## Avvio locale semplice (Windows)

### Prima configurazione

Servono [Python 3.11+](https://www.python.org/downloads/) e [Node.js](https://nodejs.org/). Dalla cartella del progetto:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e ".\backend[dev]"
npm install --prefix .\frontend
```

### Avvio quotidiano

Fai doppio clic su:

```text
START_FANTA007_FRESH.cmd
```

Lo script avvia e controlla backend e frontend, poi apre la preview. In alternativa:

```powershell
.\scripts\windows\Start-Preview.ps1 -OpenBrowser
```

- App locale: `http://127.0.0.1:5173`
- Presentazione: `http://127.0.0.1:5173/presentazione`
- Stato API: `http://127.0.0.1:8000/api/v1/health`

<details>
<summary>Avvio manuale di backend e frontend</summary>

Backend:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir .\backend --reload --port 8000
```

Frontend, in un secondo terminale:

```powershell
npm run dev --prefix .\frontend
```

</details>

## Test e build

```powershell
$env:PYTHONPATH = "$PWD;$PWD\backend"
.\.venv\Scripts\python.exe -m pytest .\backend\tests -q -rs
npm test --prefix .\frontend
npm run build --prefix .\frontend
```

Ultima verifica della baseline locale v0.5.0:

- frontend: **74 test superati**;
- backend: **143 test superati**, 4 test opzionali saltati perché richiedono gli export ufficiali locali;
- build di produzione: completata;
- verifica desktop e mobile: completata.

`npm run build` esegue anche il typecheck TypeScript (`tsc -b`). Non è configurato un lint separato. La build mostra un avviso non bloccante sul peso del chunk JavaScript principale.

I test backend usano dati sintetici o file temporanei e non modificano i dati di produzione.

<details>
<summary>Media Review: accesso amministrativo locale</summary>

Le modifiche tramite `PATCH /api/v1/admin/media-review/{player_id}` sono disabilitate per impostazione predefinita e rispondono con `403 Forbidden`.

Per abilitarle in un ambiente locale fidato:

```powershell
$env:FANTA007_ENABLE_MEDIA_REVIEW_ADMIN = "true"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir .\backend --host 127.0.0.1 --port 8000
```

Il flag **non autentica gli utenti**: quando è attivo, chiunque raggiunga l'API può modificare le revisioni. Deve quindi rimanere disabilitato nei deploy pubblici.

</details>

## Prossimi passi

Verificare la CI su GitHub, poi distribuire la baseline. Dati live, Fantagente conversazionale, account e database, e funzioni da companion stagionale sono tappe future: non fanno parte della v0.5.0.

## Repository e demo

- [Demo pubblica precedente](https://fanta007-licence-to-win.vercel.app/)
- [Repository GitHub](https://github.com/AndreCalzone97/fanta007-licence-to-win)
- Percorso consigliato: **configurazione → Home → Listone → Dossier → La mia rosa → Valutazione**

## Nota sul progetto

FANTA007 è un progetto indipendente realizzato a scopo didattico e portfolio. Nomi, marchi e dati di terze parti appartengono ai rispettivi titolari. Gli indicatori hanno finalità informative e non garantiscono risultati sportivi o di gioco.

---

**FANTA007**<br>
_Meno rumore, più contesto per decidere._
