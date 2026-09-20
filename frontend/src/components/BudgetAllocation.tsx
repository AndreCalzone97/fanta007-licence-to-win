import type { ClassicRole, LeagueConfig, SquadPlayer } from "../types";
import { squadTotals } from "../lib/squad";
const roles: Array<[ClassicRole, string]> = [["P", "Portieri"], ["D", "Difensori"], ["C", "Centrocampisti"], ["A", "Attaccanti"]];

export function BudgetAllocation({ config, squad }: { config: LeagueConfig; squad: SquadPlayer[] }) {
  const totals = squadTotals(squad, config.budget);
  const allocations = roles.map(([role, name]) => ({ role, name, spent: squad.filter(entry => entry.player.role_classic === role).reduce((sum, entry) => sum + entry.paidPrice, 0) }));
  return <section className="budget-allocation"><header><h2>Dove sono i tuoi crediti</h2><p><strong>{totals.spent}</strong> investiti · <strong>{totals.remaining}</strong> disponibili</p></header><div className="allocation-track" aria-hidden="true">{allocations.map(item => <span key={item.role} className={`allocation-${item.role.toLowerCase()}`} style={{width: `${item.spent / config.budget * 100}%`}} />)}<span className="allocation-free" style={{width: `${Math.max(0,totals.remaining) / config.budget * 100}%`}} /></div><dl>{allocations.map(item => <div key={item.role}><dt><i className={`allocation-${item.role.toLowerCase()}`} />{item.name}</dt><dd>{item.spent}<small> cr.</small></dd></div>)}<div><dt><i className="allocation-free" />Disponibili</dt><dd>{totals.remaining}<small> cr.</small></dd></div></dl></section>;
}
