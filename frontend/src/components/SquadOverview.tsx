import { useEffect, useMemo, useState } from "react";
import type { ClassicRole, LeagueConfig, SquadPlayer } from "../types";
import { normalizedFvm, ROLE_TARGETS, squadTotals, valueDifference, valueStatus } from "../lib/squad";
import { StatusBadge } from "./StatusBadge";
import { TeamCrest } from "./TeamCrest";

type Props = { config: LeagueConfig; squad: SquadPlayer[]; onAdd: (role?: ClassicRole) => void; onOpen: (entry: SquadPlayer) => void; onRemove: (playerId: number) => void; previewLimit?: number; title?: string };
const roles: ClassicRole[] = ["P", "D", "C", "A"];
const roleNames: Record<ClassicRole, string> = { P: "Portieri", D: "Difensori", C: "Centrocampisti", A: "Attaccanti" };

export function SquadOverview({ config, squad, onAdd, onOpen, onRemove, previewLimit, title = "La mia rosa" }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(squad[0]?.player.id ?? null);
  const totals = squadTotals(squad, config.budget);

  useEffect(() => {
    if (!squad.length) setSelectedId(null);
    else if (!squad.some((entry) => entry.player.id === selectedId)) setSelectedId(squad[0].player.id);
  }, [selectedId, squad]);

  const recent = useMemo(() => [...squad].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()).slice(0, previewLimit), [previewLimit, squad]);
  const selected = squad.find((entry) => entry.player.id === selectedId) ?? null;

  if (previewLimit) return <section className="recent-signings">
    <div className="section-heading"><div><span className="eyebrow">ULTIME OPERAZIONI</span><h2>{title}</h2></div><button className="text-action" onClick={() => onAdd()}>VAI AL LISTONE →</button></div>
    {!recent.length ? <div className="empty-inline"><b>Nessun acquisto registrato</b><span>Apri il Listone per iniziare la tua rosa.</span></div> : <div className="recent-strip">{recent.map((entry) => <button key={entry.player.id} onClick={() => onOpen(entry)}><TeamCrest team={entry.player.team} teamId={entry.player.team_id} /><span><b>{entry.player.name}</b><small>{entry.player.role_classic} · {entry.paidPrice} crediti</small></span></button>)}</div>}
  </section>;

  return <section className="squad-workspace">
    <header className="workspace-heading"><div><span className="eyebrow">ROSA OPERATIVA</span><h1>{title}</h1><p>{config.teamName} · {squad.length}/25 giocatori · {totals.remaining} crediti disponibili</p></div><button className="primary-action" onClick={() => onAdd()}>+ AGGIUNGI</button></header>
    {config.mode !== "Mantra" && <div className="department-meter">{roles.map((role) => <div key={role}><span>{roleNames[role]}</span><strong>{totals.byRole[role]}/{ROLE_TARGETS[role]}</strong><i><em style={{ width: `${Math.min(100, totals.byRole[role] / ROLE_TARGETS[role] * 100)}%` }} /></i></div>)}</div>}
    {!squad.length ? <div className="empty-mission"><span className="empty-seal">007</span><h2>Nessun agente reclutato.</h2><p>Apri il Listone, filtra per squadra o ruolo e registra il primo acquisto.</p><button className="primary-action" onClick={() => onAdd()}>APRI IL LISTONE →</button></div> : <div className="roster-master-detail">
      <div className="roster-master" aria-label="Giocatori in rosa">{roles.map((role) => {
        const entries = squad.filter((entry) => entry.player.role_classic === role);
        return <section key={role} className="roster-department"><header><b>{roleNames[role]}</b><span>{entries.length}/{config.mode === "Mantra" ? "—" : ROLE_TARGETS[role]}</span></header>{entries.map((entry) => <button key={entry.player.id} className={selectedId === entry.player.id ? "active" : ""} onClick={() => setSelectedId(entry.player.id)}><TeamCrest team={entry.player.team} teamId={entry.player.team_id} size="sm" /><span><strong>{entry.player.name}</strong><small>{entry.player.team}</small></span><b>{entry.paidPrice}</b></button>)}{(config.mode === "Mantra" ? !entries.length : entries.length < ROLE_TARGETS[role]) && <button className="empty-role-action" onClick={() => onAdd(role)}><span>+ Aggiungi al reparto</span><small>Listone filtrato per ruolo {role}</small></button>}</section>;
      })}</div>
      {selected && <PlayerDetail entry={selected} config={config} onOpen={() => onOpen(selected)} onRemove={() => onRemove(selected.player.id)} />}
    </div>}
  </section>;
}

function PlayerDetail({ entry, config, onOpen, onRemove }: { entry: SquadPlayer; config: LeagueConfig; onOpen: () => void; onRemove: () => void }) {
  const benchmark = normalizedFvm(entry.player, config);
  const difference = valueDifference(entry.paidPrice, benchmark);
  const status = valueStatus(entry.paidPrice, benchmark);
  return <aside className="roster-detail" aria-live="polite">
    <div className="detail-identity"><TeamCrest team={entry.player.team} teamId={entry.player.team_id} size="lg" /><div><span>{entry.player.team}</span><h2>{entry.player.name}</h2><p>{entry.player.role_classic} / {entry.player.roles_mantra.join(" · ") || "Ruolo Classic"}</p></div></div>
    <StatusBadge {...status} />
    <dl><div><dt>Pagato</dt><dd>{entry.paidPrice}</dd></div><div><dt>FVM lega</dt><dd>{benchmark}</dd></div><div><dt>Valore</dt><dd className={(difference ?? 0) >= 0 ? "positive" : "negative"}>{difference === null ? "N/D" : `${difference > 0 ? "+" : ""}${difference}%`}</dd></div><div><dt>QA</dt><dd>{entry.player.current_quotation}</dd></div></dl>
    <div className="detail-actions"><button className="secondary-action" onClick={onOpen}>APRI DOSSIER</button><button className="danger-action" onClick={onRemove}>RIMUOVI</button></div>
  </aside>;
}
