import { useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/api";
import railVideo from "../assets/home/hero-frame-2.mp4";
import railPoster from "../assets/home/hero-frame-2.png";
import { emptyFeed, isFeed, type Feed } from "./serie-a/types";
import { SerieARail } from "./serie-a/SerieARail";
import { Overlay } from "./serie-a/Overlay";

export function HomeIntelligenceRails() {
  const [playVideo, setPlayVideo] = useState(false);
  const [feed, setFeed] = useState<Feed>(emptyFeed);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1320px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPlayVideo(desktop.matches && !reduced.matches);
    update(); desktop.addEventListener("change", update); reduced.addEventListener("change", update);
    return () => { desktop.removeEventListener("change", update); reduced.removeEventListener("change", update); };
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = () => fetch(`${API_BASE_URL}/serie-a-intelligence`)
      .then(response => { if (!response.ok) throw new Error("Feed unavailable"); return response.json(); })
      .then((data: unknown) => { if (active && isFeed(data)) setFeed(data); })
      .catch(() => { if (active) setFeed(emptyFeed); });
    void refresh();
    const timer = window.setInterval(refresh, 15 * 60 * 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  return <>
    <div className="home-lab-side-paths" aria-label="Rail ambientali della Home">
      <aside className="home-lab-rail home-lab-video-rail" aria-label="Fantagente FANTA007"><div className="home-lab-rail-viewport">
        <img src={railPoster} alt="" aria-hidden="true" decoding="async" />
        {playVideo && <video src={railVideo} autoPlay muted loop playsInline preload="metadata" poster={railPoster} aria-hidden="true" />}
        <span className="home-lab-video-shade" aria-hidden="true" /><span className="home-lab-video-caption">FANTA007 <small>INTELLIGENCE / 01</small></span>
      </div></aside>
      <aside className="home-lab-rail home-lab-feed-rail" aria-label="Serie A intelligence feed"><div className="home-lab-rail-viewport"><SerieARail feed={feed} /></div></aside>
    </div>
    <button className="serie-a-mobile-trigger" type="button" onClick={() => setMobileOpen(true)}>SERIE A INTELLIGENCE <span>Classifica · Turni ↗</span></button>
    {mobileOpen && <Overlay title="Serie A Intelligence" variant="drawer" onClose={() => setMobileOpen(false)}><SerieARail feed={feed} /></Overlay>}
  </>;
}
