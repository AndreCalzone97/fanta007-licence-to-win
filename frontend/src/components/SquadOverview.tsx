import { Fragment, useEffect, useMemo, useState } from "react";
import type { ClassicRole, LeagueConfig, SquadPlayer } from "../types";
import { normalizedFvm, ROLE_TARGETS, squadTotals, valueDifference, valueStatus } from "../lib/squad";
import { StatusBadge } from "./StatusBadge";
import { TeamCrest } from "./TeamCrest";
import { StudioIcon } from "./StudioIcon";
import { AgentAmbientMedia } from "./AgentAmbientMedia";

type Props = { config: LeagueConfig; squad: SquadPlayer[]; onAdd: (role?: ClassicRole) => void; onOpen: (entry: SquadPlayer) => void; onRemove: (playerId: number) => void; previewLimit?: number; title?: string };
const roles: ClassicRole[] = ["P", "D", "C", "A"];
const roleNames: Record<ClassicRole, string> = { P: "Portieri", D: "Difensori", C: "Centrocampisti", A: "Attaccanti" };

function SegmentedSlots({ filled, total, label }: { filled: number; total: number; label: string }) {
  return <div className="squad-slot-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(filled, total)}>
    {Array.from({ length: total }, (_, index) => <span key={index} data-filled={index < filled} />)}
  </div>;
}

function BudgetProgress({ spent, budget }: { spent: number; budget: number }) {
  const segments = 20;
  const filled = budget > 0 ? Math.round(Math.min(1, spent / budget) * segments) : 0;
  return <div className="squad-budget-progress" role="progressbar" aria-label="Budget investito" aria-valuemin={0} aria-valuemax={budget} aria-valuenow={Math.min(spent, budget)}>
    {Array.from({ length: segments }, (_, index) => <span key={index} data-filled={index < filled} />)}
  </div>;
}

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
  const departments = roles.map(role => {
    const entries = squad.filter(entry => entry.player.role_classic === role);
    const target = config.mode === "Mantra" ? null : ROLE_TARGETS[role];
    return { role, name: roleNames[role], entries, target, spent: entries.reduce((sum, entry) => sum + entry.paidPrice, 0) };
  });

  if (previewLimit) return <section className="ops-recent"><div className="ops-section-heading"><h2>{title}</h2><button className="text-action" onClick={() => onAdd()}>Vai al Listone →</button></div>{recent.length ? recent.map(entry => <button className="ops-recent-row" key={entry.player.id} onClick={() => onOpen(entry)}><TeamCrest team={entry.player.team} teamId={entry.player.team_id} /><span><b>{entry.player.name}</b><small>{entry.player.role_classic}</small></span><strong>{entry.paidPrice} cr.</strong></button>) : <p>Nessun acquisto registrato</p>}</section>;

  return <section className="ops-squad squad-v21">
    <aside className="squad-agent-rail" aria-label="Fantagente FANTA007"><AgentAmbientMedia className="squad-rail-media" minWidth={1320} /><span className="squad-rail-caption">FANTA007 <small>INTELLIGENCE / ROSA</small></span></aside>
    <header className="ops-page-heading"><div><h1>{title}</h1><p>{config.teamName} · {config.mode} · Acquisti e copertura dei reparti</p></div><button className="primary-action" onClick={() => onAdd()}>Aggiungi un giocatore →</button></header>
    <div className="squad-command-metrics glass-surface-base" aria-label="Situazione della rosa">
      <div className="squad-metric squad-metric-primary"><span>Giocatori scelti</span><strong>{squad.length}<small> / 25</small></strong><SegmentedSlots filled={squad.length} total={25} label="Completamento della rosa" /></div>
      <div className="squad-metric"><span>Budget disponibile</span><strong>{totals.remaining}<small> cr.</small></strong><p>Su {config.budget} crediti iniziali</p></div>
      <div className="squad-metric"><span>Crediti investiti</span><strong>{totals.spent}<small> cr.</small></strong><BudgetProgress spent={totals.spent} budget={config.budget} /></div>
    </div>
    <div className="squad-departments-head"><h2>Copertura dei reparti</h2><p>Slot e spesa, nello stesso quadro.</p></div>
    <div className="squad-departments glass-surface-base" aria-label="Copertura per reparto">{departments.map(({ role, name, entries, target, spent }) => {
      const state = target === null ? "Raggruppamento indicativo" : entries.length >= target ? "Completo" : entries.length ? "Da completare" : "Scoperto";
      return <section key={role} className="squad-department" data-role={role.toLowerCase()}>
        <div className="squad-department-top"><span className="squad-role-mark" aria-hidden="true">{role}</span><h3>{name}</h3><span className="squad-department-state">{state}</span></div>
        <div className="squad-department-count"><strong>{entries.length}</strong><span>{target === null ? "acquistati" : `/ ${target} slot`}</span></div>
        {target !== null && <SegmentedSlots filled={entries.length} total={target} label={`${name}: ${entries.length} slot su ${target}`} />}
        <p><b>{spent} cr.</b> investiti</p>
      </section>;
    })}</div>
    <div className="ops-roster-toolbar"><p>{config.mode === "Mantra" ? "Raggruppamento Classic indicativo per la tua rosa Mantra." : "Seleziona un giocatore per rivedere il tuo acquisto."}</p><div className="ops-segmented" aria-label="Visualizzazione rosa"><button aria-pressed={layout === "board"} onClick={() => setLayout("board")}>Reparti</button><button aria-pressed={layout === "list"} onClick={() => setLayout("list")}>Elenco</button></div></div>
    {!squad.length ? <div className="ops-empty ops-empty-roster"><StudioIcon name="squad" /><h2>Costruisci la tua rosa</h2><p>Parti dal Listone: scegli un giocatore e registra il prezzo d’acquisto. Slot e budget si aggiorneranno qui.</p><button className="primary-action" onClick={() => onAdd()}>Apri il Listone →</button></div> : <div className={`ops-roster-layout ops-roster-${layout}`}>
      {layout === "board" ? <div className="ops-roster-master" aria-label="Giocatori in rosa">{departments.map(({ role, name, entries, target, spent }) => <section key={role} className="ops-roster-group">
        <header className="ops-roster-role"><span>{role}</span><div><h2>{name}</h2><p>{entries.length}{target ? ` / ${target}` : ""} giocatori</p><small>{spent} cr. investiti</small></div></header>
        <div className="ops-roster-entries"><div className="ops-roster-columns" aria-hidden="true"><span>Giocatore</span><span>Pagato</span><span>FVM lega</span></div>{entries.map(entry => <Fragment key={entry.player.id}>
          <button className="ops-roster-entry" aria-pressed={selectedId === entry.player.id} onClick={() => setSelectedId(entry.player.id)}><span><TeamCrest team={entry.player.team} teamId={entry.player.team_id} size="sm" /><span><strong>{entry.player.name}</strong><small>{entry.player.team} · {entry.player.role_classic}</small></span></span><b>{entry.paidPrice}</b><span>{normalizedFvm(entry.player, config)}</span></button>
          {selectedId === entry.player.id && <div className="ops-roster-inline"><PlayerDetail entry={entry} config={config} onOpen={() => onOpen(entry)} onRemove={() => onRemove(entry.player.id)} /></div>}
        </Fragment>)}{(!target || entries.length < target) && <button className="ops-add-role" onClick={() => onAdd(role)}>+ {target ? `${target - entries.length} posti liberi · ` : ""}Cerca {name.toLowerCase()} →</button>}</div>
      </section>)}</div> : <div className="squad-list-wrap"><table className="squad-list-table"><caption>Giocatori della tua rosa</caption><thead><tr><th scope="col">Giocatore</th><th scope="col">Ruolo</th><th scope="col">Squadra</th><th scope="col">Reparto</th><th scope="col">Pagato</th><th scope="col">FVM lega</th></tr></thead><tbody>{squad.map(entry => <tr key={entry.player.id} data-selected={selectedId === entry.player.id}><th scope="row"><button type="button" onClick={() => setSelectedId(entry.player.id)} aria-label={`Seleziona ${entry.player.name}`} aria-pressed={selectedId === entry.player.id}><TeamCrest team={entry.player.team} teamId={entry.player.team_id} size="sm" /><span>{entry.player.name}</span></button></th><td><small>Ruolo</small>{entry.player.role_classic}</td><td><small>Squadra</small>{entry.player.team}</td><td><small>Reparto</small>{roleNames[entry.player.role_classic]}</td><td><small>Pagato</small>{entry.paidPrice} cr.</td><td><small>FVM lega</small>{normalizedFvm(entry.player, config)} cr.</td></tr>)}</tbody></table>{selected && <div className="ops-roster-inline"><PlayerDetail entry={selected} config={config} onOpen={() => onOpen(selected)} onRemove={() => onRemove(selected.player.id)} /></div>}</div>}
      {selected && <div className="ops-roster-inspector"><PlayerDetail entry={selected} config={config} onOpen={() => onOpen(selected)} onRemove={() => onRemove(selected.player.id)} /></div>}
    </div>}
  </section>;
}

function PlayerDetail({ entry, config, onOpen, onRemove }: { entry: SquadPlayer; config: LeagueConfig; onOpen: () => void; onRemove: () => void }) {
  const benchmark = normalizedFvm(entry.player, config);
  const difference = valueDifference(entry.paidPrice, benchmark);
  const status = valueStatus(entry.paidPrice, benchmark);
  return <aside className="ops-roster-detail glass-surface-strong" aria-live="polite">
    <div className="ops-detail-heading"><TeamCrest team={entry.player.team} teamId={entry.player.team_id} size="lg" /><span>{entry.player.team} · {entry.player.role_classic}</span><h2>{entry.player.name}</h2></div>
    <StatusBadge {...status} />
    <dl><div><dt>Hai pagato</dt><dd>{entry.paidPrice}<small> cr.</small></dd></div><div><dt>FVM nella lega</dt><dd>{benchmark}<small> cr.</small></dd></div><div><dt>Valore vs FVM</dt><dd className={(difference ?? 0) >= 0 ? "positive" : "negative"}>{difference === null ? "N/D" : `${difference > 0 ? "+" : ""}${difference}%`}</dd></div><div><dt>Quotazione attuale</dt><dd>{config.mode === "Mantra" ? entry.player.current_quotation_mantra : entry.player.current_quotation}</dd></div></dl>
    <button className="primary-action full" onClick={onOpen}>Apri dossier →</button><button className="ops-remove-player" onClick={onRemove}>Rimuovi dalla rosa</button>
  </aside>;
}
