import { useEffect, useState } from "react";
import { TeamCrest } from "./TeamCrest";

type PlayerAvatar = { src: string; alt: string };

export function EvaluationPlayerMedia({ team, teamId, avatar }: { team: string; teamId?: string | null; avatar?: PlayerAvatar | null }) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  useEffect(() => setAvatarFailed(false), [avatar?.src]);

  return <span className="evaluation-player-media" data-media={avatar && !avatarFailed ? "avatar" : "crest"}>
    {avatar && !avatarFailed
      ? <img src={avatar.src} alt={avatar.alt} loading="lazy" decoding="async" onError={() => setAvatarFailed(true)} />
      : <TeamCrest team={team} teamId={teamId} size="sm" decorative />}
  </span>;
}
