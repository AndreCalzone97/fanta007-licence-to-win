import { useId, useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import type { Feed, Match } from "./types";
import { MatchdayPanel } from "./MatchdayPanel";
import { MatchDetailSheet } from "./MatchDetailSheet";
import { StandingsDialog } from "./StandingsDialog";
import { TeamBadge } from "./TeamBadge";

type Mode = "standings" | "next" | "last";
const modes: { key: Mode; label: string }[] = [{ key: "standings", label: "CLASSIFICA" }, { key: "next", label: "PROSSIMO TURNO" }, { key: "last", label: "ULTIMO TURNO" }];

export function SerieARail({ feed }: { feed: Feed }) {
  const [mode, setMode] = useState<Mode>("standings");
  const [standingsOpen, setStandingsOpen] = useState(false);
  const [selected, setSelected] = useState<Match | null>(null);
  const id = useId();
  const reducedMotion = useReducedMotion();
  const standingsLayoutId = `${id}-standings`;
  const selectMode = (next: Mode, openIfActive = false) => {
    if (next === "standings" && mode === "standings" && openIfActive && feed.standings.length) setStandingsOpen(true);
    else { setMode(next); setStandingsOpen(false); }
  };
  const onTabKey = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = event.key === "ArrowRight" ? (index + 1) % modes.length : event.key === "ArrowLeft" ? (index + modes.length - 1) % modes.length : event.key === "Home" ? 0 : event.key === "End" ? modes.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault(); selectMode(modes[next].key);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button[role="tab"]')[next]?.focus();
  };
  return <LayoutGroup id={id}><div className="serie-a-rail">
    <div className="home-rail-feed-head"><strong>SERIE A INTELLIGENCE</strong><small>{feed.mode === "live" ? "DATI API-FOOTBALL" : feed.mode === "stale" ? "ULTIMI DATI SALVATI" : "DATI ILLUSTRATIVI"}</small></div>
    <div className="serie-a-tabs" role="tablist" aria-label="Sezioni Serie A">{modes.map((item, index) => <button key={item.key} id={`${id}-${item.key}`} type="button" role="tab" aria-selected={mode === item.key} aria-controls={`${id}-panel`} tabIndex={mode === item.key ? 0 : -1} onClick={() => selectMode(item.key, true)} onKeyDown={event => onTabKey(event, index)}>{item.label}</button>)}</div>
    <div className="home-rail-marquee" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${mode}`} tabIndex={0}>
      {mode === "standings" && !standingsOpen && <motion.div layoutId={reducedMotion ? undefined : standingsLayoutId} className="serie-a-compact-table"><p>Classifica · {feed.standings.length} squadre</p>{feed.standings.length ? feed.standings.slice(0, 8).map(row => <div key={`${row.position}-${row.team}`}><span>{String(row.position).padStart(2, "0")}</span><b><TeamBadge name={row.team} logo={row.teamLogo} />{row.team}</b><strong>{row.points ?? "—"}</strong></div>) : <p>Dati non disponibili</p>}<button type="button" onClick={() => setStandingsOpen(true)} disabled={!feed.standings.length}>Apri classifica completa ↗</button></motion.div>}
      {mode === "next" && <MatchdayPanel matches={feed.nextMatches} empty="Prossimo turno non disponibile" onSelect={setSelected} />}
      {mode === "last" && <MatchdayPanel matches={feed.lastMatches} empty="Ultimo turno non disponibile" onSelect={setSelected} />}
    </div>
    <p className="home-rail-source">{feed.source}</p>
    {standingsOpen && <StandingsDialog feed={feed} layoutId={standingsLayoutId} onClose={() => setStandingsOpen(false)} />}
    {selected && <MatchDetailSheet match={selected} onClose={() => setSelected(null)} />}
  </div></LayoutGroup>;
}
