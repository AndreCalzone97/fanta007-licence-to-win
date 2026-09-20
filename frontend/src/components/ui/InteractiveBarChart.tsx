import { useMemo, useState } from "react";
import { motion } from "motion/react";
import "./interactive-bar-chart.css";

export type InteractiveBarDatum = {
  label: string;
  value: number;
  displayValue?: string;
};

type Props = {
  data: InteractiveBarDatum[];
  title: string;
  description?: string;
};

/**
 * Product port of the selected Bklit/21st.dev bar-chart-interactive demo (10116).
 * It keeps the reference's unframed bar field, sparse categorical axis,
 * 1100ms growing entrance and direct hover/focus inspection.
 */
export function InteractiveBarChart({ data, title, description }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const max = useMemo(() => Math.max(1, ...data.map(item => item.value)), [data]);

  return (
    <figure className="bklit-interactive-chart" aria-labelledby="performance-chart-title">
      <figcaption>
        <div>
          <span>LETTURA INTERATTIVA</span>
          <h4 id="performance-chart-title">{title}</h4>
        </div>
        {description && <p>{description}</p>}
      </figcaption>
      <div className="bklit-interactive-chart__plot" role="list" aria-label={title}>
        {data.map((item, index) => {
          const selected = active === index;
          const faded = active !== null && !selected;
          const height = Math.max(8, (item.value / max) * 100);
          return (
            <motion.button
              type="button"
              role="listitem"
              key={`${item.label}-${index}`}
              className={`bklit-interactive-chart__column${selected ? " is-active" : ""}${faded ? " is-faded" : ""}`}
              aria-label={`${item.label}: ${item.displayValue ?? item.value}`}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: faded ? .3 : 1 }}
              transition={{ duration: .18 }}
            >
              <motion.span
                className="bklit-interactive-chart__mark"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 1.1, delay: Math.min(index * .035, .42), ease: [0.22, 1, 0.36, 1] }}
                style={{ height: `${height}%` }}
              >
                <span className="bklit-interactive-chart__tooltip" aria-hidden={!selected}>
                  <b>{item.label}</b>
                  <strong>{item.displayValue ?? item.value}</strong>
                </span>
              </motion.span>
            </motion.button>
          );
        })}
      </div>
      <div className="bklit-interactive-chart__axis" aria-hidden="true">
        {data.map((item, index) => <span key={`${item.label}-axis-${index}`}>{item.label}</span>)}
      </div>
    </figure>
  );
}
