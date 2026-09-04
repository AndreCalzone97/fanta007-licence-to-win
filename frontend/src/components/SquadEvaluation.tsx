import { AgentIllustration } from "./AgentIllustration";
import { AgentInsight } from "./AgentInsight";
import { Reveal } from "./Reveal";
import { StarRating } from "./StarRating";
import { TeamCrest } from "./TeamCrest";
import { SCORING_THRESHOLDS } from "../config/scoring";
import { getAgentAdvice } from "../lib/advice";
import { getPlayerAppeal } from "../lib/appeal";
import { getDepartmentHighlights, getDepartmentScores } from "../lib/departmentScore";
import { normalizedFvm, squadTotals, valueDifference } from "../lib/squad";
import type { ClassicRole, LeagueConfig, SquadPlayer } from "../types";

function goalPhrase(config: LeagueConfig) {
  if (config.goal === "Vincere e umiliare tutti") return "puntare davvero al titolo";
  if (config.goal === "Arrivare almeno in Top 3") return "puntare davvero alla Top 3";
  if (config.goal === "Fare una stagione dignitosa") return "costruire una stagione tranquilla";
  return "stare lontano dalla zona bassa";
}

export function SquadEvaluation({ config, squad, onOpenPlayers }: { config: LeagueConfig; squad: SquadPlayer[]; onOpenPlayers: (role?: ClassicRole) => void }) {
  const totals = squadTotals(squad, config.budget);
  const advice = getAgentAdvice(config, squad);
  const evaluated = squad.map((entry) => ({
    entry,
    appeal: getPlayerAppeal(entry.player, config),
    value: valueDifference(entry.paidPrice, normalizedFvm(entry.player, config)),
  }));
  const complete = squad.length >= 25;
  const deals = evaluated.filter((item) => (item.value ?? -999) >= SCORING_THRESHOLDS.valuePickMinimumPercent).sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  const overpays = evaluated.filter((item) => (item.value ?? 0) < SCORING_THRESHOLDS.budgetRiskMaximumPercent).sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
  const averageScore = evaluated.length ? Math.round(evaluated.reduce((sum, item) => sum + item.appeal.score, 0) / evaluated.length) : 0;
  const averageRating = Math.round(averageScore / 2) / 10;
  const departments = getDepartmentScores(config, squad);
  const { strongest, weakest } = getDepartmentHighlights(departments);
  const requirement = config.goal === "Vincere e umiliare tutti" ? 72 : config.goal === "Arrivare almeno in Top 3" ? 58 : 42;
  const objectiveFit = averageScore >= requirement && overpays.length <= 3;

  if (!complete) return <section className="evaluation-page provisional-evaluation">
    <header className="evaluation-masthead"><div><span className="section-kicker">Valutazione provvisoria</span><h1>La rosa non è ancora completa.</h1><p>Questa lettura considera i <b>{squad.length} giocatori</b> già acquistati. Cambierà insieme alla rosa.</p></div><div className="evaluation-progress"><strong>{Math.round(squad.length / 25 * 100)}%</strong><span>rosa completata</span></div></header>
    <AgentInsight insight={advice} onAction={() => onOpenPlayers(advice.recommendedRole)} />
    <Reveal className="provisional-metrics"><div><span>Budget iniziale</span><strong>{config.budget}</strong></div><div><span>Speso</span><strong>{totals.spent}</strong></div><div><span>Disponibile</span><strong>{totals.remaining}</strong></div><div><span>Appetibilità media</span><strong>{evaluated.length ? `${averageRating.toFixed(1)}/5` : "N/D"}</strong></div></Reveal>
    <Reveal className="department-brief" delay={60}><div className="editorial-heading"><h2>Come stanno i reparti</h2><p>Apri il Listone già filtrato sul ruolo che vuoi completare.</p></div>{departments.map((department) => <button className={`role-${department.role.toLowerCase()}`} key={department.role} onClick={() => onOpenPlayers(department.role)}><b>{department.role}</b><span><strong>{department.name}</strong><small>{department.count}/{department.target} · {Math.max(0, department.target - department.count)} slot mancanti</small></span><StarRating value={department.score} compact label={`Punteggio ${department.name}`} /><i>APRI →</i></button>)}</Reveal>
  </section>;

  const summary = objectiveFit
    ? `La rosa ha una struttura credibile per ${goalPhrase(config)}. ${strongest?.name ?? "Il reparto migliore"} è oggi il punto più convincente${strongest ? ` (${strongest.score.toFixed(1)}/5)` : ""}; ${weakest?.name.toLowerCase() ?? "un reparto"} richiede invece più attenzione. Non vedo la necessità di stravolgere tutto: lavorerei soprattutto sul reparto meno solido e sui prezzi più fuori riferimento.`
    : `La rosa è completa, ma per ${goalPhrase(config)} la vedo ancora un gradino sotto. ${strongest?.name ?? "Un reparto"} dà una buona base${strongest ? ` (${strongest.score.toFixed(1)}/5)` : ""}, mentre ${weakest?.name.toLowerCase() ?? "un reparto"} è il punto che rischia di pesare di più nell’arco della stagione. Prima di chiudere il mercato, lì farei ancora un tentativo.`;
  const objectiveCopy = objectiveFit
    ? `Nel complesso qualità media, distribuzione del budget e profondità sono coerenti con “${config.goal}”. Il margine migliore non è rifare la rosa, ma proteggere gli acquisti riusciti e intervenire solo dove il rapporto qualità/prezzo è meno convincente.`
    : `${weakest?.verdict ?? "Il reparto più debole è quello da riequilibrare."} Per l’obiettivo “${config.goal}” servono più equilibrio e almeno un’alternativa capace di alzare il livello senza bruciare il budget residuo.`;

  return <article className="evaluation-page final-dossier">
    <header className="final-hero">
      <div className="final-copy"><span>Resoconto rosa</span><h1>Il tuo mercato, in breve.</h1><p>{config.teamName} · {config.mode} · {config.participants} partecipanti</p><div className="final-score"><span>APPETIBILITÀ MEDIA</span><StarRating value={averageRating} label="Appetibilità media della rosa" /></div></div>
      <AgentIllustration variant={objectiveFit ? "positive" : "warning"} className="final-agent" decorative sizes="(max-width: 700px) 300px, 480px" />
      <div className="final-verdict"><span>IL PARERE DEL FANTAGENTE</span><p>{summary}</p></div>
    </header>

    <Reveal className="mission-ledger"><div className="editorial-heading"><h2>Budget e acquisti</h2><p>I numeri essenziali della tua asta.</p></div><dl><div><dt>Budget iniziale</dt><dd>{config.budget}</dd></div><div><dt>Speso</dt><dd>{totals.spent}</dd></div><div><dt>Rimasto</dt><dd>{totals.remaining}</dd></div><div><dt>Buoni affari</dt><dd>{deals.length}</dd></div><div><dt>Prezzi da rivedere</dt><dd>{overpays.length}</dd></div></dl></Reveal>

    <Reveal className="deal-intelligence" delay={40}><section className="evaluation-column"><div className="editorial-heading"><h2>Migliori acquisti</h2><p>Chi hai preso sotto il riferimento FVM.</p></div><PlayerRanking items={deals.slice(0, 4)} empty="Nessun acquisto nettamente sotto il riferimento FVM." /></section><section className="evaluation-column watch"><div className="editorial-heading"><h2>Acquisti da rivedere</h2><p>Dove il prezzo pagato pesa di più.</p></div><PlayerRanking items={overpays.slice(0, 4)} empty="Nessun sovrapprezzo critico: buona gestione." /></section></Reveal>

    <Reveal className="department-analysis" delay={80}><div className="editorial-heading"><h2>Analisi reparti</h2><p>Il punteggio unisce qualità dei giocatori, prezzo pagato e completezza del reparto.</p></div>{departments.map((department) => <section className={`department-row role-${department.role.toLowerCase()}`} key={department.role}><b>{department.role}</b><div className="department-identity"><strong>{department.name}</strong><small>{department.count}/{department.target} giocatori</small></div><StarRating value={department.score} label={`Punteggio ${department.name}`} /><p>{department.verdict}</p><details><summary>Perché?</summary><ul>{department.reasons.slice(0, 3).map((reason) => <li key={reason}>{reason}</li>)}</ul></details></section>)}</Reveal>

    <Reveal className="objective-verdict" delay={100}><div><span>Coerenza con l’obiettivo</span><h2>{objectiveFit ? "La rosa è sulla strada giusta." : "C’è un reparto che frena la squadra."}</h2><p>{objectiveCopy}</p></div></Reveal>

    <Reveal className="next-operation" delay={120}><span>Cosa fare adesso</span><h2>{weakest?.action ?? (overpays.length ? "Rivedi gli acquisti più costosi prima di chiudere l’asta." : "Controlla il Listone prima di considerare chiusa l’asta.")}</h2><button className="primary-action" onClick={() => onOpenPlayers(weakest?.role)}>TORNA AL LISTONE →</button></Reveal>
  </article>;
}

function PlayerRanking({ items, empty }: { items: Array<{ entry: SquadPlayer; appeal: ReturnType<typeof getPlayerAppeal>; value: number | null }>; empty: string }) {
  if (!items.length) return <p className="ranking-empty">{empty}</p>;
  return <div className="player-ranking">{items.map(({ entry, value, appeal }, index) => <div key={entry.player.id}><span>{index + 1}</span><TeamCrest team={entry.player.team} teamId={entry.player.team_id} size="sm" /><div><b>{entry.player.name}</b><small>{entry.player.team} · ★ {appeal.rating.toFixed(1)}/5</small></div><strong className={(value ?? 0) >= 0 ? "positive" : "negative"}>{(value ?? 0) > 0 ? "+" : ""}{value}%</strong></div>)}</div>;
}
