import type { PlayerBenchmark as Benchmark } from "../types";

export function PlayerBenchmark({ benchmark }: { benchmark: Benchmark | null }) {
  if (!benchmark) return <div className="benchmark-card loading">Benchmark ruolo non disponibile.</div>;
  return <article className="benchmark-card"><span>BENCHMARK RUOLO {benchmark.role}</span><div><strong>#{benchmark.fvm_rank}<small> / {benchmark.role_total}</small></strong><b>Top {benchmark.fvm_top_percent}% FVM</b></div><dl><div><dt>Percentile FVM</dt><dd>{benchmark.fvm_percentile}%</dd></div><div><dt>Percentile QA</dt><dd>{benchmark.qa_percentile}%</dd></div></dl><details><summary>Metodo di calcolo</summary><p>{benchmark.methodology}</p></details></article>;
}
