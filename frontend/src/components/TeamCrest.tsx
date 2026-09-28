import { useEffect, useState } from "react";
import { findTeamCrest } from "../config/teamCrests";

type Props = { team?: string | null; teamId?: string | null; logo?: string | null; preferProvidedLogo?: boolean; size?: "sm" | "md" | "lg"; decorative?: boolean; className?: string };

export function TeamCrest({ team, teamId, logo, preferProvidedLogo = false, size = "md", decorative = false, className = "" }: Props) {
  const crest = findTeamCrest(team, teamId);
  const preferredSrc = (preferProvidedLogo ? logo ?? crest?.src : crest?.src ?? logo) ?? null;
  const fallbackSrc = preferredSrc === logo ? crest?.src : logo;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  useEffect(() => setFailedSrc(null), [preferredSrc, logo]);
  const src = failedSrc === null ? preferredSrc : failedSrc === preferredSrc && fallbackSrc && fallbackSrc !== preferredSrc ? fallbackSrc : null;
  const initials = (team ?? teamId ?? "?").split(/\s+/).map((part) => part[0]).join("").slice(0, 3).toUpperCase();
  const label = `${crest?.name ?? team ?? "Squadra"} — stemma`;

  return <span className={`team-crest team-crest-${size}${className ? ` ${className}` : ""}`} data-team={crest?.id} title={crest?.name ?? team ?? undefined} aria-hidden={decorative || undefined}>
    {src
      ? <img src={src} alt={decorative ? "" : label} aria-hidden={decorative || undefined} loading="lazy" decoding="async" onError={() => setFailedSrc(src)} />
      : <b aria-label={decorative ? undefined : label}>{initials}</b>}
  </span>;
}
