import { FantaHero } from "./ui/FantaHero";
import { FantaFaq } from "./ui/FantaFaq";
import { BentoFeatures } from "./ui/BentoFeatures";
import { ClickEffectButton } from "./ui/ReferenceComponents";
import { ArrowUpRight, CheckCircle2, RadioTower } from "lucide-react";
import logoUrl from "../assets/landing/fanta007-logo-v2.webp";
import agentUrl from "../assets/landing/fantagente-hero-v2.webp";
import "../styles/landing.css";

export function StudioWelcome({ onStart, onResume }: { onStart: () => void; onResume?: () => void }) {
  return <main id="inizio" tabIndex={-1} className="fanta-welcome">
    <a className="landing-skip" href="#welcome-title">Vai alla presentazione</a>
    <FantaHero onStart={onResume ?? onStart} resume={Boolean(onResume)} />
    <BentoFeatures />
    <section className="landing-agent-note" aria-label="Segnale dell'agente">
      <div className="landing-agent-visual">
        <img src={agentUrl} width="1024" height="1536" loading="lazy" decoding="async" alt="Fantagente FANTA007 con tablet e dati di mercato" />
        <div className="landing-agent-signal" aria-hidden="true"><RadioTower size={17} /><span>Segnale attivo</span><strong>Dati pronti quando servono</strong></div>
      </div>
      <div className="landing-agent-copy">
        <h2>Il tuo agente mette ordine nel rumore.</h2>
        <p>Ogni acquisto conserva il perché: budget, quotazione e ruolo restano leggibili anche quando il mercato accelera.</p>
        <ul aria-label="Supporto del Fantagente">
          <li><CheckCircle2 aria-hidden="true" size={18} /> Contesto prima del prezzo</li>
          <li><CheckCircle2 aria-hidden="true" size={18} /> Regole sempre spiegate</li>
          <li><CheckCircle2 aria-hidden="true" size={18} /> Una visione per tutta la stagione</li>
        </ul>
      </div>
    </section>
    <FantaFaq />
    <footer className="landing-footer">
      <div className="landing-footer-brand"><img src={logoUrl} width="984" height="328" loading="lazy" decoding="async" alt="FANTA007 — Licence to Win" /><p>La tua squadra. Le tue scelte.<br />I dati per farle meglio.</p>{onResume ? <span>La tua missione è pronta per continuare.</span> : null}</div>
      <nav aria-label="Collegamenti a fondo pagina">
        <ClickEffectButton onClick={onResume ?? onStart}>{onResume ? "Torna alla tua squadra" : "Configura la tua squadra"}<ArrowUpRight aria-hidden="true" size={17} /></ClickEffectButton>
        <a href="#domande-frequenti">Domande frequenti</a>
        <a href="#inizio">Torna all’inizio</a>
      </nav>
      <small>FANTA007 — Licence to Win · Uno strumento di analisi, non una promessa di vittoria.</small>
    </footer>
  </main>;
}
