import type { LeagueConfig, Player } from "../types";
import { getPlayerAppeal } from "../lib/appeal";
import { AppealBadge } from "./AppealBadge";
import { TeamCrest } from "./TeamCrest";

type Props = { player: Player; config: LeagueConfig; compared: boolean; compareDisabled: boolean; owned: boolean; favorite: boolean; onOpen: () => void; onToggleCompare: () => void; onToggleFavorite: () => void };

export function PlayerCompactCard({ player, config, compared, compareDisabled, owned, favorite, onOpen, onToggleCompare, onToggleFavorite }: Props) {
  const appeal = getPlayerAppeal(player, config);
  return <article className={`compact-player-card ${compared ? "compared" : ""} ${owned ? "owned" : ""}`}>
    <button className="favorite-toggle" aria-pressed={favorite} aria-label={`${favorite ? "Rimuovi" : "Aggiungi"} ${player.name} dai preferiti`} onClick={onToggleFavorite}>{favorite ? "★" : "☆"}</button>
    <button className="compact-player-main" onClick={onOpen} aria-label={`Apri ${player.name}`}><TeamCrest team={player.team} teamId={player.team_id} /><div><strong>{player.name}</strong><span>{player.team} · {player.role_classic}{player.roles_mantra.length ? ` / ${player.roles_mantra.join(" · ")}` : ""}</span><AppealBadge appeal={appeal} compact /></div><dl><div><dt>QA</dt><dd>{player.current_quotation}</dd></div><div><dt>FVM</dt><dd>{player.fvm}</dd></div><div><dt>Δ</dt><dd className={player.quotation_delta > 0 ? "positive" : player.quotation_delta < 0 ? "negative" : ""}>{player.quotation_delta > 0 ? "+" : ""}{player.quotation_delta}</dd></div></dl><i>›</i></button>
    {owned ? <span className="owned-badge">IN ROSA</span> : <button className="compare-toggle" aria-pressed={compared} aria-label={`${compared ? "Rimuovi" : "Aggiungi"} ${player.name} dal confronto`} disabled={!compared && compareDisabled} onClick={onToggleCompare}><span aria-hidden="true">{compared ? "✓" : "⇄"}</span><span className="sr-only">Confronta</span></button>}
  </article>;
}
