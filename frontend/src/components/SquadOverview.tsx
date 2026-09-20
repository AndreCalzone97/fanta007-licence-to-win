import { Fragment, useEffect, useMemo, useState } from "react";
import type { ClassicRole, LeagueConfig, SquadPlayer } from "../types";
import { normalizedFvm, ROLE_TARGETS, squadTotals, valueDifference, valueStatus } from "../lib/squad";
import { StatusBadge } from "./StatusBadge";
import { TeamCrest } from "./TeamCrest";
import { StudioIcon } from "./StudioIcon";

type Props = { config: LeagueConfig; squad: SquadPlayer[]; onAdd: (role?: ClassicRole) => void; onOpen: (entry: SquadPlayer) => void; onRemove: (playerId: number) => void; previewLimit?: number; title?: string };
const roles: ClassicRole[] = ["P", "D", "C", "A"];
const roleNames: Record<ClassicRole, string> = { P: "Portieri", D: "Difensori", C: "Centrocampisti", A: "Attaccanti" };

export function SquadOverview({ config, squad, onAdd, onOpen, onRemove, previewLimit, title = "La mia rosa" }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(squad[0]?.player.id ?? null);
  const [layout, setLayout] = useState<"board" | "list">("board");
  const totals = squadTotals(squad, config.budget);
  useEffect(() => {
    if (!squad.length) setSelectedId(null);
    else if (!squad.some(entry => entry.player.id === selectedId)) setSelectedId(squad[0].player.id);
  }, [selectedId, squad]);
  const recent = useMemo(() => [...squad].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, previewLimit), [previewLimit, squad]);
  const selected = squad.find(entry => entry.player.id === selectedId) ?? null;

  if (previewLimit) return <section className="ops-recent"><div className="ops-section-heading"><h2>{title}</h2><button className="text-action" onClick={() => onAdd()}>Vai al Listone →</button></div>{recent.length ? recent.map(entry => <button className="ops-recent-row" key={entry.player.id} onClick={() => onOpen(entry)}><TeamCrest team={entry.player.team} teamId={entry.player.team_id} /><span><b>{entry.player.name}</b><small>{entry.player.role_classic}</small></span><strong>{entry.paidPrice} cr.</strong></button>) : <p>Nessun acquisto registrato</p>}</section>;

  return <section className="ops-squad">
    <header className="ops-page-heading"><div><h1>{title}</h1><p>{config.teamName} · {config.mode} · Acquisti e copertura dei reparti</p></div><button className="primary-action" onClick={() => onAdd()}>Aggiungi un giocatore →</button></header>
    <div className="ops-squad-status"><div><strong>{squad.length}<small>/25</small></strong><span>giocatori scelti</span></div><div><strong>{totals.remaining}<small> cr.</small></strong><span>budget disponibile</span></div><div><strong>{totals.spent}<small> cr.</small></strong><span>investiti nella rosa</span></div><progress value={squad.length} max={25} aria-label="Completamento rosa" /></div>
    <div className="ops-roster-toolbar"><p>{config.mode === "Mantra" ? "Raggruppamento Classic indicativo per la tua rosa Mantra." : "Seleziona un giocatore per rivedere il tuo acquisto."}</p><div className="ops-segmented" aria-label="Visualizzazione rosa"><button aria-pressed={layout === "board"} onClick={() => setLayout("board")}>Reparti</button><button aria-pressed={layout === "list"} onClick={() => setLayout("list")}>Elenco</button></div></div>
    {!squad.length ? <div className="ops-empty ops-empty-roster"><StudioIcon name="squad" /><h2>La prima scelta è tua.</h2><p>Cerca nel Listone e registra il prezzo del primo acquisto. Qui troverai giocatori, reparti e budget aggiornati.</p><button className="primary-action" onClick={() => onAdd()}>Apri il Listone →</button></div> : <div className={`ops-roster-layout ops-roster-${layout}`}>
      <div className="ops-roster-master" aria-label="Giocatori in rosa">{roles.map(role => {
        const entries = squad.filter(entry => entry.player.role_classic === role);
        const target = config.mode === "Mantra" ? null : ROLE_TARGETS[role];
        return <section key={role} className="ops-roster-group">
          <header className={`ops-roster-role role-${role.toLowerCase()}`}><span>{role}</span><div><h2>{roleNames[role]}</h2><p>{entries.length}{target ? ` / ${target}` : ""} giocatori</p><small>{entries.reduce((sum, entry) => sum + entry.paidPrice, 0)} cr. investiti</small></div></header>
          <div className="ops-roster-entries"><div className="ops-roster-columns" aria-hidden="true"><span>Giocatore</span><span>Pagato</span><span>FVM lega</span></div>{entries.map(entry => <Fragment key={entry.player.id}>
            <button className="ops-roster-entry" aria-pressed={selectedId === entry.player.id} onClick={() => setSelectedId(entry.player.id)}><span><TeamCrest team={entry.player.team} teamId={entry.player.team_id} size="sm" /><span><strong>{entry.player.name}</strong><small>{entry.player.team}</small></span></span><b>{entry.paidPrice}</b><span>{normalizedFvm(entry.player, config)}</span></button>
            {selectedId === entry.player.id && <div className="ops-roster-inline"><PlayerDetail entry={entry} config={config} onOpen={() => onOpen(entry)} onRemove={() => onRemove(entry.player.id)} /></div>}
          </Fragment>)}{(!target || entries.length < target) && <button className="ops-add-role" onClick={() => onAdd(role)}>+ {target ? `${target - entries.length} posti liberi · ` : ""}Cerca {roleNames[role].toLowerCase()} →</button>}</div>
        </section>;
      })}</div>
      {selected && <div className="ops-roster-inspector"><PlayerDetail entry={selected} config={config} onOpen={() => onOpen(selected)} onRemove={() => onRemove(selected.player.id)} /></div>}
    </div>}
  </section>;
}

function PlayerDetail({ entry, config, onOpen, onRemove }: { entry: SquadPlayer; config: LeagueConfig; onOpen: () => void; onRemove: () => void }) {
  const benchmark = normalizedFvm(entry.player, config);
  const difference = valueDifference(entry.paidPrice, benchmark);
  const status = valueStatus(entry.paidPrice, benchmark);
  return <aside className="ops-roster-detail" aria-live="polite">
    <div className="ops-detail-heading"><TeamCrest team={entry.player.team} teamId={entry.player.team_id} size="lg" /><span>{entry.player.team} · {entry.player.role_classic}</span><h2>{entry.player.name}</h2></div>
    <StatusBadge {...status} />
    <dl><div><dt>Hai pagato</dt><dd>{entry.paidPrice}<small> cr.</small></dd></div><div><dt>FVM nella lega</dt><dd>{benchmark}<small> cr.</small></dd></div><div><dt>Valore vs FVM</dt><dd className={(difference ?? 0) >= 0 ? "positive" : "negative"}>{difference === null ? "N/D" : `${difference > 0 ? "+" : ""}${difference}%`}</dd></div><div><dt>Quotazione attuale</dt><dd>{config.mode === "Mantra" ? entry.player.current_quotation_mantra : entry.player.current_quotation}</dd></div></dl>
    <button className="primary-action full" onClick={onOpen}>Apri dossier →</button><button className="ops-remove-player" onClick={onRemove}>Rimuovi dalla rosa</button>
  </aside>;
}
