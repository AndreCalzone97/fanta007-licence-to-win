import type { PlayerAppeal } from "../lib/appeal";
import { AgentIllustration, type AgentVariant } from "./AgentIllustration";

export const reactionVariants: Record<PlayerAppeal["level"], AgentVariant> = { 1: "critical", 2: "warning", 3: "thinking", 4: "positive", 5: "positive" };
export function AgentReaction({ appeal }: { appeal: PlayerAppeal }) {
  return <div className={`club-agent-reaction reaction-${appeal.level}`}><AgentIllustration variant={reactionVariants[appeal.level]} decorative className="club-reaction-art" sizes="88px" /><div><span>Lettura dell’agente</span><strong>{appeal.label}</strong><small>Appetibilità {appeal.rating.toFixed(1)}/5 · Non è una previsione</small></div></div>;
}
