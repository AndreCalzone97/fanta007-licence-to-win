# Fanta007 — interfaccia operativa

Stato: redesign implementato. Catture desktop/tablet/mobile del 13 settembre 2026; ultime correzioni del 14 settembre coperte da test e build, con riconferma browser bloccata dal sistema di approvazione. Questo documento descrive il codice, non un'approvazione estetica dell'utente.

## Direzione

Interfaccia Operate per preparare e registrare un'asta. La Home risponde nell'ordine a situazione, attenzione e prossima scelta. Steep orienta gerarchia e spaziatura, Maestro le priorità, Hawy il contesto calcistico. Fintech è un riferimento per la relazione prezzo/valore, senza grafici di trading decorativi.

## Identità e superfici

Fanta007, payoff Licence to Win. Font e asset originali conservati. Sfondo minerale #f2f5f3; superfici bianche; testata #122f2e; testo #193330; secondario #4b625d. Oro #dfbd6d sulle azioni, verde #246a4e sui valori favorevoli, rosso #b13d38 su errori/scostamenti sfavorevoli. Gli stati mantengono anche etichette testuali.

La nuova presentazione è circoscritta alle classi ops-* in frontend/src/styles/operations.css. I fogli precedenti sono ancora presenti per landing, onboarding, valutazione e Media Review: il loro consolidamento è debito tecnico dichiarato, non già risolto.

## Composizione

- Testata compatta con dock orizzontale desktop; dock inferiore a cinque destinazioni sotto 700 px.
- Home: riepilogo budget/posti e priorità affiancati; mappa dei reparti; distribuzione del budget e ultimi acquisti.
- Listone: ricerca, ruoli, squadra, ordinamento, 40 risultati per pagina; azioni separate per dettaglio, preferito e confronto.
- Riga desktop con numeri allineati; riga mobile su due livelli, con QA, FVM /1000 e FVM lega. Stato In rosa mantenuto anche quando la colonna desktop è nascosta.
- Rosa: registro raggruppato per ruolo, prezzo pagato e riferimento FVM; inspector laterale desktop e dettaglio contestuale inline sotto 1000 px.
- Dettagli: ContextPanel controllato, laterale desktop e superficie dal basso su mobile; quattro tab nel dossier: Scheda, Statistiche, Analisi, Consiglio.

## Interazione

Entrate di sezione 200 ms e 6 px; pannello 260 ms; aggiornamento lista 160 ms. Niente animazioni continue. prefers-reduced-motion disabilita transizioni decorative. I pannelli sono portali, con focus confinato, Escape e isolamento dello sfondo. Il prezzo resta in bozza passando da anteprima a dossier. Salvataggio, fallimento e vincoli d'acquisto hanno feedback nel pannello.

## Verità del prodotto

FVM normalizzato al budget della lega; colonne Classic/Mantra distinte. Nessun dato mancante trasformato in zero. ID, prezzi e date d'acquisto restano nel formato normalizzato esistente; FastAPI valida il salvataggio. Le indicazioni dell'agente sono spiegabili e non promettono risultati futuri.

## Riferimenti e provenienza

Dock Nav Sora Labs (21st demo 19177): feedback di prossimità e selezione tradotti con Motion esistente, etichette sempre visibili. Modal Efferd (demo 4514): pattern responsive adattato, senza incorporare Radix Dialog/Vaul o copiare codice dalla licenza non accertata. Interactive List Preview allegato b672a229: highlight e dettaglio contestuale, senza GSAP.

Mobbin non ha fornito schermate: il connettore ha richiesto un piano a pagamento. Nessun pattern viene attribuito a una ricerca Mobbin riuscita.

Nessuna nuova immagine: logo, agenti e stemmi provengono dagli asset preesistenti del progetto. Le derivazioni WebP erano già presenti. Nessun nuovo diritto d'uso viene affermato.
