import type { Match } from "./types";
import { formatMatchDate, score } from "./types";
import { TeamBadge } from "./TeamBadge";

export function MatchdayPanel({ matches, empty, onSelect }: { matches: Match[]; empty: string; onSelect: (match: Match) => void }) {
  if (!matches.length) return <p className="serie-a-empty">{empty}</p>;
  return <div className="serie-a-matchday"><p className="serie-a-matchday-label">{matches[0].matchday} · {matches.length} partite</p>{matches.map(match => <button className="serie-a-match-row" key={match.id} type="button" onClick={() => onSelect(match)}>
    <small>{formatMatchDate(match.date)} · {match.status}</small>
    <span><b><TeamBadge name={match.homeTeam} logo={match.homeLogo} />{match.homeTeam}</b><strong>{score(match)}</strong><b><TeamBadge name={match.awayTeam} logo={match.awayLogo} />{match.awayTeam}</b></span>
    <span className="serie-a-match-row-hint">Dettagli partita ↗</span>
  </button>)}</div>;
}
