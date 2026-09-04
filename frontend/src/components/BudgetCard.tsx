import type { ClassicRole, LeagueConfig, SquadPlayer } from "../types";
import { squadTotals } from "../lib/squad";

const labels: Record<ClassicRole, string> = { P: "Portieri", D: "Difesa", C: "Centrocampo", A: "Attacco" };

export function BudgetCard({ config, squad }: { config: LeagueConfig; squad: SquadPlayer[] }) {
  const totals = squadTotals(squad, config.budget);
  const roleSpend = (role: ClassicRole) => squad.filter((entry) => entry.player.role_classic === role).reduce((sum, entry) => sum + entry.paidPrice, 0);
  return <article className="budget-card surface-card">
    <div className="card-kicker"><span>BUDGET OPERATIVO</span><b>{Math.min(100, totals.usedPercentage)}% usato</b></div>
    <div className="budget-numbers"><div><strong>{config.budget}</strong><span>iniziali</span></div><i>→</i><div><strong>{totals.spent}</strong><span>spesi</span></div><i>→</i><div className={totals.remaining < 0 ? "negative" : "positive"}><strong>{totals.remaining}</strong><span>disponibili</span></div></div>
    <div className="budget-track" aria-label={`${totals.usedPercentage}% del budget utilizzato`}><span style={{ width: `${Math.min(100, totals.usedPercentage)}%` }} /></div>
    {squad.length > 0 && <div className="budget-breakdown">{(["P", "D", "C", "A"] as ClassicRole[]).map((role) => <div key={role}><span>{labels[role]}</span><b>{roleSpend(role)} cr</b></div>)}</div>}
  </article>;
}
