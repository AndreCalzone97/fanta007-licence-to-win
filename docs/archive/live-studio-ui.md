# Fanta 007 — direzione corretta e confronto

## Vincoli aggiornati del proprietario

Il nome resta **Fanta 007**, con il logo e le illustrazioni originali. Le precedenti
indicazioni sul nome “007 Live Studio” e sulla rimozione della mascotte sono
superate. I nomi interni dei file Studio restano dettagli tecnici, non branding.

| Aspetto | Sito pubblico osservato | Anteprima precedente | Revisione corrente |
|---|---|---|---|
| Identità | Fanta007, logo illustrato | 007 Live Studio testuale | Fanta 007 con logo originale |
| Illustrazioni | Personaggio dominante nella landing | Rimosse dai flussi | Hero, consigli Home/Analisi e conferma |
| Composizione | Landing chiara e promozionale | Impostazione analitica scura | Impostazione analitica con identità Fanta 007 |
| Movimento | Effetti legacy | Transizioni essenziali | Ingresso hero 520 ms, pagine 200 ms, drawer 260 ms, feedback 140–200 ms |

Le immagini del frontend esistono già come WebP ottimizzati: vengono riutilizzate
tramite AgentIllustration, mantenendo srcSet, dimensioni e lazy loading. I PNG
nel repository sono conservati. Nessun asset viene cancellato o ridisegnato.
L’anteprima incorpora le immagini per funzionare anche senza il server Vite.

Steep orienta spaziatura e gerarchia; Maestro le azioni motivate; Hawy la lettura
per reparti e dei giocatori. Questi riferimenti guidano la UI, non sostituiscono
il marchio. Movimento limitato a ingressi e cambiamenti di stato; nessun loop o
scansione AI simulata. Reduced motion conserva gli stati e rimuove il movimento.

Verifica del sito: landing pubblica aperta nel browser, con marchio originale e
“La tua asta. Sotto controllo.”. La nuova anteprima è verificata a livello di
markup, asset incorporati, build e test; resta da validare visivamente nel browser
locale. Non è stata pubblicata su Vercel. Nessun commit/push.

---

## Storico delle revisioni (le decisioni sopra prevalgono)

# Mission #06 — 007 Live Studio

## Seconda revisione — 9 settembre 2026

Il sito pubblico è stato aperto nel browser: serve ancora la landing chiara con
mascotte, “La tua asta. Sotto controllo.” e “INIZIA LA MISSIONE”. Il controllo
GitHub ha restituito main a `44fe0c0` (Mission #02). Il lavoro locale non è stato
pubblicato. Il connettore Vercel ha restituito 403; il sito pubblico è invece
accessibile nel browser. Non è stato identificato con certezza il commit del
deployment tramite metadata Vercel.

La prima revisione era troppo conservativa su ingresso, configurazione e Rosa.
La seconda sostituisce la composizione di queste superfici:

- `StudioWelcome.tsx`: ingresso editoriale senza mascotte e schema della rosa Classic.
- `Onboarding.tsx`: form unico con riepilogo, al posto dei cinque passaggi; mantiene
  i cinque parametri, i limiti e il salvataggio già esistenti.
- `SquadOverview.tsx`: quadro Reparti come vista iniziale, alternativa Elenco,
  investimento per ruolo e selezione del giocatore con dossier/rimozione.
- `BudgetAllocation.tsx`: distribuzione dei crediti per ruolo e disponibilità,
  calcolata soltanto dai prezzi pagati; riutilizzata in Home e Analisi.
- `AgentInsight.tsx`: spiegazione editoriale dei dati senza illustrazione;
  conservati evidenze, soglie e azione.
- `App.tsx`: nuovo ingresso e conferma finale senza mascotte.

Anteprima: `docs/previews/studio-review.html`, sei schermate e quattro larghezze.
È HTML statico generato dai componenti reali con dati sintetici dichiarati, non
un deployment o un test end-to-end. Il Listone mostra le righe del componente,
non una ricerca attiva. I controlli interni non salvano dati.

Per rigenerarla, dalla cartella frontend:

```bash
npm run build
node scripts/export-design-preview.mjs
```

L’accesso browser ai file e server locali resta indisponibile: il browser pubblico
e il filesystem del processo di build sono separati. L’anteprima va aperta dal
file allegato o localmente; non viene dichiarata una verifica visiva del nuovo
frontend. Nessun commit, push o aggiornamento Vercel eseguito.


## Stato e limiti della verifica

Implementazione locale sul branch `feat/live-studio-ui-foundation`. Nessun commit,
push o merge eseguito. Nel checkout sono ancora presenti modifiche locali delle
Missioni #03–#05: questo documento descrive soltanto la Mission #06. Il diff
complessivo rispetto a HEAD non coincide quindi con il diff di questa missione.

**Revisione visiva ancora necessaria.** Il browser disponibile non ha potuto
aprire localhost/127.0.0.1 (`ERR_BLOCKED_BY_CLIENT`). Non sono state verificate
visivamente le larghezze 1440, 1024, 768 e 390 px, né la console o le interazioni
end-to-end nel browser. I risultati di build, rendering statico e HTTP riportati
qui sotto non sostituiscono queste verifiche. Non considerare completata la
validazione finale del redesign prima della prova manuale.

## Analisi precedente all'intervento

- `App.tsx`: landing, configurazione, Home, Rosa e Valutazione; selezione interna
  in state, più History API per `/players` e `/admin/media-review`.
- `PlayersPage`: ricerca, anteprima acquisto, dossier, annullamento acquisto.
- `PlayerSearch`: ricerca con debounce e AbortController, filtri in sessionStorage,
  preferiti in localStorage, paginazione e confronto di massimo tre giocatori.
- `useSquadPersistence`: risoluzione tramite FastAPI e salvataggio normalizzato
  introdotti in Mission #05. Non modificato in questa missione.
- Cinque fogli di stile principali, oltre a token/motion: regole sovrapposte,
  tema finale chiaro, diverse dimensioni di testo molto piccole.
- La Home dedicava molto spazio all'illustrazione e ripeteva riepiloghi. Il Listone
  non condivideva l'intestazione della dashboard. Su smartphone il dettaglio della
  rosa poteva trovarsi molto sotto il giocatore selezionato. I filtri squadra
  mostravano molti pulsanti e richiedevano scorrimento orizzontale.

Priorità: **MUST** gerarchia Home, navigazione, composizione responsive, flussi
esistenti; **SHOULD** filtri, recupero errori, accessibilità; **NICE TO HAVE**
interazione di scansione futura, rinviata per assenza dei dati necessari.

## Direzione visiva e riferimenti

Identità: **007 Live Studio — Licence to Win**. Superfici blu antracite opache,
accento sabbia per azioni e selezioni, verde per copertura e valori positivi.
Nessun punteggio matchday, utente autenticato o previsione inventata.

- [Steep / SaaSFrame](https://www.saasframe.io/examples/steep-analytics): gerarchia,
  spazio tra gruppi, lettura dei numeri e navigazione semplice.
- [Maestro](https://dribbble.com/shots/27067762-Maestro-Logistics-Operations-Fleet-Intelligence-Dashboard):
  attenzione operativa e collegamento tra un problema e un'azione.
- [Hawy](https://www.behance.net/gallery/248320787/Hawy-AI-Powered-Football-Analytics-Platform):
  contesto calcistico e relazione tra identità, quotazioni e confronto.
- Influenze secondarie effettive: chiarezza finanziaria per budget/prezzo,
  navigazione inferiore e bottom sheet su telefono. Nessun terminale trading.

Le pagine dei riferimenti sono state consultate; non si dichiara una comparazione
visiva pixel per pixel con gli screenshot dei prodotti.

## Modifiche per area

### Componenti e file

Nuovi:

- `frontend/src/components/CommandCenter.tsx`: Home con dati e regole esistenti.
- `frontend/src/components/StudioHeader.tsx`: marchio, squadra, controllo health,
  collegamento per saltare al contenuto.
- `frontend/src/components/StudioIcon.tsx`: piccola raccolta SVG per navigazione,
  ricerca, preferiti e confronto.
- `frontend/src/styles/studio.css`: tema e composizioni responsive, limitati a
  `.studio-ui` per non cambiare il tema amministrativo Media Review.
- `frontend/tests/commandCenter.test.mjs`: quattro test su dati sintetici.
- Questo documento.

Modificati:

- `frontend/src/App.tsx`: estrae Home; usa header comune; elimina ritardi JS tra
  sezioni in favore di una transizione CSS; mantiene persistenza e gestione errori.
- `frontend/src/pages/PlayersPage.tsx`: usa lo stesso header della dashboard.
- `frontend/src/components/BrandLogo.tsx`: wordmark testuale 007 Live Studio.
- `frontend/src/components/BottomNavigation.tsx`: icone SVG; Rosa e Analisi.
- `frontend/src/components/PlayerSearch.tsx`: titolo semantico, filtri selezionati
  accessibili, legenda, recupero errori e reset della ricerca vuota.
- `frontend/src/components/TeamSelector.tsx`: select nativo con tutte le squadre.
- `frontend/src/components/PlayerCompactCard.tsx`: icone per azioni accessibili.
- `frontend/src/components/SquadOverview.tsx`: prezzo in crediti, selezione
  esplicita, dettaglio inline mobile, stato vuoto più diretto.
- `frontend/src/components/PlayerModal.tsx`: marchio/copy del dossier aggiornati.
- `frontend/src/components/SquadEvaluation.tsx`: Analisi con indicazione che la
  valutazione provvisoria dipende da regole e dalla rosa corrente.
- `frontend/src/components/Onboarding.tsx`: nome squadra etichettato e copy più
  diretto; conserva la validazione della Mission #05.
- `frontend/src/main.tsx`: importa il nuovo livello di presentazione.
- `frontend/index.html`: titolo, descrizione e theme-color.

Nessun endpoint, contratto API o modello di persistenza modificato in Mission #06.

### Navigazione e Home

Le destinazioni restano Home, Rosa, Listone, Analisi e Impostazioni. Nessuna sezione
vuota Asta, Intelligence o Profilo. L'acquisto rimane nel Listone. La Valutazione
continua a esistere come Analisi, compreso il resoconto della rosa completa.

`CommandCenter` usa `squadTotals`, `safeMaximumBid`, `getAgentAdvice`. Il massimo
prossimo acquisto riserva un credito per ogni altro posto libero: è un limite
matematico, non una raccomandazione di prezzo. A rosa completa non viene mostrata
un'offerta numerica per un acquisto impossibile. La copertura Mantra è dichiarata
indicativa. L'illustrazione non domina più la Home; è stata rimossa anche dagli altri flussi nella seconda revisione.

### Listone, Rosa, stati

Desktop: righe a tutta larghezza con identità e QA/FVM/delta. Smartphone: schede
con metriche sotto l'identità. La legenda descrive le abbreviazioni. Le metriche
Classic esistenti non sono state reinterpretate; dettagli e confronto conservano
la propria logica precedente, inclusi i valori Mantra dove già previsti.

Il filtro club è un select nativo. Un errore delle squadre non nasconde la ricerca
per nome/ruolo; può essere ritentato. Errori dei giocatori hanno un'azione Riprova.
La ricerca senza risultati offre un reset esplicito di testo e filtri.

La Rosa conserva gruppi, prezzo pagato, FVM di lega, dossier, rimozione e annulla.
Su mobile il dettaglio selezionato è accanto alla riga; sul desktop resta laterale.
I due posizionamenti condividono `PlayerDetail` e lo stesso stato `selectedId`.

### Responsive, movimento, accessibilità

- Oltre 1100 px: navigazione laterale, contenuto a destra.
- Fino a 1100 px: navigazione orizzontale e contenuto a larghezza piena.
- Fino a 800 px: Home a colonna singola, dettaglio rosa inline.
- Fino a 640 px: navigazione inferiore, schede giocatore, filtri espandibili,
  drawer trasformato in bottom sheet.
- Transizioni: pagine 200 ms, drawer/sheet 260 ms, controlli 150 ms.
- `prefers-reduced-motion` disabilita animazioni e transizioni del tema.
- Focus visibile, skip link, controlli principali di almeno 44 px, nomi accessibili,
  `aria-pressed` per selezioni, annunci di caricamento/errore. Focus trap esistenti
  conservati nei dialoghi. Nessuna certificazione WCAG dichiarata.

## Risultati automatici

| Controllo | Passati | Falliti | Errori | Skip |
|---|---:|---:|---:|---:|
| Frontend (Node test runner) | 26 | 0 | 0 | 0 |
| Backend completo, dalla radice | 134 | 0 | 0 | 4 |

I quattro nuovi test Home coprono rosa vuota, budget dopo un acquisto, rosa
completa e indicazione Mantra. Rendering statico React: non sono test browser.
I 19 test frontend di persistenza della Mission #05 restano inclusi. La suite
backend include Media Review, pipeline e risoluzione rosa.

TypeScript e build Vite superati. Tre smoke check HTTP del dev server: `/`,
`/players`, `/admin/media-review` restituiscono 200 e l'entry point dell'app. Questo
verifica il fallback SPA, non l'esecuzione dei flussi React. `git diff --check`
superato; nessuna modifica a file JSON, CSV o XLSX tracciati.

Un primo pytest avviato da `backend/` ha prodotto tre errori di raccolta
(`No module named backend`); l'esecuzione corretta dalla radice supera la suite.
I quattro skip riguardano export ufficiali assenti. Rimangono warning preesistenti:
porta HMR 24678 occupata nei test Vite, configurazione npm http-proxy e deprecazioni
Starlette. Non sono errori della build o test falliti.

## Verifica manuale richiesta prima del commit

Dalla radice, con ambiente Python attivo e dipendenze dichiarate installate:

```bash
python -m pytest backend/tests -q
npm test --prefix frontend
npm run build --prefix frontend
python -m uvicorn app.main:app --app-dir backend --port 8000
```

In un altro terminale:

```bash
npm run dev --prefix frontend -- --port 5173
```

Aprire `http://localhost:5173` in un profilo browser di prova per non modificare la
propria rosa. Configurare una squadra sintetica con budget 500.

1. A 1440, 1024, 768 e 390 px: Home, Listone e Rosa senza sovrapposizioni o
   scorrimento orizzontale della pagina. Controllare contrasto e nomi lunghi.
2. Cercare un giocatore, selezionare ruolo/club, cambiare ordinamento, caricare
   altri risultati. Cercare un nome inesistente e usare il reset.
3. Aprire anteprima/dossier; verificare drawer desktop e sheet mobile. Usare Tab,
   Shift+Tab ed Escape, controllare che il focus resti nel dialogo e ritorni.
4. Registrare un acquisto a 12 crediti: verificare budget, Rosa, prezzo e persistenza
   dopo reload. Rimuoverlo e annullare; controllare anche annullamento aggiunta.
5. Confrontare due/tre giocatori, aprire Analisi e Impostazioni, tornare indietro con
   la navigazione del browser. Provare nome squadra lungo e modalità Mantra.
6. Fermare il backend: verificare gli errori senza perdita del salvataggio; riavviare
   e ritentare. Controllare anche un reload con rosa già salvata.
7. `/admin/media-review`: lettura, filtri e dettaglio invariati; le mutazioni
   rimangono disabilitate senza l'abilitazione esplicita della Mission #02.
8. Console senza errori applicativi, modalità reduced motion, navigazione da
   tastiera e nessun elemento nascosto dietro la barra inferiore.

## Debito e rinvii

Il tema è un livello circoscritto sopra i fogli legacy: evita una riscrittura,
ma non elimina il debito della cascata CSS. Prima di rimuovere quei fogli serve
copertura visiva delle schermate meno frequenti. Font esterni restano. Gli asset delle illustrazioni legacy sono conservati nel repository, ma non sono più usati dai componenti aggiornati. Routing manuale, comportamento multitab della persistenza,
paginazione concorrente e conformità completa delle tab ARIA restano da valutare.
Non sono stati risolti incidentalmente.

Scansione intelligence, calendario/matchday, dati live, autenticazione, profilo e
nuove infrastrutture rinviati. La Mission #07 non è stata avviata.

Commit suggerito dopo revisione e prove browser:
`feat(ui): introduce 007 Live Studio responsive command center`

## ITS Learning Debrief

### Classificazione delle tecnologie

| Tecnologia | Categoria | Uso qui |
|---|---|---|
| HTML | Linguaggio di markup | Struttura, titoli, form e semantica |
| CSS | Linguaggio di stile | Tema, Grid/Flexbox, breakpoint e animazioni |
| JavaScript | Linguaggio di programmazione | Esecuzione frontend e test Node |
| TypeScript | Linguaggio basato su JavaScript, con tipi statici | Props, stato e dati API |
| React | Libreria UI | Componenti e aggiornamento dell'interfaccia |
| Vite | Strumento di sviluppo/build | Dev server e bundle di produzione |
| Node.js | Runtime JavaScript | Esegue Vite e il test runner |
| npm | Gestore pacchetti e script | Dipendenze, test e build |
| Python | Linguaggio di programmazione | Backend esistente |
| FastAPI | Framework backend | API REST e validazione |
| pytest | Strumento/framework di test | Regressioni backend |
| Git | Sistema di controllo versione | Branch e revisione delle modifiche |

### Flusso Full Stack e React

Il browser esegue `main.tsx`, che monta `App`. `App` mantiene la sezione corrente e
usa `useSquadPersistence`. Un click nel Listone chiama un handler; `PlayersPage.add`
passa la nuova rosa alla persistenza. Il backend risolve gli ID nel dataset
canonico e risponde con JSON. Solo dopo verifica e salvataggio lo stato cambia:
React renderizza la nuova Rosa e `CommandCenter` ricalcola il riepilogo.

Le **props** di `CommandCenter` sono dati e callback forniti dal genitore. Non sono
un secondo archivio. `useState` in `PlayerSearch` conserva query e filtri;
`useEffect` reagisce ai cambiamenti effettuando la richiesta REST. `AbortController`
annulla le richieste obsolete della ricerca. `map` crea le righe e `key` identifica
stabilmente i giocatori. I controlli `if`/ternari mostrano stati vuoti, errori e
azioni diverse quando la rosa è completa. Le route continuano a usare la History
API e lo stato esistente: non è stato aggiunto un router.

### Prima e dopo

| Prima | Dopo |
|---|---|
| Home con grande illustrazione e riepiloghi ripetuti | Riepilogo numerico, reparti e azione motivata |
| Header presente soltanto nella dashboard | `StudioHeader` comune a dashboard e Listone |
| Dettaglio Rosa lontano dalla riga su telefono | Dettaglio inline selezionato |
| Molti pulsanti club | Select nativo etichettato |
| Ritardi JS nelle transizioni della dashboard | Render immediato con transizione CSS |

### Responsive e UI/UX

Responsive significa cambiare composizione in funzione dello spazio. Grid gestisce
metriche e colonne; Flexbox allinea header, azioni e navigazione. Le media query
attivano regole ai breakpoint. Un approccio mobile-first parte dalla composizione
piccola e aggiunge colonne; questa missione adatta invece incrementalmente gli
stili esistenti usando anche query `max-width`, senza dichiarare una conversione
completa a mobile-first. Una scheda mobile sposta le metriche sotto il nome: non
rimpicciolisce semplicemente una riga desktop.

**UI** è il modo in cui appaiono superfici e controlli; **UX** è quanto è facile
completare l'acquisto e recuperare da un errore. L'**architettura dell'informazione**
organizza le destinazioni Home/Rosa/Listone/Analisi. La **gerarchia visiva** porta
budget e azione prima dei dettagli. L'**interaction design** definisce selezione,
retry e apertura drawer. L'**accessibilità** rende quelle azioni utilizzabili anche
con tastiera e nomi comprensibili alle tecnologie assistive.

### Code walkthrough

1. `CommandCenter`: riceve config/rosa, chiama le funzioni di dominio, calcola i
   posti residui, mostra la riserva reale e collega l'azione al callback del padre.
2. `StudioHeader`: un effect interroga health; stato null/true/false determina il
   messaggio. La cleanup annulla la richiesta quando il componente viene smontato.
3. `PlayerSearch`: ogni variazione di query/ruolo/club/ordine attiva il caricamento;
   `retry` permette di ripetere la richiesta senza cambiare i filtri. L'errore club
   è separato da quello dei giocatori per consentire ricerca parziale.
4. `SquadOverview`: `selectedId` individua il giocatore; `PlayerDetail` riceve sempre
   dati canonici e prezzo di acquisto già risolti dalla Mission #05.
5. `studio.css`: token limitati a `.studio-ui`, layout e breakpoint. La media query
   reduced-motion prevale sulle transizioni decorative.

Connessione ITS: HTML/CSS per struttura e adattamento, JavaScript per eventi e
asincronia, TypeScript per contratti, React per stato e composizione, REST per la
separazione frontend/backend. Test automatici e verifica visiva coprono rischi
diversi. Git permette di rivedere i cambiamenti prima di renderli parte della storia.

### Preparazione colloquio

1. **React è un linguaggio?** No, è una libreria UI JavaScript.
2. **JavaScript e TypeScript?** TypeScript aggiunge controlli statici; nel browser
   viene eseguito JavaScript. Non valida automaticamente il JSON ricevuto.
3. **Che cos'è Vite?** Il dev server e lo strumento che produce il bundle frontend.
4. **Che cos'è un componente?** Una funzione che descrive una parte della UI;
   `StudioHeader` ne è un esempio riutilizzabile.
5. **Che cosa sono le props?** Input del componente, compresi i callback per le azioni.
6. **Che cos'è lo state?** Dati locali che, cambiando, provocano un nuovo render,
   per esempio `query` o `selectedId`.
7. **Come comunica React con FastAPI?** Con richieste HTTP REST e risposte JSON;
   il salvataggio della rosa passa da `/api/v1/squads/resolve`.
8. **Cosa rende responsive l'app?** Layout flessibili e media query che cambiano
   colonne, navigazione e posizione dei dettagli.
9. **UI e UX sono la stessa cosa?** No: l'aspetto di Riprova è UI, la possibilità
   di recuperare una ricerca fallita è UX.
10. **Cosa succede dopo un click?** L'handler aggiorna stato o avvia una richiesta;
    la risposta modifica lo stato e React aggiorna gli elementi interessati.

### Cinque esercizi pratici

1. Cambia temporaneamente `--accent` in `.studio-ui`: individua quali controlli lo
   ereditano e verifica che Media Review non adotti il tema operativo.
2. Porta la viewport da 1440 a 390 px: spiega quali media query cambiano navigazione,
   colonne e drawer; verifica il risultato, non solo i numeri nel CSS.
3. Cambia il budget del fixture Home e adegua il valore atteso della riserva;
   calcolalo a mano prima di lanciare il test.
4. Nel browser di prova salva un acquisto, ricarica e segui i passaggi tra
   `PlayersPage`, hook di persistenza e `CommandCenter`.
5. Ferma il backend durante una ricerca, riavvialo e usa Riprova. Spiega la
   differenza tra errore club, errore giocatori ed errore di caricamento della rosa.
