import type { ClassicRole, LeagueConfig, SquadPlayer } from "../types";
import { ROLE_TARGETS, SQUAD_SIZE, squadTotals } from "../lib/squad";
import { AgentAmbientMedia } from "./AgentAmbientMedia";

const roles: ClassicRole[] = ["P", "D", "C", "A"];
const labels: Record<ClassicRole, string> = { P: "Portieri", D: "Difensori", C: "Centrocampisti", A: "Attaccanti" };

export function ListoneRails({ config, squad }: { config: LeagueConfig; squad: SquadPlayer[] }) {
  const totals = squadTotals(squad, config.budget);
  const missing = Math.max(0, SQUAD_SIZE - squad.length);

  return <div className="listone-rails">
    <aside className="listone-agent-rail" aria-label="Fantagente FANTA007">
      <AgentAmbientMedia className="listone-rail-media" minWidth={1480} />
      <span className="listone-rail-caption">FANTA007 <small>INTELLIGENCE / LISTONE</small></span>
    </aside>
    <aside className="listone-context-rail" aria-label="Contesto della tua asta">
      <div className="listone-context-inner">
        <p className="listone-rail-kicker">MISSIONE / MERCATO</p>
        <h2>Il tuo contesto d’asta</h2>
        <div className="listone-context-metrics">
          <div><span>Budget disponibile</span><strong>{totals.remaining}<small> cr.</small></strong></div>
          <div><span>Giocatori scelti</span><strong>{squad.length}<small> / {SQUAD_SIZE}</small></strong></div>
          <div><span>Slot da coprire</span><strong>{missing}</strong></div>
        </div>
        <div className="listone-role-coverage">
          <h3>Copertura reparti</h3>
          {roles.map(role => <div key={role}><span>{labels[role]}</span><b>{totals.byRole[role]}{config.mode === "Classic" && <small> / {ROLE_TARGETS[role]}</small>}</b></div>)}
          {config.mode === "Mantra" && <p>In Mantra la copertura dipende dal regolamento della tua lega.</p>}
        </div>
        <p className="listone-context-note">Confronta quota e FVM prima di registrare il prezzo d’asta.</p>
      </div>
    </aside>
  </div>;
}
