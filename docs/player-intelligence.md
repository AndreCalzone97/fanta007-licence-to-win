# Player Intelligence e Appetibilità Fanta007

## Stato dei dati

Le quotazioni QI/QA, le variazioni e il FVM arrivano dal Listone Fantacalcio 2026/27 normalizzato nel progetto. Il dataset attivo non contiene ancora statistiche storiche per stagione: l’ingestione rimane **PENDING DATA INTEGRATION**.

La UI non stima presenze, medie, gol, assist o altri dati mancanti. Mostra `N/D` o un empty state esplicito.

## Appetibilità

L’Appetibilità è un indicatore deterministico di interesse fantacalcistico e non coincide con il giudizio sul prezzo di acquisto.

- con benchmark disponibile: 62% percentile FVM di ruolo, 23% percentile QA di ruolo e fino al 15% dal trend della quotazione;
- prima del benchmark: segnale preliminare ricavato da FVM, QA e trend;
- output: punteggio 0–100, livello 1–5, etichetta e motivazioni leggibili;
- l’obiettivo della lega orienta il commento di compatibilità, ma non modifica il punteggio grezzo;
- nessun numero casuale, dato esterno non verificato o statistica simulata entra nel calcolo.

Value Pick, Fair Price, Overpay e Budget Risk restano indicatori separati: confrontano il prezzo pagato con il FVM normalizzato per il budget della lega.

## Provider statistiche

Il frontend legge lo storico attraverso l’interfaccia `PlayerStatsProvider`. L’implementazione attiva, `embeddedStatsProvider`, espone esclusivamente record già presenti nel dataset e dotati di stagione e fonte.

Campi previsti per ogni stagione:

- stagione, competizione, club e fonte;
- URL e data di aggiornamento opzionali;
- confidence opzionale;
- presenze, MV, FM;
- dati di movimento per D/C/A;
- gol subiti e rigori parati per P.

L’importazione futura deve restare offline, produrre un dataset candidato e passare audit/diff prima dell’attivazione. Il frontend non effettua scraping.

## Confidence

- `HIGH`: almeno due stagioni verificate;
- `MEDIUM`: una stagione verificata;
- `LOW`: nessuna stagione storica verificata.

La confidence descrive la copertura informativa, non la qualità calcistica del giocatore.
