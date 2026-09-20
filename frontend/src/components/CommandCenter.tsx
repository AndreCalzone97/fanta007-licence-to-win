import type { ClassicRole, LeagueConfig, SquadPlayer } from "../types";
import { getAgentAdvice } from "../lib/advice";
import { normalizedFvm, ROLE_TARGETS, SQUAD_SIZE, safeMaximumBid, squadTotals } from "../lib/squad";
import { AgentIllustration } from "./AgentIllustration";
import { BudgetAllocation } from "./BudgetAllocation";
import { TeamCrest } from "./TeamCrest";
import { StudioIcon } from "./StudioIcon";
import { NeonBorder, ParticleEnfold } from "./ui/ReferenceComponents";
import { RadialAction } from "./ui/RadialAction";

const roles: ClassicRole[] = ["P", "D", "C", "A"];
const names: Record<ClassicRole, string> = { P: "Portieri", D: "Difensori", C: "Centrocampisti", A: "Attaccanti" };
type Props = { config: LeagueConfig; squad: SquadPlayer[]; onOpenPlayers: (role?: ClassicRole) => void; onOpenSquad: () => void; onOpenDossier: (entry: SquadPlayer) => void; onRemove: (id: number) => void };

export function CommandCenter({ config, squad, onOpenPlayers, onOpenSquad, onOpenDossier }: Props) {
  const totals = squadTotals(squad, config.budget);
  const slots = Math.max(0, SQUAD_SIZE - squad.length);
  const advice = getAgentAdvice(config, squad);
  const recent = [...squad].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 4);
  return <section className="ops-command" aria-labelledby="studio-dashboard-title">
    <ParticleEnfold className="ops-command-particles" count={10} />
    <header className="ops-page-heading">
      <div><h1 id="studio-dashboard-title">La tua asta, sotto controllo.</h1><p>{config.mode} · {config.participants} partecipanti <span className="ops-heading-divider">/</span> {config.goal}</p></div>
      <RadialAction className="ops-command-cta" onClick={() => slots ? onOpenPlayers() : onOpenSquad()}>{slots ? "Cerca un giocatore" : "Rivedi la rosa"}<span aria-hidden="true"> →</span></RadialAction>
    </header>
    <div className="ops-situation">
      <section className="ops-auction" aria-labelledby="auction-title">
        <div className="ops-section-heading"><h2 id="auction-title">Situazione dell’asta</h2><span>{slots ? squad.length ? "In costruzione" : "Pronto a iniziare" : "Rosa completa"}</span></div>
        <dl className="ops-ledger">
          <div><dt>Budget disponibile</dt><dd>{totals.remaining}<small> crediti</small></dd><p>{totals.spent} investiti su {config.budget}</p></div>
          <div><dt>Massimo prossimo acquisto</dt><dd>{slots ? safeMaximumBid(squad, config.budget) : "—"}<small>{slots ? " crediti" : ""}</small></dd><p>{slots ? "Riservando 1 credito per ogni altro posto" : "Rosa completa: nessun posto disponibile"}</p></div>
        </dl>
        <div className="ops-completion"><div><b>{squad.length}<span> / {SQUAD_SIZE} giocatori</span></b><span>{slots ? `${slots} posti da completare` : "Tutti i posti occupati"}</span></div><progress value={squad.length} max={SQUAD_SIZE} aria-label="Completamento rosa" /></div>
      </section>
      <NeonBorder className="ops-priority-frame"><aside className={`ops-priority ${advice.type.toLowerCase()}`} aria-labelledby="priority-title">
        <div className="ops-priority-copy"><div className="ops-section-heading"><h2 id="priority-title">La prossima decisione</h2><span className="ops-signal">{advice.type === "ADVICE" ? "Consiglio" : "Attenzione"}</span></div><h3>{advice.title}</h3><p>{advice.verdict}</p><p className="ops-next-action">{advice.nextAction}</p><button className="secondary-action" onClick={() => slots ? onOpenPlayers(advice.recommendedRole) : onOpenSquad()}>{slots ? "Esplora le alternative" : "Controlla gli acquisti"} →</button></div>
        <AgentIllustration variant={advice.type === "RISK" ? "critical" : advice.type === "WARNING" ? "warning" : "thinking"} decorative className="ops-agent" sizes="(max-width: 700px) 90px, 145px" />
        <details className="ops-evidence"><summary>Perché questo consiglio?</summary><ul>{advice.evidence.map(item => <li key={item}>{item}</li>)}</ul><p>{advice.threshold}</p></details>
      </aside></NeonBorder>
    </div>
    <section className="ops-departments" aria-labelledby="departments-title">
      <div className="ops-section-heading"><h2 id="departments-title">Costruisci i reparti</h2><button className="text-action" onClick={onOpenSquad}>La mia rosa →</button></div>
      <div className="ops-role-map">{roles.map(role => {
        const count = totals.byRole[role];
        const target = config.mode === "Mantra" ? SQUAD_SIZE : ROLE_TARGETS[role];
        const spent = squad.filter(entry => entry.player.role_classic === role).reduce((sum, entry) => sum + entry.paidPrice, 0);
        return <button key={role} className={`ops-role-cell role-${role.toLowerCase()}`} onClick={() => onOpenPlayers(role)} aria-label={`Cerca ${names[role].toLowerCase()}`}>
          <span className="ops-role-top"><b>{role}</b><span>{names[role]}</span><StudioIcon name="search" /></span>
          <span className="ops-role-count"><strong>{count}<small> / {config.mode === "Mantra" ? "—" : target}</small></strong><span>{spent} cr. investiti</span></span>
          <span className="ops-slot-map" aria-hidden="true">{Array.from({ length: config.mode === "Mantra" ? Math.max(count, 1) : target }, (_, index) => <i key={index} data-filled={index < count} />)}</span>
          <span className="ops-role-footer">{config.mode === "Mantra" ? "Esplora il reparto" : count === target ? "Reparto completo" : `${target - count} da scegliere`} <span aria-hidden="true">→</span></span>
        </button>;
      })}</div>
      {config.mode === "Mantra" && <p className="ops-caption">Distribuzione Classic indicativa. I vincoli Mantra dipendono dalla tua lega.</p>}
    </section>
    <div className="ops-home-lower">
      <BudgetAllocation config={config} squad={squad} />
      <section className="ops-recent"><div className="ops-section-heading"><h2>Ultimi acquisti</h2><button className="text-action" onClick={onOpenSquad}>Tutti →</button></div>
        {recent.length ? <><div className="ops-recent-labels"><span>Giocatore</span><span>Pagato / FVM lega</span></div>{recent.map(entry => <button className="ops-recent-row" key={entry.player.id} onClick={() => onOpenDossier(entry)}><TeamCrest team={entry.player.team} teamId={entry.player.team_id} size="sm" /><span><b>{entry.player.name}</b><small>{entry.player.team} · {entry.player.role_classic}</small></span><strong>{entry.paidPrice}<small> / {normalizedFvm(entry.player, config)}</small></strong><span aria-hidden="true">›</span></button>)}</> : <div className="ops-empty"><StudioIcon name="squad" /><h3>Nessun acquisto registrato</h3><p>Scegli un giocatore dal Listone e inserisci il prezzo pagato. Budget e reparti si aggiorneranno insieme.</p><button className="secondary-action" onClick={() => onOpenPlayers()}>Registra il primo acquisto →</button></div>}
      </section>
    </div>
    <p className="ops-disclaimer">Indicazioni basate su regole, budget e dati disponibili. Nessuna previsione sulle prossime partite.</p>
  </section>;
}
