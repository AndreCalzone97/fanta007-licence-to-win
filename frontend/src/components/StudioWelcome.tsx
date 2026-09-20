import { BrandLogo } from "./BrandLogo";
import { FantaHero } from "./ui/FantaHero";
import { FantaFaq } from "./ui/FantaFaq";
import { BentoFeatures } from "./ui/BentoFeatures";
import { ClickEffectButton, HoverImageReveal, AsciiFlameBall } from "./ui/ReferenceComponents";
import positive480 from "../assets/agent/agent-positive-480.webp";
import "../styles/landing.css";

export function StudioWelcome({ onStart, onResume }: { onStart: () => void; onResume?: () => void }) {
  return <main id="inizio" tabIndex={-1} className="fanta-welcome">
    <a className="landing-skip" href="#welcome-title">Vai alla presentazione</a>
    <FantaHero onStart={onResume ?? onStart} resume={Boolean(onResume)} />
    <BentoFeatures />
    <section className="landing-agent-note" aria-label="Segnale dell'agente">
      <HoverImageReveal src={positive480} alt="Fantagente 007 con valutazione positiva" eyebrow="Segnale del dossier" title="Leggi il contesto, poi scegli." />
      <div><p className="landing-eyebrow">Una scelta alla volta</p><h2>Il tuo agente mette ordine nel rumore.</h2><p>Ogni acquisto conserva il perché: budget, quotazione e ruolo restano leggibili anche quando il mercato accelera.</p><AsciiFlameBall label="Dati pronti quando servono" /></div>
    </section>
    <FantaFaq />
    <footer className="landing-footer">
      <div className="landing-footer-brand"><BrandLogo /><p>La tua squadra. Le tue scelte.<br />I dati per farle meglio.</p></div>
      <nav aria-label="Collegamenti a fondo pagina">
        <ClickEffectButton onClick={onResume ?? onStart}>{onResume ? "Torna alla tua squadra" : "Configura la tua squadra"}<span aria-hidden="true"> ↗</span></ClickEffectButton>
        <a href="#domande-frequenti">Domande frequenti</a>
        <a href="#inizio">Torna all’inizio <span aria-hidden="true">↑</span></a>
      </nav>
      <small>FANTA007 — Licence to Win · Uno strumento di analisi, non una promessa di vittoria.</small>
    </footer>
  </main>;
}
