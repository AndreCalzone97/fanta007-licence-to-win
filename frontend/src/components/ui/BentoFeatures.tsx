import type { CSSProperties } from "react";
import {
  BarChart3,
  FileSearch,
  Search,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";
import "./bento-features.css";

type FeatureKind = "market" | "list" | "dossier" | "squad" | "analysis";

type BentoFeature = {
  title: string;
  blurb: string;
  meta: string;
  kind: FeatureKind;
};

const features: BentoFeature[] = [
  { title: "Mercato sotto controllo", blurb: "Budget, posti liberi e prossimo acquisto restano nello stesso quadro.", meta: "Mercato", kind: "market" },
  { title: "Listone leggibile", blurb: "Ruolo, squadra, QA e FVM restano confrontabili a colpo d’occhio.", meta: "Listone", kind: "list" },
  { title: "Dossier verificati", blurb: "Storico, fonti e confronto di ruolo accompagnano ogni scelta.", meta: "Dossier", kind: "dossier" },
  { title: "Rosa per reparti", blurb: "Slot, profondità e spesa si leggono reparto per reparto.", meta: "Rosa", kind: "squad" },
  { title: "Analisi spiegabile", blurb: "Il Fantagente mostra dati e regola applicata, senza promettere risultati.", meta: "Analisi", kind: "analysis" },
];

const spans = [
  "bento-features__card--hero",
  "bento-features__card--small",
  "bento-features__card--small",
  "bento-features__card--medium",
  "bento-features__card--medium",
];

export function BentoFeatures() {
  return (
    <section id="come-funziona" className="bento-features" aria-labelledby="bento-features-title">
      <div className="bento-features__inner">
        <header className="bento-features__header">
          <h2 id="bento-features-title">Il tuo vantaggio, in cinque mosse.</h2>
          <p>Dati contestuali e strumenti concreti per leggere il mercato senza perdere il filo.</p>
        </header>
        <div className="bento-features__grid">
          {features.map((feature, index) => (
            <BentoCard key={feature.title} span={spans[index]} {...feature} />
          ))}
        </div>
        <footer>Dati, budget e contesto: un solo sistema per accompagnare la stagione.</footer>
      </div>
    </section>
  );
}

function BentoCard({ span, title, blurb, meta, kind }: BentoFeature & { span: string }) {
  return (
    <article className={`bento-features__card glass-surface-soft ${span}`}>
      <header>
        <FeatureIcon kind={kind} />
        <h3>{title}</h3>
        <b>{meta}</b>
      </header>
      <p>{blurb}</p>
      <FeatureVisual kind={kind} />
    </article>
  );
}

function FeatureIcon({ kind }: { kind: FeatureKind }) {
  const icons = { market: WalletCards, list: Search, dossier: FileSearch, squad: UsersRound, analysis: BarChart3 };
  const Icon = icons[kind];
  return <Icon className="bento-features__icon" size={19} strokeWidth={1.6} aria-hidden="true" />;
}

function FeatureVisual({ kind }: { kind: FeatureKind }) {
  if (kind === "market") {
    return (
      <div className="bento-visual bento-visual--market" aria-hidden="true">
        <div className="bento-budget-line"><span>Budget missione</span><strong>500 cr.</strong></div>
        <div className="bento-budget-track"><i /><i /><i /></div>
        <div className="bento-budget-stats"><span>Investiti <b>467</b></span><span>Disponibili <b>33</b></span><span>Posti <b>20</b></span></div>
      </div>
    );
  }

  if (kind === "list") {
    return (
      <div className="bento-visual bento-visual--list" aria-hidden="true">
        <div className="bento-search"><Search size={13} /><span>Cerca giocatore</span></div>
        {["A · 450 FVM", "C · 243 FVM", "D · 240 FVM"].map((row, index) => <div className="bento-player-row" key={row}><i>{index + 1}</i><span>{row}</span><b>{["4.9", "4.8", "4.7"][index]}</b></div>)}
      </div>
    );
  }

  if (kind === "dossier") {
    return (
      <div className="bento-visual bento-visual--dossier" aria-hidden="true">
        <div><span>Affidabilità</span><strong>HIGH</strong></div>
        <div><span>Benchmark</span><strong>#1</strong></div>
        <div><span>Fonti</span><ShieldCheck size={18} /><strong>Verificate</strong></div>
      </div>
    );
  }

  if (kind === "squad") {
    return (
      <div className="bento-visual bento-visual--squad" aria-hidden="true">
        {["P", "D", "C", "A"].map((role, index) => <div key={role}><b>{role}</b><span>{["0/3", "1/8", "1/8", "3/6"][index]}</span><i style={{ "--fill": `${[0, 13, 13, 50][index]}%` } as CSSProperties} /></div>)}
      </div>
    );
  }

  return (
    <div className="bento-visual bento-visual--analysis" aria-hidden="true">
      <div className="bento-analysis-bars"><i /><i /><i /><i /><i /></div>
      <div><span>Regola applicata</span><strong>Ritmo di spesa alto</strong></div>
    </div>
  );
}
