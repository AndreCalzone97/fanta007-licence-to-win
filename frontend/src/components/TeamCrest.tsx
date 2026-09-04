import { useEffect, useState } from "react";
import { findTeamCrest } from "../config/teamCrests";

type Props = { team?: string | null; teamId?: string | null; size?: "sm" | "md" | "lg"; decorative?: boolean };

export function TeamCrest({ team, teamId, size = "md", decorative = false }: Props) {
  const [failed, setFailed] = useState(false);
  const crest = findTeamCrest(team, teamId);
  useEffect(() => setFailed(false), [crest?.src]);
  const initials = (team ?? teamId ?? "?").split(/\s+/).map((part) => part[0]).join("").slice(0, 3).toUpperCase();
  const label = `${crest?.name ?? team ?? "Squadra"} — stemma`;

  return <span className={`team-crest team-crest-${size}`} title={crest?.name ?? team ?? undefined}>
    {crest && !failed
      ? <img src={crest.src} alt={decorative ? "" : label} aria-hidden={decorative || undefined} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      : <b aria-label={decorative ? undefined : label}>{initials}</b>}
  </span>;
}
