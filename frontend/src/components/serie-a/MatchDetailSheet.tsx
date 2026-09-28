import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../lib/api";
import type { Match, MatchDetail } from "./types";
import { formatMatchDate, isMatch, score } from "./types";
import { Overlay } from "./Overlay";
import { TeamBadge } from "./TeamBadge";

export function MatchDetailSheet({ match, onClose }: { match: Match; onClose: () => void }) {
  const [detail, setDetail] = useState<MatchDetail | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/serie-a-intelligence/matches/${encodeURIComponent(match.id)}`, { signal: controller.signal })
      .then(response => { if (!response.ok) throw Error("Unavailable"); return response.json(); })
      .then((data: MatchDetail) => {
        if (!isMatch(data?.match) || !Array.isArray(data.events) || !Array.isArray(data.lineups) || !Array.isArray(data.statistics)) throw Error("Invalid match detail");
        setDetail(data);
      })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [match.id]);
  const shownMatch = detail?.match ?? match;
  return <Overlay title="Dettaglio partita" variant="sheet" onClose={onClose}>
    <div className="serie-a-detail-score"><small>{shownMatch.matchday} · {formatMatchDate(shownMatch.date)} · {shownMatch.status}</small><div><span><TeamBadge name={shownMatch.homeTeam} logo={shownMatch.homeLogo} />{shownMatch.homeTeam}</span><strong>{score(shownMatch)}</strong><span><TeamBadge name={shownMatch.awayTeam} logo={shownMatch.awayLogo} />{shownMatch.awayTeam}</span></div></div>
    {!detail && !failed && <p>Caricamento dettagli…</p>}
    {failed && <p className="serie-a-empty">Dettagli non disponibili. Il risultato rimane visibile qui sopra.</p>}
    {detail && <>
      {detail.mode !== "live" && <p className="serie-a-overlay-note">{detail.mode === "demo" ? "Esempio illustrativo: eventi e statistiche non disponibili." : "Ultimi dettagli salvati."}</p>}
      <section><h3>Eventi</h3>{detail.events.length ? <ol className="serie-a-events">{detail.events.map((event, i) => <li key={i}><time>{event.minute ?? "—"}{event.extraMinute ? `+${event.extraMinute}` : ""}′</time><span><b>{event.team ?? "—"}</b><small>{[event.type, event.detail, event.player].filter(Boolean).join(" · ")}</small></span></li>)}</ol> : <p className="serie-a-empty">Eventi non disponibili.</p>}</section>
      <section><h3>Formazioni</h3>{detail.lineups.length ? <div className="serie-a-detail-columns">{detail.lineups.map((lineup, i) => <div key={i}><h4>{lineup.team} · {lineup.formation || "Modulo N/D"}</h4><ol>{lineup.players.map((player, j) => <li key={`${player}-${j}`}>{player}</li>)}</ol></div>)}</div> : <p className="serie-a-empty">Formazioni non disponibili.</p>}</section>
      <section><h3>Statistiche</h3>{detail.statistics.length ? <div className="serie-a-detail-columns">{detail.statistics.map((team, i) => <div key={i}><h4>{team.team}</h4><dl>{team.items.filter(item => item.value !== null).map(item => <div key={item.type}><dt>{item.type}</dt><dd>{item.value}</dd></div>)}</dl></div>)}</div> : <p className="serie-a-empty">Statistiche non disponibili.</p>}</section>
    </>}
  </Overlay>;
}
