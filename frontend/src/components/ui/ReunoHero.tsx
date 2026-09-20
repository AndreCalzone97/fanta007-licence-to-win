"use client";
 
import { useEffect, useId, useRef } from "react";
import "./reuno-hero.css";
 
const colors = {
  50: "#f8f7f5",
  100: "#e6e1d7",
  200: "#c8b4a0",
  300: "#a89080",
  400: "#8a7060",
  500: "#6b5545",
  600: "#544237",
  700: "#3c4237",
  800: "#2a2e26",
  900: "#1a1d18",
};
 
export function ReunoHero({ onStart, resume = false }: { onStart: () => void; resume?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gridId = useId();
  const gradientRef = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const gradient = gradientRef.current;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const ripples = new Set<HTMLDivElement>();
    const later = (fn: () => void, delay: number) => {
      const timer = setTimeout(() => { timers.delete(timer); fn(); }, delay);
      timers.add(timer);
    };
    function onMouseMove(e: MouseEvent) {
      if (!gradient || reduced.matches) return;
      gradient.style.left = e.clientX - 192 + "px";
      gradient.style.top = e.clientY - 192 + "px";
      gradient.style.opacity = "1";
    }
    function onMouseLeave() { if (gradient) gradient.style.opacity = "0"; }
    function onClick(e: MouseEvent) {
      if (reduced.matches) return;
      const ripple = document.createElement("div");
      ripple.className = "reuno-ripple";
      ripple.style.left = e.clientX + "px";
      ripple.style.top = e.clientY + "px";
      root!.appendChild(ripple);
      ripples.add(ripple);
      later(() => { ripple.remove(); ripples.delete(ripple); }, 1000);
    }
    let scrolled = false;
    function onScroll() {
      if (scrolled || reduced.matches) return;
      scrolled = true;
      root!.querySelectorAll<HTMLElement>(".reuno-floating").forEach((el, index) => {
        later(() => { el.style.animationPlayState = "running"; }, index * 200);
      });
    }
    root.addEventListener("mousemove", onMouseMove);
    root.addEventListener("mouseleave", onMouseLeave);
    root.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      root.removeEventListener("mousemove", onMouseMove);
      root.removeEventListener("mouseleave", onMouseLeave);
      root.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      timers.forEach(clearTimeout);
      ripples.forEach(ripple => ripple.remove());
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="reuno-hero" aria-labelledby="welcome-title"
    >
      <svg aria-hidden="true" className="reuno-grid" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={gridId} width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="rgba(200,180,160,0.08)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${gridId})`} />
        <line x1="0" y1="20%" x2="100%" y2="20%" className="reuno-grid-line" style={{ animationDelay: "0.5s" }} />
        <line x1="0" y1="80%" x2="100%" y2="80%" className="reuno-grid-line" style={{ animationDelay: "1s" }} />
        <line x1="20%" y1="0" x2="20%" y2="100%" className="reuno-grid-line" style={{ animationDelay: "1.5s" }} />
        <line x1="80%" y1="0" x2="80%" y2="100%" className="reuno-grid-line" style={{ animationDelay: "2s" }} />
        <line
          x1="50%"
          y1="0"
          x2="50%"
          y2="100%"
          className="reuno-grid-line"
          style={{ animationDelay: "2.5s", opacity: 0.05 }}
        />
        <line
          x1="0"
          y1="50%"
          x2="100%"
          y2="50%"
          className="reuno-grid-line"
          style={{ animationDelay: "3s", opacity: 0.05 }}
        />
        <circle cx="20%" cy="20%" r="2" className="reuno-detail-dot" style={{ animationDelay: "3s" }} />
        <circle cx="80%" cy="20%" r="2" className="reuno-detail-dot" style={{ animationDelay: "3.2s" }} />
        <circle cx="20%" cy="80%" r="2" className="reuno-detail-dot" style={{ animationDelay: "3.4s" }} />
        <circle cx="80%" cy="80%" r="2" className="reuno-detail-dot" style={{ animationDelay: "3.6s" }} />
        <circle cx="50%" cy="50%" r="1.5" className="reuno-detail-dot" style={{ animationDelay: "4s" }} />
      </svg>
 
      {/* Corner elements */}
      <div className="reuno-corner reuno-top reuno-left" style={{ animationDelay: "4s" }}>
        <div
          className="reuno-square reuno-square-tl"
          style={{ background: colors[200] }}
        ></div>
      </div>
      <div className="reuno-corner reuno-top reuno-right" style={{ animationDelay: "4.2s" }}>
        <div
          className="reuno-square reuno-square-tr"
          style={{ background: colors[200] }}
        ></div>
      </div>
      <div className="reuno-corner reuno-bottom reuno-left" style={{ animationDelay: "4.4s" }}>
        <div
          className="reuno-square reuno-square-bl"
          style={{ background: colors[200] }}
        ></div>
      </div>
      <div className="reuno-corner reuno-bottom reuno-right" style={{ animationDelay: "4.6s" }}>
        <div
          className="reuno-square reuno-square-br"
          style={{ background: colors[200] }}
        ></div>
      </div>
 
      {/* Floating elements */}
      <div className="reuno-floating" style={{ top: "25%", left: "15%", animationDelay: "5s" }}></div>
      <div className="reuno-floating" style={{ top: "60%", left: "85%", animationDelay: "5.5s" }}></div>
      <div className="reuno-floating" style={{ top: "40%", left: "10%", animationDelay: "6s" }}></div>
      <div className="reuno-floating" style={{ top: "75%", left: "90%", animationDelay: "6.5s" }}></div>
 
      <div className="reuno-content">
        {/* Top tagline */}
        <div className="reuno-center">
          <h2
            className="reuno-tagline"
            style={{ color: colors[200] }}
          >
            <span className="reuno-word" style={{ animationDelay: "0ms" }}>
              Benvenuto</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "200ms" }}>
              in</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "400ms" }}>
              <b>FANTA007</b>
            </span>{" "}
            <span className="reuno-word" style={{ animationDelay: "600ms" }}>
              — 
            </span>{" "}
            <span className="reuno-word" style={{ animationDelay: "800ms" }}>
              Strategia,</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "1000ms" }}>
              dati,</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "1200ms" }}>
              scelte</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "1400ms" }}>
              consapevoli.</span>
          </h2>
          <div
            className="reuno-divider reuno-mt"
            style={{
              background: `linear-gradient(to right, transparent, ${colors[200]}, transparent)`,
            }}
          ></div>
        </div>
 
        {/* Main headline */}
        <div className="reuno-headline-wrap">
          <h1 id="welcome-title" tabIndex={-1}
            className="reuno-headline"
            style={{ color: colors[50] }}
          >
            <div className="reuno-headline-main">
              <span className="reuno-word" style={{ animationDelay: "1600ms" }}>
                Il</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "1750ms" }}>
                mercato</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "1900ms" }}>
                è</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "2050ms" }}>
                tuo.</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "2200ms" }}>
                Giocalo</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "2350ms" }}>
                bene.</span>
            </div>
            <div
              className="reuno-headline-sub"
              style={{ color: colors[200] }}
            >
              <span className="reuno-word" style={{ animationDelay: "2600ms" }}>
                Dal</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "2750ms" }}>
                primo</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "2900ms" }}>
                acquisto</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "3050ms" }}>
                alla</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "3200ms" }}>
                rosa</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "3350ms" }}>
                completa.</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "3500ms" }}>
                Intuito,</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "3650ms" }}>
                quotazioni</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "3800ms" }}>
                e</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "3950ms" }}>
                budget,</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "4100ms" }}>
                insieme.</span>
            </div>
          </h1>
          <div
            className="reuno-side reuno-side-left"
            style={{
              background: colors[200],
              animation: "reuno-word-appear 1s ease-out forwards",
              animationDelay: "3.5s",
            }}
          ></div>
          <div
            className="reuno-side reuno-side-right"
            style={{
              background: colors[200],
              animation: "reuno-word-appear 1s ease-out forwards",
              animationDelay: "3.7s",
            }}
          ></div>
        </div>
 
        {/* Bottom tagline */}
        <div className="reuno-center">
          <div
            className="reuno-divider reuno-mb"
            style={{
              background: `linear-gradient(to right, transparent, ${colors[200]}, transparent)`,
            }}
          ></div>
          <h2
            className="reuno-tagline"
            style={{ color: colors[200] }}
          >
            <span className="reuno-word" style={{ animationDelay: "4400ms" }}>
              Nessun</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "4550ms" }}>
              account.</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "4700ms" }}>
              La</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "4850ms" }}>
              rosa</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "5000ms" }}>
              resta</span>{" "}
            <span className="reuno-word" style={{ animationDelay: "5150ms" }}>
              qui.</span>
          </h2>
          <button type="button" className="reuno-action" onClick={onStart}>
            {resume ? "Torna alla tua squadra" : "Costruisci la tua rosa"} <span aria-hidden="true">↗</span>
          </button>
          <div
            className="reuno-dots"
            style={{
              animation: "reuno-word-appear 1s ease-out forwards",
              animationDelay: "4.5s",
            }}
          >
            <div
              className="reuno-dot"
              style={{ background: colors[200] }}
            ></div>
            <div
              className="reuno-dot reuno-dot-bright"
              style={{ background: colors[200] }}
            ></div>
            <div
              className="reuno-dot"
              style={{ background: colors[200] }}
            ></div>
          </div>
        </div>
      </div>
 
      <div
        aria-hidden="true"
        ref={gradientRef}
        className="reuno-mouse-gradient"
        style={{
          background: `radial-gradient(circle, ${colors[500]}0D 0%, transparent 100%)`,
        }}
      ></div>
    </div>
  );
}
