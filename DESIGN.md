# Design FANTA007 — baseline v0.5.0

La UI/UX v0.5.0 è la baseline approvata. La Landing può essere più cinematica; le schermate operative privilegiano leggibilità, densità utile e decisioni rapide.

## Identità

- Nuovo logo FANTA007 e nuovo Fantagente sono gli asset canonici.
- Sora Variable guida titoli, numeri, controlli e testi.
- Grafite e verde profondo formano le superfici; smeraldo indica azioni e stati attivi, off-white i contenuti principali, grigio metallico bordi e informazioni secondarie.
- Il glassmorphism usa trasparenza, blur e riflessi controllati. Tabelle, numeri e testo lungo restano su superfici più opache per conservare contrasto.
- Bordi sottili, spaziatura ordinata e raggi coerenti uniscono le sezioni senza aggiungere decorazioni che competono con i dati.

## Schermate operative

- **Home:** budget, stato della rosa e prossima decisione dominano la gerarchia. Fantagente e Serie A Intelligence occupano le rail laterali desktop; il centro resta prioritario.
- **Listone:** ricerca, filtri, quotazioni e confronto dei giocatori sono facili da scansionare. Il prezzo d'asta si registra in un pannello contestuale.
- **Rosa:** acquisti, crediti, posti liberi e copertura dei reparti restano leggibili nelle viste Reparti ed Elenco.
- **Dossier:** identità del giocatore, KPI e quattro viste — Scheda, Statistiche, Analisi, Consiglio — separano i dati dal giudizio.
- **Valutazione:** score e spiegazione precedono il dettaglio di reparti, budget e prossima mossa.
- **Impostazioni:** configurazione e gestione dei dati locali usano un layout funzionale e senza rumore visivo.

## Interazione e accessibilità

La navigazione flottante mantiene destinazioni, icone e stato attivo coerenti tra le sezioni. Hover e focus sono riconoscibili; i controlli devono restare raggiungibili da tastiera e comodi al tocco. Motion e HUD comunicano stato o relazione tra dati, con supporto a `prefers-reduced-motion`.

Desktop e mobile adattano densità, rail e pannelli senza comprimere i contenuti essenziali. I dati mancanti sono indicati come **N/D**: nessuna cifra viene inventata per riempire la UI. Le indicazioni del Fantagente devono poter essere ricondotte ai dati mostrati e non sono previsioni.

Le regole implementate sono distribuite soprattutto in `frontend/src/styles/identity-v21.css`, `glass-system.css`, `home-exploration.css`, `dossier-v21.css` ed `evaluation-v21.css`. La cronologia dei redesign precedenti è conservata in `docs/archive/`.
