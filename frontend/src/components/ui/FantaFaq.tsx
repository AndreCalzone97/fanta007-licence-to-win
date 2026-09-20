import * as Accordion from "@radix-ui/react-accordion";
import { AppearText } from "./AppearText";

// FAQ3's approved centered layout, implemented with our existing Radix primitive.
const items = [
  { id: "start", question: "Da dove comincio?", answer: "Configura nome della squadra, partecipanti, regole della lega, budget e obiettivo. Poi apri il Listone, combina i filtri per squadra e ruolo e consulta il dossier prima di registrare un acquisto." },
  { id: "save", question: "Dove viene salvata la mia rosa?", answer: "Su questo browser, senza un account. Il sito pubblico e la preview locale hanno salvataggi separati. Cambiando dispositivo non ritrovi automaticamente la tua squadra." },
  { id: "data", question: "Cosa significano QA e FVM?", answer: "QA è la quotazione attuale del listone. FVM è il valore di mercato su base 1000; il valore per la tua lega viene proporzionato al budget configurato. Nessuno dei due è il prezzo che hai pagato." },
  { id: "rating", question: "Il giudizio dell’agente è una previsione?", answer: "No. L’appetibilità confronta quotazioni, FVM, trend e storico disponibile con i giocatori dello stesso ruolo. La reazione dell’agente accompagna quel punteggio: non garantisce prestazioni future." },
  { id: "missing", question: "Perché alcune statistiche sono N/D?", answer: "N/D indica un dato non disponibile. Zero è invece un valore presente nella fonte: per esempio, zero assist non significa dato mancante." },
  { id: "incomplete", question: "Posso valutare una rosa ancora incompleta?", answer: "Sì. L’Analisi della rosa accompagna ogni acquisto: finché mancano giocatori il giudizio è provvisorio. La valutazione diventa completa quando raggiungi i 25 giocatori previsti." },
];
export function FantaFaq() {
  return <section id="domande-frequenti" className="landing-faq" aria-labelledby="landing-faq-title" data-reference="faq3-layout">
    <div className="landing-section-heading"><h2 id="landing-faq-title" tabIndex={-1}><AppearText text="Prima dell’asta, tutto chiaro." /></h2><p>Le risposte che servono per usare i dati con consapevolezza.</p></div>
    <Accordion.Root type="single" collapsible className="landing-faq-items">
      {items.map(item => <Accordion.Item value={item.id} key={item.id} className="landing-faq-item">
        <Accordion.Header><Accordion.Trigger className="landing-faq-trigger">{item.question}<svg className="landing-faq-chevron" aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></Accordion.Trigger></Accordion.Header>
        <Accordion.Content className="landing-faq-content"><p>{item.answer}</p></Accordion.Content>
      </Accordion.Item>)}
    </Accordion.Root>
  </section>;
}
