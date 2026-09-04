import { useEffect, useRef, useState } from "react";
import type { LeagueConfig, Player, PlayerBenchmark as Benchmark } from "../types";
import { getPlayerInsight } from "../lib/advice";
import { getPlayerAppeal, objectiveCompatibility } from "../lib/appeal";
import { embeddedStatsProvider, isNewSerieAArrival, roleAwareStats, seasonContext } from "../lib/playerStats";
import { normalizedFvm, valueDifference, valueStatus } from "../lib/squad";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { AgentInsight } from "./AgentInsight";
import { AppealBadge } from "./AppealBadge";
import { PlayerBenchmark } from "./PlayerBenchmark";
import { Reveal } from "./Reveal";
import { StatusBadge } from "./StatusBadge";
import { StarRating } from "./StarRating";
import { TeamCrest } from "./TeamCrest";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
type Props = { player: Player | null; config: LeagueConfig; purchasePrice?: number; onClose: () => void; primaryActionLabel?: string; onPrimaryAction?: () => void };
type Tab = "overview" | "performance" | "intelligence";
const metric = (value: number | null | undefined, digits = 0) => value == null ? "N/D" : digits ? value.toFixed(digits) : value;

function metricTone(label: string) {
  if (/^(Gol|Assist|Rigori)/i.test(label)) return "metric-bonus";
  if (/^(MV|FM)$/i.test(label)) return "metric-rating";
  if (/^(PV|Minuti)$/i.test(label)) return "metric-volume";
  if (/^(Gialli|Rossi|Autogol)$/i.test(label)) return "metric-discipline";
  return "metric-neutral";
}

function playerNarrative(player: Player, appeal: ReturnType<typeof getPlayerAppeal>, config: LeagueConfig) {
  const seasons = embeddedStatsProvider.seasons(player);
  const current = seasons.find((season) => season.season === "2026/27");
  const previous = seasons.find((season) => season.season !== "2026/27");
  const parts: string[] = [];

  if (appeal.rating >= 4.5) parts.push("È un profilo da prima fascia per il ruolo: i riferimenti di mercato e il confronto con i pari ruolo lo collocano tra i nomi più appetibili.");
  else if (appeal.rating >= 3.8) parts.push("È un profilo forte e credibile per il Fantacalcio, con valori che lo tengono stabilmente sopra la media del ruolo.");
  else if (appeal.rating >= 3) parts.push("È un profilo utilizzabile e con buoni argomenti, ma il suo valore dipende molto da prezzo d’asta e costruzione del reparto.");
  else parts.push("È un profilo più situazionale: può avere senso al prezzo giusto, ma oggi non parte come uno dei riferimenti del ruolo.");

  if (previous && (previous.appearances ?? 0) > 0) {
    const stats: string[] = [`${previous.appearances} PV`];
    if (previous.fantasy_average != null) stats.push(`FM ${previous.fantasy_average.toFixed(2)}`);
    if (previous.average_rating != null) stats.push(`MV ${previous.average_rating.toFixed(2)}`);
    if (player.role_classic === "P") {
      if (previous.goals_conceded != null) stats.push(`${previous.goals_conceded} gol subiti`);
      if (previous.penalties_saved != null && previous.penalties_saved > 0) stats.push(`${previous.penalties_saved} rigori parati`);
    } else {
      if (previous.goals != null) stats.push(`${previous.goals} gol`);
      if (previous.assists != null) stats.push(`${previous.assists} assist`);
    }
    parts.push(`Nella stagione precedente: ${stats.join(" · ")}.`);
  }

  if (current && (current.appearances ?? 0) > 0 && (current.appearances ?? 0) < 5) {
    parts.push(`Il ${current.season} è ancora su un campione ridotto (${current.appearances} PV), quindi il dato corrente va letto come tendenza iniziale e non come sentenza.`);
  }

  if (config.goal === "Arrivare almeno in Top 3" && appeal.rating < 3.5) parts.push("Per una rosa da Top 3 lo vedrei più come complemento che come uomo chiamato a trascinare il reparto.");
  if (config.goal === "Vincere e umiliare tutti" && appeal.rating < 4) parts.push("Se il target è il titolo, negli slot più importanti del reparto servono profili con un margine superiore.");
  return parts.join(" ");
}

export function PlayerModal({ player, config, purchasePrice, onClose, primaryActionLabel, onPrimaryAction }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [benchmark, setBenchmark] = useState<Benchmark | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  useFocusTrap(dialogRef, Boolean(player), onClose);

  useEffect(() => {
    setTab("overview");
    setBenchmark(null);
    if (!player) return;
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/players/${player.id}/benchmark`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(setBenchmark)
      .catch(() => undefined);
    return () => controller.abort();
  }, [player]);

  if (!player) return null;
  const insight = benchmark ? getPlayerInsight(player, benchmark, config) : null;
  const appeal = getPlayerAppeal(player, config);
  const compatibility = objectiveCompatibility(appeal, config);
  const historical = embeddedStatsProvider.seasons(player);
  const benchmarkPrice = normalizedFvm(player, config);
  const purchase = purchasePrice == null ? null : {
    price: purchasePrice,
    difference: valueDifference(purchasePrice, benchmarkPrice),
    status: valueStatus(purchasePrice, benchmarkPrice),
  };
  const tabs: Array<[Tab, string]> = [["overview", "Scheda"], ["performance", "Statistiche"], ["intelligence", "Analisi giocatore"]];

  return <div className="modal-backdrop" onMouseDown={onClose}><section ref={dialogRef} className="player-dossier" role="dialog" aria-modal="true" aria-labelledby="dossier-title" onMouseDown={(event) => event.stopPropagation()}>
    <button className="icon-button dossier-close" aria-label="Chiudi dossier" onClick={onClose}>×</button>
    <header className="dossier-hero"><TeamCrest team={player.team} teamId={player.team_id} size="lg" /><div className="dossier-identity"><span>FANTA007 · DOSSIER GIOCATORE</span><h2 id="dossier-title">{player.name}</h2><p>{player.team}</p><div className="identity-tags"><b>{player.role_classic}</b>{player.roles_mantra.map((role) => <b key={role}>{role}</b>)}</div><div className="dossier-appeal"><AppealBadge appeal={appeal} /><span className={`confidence confidence-${appeal.confidence.toLowerCase()}`}>FIDUCIA DATI {appeal.confidence}</span></div></div><div className="listone-matrix"><section><span>QUOTAZIONE</span><div><b>{player.current_quotation}</b><b>{player.current_quotation_mantra}</b></div><small><i>Classic</i><i>Mantra</i></small></section><section><span>FVM / 1000</span><div><b>{player.fvm}</b><b>{player.fvm_mantra}</b></div><small><i>Classic</i><i>Mantra</i></small></section></div></header>
    <div className="dossier-tabs" role="tablist" aria-label="Sezioni dossier">{tabs.map(([value, label]) => <button role="tab" aria-selected={tab === value} className={tab === value ? "active" : ""} key={value} onClick={() => setTab(value)}>{label}</button>)}</div>

    {tab === "overview" && <div className="dossier-content">
      <Reveal className="dossier-value-grid"><div><span>QI Classic</span><strong>{player.initial_quotation}</strong></div><div><span>QA Classic</span><strong>{player.current_quotation}</strong></div><div><span>FVM / 1000</span><strong>{player.fvm}</strong></div><div><span>FVM lega</span><strong>{benchmarkPrice}</strong></div></Reveal>
      {purchase && <Reveal className="purchase-intelligence" delay={40}><div><span>PREZZO PAGATO</span><strong>{purchase.price}<small> crediti</small></strong></div><div><span>SCOSTAMENTO DAL FVM</span><strong className={(purchase.difference ?? 0) >= 0 ? "positive" : "negative"}>{purchase.difference == null ? "N/D" : `${purchase.difference > 0 ? "+" : ""}${purchase.difference}%`}</strong></div><StatusBadge {...purchase.status} /></Reveal>}
      <Reveal delay={70}><PlayerBenchmark benchmark={benchmark} /></Reveal>
      <div className="source-note"><b>Dati correnti verificati</b><span>QI, QA e FVM provengono dal Listone normalizzato presente nel progetto.</span></div>
    </div>}

    {tab === "performance" && <div className="dossier-content stats-dossier">
      <div className="editorial-heading"><span>STORICO VERIFICATO</span><h3>Rendimento per stagione</h3><p>Mostriamo soltanto dati con fonte esplicita. N/D significa non disponibile, mai stimato.</p></div>
      {isNewSerieAArrival(player) && <div className="context-flag">NUOVO ARRIVO IN SERIE A · il contesto competitivo precedente può incidere sulla lettura</div>}
      {historical.length ? historical.map((season, index) => <Reveal as="article" className="season-card" delay={index * 45} key={`${season.season}-${season.competition}`}><header><div><span>{seasonContext(season)}</span><strong>{season.season} · {season.competition}</strong></div><small>{season.club ?? player.team}</small></header><dl>{roleAwareStats(player.role_classic, season).map(([label, value]) => <div className={metricTone(label)} key={label}><dt>{label}</dt><dd>{metric(value, typeof value === "number" && !Number.isInteger(value) ? 2 : 0)}</dd></div>)}</dl><footer><span>Fonte: <b>{season.source}</b></span>{season.updated_at && <span>Aggiornato: {season.updated_at}</span>}{season.source_url && <a href={season.source_url} target="_blank" rel="noreferrer">Apri fonte ↗</a>}</footer></Reveal>) : <div className="data-pending"><h3>Statistiche non ancora disponibili.</h3><p>Stiamo aspettando dati verificati per questo giocatore. Quando saranno disponibili, troverai qui stagione, presenze, gol, assist e medie.</p></div>}
    </div>}

    {tab === "intelligence" && <div className="dossier-content intelligence-dossier">
      <Reveal className="intelligence-verdict"><div><span>IL PARERE DEL FANTAGENTE</span><h3>{appeal.label}</h3><p>{playerNarrative(player, appeal, config)}</p><small className="agent-context">{compatibility.copy}</small></div><AppealBadge appeal={appeal} /></Reveal>
    <Reveal className="intelligence-grid" delay={35}><article><span>APPETIBILITÀ FANTA007</span><StarRating value={appeal.rating} label="Appetibilità Fanta007" /><p>Quanto è interessante questo giocatore per il Fantacalcio, in base ai dati disponibili.</p><ul>{appeal.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul><details className="smart-toggle"><summary>Come viene calcolata?</summary><p>{appeal.methodology}</p></details></article><article><span>VALORE DELL’ACQUISTO</span><h4>{purchase ? `${purchase.price} crediti` : "Non acquistato"}</h4><p>Riferimento FVM per la lega: {benchmarkPrice} crediti.</p>{purchase ? <StatusBadge {...purchase.status} /> : <small>Il giudizio sul prezzo apparirà dopo aver registrato l’acquisto.</small>}</article><article><span>ADATTO AL TUO OBIETTIVO?</span><h4>{compatibility.label}</h4><p>{config.goal}</p><small>L’obiettivo orienta il consiglio, senza alterare i dati del Listone.</small></article><article><span>AFFIDABILITÀ DEI DATI</span><h4>{appeal.confidence}</h4><p>{historical.length ? `${historical.length} stagioni verificate · ${historical.reduce((sum, item) => sum + (item.appearances ?? 0), 0)} presenze aggregate.` : "Lo storico verificato non è ancora disponibile."}</p><small>Quotazioni e statistiche arrivano da fonti dichiarate nel dossier.</small></article></Reveal>
      <Reveal delay={70}>{insight ? <AgentInsight insight={insight} /> : <div className="message-state"><b>Benchmark non disponibile</b><span>L’Appetibilità preliminare resta visibile, ma il consiglio dettagliato richiede il confronto di ruolo dal servizio dati.</span></div>}</Reveal>
    </div>}
    {onPrimaryAction && <footer className="dossier-primary"><button className="primary-action full" onClick={onPrimaryAction}>{primaryActionLabel ?? "CONTINUA"} →</button></footer>}
  </section></div>;
}
