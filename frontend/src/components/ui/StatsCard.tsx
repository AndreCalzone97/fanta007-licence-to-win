import type { ReactNode } from "react";
import "./stats-card.css";

export type StatsCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  change: string;
  changeType: "positive" | "negative";
  className?: string;
};

/**
 * Product port of ravikatiyar162's 21st.dev Stats Card.
 * The original Card > CardHeader > CardTitle + icon > CardContent hierarchy,
 * value emphasis and signed trend treatment are preserved without Tailwind.
 */
export function StatsCard({ title, value, icon, change, changeType, className = "" }: StatsCardProps) {
  return (
    <article className={`fanta-stats-card ${className}`.trim()}>
      <header className="fanta-stats-card__header">
        <h3>{title}</h3>
        <span className="fanta-stats-card__icon" aria-hidden="true">{icon}</span>
      </header>
      <div className="fanta-stats-card__content">
        <strong>{value}</strong>
        <p className={changeType === "positive" ? "is-positive" : "is-negative"}>{change}</p>
      </div>
    </article>
  );
}
