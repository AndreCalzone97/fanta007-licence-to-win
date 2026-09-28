import { useEffect, useState } from "react";
import video from "../assets/home/hero-frame-2.mp4";
import poster from "../assets/home/hero-frame-2.png";

/** The approved Home footage, kept secondary to the operational data. */
export function AgentAmbientMedia({ className = "", minWidth = 900 }: { className?: string; minWidth?: number }) {
  const [play, setPlay] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia(`(min-width: ${minWidth}px)`);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPlay(desktop.matches && !reduced.matches);
    update();
    desktop.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => { desktop.removeEventListener("change", update); reduced.removeEventListener("change", update); };
  }, [minWidth]);

  return <span className={`agent-ambient-media ${className}`} aria-hidden="true">
    <img src={poster} alt="" decoding="async" />
    {play && <video src={video} poster={poster} autoPlay muted loop playsInline preload="metadata" />}
  </span>;
}
