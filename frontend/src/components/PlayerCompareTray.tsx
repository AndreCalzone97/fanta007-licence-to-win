import type { Player } from "../types";

export function PlayerCompareTray({ players, onRemove, onCompare }: { players: Player[]; onRemove: (id: number) => void; onCompare: () => void }) {
  if (!players.length) return null;
  return <aside className="compare-tray" aria-label="Selezione confronto"><div><b>CONFRONTO</b><span>{players.length}/3 selezionati</span></div><div className="compare-chips">{players.map((player) => <button key={player.id} onClick={() => onRemove(player.id)}>{player.name} ×</button>)}</div><button className="primary-action" disabled={players.length < 2} onClick={onCompare}>CONFRONTA {players.length}</button></aside>;
}
