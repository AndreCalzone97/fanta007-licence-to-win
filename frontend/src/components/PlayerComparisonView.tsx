import type { LeagueConfig, Player } from "../types";
import { normalizedFvm } from "../lib/squad";
import { getPlayerAppeal } from "../lib/appeal";

const value = (input: number | null | undefined, digits = 0) => input == null ? "N/D" : digits ? input.toFixed(digits) : String(input);

export function PlayerComparisonView({ players, config, onBack, onOpen }: { players: Player[]; config: LeagueConfig; onBack: () => void; onOpen: (player: Player) => void }) {
  const metrics = [
    ["QA", (player: Player) => value(player.current_quotation)],
    ["FVM / 1000", (player: Player) => value(config.mode === "Mantra" ? player.fvm_mantra : player.fvm)],
    ["FVM lega", (player: Player) => value(normalizedFvm(player, config))],
    ["Appetibilità", (player: Player) => `${getPlayerAppeal(player, config).level}/5`],
    ["MV storica", (player: Player) => value(player.statistics[0]?.average_rating, 2)],
    ["FM storica", (player: Player) => value(player.statistics[0]?.fantasy_average, 2)],
    ["Presenze", (player: Player) => value(player.statistics[0]?.appearances)],
    ["Gol", (player: Player) => value(player.statistics[0]?.goals)],
    ["Assist", (player: Player) => value(player.statistics[0]?.assists)],
  ] as const;
  return <section className="comparison-view"><header><button className="text-button" onClick={onBack}>← TORNA AL LISTONE</button><div><span className="eyebrow">PLAYER INTELLIGENCE</span><h2>Confronto giocatori</h2></div></header><div className="comparison-players" style={{ gridTemplateColumns: `repeat(${players.length}, minmax(0,1fr))` }}>{players.map((player) => <button key={player.id} onClick={() => onOpen(player)}><strong>{player.name}</strong><span>{player.team} · {player.role_classic}</span></button>)}</div><div className="comparison-metrics">{metrics.map(([label, read]) => <div className="comparison-row" key={label}><b>{label}</b><div style={{ gridTemplateColumns: `repeat(${players.length}, minmax(0,1fr))` }}>{players.map((player) => <span key={player.id}>{read(player)}</span>)}</div></div>)}</div><p className="comparison-note">N/D indica un dato non disponibile nel dataset: nessun valore viene stimato.</p></section>;
}
