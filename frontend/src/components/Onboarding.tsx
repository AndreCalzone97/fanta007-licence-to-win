import { useMemo, useState } from "react";
import type { LeagueConfig, LeagueGoal, LeagueMode } from "../types";
import { BrandLogo } from "./BrandLogo";

type Props = { onCancel: () => void; onComplete: (config: LeagueConfig) => void; initialConfig?: LeagueConfig | null; editing?: boolean };

const modes: LeagueMode[] = ["Classic", "Mantra", "Classic con Trequartisti"];
const goals: Array<{ value: LeagueGoal; emoji: string }> = [
  { value: "Vincere e umiliare tutti", emoji: "😈" },
  { value: "Arrivare almeno in Top 3", emoji: "🏆" },
  { value: "Fare una stagione dignitosa", emoji: "😎" },
  { value: "Non arrivare ultimo", emoji: "🙏" },
];

export function Onboarding({ onCancel, onComplete, initialConfig, editing = false }: Props) {
  const [step, setStep] = useState(0);
  const [motion, setMotion] = useState<"idle" | "exit" | "enter">("idle");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [draft, setDraft] = useState<LeagueConfig>(initialConfig ?? { teamName: "", participants: 8, mode: "Classic", budget: 500, goal: "Vincere e umiliare tutti" });
  const valid = useMemo(() => step === 0 ? draft.teamName.trim().length >= 2 : step === 1 ? draft.participants >= 2 && draft.participants <= 100 : step === 3 ? draft.budget >= 10 && draft.budget <= 100000 : true, [draft, step]);

  function next() {
    if (!valid) return;
    if (step === 4) onComplete({ ...draft, teamName: draft.teamName.trim() });
    else move(step + 1, "forward");
  }

  function move(nextStep: number, nextDirection: "forward" | "back") {
    if (motion === "exit") return;
    setDirection(nextDirection);
    setMotion("exit");
    window.setTimeout(() => {
      setStep(nextStep);
      setMotion("enter");
      window.setTimeout(() => setMotion("idle"), 260);
    }, 150);
  }

  return (
    <main className="briefing-shell">
      <header className="briefing-topbar">
        <button className="text-button" onClick={step ? () => move(step - 1, "back") : onCancel}>← Indietro</button>
        <BrandLogo compact />
        <span className="step-count">{step + 1} / 5</span>
      </header>
      <div className="progress"><span style={{ width: `${((step + 1) / 5) * 100}%` }} /></div>
      <section key={step} className={`question-card onboarding-step is-${motion} direction-${direction}`}>
        <p className="eyebrow">{editing ? "MODIFICA CONFIGURAZIONE" : "MISSION BRIEFING"}</p>
        {step === 0 && <><h1>Come si chiama la tua squadra?</h1><p>Ogni operazione seria ha bisogno di un nome in codice.</p><input className="mission-input" autoFocus value={draft.teamName} onChange={(event) => setDraft({ ...draft, teamName: event.target.value })} onKeyDown={(event) => event.key === "Enter" && next()} placeholder="Es. Operazione Scudetto" maxLength={40} /></>}
        {step === 1 && <><h1>Quanti agenti partecipano alla tua lega?</h1><p>Il numero di avversari cambia il contesto dell’asta.</p><div className="choice-grid compact">{[4, 6, 8, 10, 12].map((value) => <button key={value} className={draft.participants === value ? "selected" : ""} onClick={() => setDraft({ ...draft, participants: value })}>{value}</button>)}</div><label className="custom-field">Altro numero<input type="number" min="2" max="100" value={draft.participants} onChange={(event) => setDraft({ ...draft, participants: Number(event.target.value) })} /></label></>}
        {step === 2 && <><h1>Che tipo di Fantacalcio giocate?</h1><p>Conserveremo separati ruoli Classic e Mantra.</p><div className="choice-grid vertical">{modes.map((mode) => <button key={mode} className={draft.mode === mode ? "selected" : ""} onClick={() => setDraft({ ...draft, mode })}><strong>{mode}</strong><span>Seleziona modalità</span></button>)}</div></>}
        {step === 3 && <><h1>Qual è il budget operativo?</h1><p>Il FVM verrà adattato al budget reale della tua lega.</p><div className="choice-grid compact">{[250, 500, 1000].map((value) => <button key={value} className={draft.budget === value ? "selected" : ""} onClick={() => setDraft({ ...draft, budget: value })}>{value}</button>)}</div><label className="custom-field">Budget personalizzato<input type="number" min="10" max="100000" value={draft.budget} onChange={(event) => setDraft({ ...draft, budget: Number(event.target.value) })} /></label></>}
        {step === 4 && <><h1>Qual è la tua missione?</h1><p>Orienterà l’interpretazione di Fantagente 007, senza manipolare i dati.</p><div className="choice-grid vertical goals">{goals.map(({ value, emoji }) => <button key={value} className={draft.goal === value ? "selected" : ""} onClick={() => setDraft({ ...draft, goal: value })}><b>{emoji}</b><strong>{value}</strong></button>)}</div></>}
        {!valid && <p className="validation">Inserisci un valore valido per continuare.</p>}
        <button className="primary-action" disabled={!valid} onClick={next}>{step === 4 ? editing ? "SALVA MODIFICHE" : "ACCETTA LA MISSIONE" : "CONTINUA"}</button>
      </section>
    </main>
  );
}
