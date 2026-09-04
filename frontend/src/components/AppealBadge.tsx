import type { PlayerAppeal } from "../lib/appeal";
import { StarRating } from "./StarRating";

export function AppealBadge({ appeal, compact = false }: { appeal: PlayerAppeal; compact?: boolean }) {
  return <span className={`appeal-badge level-${appeal.level} ${compact ? "compact" : ""}`} title={`Appetibilità Fanta007: ${appeal.rating.toFixed(1)} su 5`}>
    {!compact && <span>APPETIBILITÀ FANTA007</span>}<StarRating value={appeal.rating} compact={compact} label="Appetibilità Fanta007" />{!compact && <em>{appeal.label}</em>}
  </span>;
}
