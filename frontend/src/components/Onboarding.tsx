import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { LeagueConfig, LeagueGoal, LeagueMode } from "../types";
import { BrandLogo } from "./BrandLogo";
import { AgentIllustration } from "./AgentIllustration";

type Props = { onCancel: () => void; onComplete: (config: LeagueConfig) => void; initialConfig?: LeagueConfig | null; editing?: boolean };
const modes: LeagueMode[] = ["Classic", "Mantra", "Classic con Trequartisti"];
const goals: LeagueGoal[] = ["Vincere e umiliare tutti", "Arrivare almeno in Top 3", "Fare una stagione dignitosa", "Non arrivare ultimo"];
const goalLabels: Record<LeagueGoal, string> = {
  "Vincere e umiliare tutti": "Voglio vincere",
  "Arrivare almeno in Top 3": "Puntare al podio",
  "Fare una stagione dignitosa": "Fare una buona stagione",
  "Non arrivare ultimo": "Evitare l’ultimo posto",
};
const goalDescriptions: Record<LeagueGoal, string> = {
  "Vincere e umiliare tutti": "Massimizzare ogni scelta",
  "Arrivare almeno in Top 3": "Costruire una rosa competitiva",
  "Fare una stagione dignitosa": "Giocare con equilibrio",
  "Non arrivare ultimo": "Proteggere il margine",
};
const modeDescriptions: Record<LeagueMode, string> = {
  Classic: "Ruoli e rosa Classic",
  Mantra: "Vincoli di ruolo Mantra",
  "Classic con Trequartisti": "Classic con il trequartista",
};
const stepCount = 5;
const stepLabels = ["Squadra", "Partecipanti", "Regole", "Budget", "Obiettivo"] as const;
const stepSignals = [
  "Identità della missione",
  "Contesto dell’asta",
  "Sistema di gioco",
  "Margine operativo",
  "Direzione stagionale",
] as const;
const budgetSliderMin = 25;
const budgetSliderMax = 2000;
const stepVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 22 : -22 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -14 : 14 }),
};

export function Onboarding({ onCancel, onComplete, initialConfig, editing = false }: Props) {
  const [step, setStep] = useState(0);
  const [stepDirection, setStepDirection] = useState(1);
  const reducedMotion = useReducedMotion();
  const stepRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (step > 0) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [step]);
  const [draft, setDraft] = useState<LeagueConfig>(initialConfig ?? { teamName: "", participants: 8, mode: "Classic", budget: 500, goal: "Vincere e umiliare tutti" });
  const teamNameValid = draft.teamName.trim().length >= 2 && draft.teamName.trim().length <= 40;
  const participantsValid = Number.isSafeInteger(draft.participants) && draft.participants >= 2 && draft.participants <= 100;
  const budgetValid = Number.isSafeInteger(draft.budget) && draft.budget >= 25 && draft.budget <= 100000;
  const valid = teamNameValid && participantsValid && budgetValid;
  const stepValid = step === 0 ? teamNameValid : step === 1 ? participantsValid : step === 3 ? budgetValid : true;
  const budgetSliderValue = Math.min(budgetSliderMax, Math.max(budgetSliderMin, draft.budget || budgetSliderMin));
  const budgetProgress = ((budgetSliderValue - budgetSliderMin) / (budgetSliderMax - budgetSliderMin)) * 100;

  function goToStep(nextStep: number) {
    setStepDirection(nextStep >= step ? 1 : -1);
    setStep(nextStep);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!stepValid) return;
    if (step === stepCount - 1) {
      if (valid) onComplete({ ...draft, teamName: draft.teamName.trim() });
      return;
    }
    goToStep(step + 1);
  }
  function goBack() {
    if (step === 0) onCancel();
    else goToStep(step - 1);
  }

  const showCompanion = step === 0 || step === 3 || step === 4;

  return <main className="studio-setup onboarding-shell" data-step={step + 1}><header className="welcome-header onboarding-topbar"><BrandLogo compact withoutTagline /><button className="text-action" onClick={goBack}>{step === 0 ? editing ? "← Torna alla Home" : "← Torna alla landing" : "← Passaggio precedente"}</button></header><ol className="club-setup-stages" aria-label="Passaggi di configurazione">{stepLabels.map((label, index) => { const state = index < step ? "complete" : index === step ? "current" : "upcoming"; return <li key={label} data-state={state} aria-current={step === index ? "step" : undefined} className={step > index ? "done" : ""}><button type="button" disabled={index > step} aria-label={`${label}: ${state === "complete" ? "completato, modifica passaggio" : state === "current" ? "passaggio attuale" : "passaggio successivo"}`} onClick={() => goToStep(index)}><span aria-hidden="true">{index < step ? "✓" : index + 1}</span><span>{label}</span></button></li>; })}</ol><p className="setup-mobile-stage" aria-live="polite">Passaggio {step + 1} di {stepCount} · <strong>{stepLabels[step]}</strong></p><div className="setup-layout">
    <section className="setup-intro"><div className="setup-intro-copy"><span className="setup-kicker">Setup missione · {String(step + 1).padStart(2, "0")}</span><h2>La tua rosa.<br /><em>Le tue regole.</em></h2><p>Definisci il contesto una volta. FANTA007 userà questi parametri per rendere prezzi, budget e consigli realmente leggibili.</p></div><div className="setup-summary"><div className="setup-summary-heading"><div><span>Configurazione live</span><h3>{draft.teamName.trim() || "La tua squadra"}</h3></div><strong>{Math.round(((step + 1) / stepCount) * 100)}%</strong></div><dl><div><dt>Budget</dt><dd>{Number.isFinite(draft.budget) ? draft.budget : "—"}<small> crediti</small></dd></div><div><dt>Partecipanti</dt><dd>{Number.isFinite(draft.participants) ? draft.participants : "—"}</dd></div><div><dt>Regole</dt><dd>{draft.mode}</dd></div><div><dt>Missione</dt><dd>{goalLabels[draft.goal]}</dd></div></dl><div className="setup-roster-note"><span aria-hidden="true" /><p>{draft.mode === "Mantra" ? "25 posti totali. I vincoli specifici Mantra restano quelli della tua lega." : "25 posti · 3 P · 8 D · 8 C · 6 A"}</p></div>{showCompanion && <AgentIllustration variant="companion" decorative className="club-setup-agent" sizes="(max-width: 900px) 0px, 180px" />}</div><small>Dati salvati solo su questo dispositivo</small></section>
    <form className="setup-form" onSubmit={submit}><header className="setup-form-heading"><div><span>{stepSignals[step]}</span><h2>{editing ? "Aggiorna la configurazione" : "Configura la tua lega"}</h2><p>Un passaggio alla volta. Puoi tornare sugli step già completati.</p></div><span className="setup-step-count" aria-live="polite"><b>{String(step + 1).padStart(2, "0")}</b> / 0{stepCount}</span></header><div className="setup-progress" role="progressbar" aria-label={`Configurazione: passaggio ${step + 1} di ${stepCount}`} aria-valuemin={1} aria-valuemax={stepCount} aria-valuenow={step + 1}><span style={{ width: `${((step + 1) / stepCount) * 100}%` }} /></div><AnimatePresence initial={false} mode="wait" custom={stepDirection}><motion.section ref={stepRef} tabIndex={-1} key={step} custom={stepDirection} variants={stepVariants} initial={reducedMotion ? false : "enter"} animate="center" exit={reducedMotion ? undefined : "exit"} onAnimationComplete={() => stepRef.current?.focus({ preventScroll: true })} transition={{ duration: reducedMotion ? 0 : .24, ease: [.22, 1, .36, 1] }} className="setup-step onboarding-step" aria-label={`Passaggio ${step + 1} di ${stepCount}`}>
      {step === 0 && <><h1>Come si chiama la tua squadra?</h1><p>Un nome chiaro rende leggibile ogni decisione.</p><label className="setup-field">Nome della squadra<input required minLength={2} maxLength={40} value={draft.teamName} onChange={event => setDraft({ ...draft, teamName: event.target.value })} placeholder="Es. Operazione Scudetto" autoComplete="off" /></label></>}
      {step === 1 && <><h1>Quanti partecipanti ci sono?</h1><p>Il numero di avversari cambia il contesto dell’asta.</p><div className="choice-grid compact" aria-label="Numero di partecipanti">{[4, 6, 8, 10, 12].map(value => <button type="button" key={value} className={draft.participants === value ? "selected" : ""} aria-pressed={draft.participants === value} onClick={() => setDraft({ ...draft, participants: value })}>{value}</button>)}</div><label className="custom-field">Altro numero<input required type="number" min={2} max={100} step={1} value={draft.participants || ""} onChange={event => setDraft({ ...draft, participants: Number(event.target.value) })} /></label></>}
      {step === 2 && <><h1>Che tipo di Fantacalcio giocate?</h1><p>Conserveremo separati i ruoli Classic e Mantra.</p><div className="choice-grid vertical" aria-label="Modalità di gioco">{modes.map(mode => <button type="button" key={mode} className={draft.mode === mode ? "selected" : ""} aria-pressed={draft.mode === mode} onClick={() => setDraft({ ...draft, mode })}><strong>{mode}</strong><span>{modeDescriptions[mode]}</span></button>)}</div></>}
      {step === 3 && <><h1>Qual è il budget operativo?</h1><p id="budget-help">Il FVM verrà letto nel contesto del budget reale della tua lega.</p><label className="budget-control" htmlFor="budget-slider"><span>Budget iniziale <output htmlFor="budget-slider">{draft.budget.toLocaleString("it-IT")} <small>cr.</small></output></span><input id="budget-slider" type="range" min={budgetSliderMin} max={budgetSliderMax} step={25} value={budgetSliderValue} aria-describedby="budget-help budget-range-note" onChange={event => setDraft({ ...draft, budget: Number(event.target.value) })} style={{ "--budget-progress": `${budgetProgress}%` } as CSSProperties} /><span className="budget-scale" aria-hidden="true"><span>25</span><span>500</span><span>1.000</span><span>2.000</span></span></label><div className="choice-grid compact budget-presets" aria-label="Budget consigliati">{[250, 500, 1000].map(value => <button type="button" key={value} className={draft.budget === value ? "selected" : ""} aria-label={`${value} crediti`} aria-pressed={draft.budget === value} onClick={() => setDraft({ ...draft, budget: value })}>{value}</button>)}</div><label className="custom-field" htmlFor="budget-custom">Budget personalizzato<input id="budget-custom" required type="number" inputMode="numeric" min={25} max={100000} step={1} value={draft.budget || ""} aria-describedby="budget-range-note" onChange={event => setDraft({ ...draft, budget: Number(event.target.value) })} /></label><small id="budget-range-note" className="budget-range-note">Il cursore copre i budget più comuni fino a 2.000 crediti; il campo personalizzato resta disponibile fino a 100.000.</small></>}
      {step === 4 && <><h1>Qual è il tuo obiettivo?</h1><p>Orienterà la lettura dei dati senza modificare quotazioni o statistiche.</p><div className="choice-grid vertical goals" aria-label="Obiettivo stagionale">{goals.map(goal => <button type="button" key={goal} className={draft.goal === goal ? "selected" : ""} aria-pressed={draft.goal === goal} onClick={() => setDraft({ ...draft, goal })}><strong>{goalLabels[goal]}</strong><span>{goalDescriptions[goal]}</span></button>)}</div></>}
    </motion.section></AnimatePresence><div className="setup-form-actions">{step > 0 && <button type="button" className="secondary-action" onClick={() => goToStep(step - 1)}>Indietro</button>}<button className="primary-action" disabled={!stepValid} type="submit">{step === stepCount - 1 ? editing ? "Salva le impostazioni" : "Avvia la missione" : "Continua"} →</button></div>{!stepValid && <small className="setup-validation" role="status">{step === 0 ? "Inserisci un nome di almeno 2 caratteri." : step === 1 ? "Scegli un numero intero tra 2 e 100." : "Inserisci un budget intero tra 25 e 100000 crediti."}</small>}</form>
  </div></main>;
}
