import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AgentAmbientMedia } from "./AgentAmbientMedia";
import { BudgetAllocation } from "./BudgetAllocation";
import { EvaluationPlayerMedia } from "./EvaluationPlayerMedia";
import { TeamCrest } from "./TeamCrest";
import { SCORING_THRESHOLDS } from "../config/scoring";
import { getAgentAdvice } from "../lib/advice";
import { getPlayerAppeal } from "../lib/appeal";
import { getDepartmentHighlights, getDepartmentScores, type DepartmentScore } from "../lib/departmentScore";
import { normalizedFvm, squadTotals, valueDifference } from "../lib/squad";
import type { ClassicRole, LeagueConfig, SquadPlayer } from "../types";
import "../styles/evaluation-v21.css";

type EvaluatedPlayer = { entry: SquadPlayer; appeal: ReturnType<typeof getPlayerAppeal>; value: number | null };

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 10, filter: "blur(5px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, amount: .08 }} transition={{ duration: reduced ? 0 : .38, delay: reduced ? 0 : delay, ease: [.22, 1, .36, 1] }}>{children}</motion.div>;
}

function Ticker({ value, suffix = "" }: { value: number; suffix?: string }) {
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState(reduced ? value : 0);
  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 650, 1);
      setCurrent(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduced]);
  return <span aria-label={`${value}${suffix}`}><span aria-hidden="true">{current}{suffix}</span></span>;
}

function CompletionCard({ count }: { count: number }) {
  const reduced = useReducedMotion();
  const percent = Math.min(100, Math.round(count / 25 * 100));
  const perimeter = 2 * Math.PI * 76;
  return <div className="evaluation-completion" role="progressbar" aria-label="Completamento della rosa" aria-valuemin={0} aria-valuemax={25} aria-valuenow={Math.min(count, 25)}>
    <svg viewBox="0 0 192 192" aria-hidden="true"><circle className="evaluation-ring-track" cx="96" cy="96" r="76" /><motion.circle className="evaluation-ring-fill" cx="96" cy="96" r="76" strokeDasharray={perimeter} initial={reduced ? false : { strokeDashoffset: perimeter }} animate={{ strokeDashoffset: perimeter * (1 - percent / 100) }} transition={{ duration: reduced ? 0 : .9, ease: [.22, 1, .36, 1] }} /></svg>
    <div><strong><Ticker value={percent} suffix="%" /></strong><span>ROSA COMPLETATA</span><small>{count} / 25 giocatori</small></div>
  </div>;
}

function VerdictTitle({ text }: { text: string }) {
  const reduced = useReducedMotion();
  return <h2 className="evaluation-verdict-title" aria-label={text}>{text.split(" ").map((word, index) => <motion.span key={index} aria-hidden="true" initial={reduced ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .28, delay: reduced ? 0 : .13 + index * .045 }}>{word}{" "}</motion.span>)}</h2>;
}

function PlayerRanking({ items, empty }: { items: EvaluatedPlayer[]; empty: string }) {
  if (!items.length) return <p className="evaluation-ranking-empty">{empty}</p>;
  return <div className="evaluation-player-ranking">{items.map(({ entry, value, appeal }, index) => <div key={entry.player.id}><span>{index + 1}</span><TeamCrest team={entry.player.team} teamId={entry.player.team_id} size="sm" /><div><b>{entry.player.name}</b><small>{entry.player.team} · ★ {appeal.rating.toFixed(1)}/5</small></div><strong>{(value ?? 0) > 0 ? "+" : ""}{value}%</strong></div>)}</div>;
}

function DepartmentDialog({ department, config, squad, onClose, onOpenPlayers }: { department: DepartmentScore; config: LeagueConfig; squad: SquadPlayer[]; onClose: () => void; onOpenPlayers: (role?: ClassicRole) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key !== "Tab" || !panelRef.current) return;
      const controls = [...panelRef.current.querySelectorAll<HTMLElement>("button, a[href], [tabindex]:not([tabindex='-1'])")].filter(element => !element.hasAttribute("disabled"));
      if (!controls.length) return;
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls[controls.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) { event.preventDefault(); controls[0].focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [onClose]);
  const players = squad.filter(entry => entry.player.role_classic === department.role);
  const spent = players.reduce((sum, entry) => sum + entry.paidPrice, 0);
  return createPortal(<motion.div className="evaluation-dialog-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <motion.div ref={panelRef} className="evaluation-dialog" role="dialog" aria-modal="true" aria-labelledby="evaluation-dialog-title" layoutId={`evaluation-role-${department.role}`}>
      <div className="evaluation-dialog-top"><span>REPARTO / {department.role}</span><button ref={closeRef} type="button" onClick={onClose} aria-label="Chiudi dettaglio reparto">×</button></div>
      <h2 id="evaluation-dialog-title">{department.name}</h2><p>{department.verdict}</p>
      <div className="evaluation-dialog-metrics"><div><span>Copertura</span><strong>{department.count}/{department.target}</strong></div><div><span>Spesa</span><strong>{spent} cr.</strong></div><div><span>Valutazione</span><strong>{department.count ? `${department.score.toFixed(1)}/5` : "N/D"}</strong></div></div>
      <h3>Perché questa lettura</h3><ul>{department.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
      <h3>Giocatori acquistati</h3>{players.length ? <div className="evaluation-dialog-players">{players.map(entry => <div key={entry.player.id}><EvaluationPlayerMedia team={entry.player.team} teamId={entry.player.team_id} /><span className="evaluation-dialog-player-info"><strong>{entry.player.name}</strong><small>{entry.player.team}</small></span><b>{entry.paidPrice} cr.</b></div>)}</div> : <p className="evaluation-dialog-empty">Nessun acquisto registrato in questo reparto.</p>}
      <div className="evaluation-dialog-actions"><p>{department.action}</p><button type="button" className="primary-action" onClick={() => { onClose(); onOpenPlayers(department.role); }}>Apri il Listone →</button></div>
      {config.mode === "Mantra" && <small className="evaluation-mantra-note">Raggruppamento Classic indicativo: i vincoli Mantra dipendono dal regolamento della lega.</small>}
    </motion.div>
  </motion.div>, document.body);
}

export function SquadEvaluation({ config, squad, onOpenPlayers }: { config: LeagueConfig; squad: SquadPlayer[]; onOpenPlayers: (role?: ClassicRole) => void }) {
  const [selectedRole, setSelectedRole] = useState<ClassicRole | null>(null);
  const [focusedRole, setFocusedRole] = useState<ClassicRole | null>(null);
  const closeDialog = useCallback(() => { setSelectedRole(null); setFocusedRole(null); }, []);
  const totals = squadTotals(squad, config.budget);
  const advice = getAgentAdvice(config, squad);
  const evaluated: EvaluatedPlayer[] = squad.map(entry => ({ entry, appeal: getPlayerAppeal(entry.player, config), value: valueDifference(entry.paidPrice, normalizedFvm(entry.player, config)) }));
  const complete = squad.length >= 25;
  const deals = evaluated.filter(item => (item.value ?? -999) >= SCORING_THRESHOLDS.valuePickMinimumPercent).sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  const overpays = evaluated.filter(item => (item.value ?? 0) < SCORING_THRESHOLDS.budgetRiskMaximumPercent).sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
  const averageScore = evaluated.length ? Math.round(evaluated.reduce((sum, item) => sum + item.appeal.score, 0) / evaluated.length) : 0;
  const averageRating = Math.round(averageScore / 2) / 10;
  const departments = getDepartmentScores(config, squad);
  const { strongest, weakest } = getDepartmentHighlights(departments);
  const requirement = config.goal === "Vincere e umiliare tutti" ? 72 : config.goal === "Arrivare almeno in Top 3" ? 58 : 42;
  const objectiveFit = averageScore >= requirement && overpays.length <= 3;
  const verdictTitle = complete ? objectiveFit ? "La rosa è sulla strada giusta." : "C’è un reparto che frena la squadra." : advice.title;
  const summary = complete ? objectiveFit
    ? `La rosa ha una struttura credibile per ${config.goal}. ${strongest?.name ?? "Il reparto migliore"} è oggi il punto più convincente${strongest ? ` (${strongest.score.toFixed(1)}/5)` : ""}; ${weakest?.name.toLowerCase() ?? "un reparto"} richiede invece più attenzione.`
    : `La rosa è completa, ma per “${config.goal}” la valutazione resta sotto l’obiettivo. ${strongest?.name ?? "Un reparto"} dà una buona base${strongest ? ` (${strongest.score.toFixed(1)}/5)` : ""}, mentre ${weakest?.name.toLowerCase() ?? "un reparto"} è il punto da rivedere.`
    : advice.verdict;
  const objectiveCopy = objectiveFit
    ? `Nel complesso qualità media, distribuzione del budget e profondità sono coerenti con “${config.goal}”. Proteggi gli acquisti riusciti e intervieni dove il rapporto qualità/prezzo è meno convincente.`
    : `${weakest?.verdict ?? "Il reparto più debole è quello da riequilibrare."} Per l’obiettivo “${config.goal}” servono più equilibrio e un’alternativa che alzi il livello senza bruciare il budget residuo.`;
  const nextAction = complete ? weakest?.action ?? "Controlla gli acquisti sopra benchmark prima di concludere." : advice.nextAction;
  const nextRole = complete ? weakest?.role : advice.recommendedRole;
  const selected = departments.find(department => department.role === selectedRole);
  const spentPercentage = config.budget > 0 ? Math.min(100, Math.round(totals.spent / config.budget * 100)) : 0;
  const missing = Math.max(0, 25 - squad.length);

  return <section className="evaluation-v21 evaluation-page" aria-labelledby="evaluation-title">
    <aside className="evaluation-agent-rail" aria-label="Fantagente FANTA007"><AgentAmbientMedia className="evaluation-rail-media" minWidth={1480} /><span className="evaluation-rail-caption">FANTA007 <small>INTELLIGENCE / VALUTAZIONE</small></span></aside>
    <aside className="evaluation-context-rail" aria-label="Sintesi della valutazione"><div className="evaluation-context-inner"><span className="evaluation-kicker">MISSIONE / VERDETTO</span><h2>Quadro rapido</h2><p>{complete ? "Rosa completa" : "Valutazione provvisoria"}</p><div><span>Slot da coprire</span><strong>{missing}</strong></div><div><span>Margine residuo</span><strong>{totals.remaining}<small> cr.</small></strong></div><div><span>Segnale principale</span><b>{complete ? weakest?.name ?? "Rosa completa" : advice.title}</b></div><small>La lettura si aggiorna con ogni acquisto.</small></div></aside>

    <Reveal className="evaluation-entry"><span className="evaluation-kicker">FANTA007 / ROSA INTELLIGENCE</span><h1 id="evaluation-title">Ogni scelta lascia un segno.<br /><em>Ecco il quadro.</em></h1><p>{config.teamName} · {config.mode} · {config.participants} partecipanti</p></Reveal>
    <Reveal className="evaluation-hero" delay={.06}><div className="evaluation-hero-light" aria-hidden="true" /><div className="evaluation-score-panel"><span className="evaluation-kicker">01 / AVANZAMENTO</span><CompletionCard count={squad.length} /><p>{complete ? "Tutti gli slot sono occupati. Ora conta la qualità delle scelte." : "Il giudizio resta provvisorio finché la rosa non è completa."}</p></div><div className="evaluation-verdict-panel"><span className="evaluation-kicker">02 / LETTURA DELL’AGENTE</span><VerdictTitle text={verdictTitle} /><p>{summary}</p><div className="evaluation-verdict-foot"><span>{complete ? "VALUTAZIONE COMPLETA" : "ANALISI IN CORSO"}</span><small>Regole e dati della rosa, nessuna previsione.</small></div></div></Reveal>

    <Reveal className="evaluation-bento" delay={.05}><div className="evaluation-section-head"><span className="evaluation-kicker">03 / BREAKDOWN</span><h2>I numeri che guidano la prossima mossa.</h2></div><div className="evaluation-bento-grid"><div className="evaluation-bento-card evaluation-bento-budget"><span>Budget disponibile</span><strong><Ticker value={totals.remaining} /> <small>cr.</small></strong><p>{totals.spent} investiti su {config.budget}</p><div className="evaluation-budget-meter" role="progressbar" aria-label="Budget investito" aria-valuemin={0} aria-valuemax={config.budget} aria-valuenow={Math.min(totals.spent, config.budget)}><span style={{ width: `${spentPercentage}%` }} /></div></div><div className="evaluation-bento-card"><span>Appetibilità media</span><strong>{evaluated.length ? `${averageRating.toFixed(1)}/5` : "N/D"}</strong><p>{evaluated.length ? `${evaluated.length} ${evaluated.length === 1 ? "profilo valutato" : "profili valutati"}` : "Scegli il primo giocatore"}</p></div><div className="evaluation-bento-card"><span>Slot mancanti</span><strong>{missing}</strong><p>Su 25 posti disponibili</p></div><div className="evaluation-bento-card"><span>Reparto più solido</span><strong className="evaluation-bento-word">{strongest?.name ?? "N/D"}</strong><p>{strongest ? `${strongest.score.toFixed(1)}/5 nella rosa attuale` : "Nessun reparto valutabile"}</p></div></div></Reveal>

    <Reveal className="evaluation-signals" delay={.05}><div className="evaluation-section-head"><span className="evaluation-kicker">04 / SEGNALI</span><h2>Dove guadagni terreno. Dove serve attenzione.</h2></div><div className="evaluation-signal-grid"><article className="evaluation-signal-card" data-tone="positive"><span>PUNTO FORTE</span><h3>{strongest?.name ?? "Segnali in attesa"}</h3><p>{strongest ? `${strongest.count}/${strongest.target} giocatori · ${strongest.score.toFixed(1)}/5` : "Aggiungi un giocatore per leggere il primo segnale di reparto."}</p></article><article className="evaluation-signal-card" data-tone="attention"><span>DA MONITORARE</span><h3>{weakest?.name ?? "Copertura reparti"}</h3><p>{weakest ? `${Math.max(0, weakest.target - weakest.count)} slot mancanti · ${weakest.verdict}` : "I reparti prenderanno forma con i primi acquisti."}</p></article><article className="evaluation-signal-card" data-tone="neutral"><span>PREZZI D’ASTA</span><h3>{overpays.length ? `${overpays.length} da rivedere` : evaluated.length ? "Nessun alert critico" : "Prezzi da valutare"}</h3><p>{deals.length} {deals.length === 1 ? "acquisto" : "acquisti"} sotto il riferimento FVM.</p></article></div></Reveal>

    <Reveal className="evaluation-departments" delay={.05}><div className="evaluation-section-head"><span className="evaluation-kicker">05 / REPARTI</span><h2>Quattro reparti, una rosa.</h2><p>Seleziona una card per vedere giocatori, spesa e motivi della valutazione.</p></div><div className="evaluation-focus-grid" onMouseLeave={() => setFocusedRole(null)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusedRole(null); }}>{departments.map(department => {
      const spent = squad.filter(entry => entry.player.role_classic === department.role).reduce((sum, entry) => sum + entry.paidPrice, 0);
      return <motion.button type="button" layoutId={`evaluation-role-${department.role}`} className="evaluation-focus-card" data-dimmed={focusedRole !== null && focusedRole !== department.role} key={department.role} onMouseEnter={() => setFocusedRole(department.role)} onFocus={() => setFocusedRole(department.role)} onClick={() => setSelectedRole(department.role)} aria-label={`Apri dettaglio ${department.name}`}><span className="evaluation-role-letter">{department.role}</span><span className="evaluation-role-name">{department.name}</span><strong>{department.count}<small> / {department.target}</small></strong><span className="evaluation-role-meter" aria-hidden="true"><span style={{ width: `${Math.min(100, department.count / department.target * 100)}%` }} /></span><span className="evaluation-role-footer"><small>{spent} cr. investiti</small><b>{department.count ? `${department.score.toFixed(1)}/5` : "N/D"}</b></span><span className="evaluation-role-open">ESPLORA ↗</span></motion.button>;
    })}</div>{config.mode === "Mantra" && <p className="evaluation-mantra-note">Raggruppamento Classic indicativo: i vincoli Mantra dipendono dal regolamento della tua lega.</p>}</Reveal>

    <Reveal className="evaluation-budget-section" delay={.05}><div className="evaluation-section-head"><span className="evaluation-kicker">06 / EQUILIBRIO</span><h2>I crediti raccontano le priorità.</h2></div><BudgetAllocation config={config} squad={squad} /><div className="evaluation-budget-context"><div><span>Ritmo di spesa</span><strong>{totals.usedPercentage}%</strong><p>Budget investito</p></div><div><span>Rosa completata</span><strong>{Math.round(squad.length / 25 * 100)}%</strong><p>Slot occupati</p></div><p>Le due percentuali descrivono grandezze diverse: spesa sul budget e posti coperti. Leggile insieme, senza trattarle come un voto.</p></div></Reveal>

    {complete && <Reveal className="evaluation-objective" delay={.05}><span className="evaluation-kicker">07 / OBIETTIVO</span><h2>{objectiveFit ? "La rosa è sulla strada giusta." : "C’è un reparto che frena la squadra."}</h2><p>{objectiveCopy}</p><div className="evaluation-deal-grid"><section><h3>Migliori acquisti</h3><PlayerRanking items={deals.slice(0, 4)} empty="Nessun acquisto nettamente sotto il riferimento FVM." /></section><section><h3>Acquisti da rivedere</h3><PlayerRanking items={overpays.slice(0, 4)} empty="Nessun sovrapprezzo critico." /></section></div></Reveal>}
    <Reveal className="evaluation-next" delay={.05}><div><span className="evaluation-kicker">{complete ? "08" : "07"} / PROSSIMA MOSSA</span><h2>{nextAction}</h2><p>{complete ? "Parti dal reparto meno solido e confronta alternative nel Listone." : "Il Fantagente aggiornerà questa lettura quando registri altri acquisti."}</p><button className="primary-action" type="button" onClick={() => onOpenPlayers(nextRole)}>Apri il Listone →</button></div><span className="evaluation-next-mark" aria-hidden="true">007</span></Reveal>
    <AnimatePresence>{selected && <DepartmentDialog key={selected.role} department={selected} config={config} squad={squad} onClose={closeDialog} onOpenPlayers={onOpenPlayers} />}</AnimatePresence>
  </section>;
}
