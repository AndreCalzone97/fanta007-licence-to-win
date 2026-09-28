import type { LeagueConfig, Player } from "../types";
import { getPlayerAppeal } from "../lib/appeal";
import { normalizedFvm } from "../lib/squad";
import { StudioIcon } from "./StudioIcon";
import { TeamCrest } from "./TeamCrest";

type Props = { player: Player; config: LeagueConfig; owned: boolean; favorite: boolean; onOpen: () => void; onToggleFavorite: () => void };

export function PlayerCompactCard({ player, config, owned, favorite, onOpen, onToggleFavorite }: Props) {
  const appeal = getPlayerAppeal(player, config);
  const mantra = config.mode === "Mantra";
  const delta = mantra ? player.quotation_delta_mantra : player.quotation_delta;
  return <article className={`ops-player-row${owned ? " owned" : ""}`}>
    <button className="ops-row-favorite" aria-pressed={favorite} aria-label={`${favorite ? "Rimuovi" : "Aggiungi"} ${player.name} dai preferiti`} onClick={onToggleFavorite}><StudioIcon name="star" /></button>
    <button className="ops-player-select" onClick={onOpen} aria-label={`Apri ${player.name}`}>
      <span className="ops-player-identity"><TeamCrest team={player.team} teamId={player.team_id} /><span><strong>{player.name}</strong><small>{player.team} <span>· {player.role_classic}{player.roles_mantra.length ? ` / ${player.roles_mantra.join(" · ")}` : ""}</span>{owned && <span className="ops-owned-mobile"> · In rosa</span>}</small></span></span>
      <span className="ops-player-rating" aria-label={`Appetibilità ${appeal.rating.toFixed(1)} su 5`}><StudioIcon name="star" /><b>{appeal.rating.toFixed(1)}</b><small>/5</small></span>
      <span className="ops-player-number"><small>QA</small><b>{mantra ? player.current_quotation_mantra : player.current_quotation}</b></span>
      <span className="ops-player-number"><small>FVM / 1000</small><b>{mantra ? player.fvm_mantra : player.fvm}</b></span>
      <span className="ops-player-number ops-league-value"><small>FVM lega</small><b>{normalizedFvm(player, config)}</b></span>
      <span className="ops-player-number"><small>Δ quota</small><b className={delta > 0 ? "positive" : delta < 0 ? "negative" : ""}>{delta > 0 ? "+" : ""}{delta}</b></span>
      <span className="ops-player-status">{owned ? "In rosa" : "Dossier"}<span aria-hidden="true"> ↗</span></span>
    </button>
  </article>;
}
