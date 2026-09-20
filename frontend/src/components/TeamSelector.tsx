import type { Team } from "../types";
import * as Select from "@radix-ui/react-select";
import { TeamCrest } from "./TeamCrest";

export function TeamSelector({ teams, value, onChange }: { teams: Team[]; value: string; onChange: (value: string) => void }) {
  const selected = teams.find(team => team.name === value);
  return <Select.Root value={value || "__all"} onValueChange={next => onChange(next === "__all" ? "" : next)}>
    <Select.Trigger className="club-team-trigger" aria-label="Filtra per squadra"><Select.Value><span className="club-team-value">{selected && <TeamCrest team={selected.name} teamId={selected.id} size="sm" decorative />}{selected?.name ?? "Tutte le squadre"}</span></Select.Value><Select.Icon aria-hidden="true">⌄</Select.Icon></Select.Trigger>
    <Select.Portal><Select.Content position="popper" sideOffset={8} collisionPadding={12} className="club-team-menu"><Select.ScrollUpButton className="club-team-scroll">⌃</Select.ScrollUpButton><Select.Viewport><Select.Item value="__all" className="club-team-option"><Select.ItemText>Tutte le squadre</Select.ItemText><Select.ItemIndicator aria-hidden="true">✓</Select.ItemIndicator></Select.Item>{teams.map(team => <Select.Item key={team.id} value={team.name} textValue={team.name} className="club-team-option"><TeamCrest team={team.name} teamId={team.id} size="sm" decorative /><Select.ItemText>{team.name}</Select.ItemText><Select.ItemIndicator aria-hidden="true">✓</Select.ItemIndicator></Select.Item>)}</Select.Viewport><Select.ScrollDownButton className="club-team-scroll">⌄</Select.ScrollDownButton></Select.Content></Select.Portal>
  </Select.Root>;
}
