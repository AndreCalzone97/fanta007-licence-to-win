import { useEffect, useRef } from "react";
import {
  Activity,
  ArrowRight,
  ChevronDown,
  Radar,
  ShieldCheck,
  Target,
} from "lucide-react";
import logoUrl from "../../assets/landing/fanta007-logo-v2.webp";
import agentUrl from "../../assets/landing/fantagente-hero-v2.webp";
import "./reuno-hero.css";

type ReunoHeroProps = {
  onStart: () => void;
  resume?: boolean;
};

const hudSignals = [
  { icon: Activity, label: "Stagione", value: "Segnali ogni giornata" },
  { icon: Radar, label: "Rosa", value: "Budget sotto controllo" },
  { icon: ShieldCheck, label: "Decisioni", value: "Regole spiegate" },
];

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function ReunoHero({ onStart }: ReunoHeroProps) {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const renderProgress = () => {
      frame = 0;

      if (reduceMotion.matches) {
        hero.dataset.phase = "reduced";
        hero.style.setProperty("--intro", "1");
        hero.style.setProperty("--scene", "1");
        hero.style.setProperty("--detail", "1");
        hero.style.setProperty("--outro", "0");
        hero.style.setProperty("--drift", "0");
        return;
      }

      const rect = hero.getBoundingClientRect();
      const distance = Math.max(1, hero.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / distance);
      const intro = 1 - clamp((progress - 0.08) / 0.2);
      const scene = clamp((progress - 0.14) / 0.34);
      const detail = clamp((progress - 0.42) / 0.26);
      const outro = clamp((progress - 0.84) / 0.16);
      const drift = clamp((progress - 0.32) / 0.48);

      hero.dataset.phase = progress < 0.34 ? "intro" : "scene";

      hero.style.setProperty("--intro", intro.toFixed(4));
      hero.style.setProperty("--scene", scene.toFixed(4));
      hero.style.setProperty("--detail", detail.toFixed(4));
      hero.style.setProperty("--outro", outro.toFixed(4));
      hero.style.setProperty("--drift", drift.toFixed(4));
    };

    const requestRender = () => {
      if (!frame) frame = window.requestAnimationFrame(renderProgress);
    };

    requestRender();
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);
    reduceMotion.addEventListener("change", requestRender);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      reduceMotion.removeEventListener("change", requestRender);
    };
  }, []);

  function revealMission() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("come-funziona")?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <section ref={heroRef} className="reuno-hero" data-phase="intro" aria-labelledby="welcome-title">
      <div className="reuno-hero__sticky">
        <div className="reuno-canvas">
          <div className="reuno-atmosphere" aria-hidden="true">
            <span className="reuno-atmosphere__beam" />
            <span className="reuno-atmosphere__orbit reuno-atmosphere__orbit--one" />
            <span className="reuno-atmosphere__orbit reuno-atmosphere__orbit--two" />
          </div>

          <header className="reuno-masthead">
            <img
              className="reuno-logo"
              src={logoUrl}
              width="984"
              height="328"
              alt="FANTA007 — Licence to Win"
              fetchPriority="high"
              decoding="async"
            />
            <p className="reuno-live-status" aria-label="Stato del companion FANTA007">
              <i aria-hidden="true" />
              <span className="reuno-status-copy reuno-status-copy--intro" aria-hidden="true">Il tuo companion stagionale</span>
              <span className="reuno-status-copy reuno-status-copy--scene" aria-hidden="true">Missione attiva</span>
            </p>
          </header>

          <div className="reuno-intro">
            <h1 id="welcome-title" tabIndex={-1}>
              <span>Dall’asta all’ultima giornata.</span>
              <strong>La missione continua.</strong>
            </h1>
            <p className="reuno-lede">
              FANTA007 evolve con la tua squadra: dati, rosa e segnali utili per preparare
              l’asta, seguire i giocatori e affrontare ogni giornata con più contesto.
            </p>

            <div className="reuno-actions">
              <button type="button" className="reuno-action reuno-action--primary" onClick={onStart}>
                Entra in FANTA007
                <ArrowRight aria-hidden="true" size={18} strokeWidth={1.8} />
              </button>
              <button type="button" className="reuno-action reuno-action--secondary" onClick={revealMission}>
                <ChevronDown aria-hidden="true" size={17} strokeWidth={1.8} />
                Scopri la missione
              </button>
            </div>

          </div>

          <div className="reuno-scene">
            <div className="reuno-scene-copy">
              <h2>Il mercato finisce. La lettura continua.</h2>
              <p>
                Rosa, dossier, budget e segnali di giornata <span className="reuno-copy-keep">restano nello stesso quadro</span>,
                dall’asta fino all’ultima scelta.
              </p>
            </div>

            <div className="reuno-scene-word" aria-hidden="true">COMPANION</div>

            <div className="reuno-data-plane" aria-hidden="true">
              <span className="reuno-data-plane__line reuno-data-plane__line--one" />
              <span className="reuno-data-plane__line reuno-data-plane__line--two" />
              <span className="reuno-data-plane__node reuno-data-plane__node--one" />
              <span className="reuno-data-plane__node reuno-data-plane__node--two" />
            </div>

            <div className="reuno-mission-core" aria-hidden="true">
              <span>Companion online</span>
              <strong>Asta <i /> Rosa <i /> Giornata</strong>
            </div>

            <div className="reuno-agent-frame">
              <img
                className="reuno-agent"
                src={agentUrl}
                width="1024"
                height="1536"
                alt="Fantagente FANTA007 con tablet e interfaccia dati"
                fetchPriority="auto"
                decoding="async"
              />
              <div className="reuno-agent-scan" aria-hidden="true" />
            </div>

            <div className="reuno-target" aria-hidden="true">
              <Target size={28} strokeWidth={1.1} />
            </div>

            <div className="reuno-hud" aria-hidden="true">
              {hudSignals.map(({ icon: Icon, label, value }, index) => (
                <article className={`reuno-hud-card reuno-hud-card--${index + 1}`} key={label}>
                  <Icon size={18} strokeWidth={1.5} />
                  <span>{label}</span>
                  <strong>{value}</strong>
                </article>
              ))}
            </div>
          </div>

          <aside className="reuno-dashboard-teaser" aria-label="Copertura del companion FANTA007">
            <div className="reuno-dashboard-teaser__heading">
              <span>Mission control</span>
              <b>Una visione, tutta la stagione</b>
            </div>
            <div className="reuno-dashboard-teaser__signals">
              <div><span>Mercato</span><b>Budget · slot · valore</b></div>
              <div><span>Giocatori</span><b>Dossier · trend · affidabilità</b></div>
              <div><span>Giornata</span><b>Segnali · scelte · contesto</b></div>
            </div>
          </aside>

          <button type="button" className="reuno-scroll-cue" onClick={revealMission} aria-label="Scopri la missione">
            <ChevronDown aria-hidden="true" size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
