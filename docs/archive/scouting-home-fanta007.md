# FANTA007 — scouting Home companion

Stato: scouting soltanto. Nessun componente di questa lista è ancora approvato o implementato nella Home.

## Obiettivo del prossimo blocco

Evolvere la Home da riepilogo dell'asta a centro operativo del companion stagionale, mantenendo leggibili budget, completamento rosa, priorità e prossime decisioni. La prima preview dovrà integrare al massimo due pattern, senza ridisegnare l'intera applicazione.

## Shortlist consigliata

### 1. Progress Metric Card — candidato forte per lo stato missione

- Riferimento: [Progress Metric Card di Mak VieSAinte](https://21st.dev/@makviesainte/components/progress-metric-card)
- Struttura utile: valore principale, andamento temporale, metadati di supporto e selezione del punto osservato.
- Uso FANTA007: una sola card primaria per `rosa completata` oppure `budget residuo`; i dati devono provenire esclusivamente dalle informazioni già disponibili.
- Adattamento necessario: eliminare il linguaggio e-commerce e mantenere il chart solo quando esiste una serie temporale reale. In assenza di storico, usare una progressione semplice invece di inventare un trend.
- Valutazione: **forte**, da prototipare.

### 2. Segmented Tabs — candidato forte per il contesto operativo

- Riferimento: [Segmented Tabs di micka_design](https://21st.dev/@micka_design/components/tabs-base)
- Uso FANTA007: switch compatto fra `Asta`, `Rosa` e `Giornata`, soltanto quando le tre viste avranno contenuti reali e distinti.
- Perché funziona: rende visibile il contesto attivo senza aggiungere una seconda navigazione globale.
- Vincolo: su mobile deve mantenere target tattili adeguati e non sostituire la dock principale.
- Valutazione: **forte**, da affiancare alla card KPI nella prima preview.

## Componenti utili in una fase successiva

### Tabs Subtle

- Riferimento: [Tabs Subtle di micka_design](https://21st.dev/@micka_design/components/tabs-subtle)
- Possibile uso: navigazione interna più discreta in un singolo pannello, per esempio `Sintesi / Dettaglio`.
- Valutazione: interessante, ma alternativa ai Segmented Tabs; non usarli insieme nella stessa gerarchia.

### Table

- Riferimento: [Table di micka_design](https://21st.dev/@micka_design/components/table)
- Possibile uso: calendario, segnali settimanali o lista compatta di priorità.
- Valutazione: utile quando il contenuto sarà definito; la Home attuale non richiede una nuova tabella.

### Select

- Riferimento: [Select di micka_design](https://21st.dev/@micka_design/components/select)
- Possibile uso: filtri di giornata o competizione, non come sostituto delle azioni principali.
- Valutazione: componente di supporto, non un pattern strutturale.

### Glow Card Grid

- Riferimento: [Glow Card Grid di ncdai](https://21st.dev/@ncdai/components/glow-card-grid)
- Possibile uso: segnali prioritari o moduli companion in una futura area editoriale.
- Rischio: glow e interazione possono competere con la densità della dashboard.
- Valutazione: interessante, da usare con molta moderazione e dopo i blocchi operativi.

### Blog Section with Lined Grid

- Riferimento: [Blog Section with Lined Grid di ncdai](https://21st.dev/@ncdai/components/blog-02)
- Possibile uso: news e segnali settimanali, mantenendo una scansione editoriale ordinata.
- Valutazione: adatto alla futura sezione contenuti, non alla prima iterazione della Home.

### Blog Grid Section

- Riferimento: [Blog Grid Section di ncdai](https://21st.dev/@ncdai/components/blog-01)
- Possibile uso: raccolta di news o approfondimenti.
- Valutazione: secondario; evitare una griglia di card generiche nella dashboard operativa.

## Riferimenti da non portare nel prossimo test

- [Hero Golden Spiral di ncdai](https://21st.dev/@ncdai/components/hero-01): la Home non deve diventare una seconda landing.
- [21st AI](https://21st.dev/ai): utile per generare e confrontare varianti, ma non è un componente da integrare nel prodotto.

## Decisione proposta

Per la prossima preview usare soltanto:

1. **Progress Metric Card** come pattern per un unico stato missione prioritario.
2. **Segmented Tabs** come controllo contestuale `Asta / Rosa / Giornata`.

La preview dovrà riutilizzare dati reali, palette e densità dell'app operativa. Nessun nuovo dato, chart fittizio o cambiamento alle logiche esistenti.

## Prompt pronto per il prossimo passaggio

> Lavora esclusivamente su una preview integrata della Home FANTA007. Mantieni logica, dati, navigazione globale e sezioni esistenti. Adatta fedelmente la struttura della Progress Metric Card di Mak VieSAinte a un solo KPI reale della missione e usa i Segmented Tabs di micka_design per confrontare i contesti Asta, Rosa e Giornata. Non introdurre chart fittizi: se manca una serie storica, mostra una progressione reale e statica. Mantieni la UI operativa chiara, compatta e coerente con il visual system nero/grafite/verde della Landing, senza trasformare la Home in una scena cinematografica. Prima mostra una proposta di mapping dati e gerarchia; implementa solo dopo approvazione.
