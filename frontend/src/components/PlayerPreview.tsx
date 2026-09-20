import { useEffect, useMemo, useState } from "react";
import type { LeagueConfig, Player, SquadPlayer } from "../types";
import { acquisitionBlockReason, normalizedFvm, safeMaximumBid, squadTotals, valueDifference, valueStatus } from "../lib/squad";
import { StatusBadge } from "./StatusBadge";
import { TeamCrest } from "./TeamCrest";
import { getPlayerAppeal } from "../lib/appeal";
import { AgentReaction } from "./AgentReaction";
import { ContextPanel } from "./ui/ContextPanel";
import { GradientSlider } from "./ui/ReferenceComponents";

type Props = { player: Player | null; config: LeagueConfig; squad: SquadPlayer[]; onClose: () => void; onAdd: (player: Player, price: number) => void | Promise<boolean | void>; onDossier: (player: Player) => void };

export function PlayerPreview({ player, config, squad, onClose, onAdd, onDossier }: Props) {
  const [draftPrices, setDraftPrices] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  useEffect(() => { setPurchaseError(""); }, [player?.id]);
  useEffect(() => {
    setDraftPrices(current => Object.fromEntries(Object.entries(current).filter(([id]) => !squad.some(entry => entry.player.id === Number(id)))));
  }, [squad]);
  const price = player ? draftPrices[player.id] ?? 0 : 0;
  function setPrice(value: number) { setPurchaseError(""); if (player) setDraftPrices(current => ({ ...current, [player.id]: value })); }
  const benchmark = useMemo(() => player ? normalizedFvm(player, config) : 0, [config, player]);
  if (!player) return null;
  const appeal = getPlayerAppeal(player, config);
  const totals = squadTotals(squad, config.budget);
  const maximumBid = safeMaximumBid(squad, config.budget);
  const sliderMax = Math.max(1, Math.min(config.budget, maximumBid));
  const blockReason = acquisitionBlockReason(config, squad, player, price);
  const owned = squad.find(entry => entry.player.id === player.id);
  const difference = valueDifference(owned?.paidPrice ?? price, benchmark);
  const status = valueStatus(owned?.paidPrice ?? price, benchmark);
  const mantra = config.mode === "Mantra";

  async function submitPurchase() {
    if (!player || blockReason || submitting) return;
    setSubmitting(true);
    setPurchaseError("");
    try {
      if (await onAdd(player, price) === false) setPurchaseError("Acquisto non salvato. Controlla il collegamento e riprova; la rosa precedente è conservata.");
    } catch {
      setPurchaseError("Acquisto non salvato. Controlla il collegamento e riprova; la rosa precedente è conservata.");
    } finally { setSubmitting(false); }
  }

  return <ContextPanel titleId="preview-title" onClose={() => { if (!submitting) onClose(); }} className="ops-player-preview">
    <div className="ops-panel-top"><span>{owned ? "Nella tua rosa" : "Valuta l’acquisto"} · #{player.id}</span><button className="ops-close" aria-label="Chiudi anteprima" onClick={onClose} disabled={submitting}>×</button></div>
    <header className="ops-preview-identity"><TeamCrest team={player.team} teamId={player.team_id} size="lg" /><div><h2 id="preview-title">{player.name}</h2><p>{player.team} · {player.role_classic} / {player.roles_mantra.join(" · ")}</p></div></header>
    <div className="ops-preview-value"><div><span>FVM per la tua lega</span><strong>{benchmark}<small> crediti</small></strong><small>Riferimento su {config.budget}, non prezzo consigliato</small></div><dl><div><dt>QI → QA</dt><dd>{mantra ? player.initial_quotation_mantra : player.initial_quotation} → {mantra ? player.current_quotation_mantra : player.current_quotation}</dd></div><div><dt>FVM / 1000</dt><dd>{mantra ? player.fvm_mantra : player.fvm}</dd></div></dl></div>
    <button className="ops-dossier-link" disabled={submitting} onClick={() => onDossier(player)}><span>Statistiche e dossier completo<small>Storico, confronto di ruolo e consiglio</small></span><span aria-hidden="true">↗</span></button>
    <div className="ops-preview-body">
      {owned ? <section className="ops-owned-purchase"><h3>Acquisto registrato</h3><strong>{owned.paidPrice} <small>crediti</small></strong><StatusBadge {...status} /><p>Il prezzo pagato è salvato nella tua rosa.</p></section> : <form aria-busy={submitting} onSubmit={event => { event.preventDefault(); void submitPurchase(); }}>
        <div className="ops-section-heading"><h3>Registra il prezzo d’asta</h3><span>{totals.remaining} cr. disponibili</span></div>
        <label className="ops-price-field" htmlFor="paid-price">Quanto lo hai pagato?<span><input id="paid-price" inputMode="numeric" min="1" max={config.budget} step="1" type="number" disabled={submitting} value={price || ""} onChange={event => setPrice(Math.max(0, Number(event.target.value)))} placeholder="0" aria-describedby="bid-guidance" aria-invalid={price > 0 && Boolean(blockReason)} /><b>crediti</b></span></label>
        <GradientSlider id="paid-price-range" value={Math.min(price, sliderMax)} min={0} max={sliderMax} onChange={setPrice} disabled={submitting} aria-label="Seleziona il prezzo in crediti" />
        <p id="bid-guidance" className="ops-caption">Massimo sostenibile: <b>{maximumBid} cr.</b> Riserva almeno 1 credito per ogni altro posto.</p>
        <dl className="ops-bid-summary"><div><dt>Dopo l’acquisto</dt><dd className={totals.remaining - price < 0 ? "negative" : ""}>{totals.remaining - price} cr.</dd></div><div><dt>Valore vs FVM</dt><dd>{price ? difference === null ? "N/D" : `${difference > 0 ? "+" : ""}${difference}%` : "—"}</dd></div></dl>
        {price > 0 && !blockReason && <StatusBadge {...status} />}
        {blockReason && price > 0 && <p className="ops-purchase-guard" role="alert">{blockReason}</p>}
        {purchaseError && <p className="ops-purchase-guard" role="alert">{purchaseError}</p>}
        <button className="primary-action full" type="submit" disabled={submitting || Boolean(blockReason)}>{submitting ? "Salvataggio dell’acquisto…" : "Aggiungi alla rosa →"}</button>
      </form>}
      <AgentReaction appeal={appeal} />
    </div>
  </ContextPanel>;
}
