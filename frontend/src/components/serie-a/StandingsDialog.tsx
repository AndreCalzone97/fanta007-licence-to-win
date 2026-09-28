import type { Feed } from "./types";
import { Overlay } from "./Overlay";
import { TeamBadge } from "./TeamBadge";

const show = (value: number | null) => value ?? "—";
export function StandingsDialog({ feed, layoutId, onClose }: { feed: Feed; layoutId: string; onClose: () => void }) {
  return <Overlay title="Classifica Serie A" variant="dialog" layoutId={layoutId} onClose={onClose}>
    <p className="serie-a-overlay-note">{feed.source}. {feed.mode === "demo" ? "Valori non disponibili: nessun risultato inventato." : "Classifica della stagione configurata."}</p>
    <div className="serie-a-table-scroll"><table className="serie-a-table"><caption>Classifica completa Serie A</caption><thead><tr><th scope="col">Pos.</th><th scope="col">Squadra</th><th scope="col">PG</th><th scope="col">V</th><th scope="col">N</th><th scope="col">P</th><th scope="col">GF</th><th scope="col">GS</th><th scope="col">DR</th><th scope="col">Pt</th></tr></thead><tbody>{feed.standings.map(row => <tr key={`${row.position}-${row.team}`}><td>{row.position}</td><th scope="row"><span className="serie-a-table-team"><TeamBadge name={row.team} logo={row.teamLogo} />{row.team}</span></th><td>{show(row.played)}</td><td>{show(row.won)}</td><td>{show(row.drawn)}</td><td>{show(row.lost)}</td><td>{show(row.goalsFor)}</td><td>{show(row.goalsAgainst)}</td><td>{show(row.goalDifference)}</td><td><strong>{show(row.points)}</strong></td></tr>)}</tbody></table></div>
  </Overlay>;
}
