import { useEffect, useRef, useState, type FormEvent } from "react";
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

export function Onboarding({ onCancel, onComplete, initialConfig, editing = false }: Props) {
  const [step, setStep] = useState(0);
  const stepRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (step > 0) stepRef.current?.focus({ preventScroll: true });
  }, [step]);
  const [draft, setDraft] = useState<LeagueConfig>(initialConfig ?? { teamName: "", participants: 8, mode: "Classic", budget: 500, goal: "Vincere e umiliare tutti" });
  const teamNameValid = draft.teamName.trim().length >= 2 && draft.teamName.trim().length <= 40;
  const participantsValid = Number.isSafeInteger(draft.participants) && draft.participants >= 2 && draft.participants <= 100;
  const budgetValid = Number.isSafeInteger(draft.budget) && draft.budget >= 25 && draft.budget <= 100000;
  const valid = teamNameValid && participantsValid && budgetValid;
  const stepValid = step === 0 ? teamNameValid : step === 1 ? participantsValid : step === 3 ? budgetValid : true;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!stepValid) return;
    if (step === stepCount - 1) {
      if (valid) onComplete({ ...draft, teamName: draft.teamName.trim() });
      return;
    }
    setStep((current) => current + 1);
  }
  function goBack() {
    if (step === 0) onCancel();
    else setStep((current) => current - 1);
  }

  return <main className="studio-setup"><header className="welcome-header"><BrandLogo compact /><button className="text-action" onClick={goBack}>{step === 0 ? "← Indietro" : "← Passaggio precedente"}</button></header><ol className="club-setup-stages" aria-label="Passaggi di configurazione">{["Squadra", "Partecipanti", "Regole", "Budget", "Obiettivo"].map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined} className={step > index ? "done" : ""}><button type="button" disabled={index > step} aria-label={`${label}${index < step ? ": modifica passaggio completato" : ""}`} onClick={() => setStep(index)}><span aria-hidden="true">{index + 1}</span><span>{label}</span></button></li>)}</ol><div className="setup-layout">
    <section className="setup-intro"><h1>La tua rosa.<br /><em>Le tue regole.</em></h1><p>Partiamo dalla lega. Queste impostazioni danno un contesto ai prezzi e alla costruzione della rosa.</p><div className="setup-summary"><h2>{draft.teamName.trim() || "La tua squadra"}</h2><dl><div><dt>Budget iniziale</dt><dd>{Number.isFinite(draft.budget) ? draft.budget : "—"}<small> crediti</small></dd></div><div><dt>Partecipanti</dt><dd>{Number.isFinite(draft.participants) ? draft.participants : "—"}</dd></div><div><dt>Regolamento</dt><dd>{draft.mode}</dd></div><div><dt>Obiettivo</dt><dd>{goalLabels[draft.goal]}</dd></div></dl><p>{draft.mode === "Mantra" ? "25 posti totali. I vincoli specifici di ruolo Mantra dipendono dalla tua lega." : "25 posti: 3 portieri, 8 difensori, 8 centrocampisti e 6 attaccanti."}</p></div><small>Salvataggio su questo dispositivo. Nessun profilo pubblico.</small></section>
    <form className="setup-form" onSubmit={submit}><header className="setup-form-heading"><div><h2>{editing ? "Aggiorna la configurazione" : "Configura la tua lega"}</h2><p>Un passaggio alla volta, poi sei pronto a costruire la rosa.</p></div><span className="setup-step-count" aria-live="polite">{step + 1} di {stepCount}</span></header><div className="setup-progress" role="progressbar" aria-label={`Configurazione: passaggio ${step + 1} di ${stepCount}`} aria-valuemin={1} aria-valuemax={stepCount} aria-valuenow={step + 1}><span style={{ width: `${((step + 1) / stepCount) * 100}%` }} /></div><section ref={stepRef} tabIndex={-1} key={step} className="setup-step" aria-label={`Passaggio ${step + 1} di ${stepCount}`}>
      {step === 0 && <><h1>Come si chiama la tua squadra?</h1><p>Un nome chiaro rende leggibile ogni decisione.</p><label className="setup-field">Nome della squadra<input autoFocus required minLength={2} maxLength={40} value={draft.teamName} onChange={event => setDraft({ ...draft, teamName: event.target.value })} placeholder="Es. Operazione Scudetto" autoComplete="off" /></label></>}
      {step === 1 && <><h1>Quanti partecipanti ci sono?</h1><p>Il numero di avversari cambia il contesto dell’asta.</p><div className="choice-grid compact" aria-label="Numero di partecipanti">{[4, 6, 8, 10, 12].map(value => <button type="button" key={value} className={draft.participants === value ? "selected" : ""} aria-pressed={draft.participants === value} onClick={() => setDraft({ ...draft, participants: value })}>{value}</button>)}</div><label className="custom-field">Altro numero<input required type="number" min={2} max={100} step={1} value={draft.participants || ""} onChange={event => setDraft({ ...draft, participants: Number(event.target.value) })} /></label></>}
      {step === 2 && <><h1>Che tipo di Fantacalcio giocate?</h1><p>Conserveremo separati i ruoli Classic e Mantra.</p><div className="choice-grid vertical" aria-label="Modalità di gioco">{modes.map(mode => <button type="button" key={mode} className={draft.mode === mode ? "selected" : ""} aria-pressed={draft.mode === mode} onClick={() => setDraft({ ...draft, mode })}><strong>{mode}</strong><span>{modeDescriptions[mode]}</span></button>)}</div></>}
      {step === 3 && <><h1>Qual è il budget operativo?</h1><p>Il FVM verrà letto nel contesto del budget reale della tua lega.</p><div className="choice-grid compact" aria-label="Budget iniziale">{[250, 500, 1000].map(value => <button type="button" key={value} className={draft.budget === value ? "selected" : ""} aria-pressed={draft.budget === value} onClick={() => setDraft({ ...draft, budget: value })}>{value}</button>)}</div><label className="custom-field">Budget personalizzato<input required type="number" min={25} max={100000} step={1} value={draft.budget || ""} onChange={event => setDraft({ ...draft, budget: Number(event.target.value) })} /></label></>}
      {step === 4 && <><h1>Qual è il tuo obiettivo?</h1><p>Orienterà la lettura dei dati senza modificare quotazioni o statistiche.</p><div className="choice-grid vertical goals" aria-label="Obiettivo stagionale">{goals.map(goal => <button type="button" key={goal} className={draft.goal === goal ? "selected" : ""} aria-pressed={draft.goal === goal} onClick={() => setDraft({ ...draft, goal })}><strong>{goalLabels[goal]}</strong><span>{goalDescriptions[goal]}</span></button>)}</div></>}
    </section><div className="setup-form-actions">{step > 0 && <button type="button" className="secondary-action" onClick={() => setStep(current => current - 1)}>Indietro</button>}<button className="primary-action" disabled={!stepValid} type="submit">{step === stepCount - 1 ? editing ? "Salva le impostazioni" : "Crea la tua squadra" : "Continua"} →</button></div>{!stepValid && <small className="setup-validation">{step === 0 ? "Inserisci un nome di almeno 2 caratteri." : step === 1 ? "Scegli un numero intero tra 2 e 100." : "Inserisci un budget intero tra 25 e 100000 crediti."}</small>}<AgentIllustration variant={step === 4 ? "positive" : "thinking"} decorative className="club-setup-agent" sizes="120px" /></form>
  </div></main>;
}
