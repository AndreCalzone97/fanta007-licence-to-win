# Home sperimentale — Serie A Intelligence

La Home V2.1 sperimentale mostra il video Fantagente nella rail sinistra desktop e un feed Serie A nella rail destra. Sotto 1320 px il video viene omesso e il feed rimane accessibile con il pulsante “Serie A Intelligence”, in un drawer. La Home centrale non cambia.

Il browser legge `GET /api/v1/serie-a-intelligence`; il backend chiama [API-Football](https://www.api-football.com/documentation-v3). La chiave resta solo sul server. Le tre viste sono Classifica, Prossimo turno e Ultimo turno. Tornando da un turno a Classifica appare prima la tabella compatta; un secondo clic sulla tab Classifica, oppure il pulsante nella tabella compatta, apre la classifica completa. Ogni partita apre un dettaglio. Eventi, formazioni e statistiche compaiono solo se forniti dall'API. I loghi delle squadre sono facoltativi e hanno un badge con iniziali come fallback.

Configurare `API_FOOTBALL_KEY` nell'ambiente del backend, senza prefisso `VITE_`. Facoltativamente configurare `API_FOOTBALL_SEASON` con l'anno iniziale della stagione, per esempio `2026` per 2026/27. Senza chiave vengono mostrati esempi chiaramente etichettati; punti, risultati e date ignoti non vengono inventati. Se il provider fallisce dopo una risposta valida, viene usato l'ultimo snapshot in memoria con indicazione “ultimi dati salvati”; dopo un riavvio senza provider torna la demo.

Cache server in memoria: classifica 6 ore, calendario/risultati 30 minuti, dettaglio partita 90 secondi solo se in corso, 30 minuti se non iniziata e 6 ore se conclusa. Nessuna cache distribuita: su deploy multiistanza ogni processo mantiene il proprio snapshot. Per il live vero futuro servirà valutare quote, frequenze e cache condivisa; questa UI non è un mini-live.

Il video si carica solo su desktop e solo se non è attivo `prefers-reduced-motion`; altrimenti resta il poster statico. La Home sperimentale è ancora disponibile nella preview di sviluppo, non sostituisce automaticamente la Home pubblicata.
