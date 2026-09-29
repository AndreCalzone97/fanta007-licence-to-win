# Prompt di handoff — FANTA007 V2

Copia il testo seguente nella chat del Senior UX/UI Designer.

---

Agisci come Senior Product Designer, Senior UX/UI Designer e React Frontend
Engineer. Devi revisionare la V2 di FANTA007 già implementata: non ripartire da
zero e non sostituire i componenti approvati con alternative generiche.

## Obiettivo prodotto

FANTA007 è uno strumento di supporto all'asta del Fantacalcio: aiuta a leggere
Listone, quotazioni, FVM, budget, copertura dei reparti e dati storici. Non deve
promettere risultati sportivi né inventare previsioni. La V2 deve risultare più
chiara, autorevole e interattiva della V1, mantenendo intatti dati, regole,
persistenza locale e flussi di acquisto/rimozione.

## Componenti V2 approvati e già integrati

1. Navigazione N1 — Floating Dock:
   https://21st.dev/@manuarora700/components/floating-dock
2. Navigazione dossier — Expandable Tabs:
   https://21st.dev/@victorwelander/components/expandable-tabs
3. Scheda dossier D2 — Stats Card:
   https://21st.dev/@ravikatiyar162/components/stats-card-1
4. Statistiche dossier S1 — Bar Chart, variante interactive demo 10116:
   https://21st.dev/@bklitai/components/bar-chart
5. Hero H1 — Hero Section:
   https://21st.dev/@reuno-ui/components/hero-section
6. Features — Bento Features:
   https://21st.dev/@larsen66/components/bento-features

Efferd Modal è escluso. Expandable Tabs sostituisce solo la navigazione delle
quattro sezioni Scheda, Statistiche, Analisi e Consiglio; non sostituisce il
grafico del budget. Il budget graphic esistente va mantenuto.

## Stato verificato

- I sei slot UI approvati sono implementati.
- N1, Expandable Tabs, H1, D2 e Bento hanno una sorgente esatta recuperata o
  fornita e archiviata nel repository.
- S1 è un port basato sulla variante esatta selezionata, sulla preview pubblica e
  sulla documentazione ufficiale dell'autore. Il bundle sorgente 21st.dev della
  demo 10116 non era recuperabile per esaurimento quota: non presentarlo come
  copia verbatim finché non viene eseguito il diff dopo il reset della quota.
- D2 usa quattro card per QI, QA, FVM / 1000 e FVM normalizzato sulla lega.
- S1 usa solo metriche stagionali verificate, con crescita barre di 1100 ms,
  tooltip, hover, click e focus da tastiera.
- Bento mantiene griglia a sei colonne, card span 4x2/2x1/2x1/3x1/3x1,
  spirale golden-angle, randomizzazione con R e collapse mobile.
- H1 mantiene il reveal progressivo delle parole; per gli screenshot attendere
  circa 5,5 secondi dal caricamento.
- Il foglio pose del Fantagente è un riferimento per personaggio, stati e future
  animazioni contestuali; non è un layout UI da riprodurre.
- Il salvataggio esistente è rimasto intatto: 25/25 giocatori, 438 crediti spesi,
  62 disponibili durante l'ultima verifica.
- Build di produzione superata; 47/47 test superati; controllo UI Impeccable
  senza segnalazioni sui file modificati.

## Preview locale

- Applicazione: http://127.0.0.1:5173/
- Hero H1 + Bento: http://127.0.0.1:5173/presentazione
- Listone + dossier: http://127.0.0.1:5173/players
- API health: http://127.0.0.1:8000/api/v1/health

Se i servizi non sono attivi, dalla root del repository eseguire:

```powershell
.\scripts\windows\Start-Preview.ps1 -OpenBrowser
```

Il launcher deve verificare backend 8000, frontend 5173 e Listone reale prima di
aprire la preview. Non usare dati mock per la revisione finale.

## Revisione richiesta

1. Confronta visivamente desktop e mobile con i sei riferimenti 21st.dev sopra.
2. Segnala per ogni componente: struttura, interazione, animazione, responsive,
   accessibilità e scostamenti dal riferimento.
3. Distingui chiaramente:
   - difetti funzionali;
   - difetti di fedeltà al componente;
   - adattamenti di prodotto necessari;
   - preferenze estetiche non bloccanti.
4. Non alterare dati, formule, API, localStorage, acquisti salvati o logica di
   scoring durante un pass esclusivamente UI.
5. Non introdurre nuovi componenti 21st.dev senza approvazione. Se proponi una
   sostituzione, fornisci il link pubblico 21st.dev esatto, la motivazione e il
   costo di migrazione.
6. Prima di dichiarare la V2 chiusa, recupera quando possibile il sorgente S1
   demo 10116 da 21st.dev e confrontalo con il port locale.

## Screenshot di accettazione richiesti

- Hero H1 desktop dopo il completamento dell'animazione.
- Bento Features desktop e mobile.
- Listone desktop con Floating Dock.
- Dossier Scheda desktop e mobile con le quattro D2 card.
- Dossier Statistiche desktop e mobile con S1 e tooltip attivo.
- Expandable Tabs con una voce espansa e una selezione persistente dopo click
  esterno.

Consegna un report prioritizzato P0/P1/P2, con evidenza visiva, componente
coinvolto, differenza osservata e modifica proposta. Non dichiarare “identico”
senza confronto diretto con il riferimento pubblico.

---
