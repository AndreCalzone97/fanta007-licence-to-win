# FANTA007 — Audit e proposta di redesign guidato dai modelli

Documento pre-codice · 13 settembre 2026 · **In attesa di approvazione**

Questo documento risponde ai 13 punti del brief allegato. Non è un redesign implementato e non certifica il prodotto come pronto per la produzione. Durante questa fase non sono stati modificati sorgenti applicativi, API, dati o asset; non sono state installate dipendenze, né eseguiti commit, push o deploy.

## Sintesi della decisione

La base funzionale è riutilizzabile. La distanza dai modelli è invece reale: Hero 40, FAQ3 e lista interattiva non sono stati riprodotti nella loro struttura più riconoscibile. Aggiungere altre librerie, senza correggere prima questa distanza, non risolverebbe il problema.

Propongo di partire dalla **presentazione Hero 40 + FAQ3**, mantenendo nome FANTA007, font e asset. La navigazione Dock Nav e il dossier Modal responsive sono proposte concrete ora verificate su 21st, ma **non vengono spacciate per gli esatti modelli scelti originariamente dall'utente**.

### Classificazioni

- **VINCOLO UTENTE:** requisito esplicito, da preservare o realizzare.
- **IMPLEMENTAZIONE NECESSARIA:** intervento tecnico indispensabile per rispettare il requisito.
- **SUGGERIMENTO DA APPROVARE:** decisione progettuale ulteriore, non ancora autorizzata nella sua forma concreta.
- **FUORI SCOPE:** non incluso in questo passaggio.

## 1. Stato reale del repository

Cartella effettiva: `C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository`.

| Ambito | Evidenza | Significato |
|---|---|---|
| Copia locale | Directory recuperata; `.git` assente. `git status` e lettura HEAD non eseguibili come checkout Git | Non esiste un branch corrente verificabile in questa cartella |
| Export del 9 settembre | Branch storico `feat/live-studio-ui-foundation`; HEAD storico `44fe0c029ea7210eb758900be85190175ae3d286` | Metadati dell'esportazione, non stato Git attuale |
| Stato storico incluso | 205 file; 35 modifiche tracciate e 20 file non tracciati | Le modifiche erano già incluse nei file esportati; non riapplicare la patch |
| GitHub pubblico | Durante l'ispezione, main risolveva a `ffa53155f8d14f0682b0a8108730945d9b18f3a7` | Distinto dall'HEAD storico locale; non prova quale commit serva Vercel |
| Produzione | Landing “La tua asta. Sotto controllo.” e CTA “INIZIA LA MISSIONE” | Non coincide con la landing della preview locale |
| Preview locale | Landing “Il mercato è tuo. Giocalo bene.”, arco petrolio, FAQ e footer | Lavoro successivo presente localmente, non da assumere pubblicato |
| `studio-review.html` | Documento statico di circa 2,13 MB, selettore e iframe sandbox, contenuti dimostrativi | Non usa API o persistenza; i pulsanti del prodotto non sono operativi |

Fonti: [metadati dell'export](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/export-info/README.md>), [stato Git esportato](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/export-info/git-status.txt>), [commit remoto rilevato](https://github.com/AndreCalzone97/fanta007-licence-to-win/commit/ffa53155f8d14f0682b0a8108730945d9b18f3a7), [sito pubblico](https://fanta007-licence-to-win.vercel.app/), [preview statica esistente](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/docs/previews/studio-review.html>).

Prima di qualsiasi futura pubblicazione occorrerà ricostruire un checkout separato e confrontarlo con questa copia. Non propongo `git init`, reset o sovrascritture automatiche.

## 2. Modifiche già presenti

Confronto SHA-256 con il manifest dei 205 file dell'export, **prima della creazione di questo documento**:

- Nessun file del manifest mancante.
- 15 file cambiati, tutti frontend.
- 13 file sorgente/documentazione aggiuntivi rispetto al manifest, esclusi vendor e output generati.
- Hash invariati: backend **64/64**, dati **20/20**, asset agente frontend **18/18**. Questo dimostra la conservazione dei file controllati, non una certificazione di accuratezza o licenza dei dati.

I 15 file modificati sono:

- [frontend/package.json](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/package.json>)
- [frontend/package-lock.json](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/package-lock.json>)
- [frontend/src/App.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/App.tsx>)
- [frontend/src/components/BottomNavigation.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/BottomNavigation.tsx>)
- [frontend/src/components/CommandCenter.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/CommandCenter.tsx>)
- [frontend/src/components/Onboarding.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/Onboarding.tsx>)
- [frontend/src/components/PlayerModal.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/PlayerModal.tsx>)
- [frontend/src/components/PlayerPreview.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/PlayerPreview.tsx>)
- [frontend/src/components/PlayerSearch.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/PlayerSearch.tsx>)
- [frontend/src/components/StudioWelcome.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/StudioWelcome.tsx>)
- [frontend/src/components/TeamSelector.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/TeamSelector.tsx>)
- [frontend/src/hooks/useFocusTrap.ts](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/hooks/useFocusTrap.ts>)
- [frontend/src/main.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/main.tsx>)
- [frontend/src/pages/PlayersPage.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/pages/PlayersPage.tsx>)
- [frontend/src/styles/studio.css](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/styles/studio.css>)

I 13 file aggiuntivi sono:

- [docs/CLUB-PREVIEW.md](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/docs/CLUB-PREVIEW.md>)
- [docs/COMPONENT-INTEGRATION.md](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/docs/COMPONENT-INTEGRATION.md>)
- [docs/MAJOR-REDESIGN-PREVIEW.md](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/docs/MAJOR-REDESIGN-PREVIEW.md>)
- [frontend/src/styles/club.css](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/styles/club.css>)
- [frontend/tests/componentIntegration.test.mjs](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/tests/componentIntegration.test.mjs>)
- [frontend/src/components/AgentReaction.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/AgentReaction.tsx>)
- [frontend/src/components/DevelopmentFeedback.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/DevelopmentFeedback.tsx>)
- [frontend/src/components/SectionArrival.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/SectionArrival.tsx>)
- [frontend/src/components/ui/RadialAction.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/ui/RadialAction.tsx>)
- [frontend/src/components/ui/FantaHero.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/ui/FantaHero.tsx>)
- [frontend/src/components/ui/FantaFaq.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/ui/FantaFaq.tsx>)
- [frontend/src/components/ui/DossierTabs.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/ui/DossierTabs.tsx>)
- [frontend/src/components/ui/AppearText.tsx](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/ui/AppearText.tsx>)

Questi non sono “file untracked” verificati con Git: sono file assenti dal manifest. Tutto il lavoro presente va preservato, anche quando il suo risultato visivo verrà superato.

## 3. Architettura UI e componenti coinvolti

Stack rilevato: React **19.2.8**, TypeScript **7.0.2**, Vite **8.2.2**; Motion **13.2.0** dichiarato, Radix Accordion e Select già presenti; Agentation **3.0.2** dichiarato come strumento di sviluppo.

| Funzione | Componenti principali |
|---|---|
| Stato applicativo, passaggi e percorsi | [App](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/App.tsx>), [PlayersPage](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/pages/PlayersPage.tsx>), [useSquadPersistence](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/hooks/useSquadPersistence.ts>) |
| Presentazione e FAQ | [StudioWelcome](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/StudioWelcome.tsx>), [FantaHero](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/ui/FantaHero.tsx>), [FantaFaq](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/ui/FantaFaq.tsx>), [BrandLogo](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/BrandLogo.tsx>) |
| Configurazione e navigazione | [Onboarding](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/Onboarding.tsx>), [BottomNavigation](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/BottomNavigation.tsx>), [StudioHeader](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/StudioHeader.tsx>) |
| Home e budget | [CommandCenter](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/CommandCenter.tsx>), [BudgetAllocation](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/BudgetAllocation.tsx>), [AgentInsight](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/AgentInsight.tsx>) |
| Listone e confronto | [PlayerSearch](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/PlayerSearch.tsx>), [PlayerCompactCard](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/PlayerCompactCard.tsx>), [TeamSelector](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/TeamSelector.tsx>), [PlayerComparisonView](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/PlayerComparisonView.tsx>), [PlayerCompareTray](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/PlayerCompareTray.tsx>) |
| Acquisto e dossier | [PlayerPreview](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/PlayerPreview.tsx>), [PlayerModal](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/PlayerModal.tsx>), [DossierTabs](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/ui/DossierTabs.tsx>), [AppealBadge](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/AppealBadge.tsx>), [StarRating](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/StarRating.tsx>), [AgentReaction](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/AgentReaction.tsx>) |
| Rosa e valutazione | [SquadOverview](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/SquadOverview.tsx>), [SquadEvaluation](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/SquadEvaluation.tsx>) |
| Impostazioni e accessibilità | [SettingsDialog](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/SettingsDialog.tsx>), [useFocusTrap](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/hooks/useFocusTrap.ts>) |

I percorsi esistenti, incluso `/players` e il percorso amministrativo media, vanno conservati. Home, Rosa e Valutazione condividono parte della navigazione gestita nello stato React: non introdurre un nuovo router come effetto collaterale del restyling.

### Branding e design system esistente

- Font dichiarati: **Inter** per il testo e **Manrope** per titoli/brand, con fallback di sistema. Nessun nuovo font proposto.
- Identità presente: logo agente, oro, toni scuri blu/petrolio, fondi chiari; l'ultima iterazione usa anche avorio e verde salvia.
- Non esiste un unico tema effettivo: `main.tsx` importa sette fogli, con ulteriori import di token/motion e numerosi override.
- Conservare originali PNG e stemmi. Le varianti WebP già presenti possono continuare a servire la UI senza sostituire gli originali.
- Uniformare la scritta pubblica a **FANTA007** è un vincolo del brief, non una nuova proposta di naming.

Punti di forza da non riscrivere: flusso guidato, calcoli budget/slot, separazione Reparti/Elenco, acquisti per ID e prezzo, confronto fino a tre giocatori, preferiti, gestione N/D, spiegazioni del giudizio, focus/Escape già implementati in più pannelli.

## 4. Compatibilità frontend/backend

Il redesign non richiede un nuovo backend.

- Le chiamate frontend corrispondono alle rotte FastAPI: health, teams, players/lista/ricerca/dettaglio/benchmark e `POST /api/v1/squads/resolve`.
- Il payload `StoredSquad` v2 e la risposta di risoluzione sono compatibili. Non cambiare chiavi salvate, ID giocatore o significato del prezzo pagato.
- API amministrative media da lasciare fuori dal redesign pubblico.
- La configurazione locale usa `VITE_API_BASE_URL`; le variabili backend sono documentate nell'esempio. Nessuna chiave deve finire nel frontend o nella documentazione.
- CORS non equivale ad autenticazione e non viene usato come garanzia di sicurezza.

**Disallineamento limitato dei tipi:** il tipo frontend Team include `colors` e `source_page`; il backend espone anche `code`, `official_name`, `season`, `source_url` e `attribution`. L'interfaccia corrente usa ID/nome e catalogo locale degli stemmi, quindi non è emersa una chiamata fallita. Prima di usare “colori della squadra” nel dossier bisogna verificare quale fonte reale li fornisca: non assumere che arrivino già dall'API.

## 5. Mappa modello → schermata

### Registro dei riferimenti realmente verificati

**M1 — Hero 40, vincolo utente.** Pagina ufficiale e sorgente precedentemente recuperato sono accessibili. Struttura: hero a tutta altezza, navigazione superiore, sfondo Dither Reveal, gruppo titolo/CTA nella zona inferiore destra, gerarchia tipografica forte. L'arco e la suddivisione attuale in due colonne non riproducono questa composizione. Adattamento FANTA007: stesso rapporto fra sfondo, contenuto e navigazione; protagonista PNG come elemento visivo identitario, contenuti del prodotto e CTA reali. Non copiare agenzia, fotografie, testi o palette lilla della demo. Fonte: [Hero 40](https://www.originkit.dev/sections/hero-40).

Il Dither Reveal del pacchetto ispezionato usa React e WebGL nativo: non impone GSAP, Three o OGL. Il template completo contiene scaffolding estraneo a Vite; estrarre soltanto sezione e dipendenze effettive. Mancano nel componente ispezionato protezioni esplicite sufficienti per movimento ridotto/fallback: serviranno stato statico, limite del carico grafico e sospensione quando non visibile. Licenza del pacchetto non identificata nei file controllati: **verifica necessaria prima di trasferirne il codice nell'app**.

**M2 — FAQ3, vincolo utente già scelto.** Sorgente negli allegati recuperabile. Titolo/introduzione centrali su desktop, accordion in un unico blocco centrale, chevron con rotazione e animazione dell'altezza in apertura/chiusura. Adattare alle sei domande reali e ai comportamenti FANTA007. Radix Accordion è già presente; non serve installare tutto shadcn/Tailwind, avatar o immagini suggerite dal testo boilerplate. La licenza non è indicata nell'allegato; prima di copiare integralmente va accertata. Il pattern può essere implementato con le primitive già presenti.

**M3 — InteractiveListPreview, vincolo di riferimento da adattare.** Sorgente allegato verificato. Lista a colonne, evidenziazione animata della riga e immagine che segue il puntatore. Il sorgente usa GSAP e classi Tailwind; la variante touch trasforma gli elementi in grandi card immagine. Per il Listone propongo di conservare struttura a righe e selezione animata, collegando nome, squadra, ruolo, QA/FVM/variazione e azioni reali; eventuale immagine soltanto lo stemma esistente, senza coprire i dati. Ridimensionamento touch e sostituzione GSAP con Motion sono **adattamenti da approvare**, non una replica identica. Commento di origine Hyperiux Vault presente; licenza di copia non esplicitata nell'allegato.

**M4 — Dock Nav di Sora Labs, suggerimento da approvare.** Sorgente ottenuto realmente tramite MCP 21st. Espansione delle icone e degli elementi vicini, etichetta al passaggio, supporto reduced motion. Proposta: dock superiore desktop e navigazione inferiore mobile, cinque destinazioni reali. Da aggiungere etichette utilizzabili anche senza hover, focus visibile e stato attivo. Il sorgente usa Motion, helper/classi e Next Image; in Vite si usa un normale elemento immagine o l'icona SVG già presente. Nessuna necessità di installare Next. La pagina dichiara **MIT**. Fonte: [Dock Nav](https://21st.dev/@soralabs/components/dock-nav).

**M5 — Modal di Efferd, escluso.** Il riferimento è stato valutato ma non viene integrato nel redesign corrente. Il `ContextPanel` già presente resta solo il contenitore funzionale per anteprima e dossier, senza importare il componente Efferd o dipendenze aggiuntive.

**M6 — Particle Interlock, vincolo di riferimento per il loader.** Pagina tecnica accessibile: sfera Canvas con due gusci di punti controrotanti, parametri di densità/colore/velocità e interazione di trascinamento. Non è stato acquisito/verificato il sorgente completo del componente. Per un loader FANTA007 il trascinamento non è necessario: animazione piccola, etichetta di stato accessibile, nessun ritardo artificiale; fallback statico con movimento ridotto. Dipendenze e licenza restano da verificare prima dell'integrazione. Fonte: [Particle Interlock](https://www.originkit.dev/components/particle-interlock).

**Riferimenti non identificabili univocamente:** stepper, search bar, slider, checkbox, paginazione, footer e template statistico specifici. Molti allegati testuali recuperabili sono copie identiche di FAQ3, e diverse vecchie immagini ripetono lo stesso logo; i 14 screenshot più recenti documentano invece l'app corrente. La lista funzionale dell'utente rimane vincolante. Non sostituirò in silenzio i modelli mancanti né chiederò di rifare tutta la raccolta: le alternative dovranno avere nome/link e approvazione espliciti.

### Le 14 aree

| Area | Modello e stato | Elementi strutturali/interazioni da mantenere o riprodurre | Adattamenti a dati e prodotto |
|---|---|---|---|
| 1. Home superiore | M4 proposto per navigazione; nessun modello dashboard esatto identificato | Cinque destinazioni evidenti, stato attivo; riepilogo compatto, avanzamento animato | Squadra, obiettivo, budget, slot e massimo acquisto rimangono calcolati come oggi; PNG originale |
| 2. Home inferiore | M3 proposto per liste; composizione dashboard da approvare | Reparti azionabili, consiglio agente, barra budget e ultimi acquisti; riduzione di vuoti e duplicazioni | Non perdere qualità reparti; nessun nuovo indicatore predittivo |
| 3. Rosa — Reparti | Struttura funzionale utente + selezione M3 proposta | Griglia di reparti, selezione evidente, pannello dettaglio, aggiunta per ruolo | Acquistati/capienza, spesa per reparto, prezzo pagato e rimozione reali |
| 4. Rosa — Elenco | M3 adattato, da approvare | Righe più dense, colonne leggibili, transizione Reparti/Elenco, selezione da tastiera | Stessi giocatori/azioni; layout mobile esplicito senza preview che copre il testo |
| 5. Listone | M3 verificato; controlli specifici non identificati | Lista a colonne, evidenza di hover/focus/selezione; ricerca, filtri, ordinamento, preferiti, confronto | QA/FVM/variazione reali, stemmi esistenti; preservare query e risultati; valutare paginazione senza cambiare API |
| 6. Anteprima/acquisto | M5 proposto | Pannello proporzionato, apertura/chiusura, input prezzo e CTA persistente, ritorno dal dossier | Budget disponibile/sostenibile/residuo, draft prezzo e validazioni invariati |
| 7. Dossier — Statistiche | M5 per contenitore; tabella richiesta dall'utente | Dossier desktop centrale, quattro tab, tabella con etichette estese, scroll interno | Mostrare solo campi del dataset; zero distinto da N/D; fonti/stagioni esplicite |
| 8. Dossier — Analisi | M5 + requisiti dell'utente | Riepilogo giudizio dominante, stelle leggibili, dettagli progressivi, PNG non ridondante | Appetibilità, obiettivo, prezzo/valore, affidabilità e fonte senza modificare formule |
| 9. Dossier — Consiglio | Quarta sezione obbligatoria; M5 proposto | Tab autonomo, segnale → motivazione → prossima azione, dati espandibili | Riutilizzare l'attuale consiglio operativo; nessuna previsione nuova |
| 10. Valutazione superiore | Requisiti utente; modello score esatto non identificato | Completamento e distribuzione budget animati, priorità agente leggibile | Rosa provvisoria/completa, crediti e spesa coerenti con Home |
| 11. Valutazione inferiore | M3 come possibile linguaggio delle righe | Reparti riconoscibili, score leggibile, collegamento al filtro di ruolo | Stesse medie e slot; legenda non basata solo sul colore |
| 12. Impostazioni | M5 proposto come famiglia dei pannelli | Gruppi Missione/Configurazione/Dati, modifica, conferma distruttiva coerente | Elenco preciso dei dati eliminati, ritorno alla landing; nessun reset aggiuntivo implicito |
| 13. Presentazione iniziale | **M1 verificato e vincolante** | Hero a tutta altezza, navigazione superiore, gerarchia titolo/CTA e sfondo del modello | Nome FANTA007, agente PNG, CTA verso configurazione, colori/font esistenti; fallback shader |
| 14. FAQ e footer | **M2 verificato e scelto**; footer specifico non identificato | FAQ centrali, chevron, apertura/chiusura animate; footer soltanto con link reali | Sei domande FANTA007; configurazione/FAQ/torna all'inizio; niente sponsor o loghi non autorizzati |

**Configurazione iniziale**, oltre alle 14 aree: conservare tutti i cinque passaggi e il riepilogo, Invio/indietro e validazioni. Lo sfondo può condividere M1; stepper e toggle esatti non sono identificati. La scelta di un nuovo stepper va mostrata prima di essere applicata.

## 6. Problemi confermati

| ID / priorità | Problema ed evidenza | Intervento |
|---|---|---|
| C01 — P1 | Hero locale con arco/due colonne anziché composizione Hero 40 | Ricostruire la composizione, non un ulteriore tema CSS |
| C02 — P1 | FAQ locale a due colonne e indicatore “+”; FAQ3 centrale con chevron | Allineare struttura, indicatore e animazione al riferimento |
| C03 — P1 | Nome pubblico “Fanta 007” in BrandLogo e metadati HTML | Uniformare a FANTA007 |
| C04 — P1 | Listone misurato a 1264 px: riga ~158 px; badge voto ~456 × 52 px. A 375 px: riga ~234 px | Correggere gerarchia della riga e selettori CSS troppo estesi, senza ridurre eccessivamente il testo |
| C05 — P1 | Dossier ha soltanto Scheda/Statistiche/Analisi; consiglio incorporato nell'analisi | Separare Consiglio operativo come quarta sezione |
| C06 — P1 | Dossier e anteprima sono pannelli laterali a tutta altezza | Valutare M5 centrale desktop; decisione strutturale da approvare |
| C07 — P1 | Reset con prima conferma interna più conferma nativa; testo non esplicita il ritorno alla presentazione | Rendere unico e chiaro il percorso di conferma, mantenendo protezione distruttiva |
| C08 — P1 | CSS sovrapposti; colori P/D uguali in una vista, diversi in un'altra | Consolidare per componente e definire un'unica semantica dei reparti |
| C09 — P1 | Tab dossier con aria-controls ma pannello senza aria-labelledby associato | Completare il collegamento accessibile tab/pannello |
| C10 — P2 | Build main JS 510,59 kB; warning Vite >500 kB | Misurare e separare codice non necessario all'ingresso prima di aggiungere shader/librerie |
| C11 — P0 operativo | La copia locale non è un checkout Git | Predisporre baseline recuperabile prima dei cambi; riallineamento Git separato prima di pubblicare |

Non è stato rilevato overflow orizzontale del Listone alle larghezze **375, 768 e 1264 px** provate. Questo non dimostra che tutte le altre schermate siano responsive.

## 7. Ipotesi da verificare, non bug già riprodotti

- **P0 — Risposte obsolete nel Listone:** `loadMore()` non usa AbortController né verifica la versione dei filtri prima di aggiungere risultati. Se si cambia filtro mentre una pagina è in volo, potrebbe contaminare il nuovo elenco. Evidenza statica presente; riproduzione con rete controllata ancora necessaria.
- **P1 — Navigazione avanti/indietro e focus:** verificare percorso diretto `/players`, ritorno alla sezione precedente e chiusura di pannelli sovrapposti.
- **P1 — Valori mancanti:** verificare tutti i rami di rendering zero/null/N/D, non soltanto i giocatori con dati completi.
- **P1 — Budget limite:** verificare ultimo credito, reparto completo, acquisto duplicato, annullamento rimozione e passaggio al dossier senza perdere il prezzo.
- **P1 — Focus oscurato:** verificare sticky header, footer acquisto e navigazione mobile anche a zoom elevato. La skill UI/UX Pro Max ha guidato questo criterio; nessuna palette automatica è stata applicata.
- **P2 — Costo shader:** misurare frame rate, memoria e fallback su dispositivi modesti prima di adottare Dither Reveal.
- **P1 — Produzione:** non è stato certificato il commit effettivamente distribuito né provato l'intero flusso produttivo.

## 8. Proposte aggiuntive del designer

Queste proposte non sostituiscono M1/M2/M3. “Approvazione” indica una scelta aggiuntiva; nessun intervento viene implementato in questa fase.

| ID / classe / priorità | Problema, area e vantaggio UX | Impatto visivo e tecnico | Rischio / dipendenza / funzione / approvazione |
|---|---|---|---|
| S01 — SUGGERIMENTO DA APPROVARE — P1 | Sidebar attuale distante dalla richiesta di dock; tutte le schermate. M4 offre accesso compatto e stato attivo | Dock superiore desktop, inferiore mobile; riuso callback/percorsi | Medio; nessuna libreria obbligatoria; cambia presentazione non destinazioni; **sì** |
| S02 — SUGGERIMENTO DA APPROVARE — P1 | Dossier lungo/laterale; lettura più concentrata con M5 | Centrale desktop, mobile adattivo, body scrollabile e quattro tab | Medio; Radix Dialog/Vaul solo opzionali; cambia contenitore non dati; **sì** |
| S03 — SUGGERIMENTO DA APPROVARE — P1 | Righe Listone enormi e modello M3 troppo orientato a immagini | M3 denso con Motion, stemma discreto e selezione tastiera/touch | Medio; nessuna nuova dipendenza; no perdita di azioni; **sì**, per l'adattamento del modello |
| S04 — SUGGERIMENTO DA APPROVARE — P2 | “Mostra altri” non offre avanti/indietro come richiesto precedentemente | Paginazione esplicita, mantenendo filtri e scroll; usa offset/limit esistenti | Medio; nessuna; cambia comportamento di navigazione dati; **sì**, modello esatto da definire |
| S05 — IMPLEMENTAZIONE NECESSARIA — P1 | Vuoti/errori/caricamenti non uniformi; feedback comprensibile | Stati coerenti e azione Riprova; M6 solo dopo verifica, senza ritardo artificiale | Basso/medio; M6 da verificare; nessun nuovo flusso; approvazione solo per codice/deps M6 |
| S06 — SUGGERIMENTO DA APPROVARE — P1 | Home dispersiva: budget, progressione e reparti poco coordinati | Portare budget/slot in primo piano, accostare consiglio e copertura, mantenere qualità reparti | Medio; nessuna; sola gerarchia; **sì** |
| S07 — IMPLEMENTAZIONE NECESSARIA — P1 | Ripetizioni nel dossier e acronimi poco chiari | Riepilogo unico, etichette estese, dettagli espandibili, fonte vicino al dato | Basso; nessuna; stessi calcoli; nessuna decisione extra oltre il brief |
| S08 — IMPLEMENTAZIONE NECESSARIA — P1 | Reset poco esplicito e doppia conferma disomogenea | Un'unica conferma accessibile con elenco effetti e ritorno landing | Medio per azione distruttiva; nessuna; non ampliare cosa cancella; no scelta estetica extra |
| S09 — IMPLEMENTAZIONE NECESSARIA — P1 | Motion e stili incoerenti fra viste | Token di durata/easing, riduzione movimento, selettori circoscritti | Medio; Motion esistente; nessun cambio funzionale; no nuovo tema |
| S10 — FUORI SCOPE | Login, DB, nuove previsioni, foto di giocatori o marchi decorativi non verificati | Nessuna implementazione | Nessuna installazione o scrittura; serve incarico separato |

Non viene proposta una nuova palette. L'oro, i toni scuri e chiari verranno ricondotti a token coerenti; se la distribuzione dei colori cambia sensibilmente, sarà mostrata e approvata prima.

## 9. Dipendenze, skill, accesso e licenze

| Risorsa | Valore immediato | Decisione proposta |
|---|---|---|
| UI/UX Pro Max | Usata per criteri mirati di leggibilità, focus e responsive | Supporto alla verifica, non sostituzione dei modelli utente |
| 21st MCP | Collegamento funzionante; verificati Dock Nav e Modal; preferiti dell'account vuoti al controllo | Usarlo per componenti nominati e valutati, non installazioni in blocco. Le due acquisizioni sorgente disponibili sono state utilizzate |
| Motion | Già presente; copre transizioni, selezione, comparsa testo e gran parte delle microinterazioni | Un solo sistema motion, evitando un secondo motore per semplici effetti |
| Radix Accordion/Select | Già presenti e adatti a FAQ e selettore squadra | Riutilizzare, mantenendo accessibilità |
| Agentation | Già caricato solo in sviluppo mediante import lazy condizionale | Utile per annotazioni in preview; verificare esclusione dal bundle produzione e non coprire i controlli |
| transitions.dev | Roster pertinente al motion; skill non disponibile nel catalogo corrente, non usata in questo audit | Riserva; non installare adesso |
| OriginKit Hero 40/Dither Reveal | Pagina e pacchetto ispezionati; utile al primo blocco | Estrarre solo dopo controllo licenza; nessun import dell'intero template |
| OriginKit Particle Interlock | Pagina/API consultate, sorgente completo non verificato | Riserva immediata per loading; niente integrazione dichiarata |
| GSAP | Richiesto dal sorgente della lista M3, non dallo stack attuale | Evitabile con traduzione su Motion se approvata |
| Radix Dialog/Vaul | Utili per importare fedelmente la base del Modal M5 | Opzionali, **non approvati per installazione**; verificare versioni/peer dependency/licenze |
| Tailwind/shadcn/Next | Presenti nei boilerplate di alcuni riferimenti, non prerequisiti dell'intero prodotto | Nessuna migrazione di stack automatica |
| Aceternity, Beautiful UI, Component Gallery, altri effetti OriginKit | Nessuna lacuna attuale che giustifichi ulteriore codice | Riserva; evitare duplicazioni di hero, accordion, effetti e pulsanti |
| Impeccable | Soluzione di scorta richiesta dall'utente | Non usata per imporre la direzione di questo redesign |

**Licenze:** accesso a sorgente o API non equivale da solo a diritto di incorporare ogni asset. Per Dock Nav è stata rilevata la dichiarazione MIT nella pagina; preservare eventuali avvisi richiesti. Per M1/M2/M3/M5/M6 le verifiche sopra indicate restano aperte. Nessun logo esterno viene aggiunto nel footer, nessun “mi ispiro a” con marchi non verificati. Le chiavi condivise in chat non vengono riportate nel documento né incluse nell'app.

## 10. Piano in 11 blocchi

Ogni blocco termina con verifica e confronto visivo prima di procedere. File indicati sono quelli esistenti da coinvolgere; eventuali nuovi componenti saranno nominati nel registro di implementazione.

**Rollback comune R:** prima di ogni blocco, snapshot con hash dei soli file coinvolti e confronto con la baseline approvata. Ripristino puntuale dei cambi del blocco, mai reset globale né eliminazione del lavoro precedente. Finché manca Git, lo snapshot è necessario; commit/push restano vietati. Qualsiasi modifica dati/storage rimane esclusa.

| Blocco | File e obiettivo/modifiche | Dipendenze | Test e criteri di accettazione | Rollback / risultato visivo |
|---|---|---|---|---|
| 1. Baseline e compatibilità | [package.json](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/package.json>), [types](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/types.ts>), [persistenza](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/lib/squadPersistence.ts>); registrare stato, flussi e contratti senza rifattorizzarli indiscriminatamente | Nessuna | Hash protetti invariati; baseline test/build; zero perdita della copia recuperata | R; app invariata |
| 2. Modelli e fondamentali | [FantaHero](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/ui/FantaHero.tsx>), [FantaFaq](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/ui/FantaFaq.tsx>), [DossierTabs](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/ui/DossierTabs.tsx>), [token](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/styles/tokens.css>); fissare specifiche modello, stati e confini CSS | Esistenti; licenze come prerequisito al codice di terzi | Confronto struttura/interazioni con riferimenti; nessun cambio di font/palette non approvato | R; componenti coerenti, non collage |
| 3. Presentazione, FAQ, footer | [StudioWelcome](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/StudioWelcome.tsx>), [Hero](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/ui/FantaHero.tsx>), [FAQ](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/ui/FantaFaq.tsx>), [BrandLogo](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/BrandLogo.tsx>), [HTML](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/index.html>), [stili](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/styles/club.css>); M1/M2 e link reali | Nessuna installazione prevista; Dither soltanto se licenza verificata | CTA funzionante, FAQ tastiera/apertura/chiusura, fallback shader, screenshot 375/768/1440, nessun overflow | R; hero davvero a tutta altezza e FAQ centrali |
| 4. Configurazione e navigazione | [Onboarding](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/Onboarding.tsx>), [Navigation](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/BottomNavigation.tsx>), [App](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/App.tsx>); cinque step, riepilogo, nav approvata | Motion esistente | Creazione da zero, Invio/indietro/errori, rientro/modifica, stato attivo, percorsi e tastiera | R; ingresso e navigazione parte dello stesso prodotto |
| 5. Home | [CommandCenter](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/CommandCenter.tsx>), [BudgetAllocation](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/BudgetAllocation.tsx>), [AgentInsight](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/AgentInsight.tsx>); gerarchia approvata e meno duplicazioni | Nessuna | Rosa vuota/parziale/completa, somme coerenti, link reparto/ultimi acquisti, qualità reparti presente | R; budget e prossima azione immediati |
| 6. Listone | [Search](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/PlayerSearch.tsx>), [riga](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/PlayerCompactCard.tsx>), [TeamSelector](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/TeamSelector.tsx>), [confronto](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/PlayerCompareTray.tsx>); M3 adattato, controlli e gestione richieste | Motion; GSAP solo se successivamente approvato e motivato | Filtri combinati, risposte ritardate, preferiti/confronto, 0 risultati/errore, 533 elementi senza duplicati, touch/focus | R; righe compatte con voto leggibile, non barre sproporzionate |
| 7. Dossier e acquisto | [Preview](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/PlayerPreview.tsx>), [Modal](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/PlayerModal.tsx>), [Tabs](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/ui/DossierTabs.tsx>), [Appeal](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/AppealBadge.tsx>); M5 approvato, quattro sezioni, prezzo conservato | Esistenti o Dialog/Vaul con consenso separato | Apri/chiudi/Escape/focus, passaggio acquisto↔dossier, zero/N/D, validazione budget/duplicati, tab da tastiera | R; dossier centrale desktop, mobile leggibile, dati invariati |
| 8. Rosa e valutazione | [Rosa](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/SquadOverview.tsx>), [Valutazione](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/SquadEvaluation.tsx>), [Budget](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/BudgetAllocation.tsx>); viste distinte, dettaglio, score e reparti | Nessuna | Cambio vista/selezione, rimozione/annulla, budget e score uguali alla baseline per stessa fixture | R; rosa più leggibile, valutazione meno dispersiva |
| 9. Responsive | [studio.css](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/styles/studio.css>), [club.css](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/styles/club.css>), componenti dei blocchi 3–8 | Nessuna | 375/768/1440 e viewport corta; zoom 200%; orientamento; controllo overflow e CTA non coperte | R; adattamento reale, non semplice riduzione desktop |
| 10. Motion | [SectionArrival](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/SectionArrival.tsx>), [AppearText](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/ui/AppearText.tsx>), [RadialAction](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/ui/RadialAction.tsx>), [motion.css](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/styles/motion.css>); tempi coerenti, loader verificato, stop offscreen | Motion; M6 solo dopo controllo | Reduced motion, interruzione animazioni, ritorni rapidi, nessun ritardo artificiale o salto di layout | R; movimento intenzionale e leggero |
| 11. Accessibilità e QA finale | [FocusTrap](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/hooks/useFocusTrap.ts>), [Settings](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/src/components/SettingsDialog.tsx>), [test](<C:/Users/Andry/Desktop/Progetto FANTA007/recovery-20260909/FANTA007/repository/frontend/tests/componentIntegration.test.mjs>), componenti interessati | Nessuna automatica | Flusso completo, reset su fixture isolata, contrasto, focus, stati, console, TypeScript/build, test frontend/backend | R; consegna interattiva verificata con elenco residui |

### Azioni e comandi successivi, dopo approvazione

Li eseguirò io: non è richiesto all'utente aprire PowerShell.

1. Creare snapshot pre-blocco in cartella di audit separata, con hash, senza toccare dati o export originale.
2. Verificare licenza e versione del solo componente da integrare; nessun `npx ... add` direttamente nell'app prima della revisione del pacchetto.
3. Applicare modifiche limitate al blocco con patch puntuali; registro ID/problema/modello/file/stati/esito.
4. Eseguire nella cartella repository:

```powershell
npm --prefix frontend test
npm --prefix frontend run build
```

La build include `tsc -b`. Test backend dal percorso backend con l'ambiente virtuale già disponibile nella radice repository:

```powershell
..\.venv\Scripts\python.exe -m pytest -q
```

5. Riutilizzare i server locali già attivi. Se non lo sono, dopo controllo delle porte:
   - dalla cartella frontend: `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`;
   - dalla cartella backend: `..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000`.
6. Aprire qui la preview e verificare i flussi; eventuali servizi avviati senza finestre PowerShell visibili.
7. Nessun comando di deploy, commit, push, reset Git o nuova installazione è incluso nell'approvazione del primo blocco.

## 11. Primo blocco consigliato

**Baseline recuperabile → Hero 40 + FAQ3 → revisione visiva prima di estendere il linguaggio alle altre schermate.**

È il primo intervento visibile consigliato perché i riferimenti sono identificati e la distanza rispetto al risultato attuale è dimostrabile. Le basi tecniche dei blocchi 1–2 lo precedono; non diventeranno una lunga rifattorizzazione generale.

Accettazione del primo passaggio:

- Composizione riconoscibile del modello Hero 40, non lo stesso arco con colori diversi.
- Logo/nome FANTA007 e protagonista conservati.
- CTA avvia il flusso reale; FAQ3 funzionante e footer senza voci finte.
- Desktop/mobile e movimento ridotto verificati.
- Nessuna modifica a dati, API, scoring o persistenza.
- Nessuna nuova libreria installata senza approvazione.
- Se la licenza dello shader non viene verificata, l'effetto resta esplicitamente sospeso: nessuna imitazione dichiarata come integrazione originale.

## 12. Preview e stato delle verifiche

### Preview attuale

La preview interattiva esistente è stata verificata su [localhost:5173](http://localhost:5173/), con API locale su 8000. È **la versione attuale, non il redesign proposto**. Richiede che i servizi locali restino attivi; non è un link pubblico Vercel. Le due sessioni browser di audit sono state chiuse senza fermare i server originali.

La prova locale ha usato una sessione isolata e una squadra vuota “Audit modelli”, completando il flusso iniziale e aprendo il Listone. La visita alla produzione si è fermata alla landing e al primo step: nessun acquisto o configurazione produttiva è stato inviato.

### Preview da produrre dopo approvazione

App React reale, non HTML statico: landing/FAQ, configurazione da zero, Home, Listone, acquisto, dossier, Rosa, Valutazione e Impostazioni. Dati locali reali dell'app; fixture dichiarate soltanto per casi limite/test, mai spacciate per statistiche di giocatori.

Per la tua prova libera predisporrò un contesto browser isolato: nome squadra, obiettivo, regole, acquisti e reset senza alterare la tua squadra già salvata. Non aggiungo automaticamente un parametro di reset o una nuova funzione pubblica. Al termine apro il link direttamente in Codex; nessun comando richiesto a te.

### Esiti separati

| Stato | Controllo |
|---|---|
| **Completato** | Audit sorgenti/modelli disponibili, confronto landing locale/pubblica, hash manifest/protetti |
| **Completato** | Frontend: **31 test passati**, zero falliti |
| **Completato** | Build frontend e TypeScript passati; 553 moduli, CSS 173,96 kB, main JS 510,59 kB, gzip 160,43 kB |
| **Completato con warning** | Warning bundle >500 kB; test riportano porta WebSocket Vite 24678 occupata, senza fallimenti |
| **Completato** | Backend: **134 passati**; 2 warning di deprecazione |
| **Parziale** | Backend: **4 saltati**, mancano export XLSX ufficiali per quei controlli; non sono test passati |
| **Parziale** | Browser locale: onboarding → Home → Listone; larghezze Listone 375/768/1264 senza overflow orizzontale; nessun errore JavaScript riportato dal comando errors nella sessione controllata |
| **Parziale** | Produzione: landing e apertura primo step; non test end-to-end |
| **Non verificato** | Intero flusso acquisto/persistenza/reset in questo passaggio; tutte le schermate mobile/tablet; contrasto completo; performance shader |
| **Non conforme al brief** | Hero/FAQ, proporzioni lista, nome pubblico, quarta tab dossier e altri punti C01–C09 |
| **Bloccato da verifica risorsa** | Licenze non identificate e sorgente completo Particle Interlock; nessuna integrazione di tali risorse dichiarata |
| **Bloccato dall'ambiente per operazioni Git** | `.git` assente nella copia recuperata; non impedisce audit/preview locale |

## 13. Decisioni da approvare

1. **Primo passaggio:** Hero 40 nella sua composizione reale + FAQ3 centrale, conservando font, colori identitari e agente; nessun nuovo tema imposto.
2. **Navigazione proposta M4:** Dock Nav Sora Labs in alto su desktop e in basso su mobile, con etichette e accessibilità aggiunte. Non è identificato come il tuo modello originale.
3. **Dossier proposto M5:** Modal centrale desktop/mobile adattivo e quattro sezioni; scegliere prima se tradurre il pattern con lo stack attuale o valutare l'aggiunta di Radix Dialog/Vaul.
4. **Lista M3 adattata:** mantenere righe e selezione animate, senza grande immagine che oscura dati; usare Motion già presente. Paginazione avanti/indietro come ulteriore decisione esplicita.
5. **Home e schermate senza modello univoco:** approvare la gerarchia proposta prima di ricomporle. Nessuna sostituzione silenziosa dei riferimenti mancanti.

L'approvazione può riguardare soltanto il punto 1: gli altri blocchi rimangono fermi finché non vengono concordati. Nessuna autorizzazione al deploy è implicita.

**Stato finale di questo documento: audit consegnato; implementazione del nuovo redesign non iniziata; attesa approvazione.**
