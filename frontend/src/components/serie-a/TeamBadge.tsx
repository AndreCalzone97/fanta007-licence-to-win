import { TeamCrest } from "../TeamCrest";

export function TeamBadge({ name, logo }: { name: string; logo?: string | null }) {
  return <TeamCrest team={name} logo={logo} preferProvidedLogo size="sm" decorative className="serie-a-team-badge" />;
}
