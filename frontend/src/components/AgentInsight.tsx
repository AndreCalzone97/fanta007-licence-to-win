import type { AgentInsight as Insight } from "../types";
import { AgentIllustration, type AgentVariant } from "./AgentIllustration";

export function AgentInsight({ insight, onAction }: { insight: Insight; onAction?: (role?: Insight["recommendedRole"]) => void }) {
  const variant: AgentVariant = insight.type === "RISK" ? "critical" : insight.type === "WARNING" ? "warning" : "positive";
  return <article className={`explainable-insight ${insight.type.toLowerCase()}`}>
    <AgentIllustration key={variant} variant={variant} className="insight-agent-foreground" decorative sizes="(max-width: 620px) 150px, 260px" />
    <div className="insight-copy">
      <header><span>{insight.type === "ADVICE" ? "CONSIGLIO" : insight.type === "WARNING" ? "ATTENZIONE" : "RISCHIO"}</span><h3>{insight.title}</h3></header>
      <div className="insight-verdict"><b>IN BREVE</b><p>{insight.verdict}</p></div>
      <details className="smart-toggle"><summary>Perché te lo sto dicendo?</summary><div className="insight-details"><b>COSA STO GUARDANDO</b><ul>{insight.evidence.map((item) => <li key={item}>{item}</li>)}</ul><b>COME LO LEGGO</b><p>{insight.threshold}</p></div></details>
      <footer><b>PROSSIMA AZIONE</b><p>{insight.nextAction}</p>{onAction && <button className="insight-action" onClick={() => onAction(insight.recommendedRole)}>APRI IL LISTONE →</button>}</footer>
    </div>
  </article>;
}
