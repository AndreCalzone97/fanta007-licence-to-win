import { useEffect, useMemo, useRef, useState } from "react";
import type { LeagueConfig, Player, SquadPlayer } from "../types";
import { acquisitionBlockReason, normalizedFvm, safeMaximumBid, squadTotals, valueDifference, valueStatus } from "../lib/squad";
import { StatusBadge } from "./StatusBadge";
import { TeamCrest } from "./TeamCrest";
import { AppealBadge } from "./AppealBadge";
import { getPlayerAppeal } from "../lib/appeal";
import { useFocusTrap } from "../hooks/useFocusTrap";

type Props = { player: Player | null; config: LeagueConfig; squad: SquadPlayer[]; onClose: () => void; onAdd: (player: Player, price: number) => void; onDossier: (player: Player) => void };

export function PlayerPreview({ player, config, squad, onClose, onAdd, onDossier }: Props) {
  const [price, setPrice] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  useFocusTrap(dialogRef, Boolean(player), onClose);
  useEffect(() => { setPrice(0); }, [player]);
  const benchmark = useMemo(() => player ? normalizedFvm(player, config) : 0, [config, player]);
  const difference = valueDifference(price, benchmark);
  const status = valueStatus(price, benchmark);
  if (!player) return null;
  const appeal = getPlayerAppeal(player, config);
  const totals = squadTotals(squad, config.budget);
  const maximumBid = safeMaximumBid(squad, config.budget);
  const blockReason = acquisitionBlockReason(config, squad, player, price);

  return <div className="sheet-backdrop" onMouseDown={onClose}><section ref={dialogRef} className="player-preview" role="dialog" aria-modal="true" aria-labelledby="preview-title" onMouseDown={(event) => event.stopPropagation()}>
    <button ref={closeRef} className="icon-button preview-close" aria-label="Chiudi anteprima" onClick={onClose}>×</button>
    <div className="preview-identity"><TeamCrest team={player.team} teamId={player.team_id} size="lg" /><div><span>LISTONE #{player.id}</span><h2 id="preview-title">{player.name}</h2><p>{player.team} · {player.role_classic} / {player.roles_mantra.join(" · ")}</p><AppealBadge appeal={appeal} /></div></div>
    <div className="preview-metrics"><div><span>QI → QA</span><strong>{player.initial_quotation} → {player.current_quotation}</strong></div><div><span>FVM / 1000</span><strong>{config.mode === "Mantra" ? player.fvm_mantra : player.fvm}</strong></div><div className="featured"><span>FVM per la tua lega</span><strong>{benchmark}</strong><small>su {config.budget} crediti</small></div></div>
    <div className="preview-budget-strip"><span>Disponibili <b>{totals.remaining}</b></span><span>Offerta sostenibile <b>{maximumBid}</b></span><span>Dopo l'acquisto <b className={totals.remaining - price < 0 ? "negative" : ""}>{totals.remaining - price}</b></span></div>
    <label className="price-field"><span>Quanto lo hai pagato?</span><div><input inputMode="numeric" min="0" max={config.budget} type="number" value={price || ""} onChange={(event) => setPrice(Math.max(0, Number(event.target.value)))} placeholder="0" /><b>crediti</b></div></label>
    {price > 0 && <div className="live-comparison"><div><strong>{((price / config.budget) * 100).toFixed(1)}%</strong><span>del budget iniziale</span></div><div><strong>{difference !== null && difference > 0 ? "+" : ""}{difference}%</strong><span>valore vs benchmark</span></div><StatusBadge {...status} /></div>}
    {blockReason && price > 0 && <div className="purchase-guard" role="alert">{blockReason}</div>}
    <button className="primary-action full" disabled={Boolean(blockReason)} onClick={() => onAdd(player, price)}>AGGIUNGI ALLA ROSA</button>
    <button className="secondary-link" onClick={() => onDossier(player)}>Apri dossier completo →</button>
  </section></div>;
}
