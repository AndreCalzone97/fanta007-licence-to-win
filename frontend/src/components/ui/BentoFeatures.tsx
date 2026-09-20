import { useEffect, useMemo, useRef, useState } from "react";
import "./bento-features.css";

type SpiralConfig = {
  points: number;
  dotRadius: number;
  duration: number;
  gradient: "none" | "grayscale";
  color: string;
  pulseEffect: boolean;
  opacityMin: number;
  opacityMax: number;
  sizeMin: number;
  sizeMax: number;
  background: string;
};

type BentoFeature = { title: string; blurb: string; meta: string };

const features: BentoFeature[] = [
  { title: "Mercato sotto controllo", blurb: "Budget disponibile, posti liberi e prossimo acquisto sostenibile restano visibili mentre costruisci la rosa.", meta: "Mercato" },
  { title: "Listone leggibile", blurb: "Cerca, filtra e ordina 533 profili senza perdere ruolo, squadra, quotazione e FVM.", meta: "Listone" },
  { title: "Dossier verificati", blurb: "Storico, fonti e confronto di ruolo aiutano a leggere il giocatore prima di fissare il prezzo.", meta: "Dossier" },
  { title: "Rosa per reparti", blurb: "Slot, spesa e profondità vengono organizzati per portieri, difensori, centrocampisti e attaccanti.", meta: "Rosa" },
  { title: "Analisi spiegabile", blurb: "Il Fantagente collega dati e obiettivo della lega: mostra la regola applicata, non promette il risultato.", meta: "Dati" },
];

const spans = [
  "bento-features__card--hero",
  "bento-features__card--small",
  "bento-features__card--small",
  "bento-features__card--medium",
  "bento-features__card--medium",
];

/** Product adaptation of larsen66's 21st.dev Bento Features. */
export function BentoFeatures() {
  const spiralRef = useRef<HTMLDivElement>(null);
  const [cfg, setCfg] = useState<SpiralConfig>({
    points: 800,
    dotRadius: 1.6,
    duration: 3,
    gradient: "none",
    color: "#ffffff",
    pulseEffect: true,
    opacityMin: .25,
    opacityMax: .9,
    sizeMin: .5,
    sizeMax: 1.35,
    background: "transparent",
  });

  const gradients = useMemo<Record<SpiralConfig["gradient"], string[]>>(() => ({
    none: [],
    grayscale: ["#ffffff", "#999999", "#333333"],
  }), []);

  function randomize() {
    const rand = (min: number, max: number) => Math.random() * (max - min) + min;
    const useBW = Math.random() > .4;
    setCfg(current => ({
      ...current,
      points: Math.floor(rand(400, 1800)),
      dotRadius: rand(.8, 3),
      duration: rand(1.2, 6),
      pulseEffect: Math.random() > .3,
      opacityMin: rand(.1, .4),
      opacityMax: rand(.6, 1),
      sizeMin: rand(.4, .9),
      sizeMax: rand(1.1, 2.1),
      gradient: useBW ? "none" : "grayscale",
      color: "#ffffff",
    }));
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "r" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) randomize();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const container = spiralRef.current;
    if (!container) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const size = 620;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const center = size / 2;
    const maxRadius = center - 4 - cfg.dotRadius;
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("aria-hidden", "true");

    if (cfg.gradient !== "none") {
      const defs = document.createElementNS(svgNS, "defs");
      const gradient = document.createElementNS(svgNS, "linearGradient");
      gradient.setAttribute("id", "fantaSpiralGradient");
      gradient.setAttribute("gradientUnits", "userSpaceOnUse");
      gradient.setAttribute("x1", "0%");
      gradient.setAttribute("y1", "0%");
      gradient.setAttribute("x2", "100%");
      gradient.setAttribute("y2", "100%");
      gradients[cfg.gradient].forEach((color, index, array) => {
        const stop = document.createElementNS(svgNS, "stop");
        stop.setAttribute("offset", `${(index * 100) / (array.length - 1)}%`);
        stop.setAttribute("stop-color", color);
        gradient.appendChild(stop);
      });
      defs.appendChild(gradient);
      svg.appendChild(defs);
    }

    for (let index = 0; index < cfg.points; index += 1) {
      const position = index + .5;
      const fraction = position / cfg.points;
      const radius = Math.sqrt(fraction) * maxRadius;
      const theta = position * goldenAngle;
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", (center + radius * Math.cos(theta)).toFixed(3));
      circle.setAttribute("cy", (center + radius * Math.sin(theta)).toFixed(3));
      circle.setAttribute("r", String(cfg.dotRadius));
      circle.setAttribute("fill", cfg.gradient === "none" ? cfg.color : "url(#fantaSpiralGradient)");
      circle.setAttribute("opacity", "0.6");

      if (cfg.pulseEffect && !reduced) {
        const radiusAnimation = document.createElementNS(svgNS, "animate");
        radiusAnimation.setAttribute("attributeName", "r");
        radiusAnimation.setAttribute("values", `${cfg.dotRadius * cfg.sizeMin};${cfg.dotRadius * cfg.sizeMax};${cfg.dotRadius * cfg.sizeMin}`);
        radiusAnimation.setAttribute("dur", `${cfg.duration}s`);
        radiusAnimation.setAttribute("begin", `${(fraction * cfg.duration).toFixed(3)}s`);
        radiusAnimation.setAttribute("repeatCount", "indefinite");
        circle.appendChild(radiusAnimation);
        const opacityAnimation = document.createElementNS(svgNS, "animate");
        opacityAnimation.setAttribute("attributeName", "opacity");
        opacityAnimation.setAttribute("values", `${cfg.opacityMin};${cfg.opacityMax};${cfg.opacityMin}`);
        opacityAnimation.setAttribute("dur", `${cfg.duration}s`);
        opacityAnimation.setAttribute("begin", `${(fraction * cfg.duration).toFixed(3)}s`);
        opacityAnimation.setAttribute("repeatCount", "indefinite");
        circle.appendChild(opacityAnimation);
      }
      svg.appendChild(circle);
    }

    container.replaceChildren(svg);
    return () => svg.remove();
  }, [cfg, gradients]);

  return (
    <section id="come-funziona" className="bento-features" aria-labelledby="bento-features-title">
      <div className="bento-features__depth" aria-hidden="true" />
      <div className="bento-features__inner">
        <div className="bento-features__spiral" aria-hidden="true"><div ref={spiralRef} /></div>
        <header className="bento-features__header">
          <div>
            <p>STRUMENTI FANTA007</p>
            <h2 id="bento-features-title">Il tuo vantaggio, in cinque mosse.</h2>
            <span>Bento essenziale. Dati contestuali. Scelte leggibili.</span>
          </div>
          <button type="button" onClick={randomize} aria-label="Cambia il ritmo dello sfondo">R · Cambia ritmo</button>
        </header>
        <div className="bento-features__grid">
          {features.map((feature, index) => <BentoCard key={feature.title} span={spans[index]} {...feature} />)}
        </div>
        <footer>Dati, budget e contesto: un solo sistema per leggere il mercato.</footer>
      </div>
    </section>
  );
}

function BentoCard({ span, title, blurb, meta }: BentoFeature & { span: string }) {
  return (
    <article className={`bento-features__card ${span}`}>
      <header>
        <span aria-hidden="true">•</span>
        <h3>{title}</h3>
        <b>{meta}</b>
      </header>
      <p>{blurb}</p>
      <div className="bento-features__hover-outline" aria-hidden="true"><div /></div>
    </article>
  );
}
