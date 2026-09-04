import type { Team } from "../types";
import { TeamCrest } from "./TeamCrest";

export function TeamSelector({ teams, value, onChange }: { teams: Team[]; value: string; onChange: (value: string) => void }) {
  return <div className="team-selector" aria-label="Filtra per squadra">
    <button className={!value ? "active" : ""} aria-pressed={!value} onClick={() => onChange("")}><span>TUTTE</span></button>
    {teams.map((team) => <button key={team.id} className={value === team.name ? "active" : ""} aria-pressed={value === team.name} title={team.name} onClick={() => onChange(team.name)}>
      <TeamCrest team={team.name} teamId={team.id} decorative size="sm" /><span>{team.name}</span>
    </button>)}
  </div>;
}
