import { AgentIllustration } from "./AgentIllustration";
import type { AgentInsight as Insight } from "../types";

export function AgentInsight({ insight, onAction }: { insight: Insight; onAction?: (role?: Insight["recommendedRole"]) => void }) {
  return <article className={`explainable-insight ${insight.type.toLowerCase()}`}>
    <div className="insight-copy">
      <header><span>{insight.type === "ADVICE" ? "CONSIGLIO" : insight.type === "WARNING" ? "ATTENZIONE" : "RISCHIO"}</span><div className="fanta-insight-heading"><h3>{insight.title}</h3><AgentIllustration variant={insight.type === "RISK" ? "critical" : insight.type === "WARNING" ? "warning" : "positive"} decorative className="fanta-insight-agent" sizes="112px" /></div></header>
      <div className="insight-verdict"><b>IN BREVE</b><p>{insight.verdict}</p></div>
      <details className="smart-toggle"><summary>Dati e regola applicata</summary><div className="insight-details"><b>DATI CONSIDERATI</b><ul>{insight.evidence.map((item) => <li key={item}>{item}</li>)}</ul><b>REGOLA</b><p>{insight.threshold}</p></div></details>
      <footer><b>PROSSIMA AZIONE</b><p>{insight.nextAction}</p>{onAction && <button className="insight-action" onClick={() => onAction(insight.recommendedRole)}>APRI IL LISTONE →</button>}</footer>
    </div>
  </article>;
}
