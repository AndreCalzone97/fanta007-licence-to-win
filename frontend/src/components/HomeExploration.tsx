import { useState } from "react";
import type { ClassicRole, LeagueConfig, SquadPlayer } from "../types";
import { getAgentAdvice } from "../lib/advice";
import { getPlayerAppeal } from "../lib/appeal";
import { normalizedFvm, ROLE_TARGETS, SQUAD_SIZE, safeMaximumBid, squadTotals } from "../lib/squad";
import { AgentIllustration } from "./AgentIllustration";
import { TeamCrest } from "./TeamCrest";
import { EncryptedText, InViewGroup, InViewItem, MovingBorder, TextEffect, TextMorph, moveSpotlight } from "./HomeLabEffects";
import { HomeIntelligenceRails } from "./HomeIntelligenceRails";
import "../styles/home-exploration.css";

const roles: ClassicRole[] = ["P", "D", "C", "A"];
const roleNames: Record<ClassicRole, string> = { P: "Portieri", D: "Difensori", C: "Centrocampisti", A: "Attaccanti" };

type Props = {
  config: LeagueConfig;
  squad: SquadPlayer[];
  onOpenPlayers: (role?: ClassicRole) => void;
  onOpenSquad: () => void;
  onOpenDossier: (entry: SquadPlayer) => void;
};

export function HomeExploration({ config, squad, onOpenPlayers, onOpenSquad, onOpenDossier }: Props) {
  const [whyOpen, setWhyOpen] = useState(false);
  const totals = squadTotals(squad, config.budget);
  const slots = Math.max(0, SQUAD_SIZE - squad.length);
  const safeBid = slots ? safeMaximumBid(squad, config.budget) : null;
  const advice = getAgentAdvice(config, squad);
  const avgAppeal = squad.length ? (squad.reduce((sum, entry) => sum + getPlayerAppeal(entry.player, config).rating, 0) / squad.length).toFixed(1) : null;
  const perSlot = slots ? Math.floor(totals.remaining / slots) : null;
  const recent = [...squad].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 3);
  const priorityRole = advice.recommendedRole;

  return <section className="home-lab" aria-labelledby="home-lab-title">
    <HomeIntelligenceRails />
    <header className="home-lab-intro" data-reference="Spotlight New / Background Beams">
      <div className="home-lab-atmosphere" aria-hidden="true"><svg className="home-lab-beams" viewBox="0 0 1200 220" preserveAspectRatio="none"><path d="M0 154 C240 177 315 33 610 75 S990 202 1200 46" /><path d="M0 200 C290 120 450 206 705 125 S1045 50 1200 148" /></svg></div>
      <div className="home-lab-intro-copy"><p className="home-lab-kicker"><TextEffect text="CENTRO DI COMANDO" /> · {config.mode.toUpperCase()}</p><h1 id="home-lab-title">La tua asta, sotto controllo.</h1><p>Budget, copertura e prossima decisione: il quadro essenziale della tua rosa.</p><button className="home-lab-primary" onClick={() => slots ? onOpenPlayers(priorityRole) : onOpenSquad()}>{slots ? "Esplora il Listone" : "Rivedi la rosa"}<span aria-hidden="true"> ↗</span></button></div>
      <aside className="home-lab-terminal" aria-label="Feed operativo FANTA007" data-reference="Aceternity Terminal">
        <div className="home-lab-terminal-head"><span>FEED / 007</span><span aria-hidden="true">●</span></div>
        <dl><div><dt>ROSA</dt><dd>{slots === SQUAD_SIZE ? "DA INIZIARE" : slots ? "IN CORSO" : "COMPLETA"}</dd></div><div><dt>GIOCATORI</dt><dd>{squad.length} / {SQUAD_SIZE}</dd></div><div><dt>MARGINE</dt><dd>{totals.remaining} CR.</dd></div></dl>
      </aside>
    </header>

    <div className="home-lab-grid" data-reference="Kokonut Bento Grid">
      <section className="home-lab-card home-lab-metric glass-surface-base" aria-labelledby="home-lab-budget" data-reference="Progress Metric Card / HyperUI Progress Bars">
        <div className="home-lab-card-heading"><span className="home-lab-pattern">IL TUO MARGINE</span><span className="home-lab-state">{slots ? "ASTA IN CORSO" : "ROSA COMPLETA"}</span></div>
        <div className="home-lab-metric-main"><div><p className="home-lab-label" id="home-lab-budget">Budget disponibile</p><p className="home-lab-hero-value">{totals.remaining}<span> crediti</span></p><p className="home-lab-soft">{totals.spent} investiti su {config.budget}</p></div><div className="home-lab-bid"><span>Massimo prossimo acquisto</span><strong>{safeBid ?? "—"}</strong><small>{safeBid === null ? "Nessuno slot libero" : "tetto matematico: 1 credito riservato agli altri slot"}</small></div></div>
        <div className="home-lab-progress-set"><div><span><b>Completamento rosa</b><b>{squad.length}/{SQUAD_SIZE}</b></span><progress value={squad.length} max={SQUAD_SIZE} aria-label="Completamento della rosa" /></div><div><span><b>Budget investito</b><b>{totals.usedPercentage}%</b></span><progress value={Math.max(0, Math.min(100, totals.usedPercentage))} max="100" aria-label="Percentuale di budget investito" /></div></div>
        <p className="home-lab-note">Due progressi reali, senza simulare uno storico di spesa.</p>
      </section>

      <section className="home-lab-card home-lab-tracker glass-surface-spotlight" aria-labelledby="home-lab-next" data-reference="Moving Border / Encrypted Text">
        <MovingBorder />
        <div className="home-lab-card-heading"><span className="home-lab-pattern">IL CONSIGLIO DEL FANTAGENTE</span><span className="home-lab-signal">{advice.type === "ADVICE" ? <EncryptedText text="PROSSIMA MOSSA" /> : "ATTENZIONE"}</span></div>
        <div className="home-lab-tracker-body"><div><p className="home-lab-label" id="home-lab-next">La prossima decisione</p><h2>{advice.title}</h2><p>{advice.verdict}</p></div><AgentIllustration variant="companion" decorative className="home-lab-agent" sizes="(max-width: 700px) 80px, 112px" /></div>
        <div className="home-lab-tracker-action"><span>AZIONE CONSIGLIATA</span><p>{advice.nextAction}</p><button onClick={() => slots ? onOpenPlayers(priorityRole) : onOpenSquad()}>{slots ? "Confronta i profili" : "Apri la rosa"}<span aria-hidden="true"> →</span></button></div>
        <details className="home-lab-why" onToggle={event => setWhyOpen(event.currentTarget.open)}><summary>Perché FANTA007 lo suggerisce?<span className="home-lab-why-state"><TextMorph text={whyOpen ? "CHIUDI" : "APRI"} /></span></summary><ul>{advice.evidence.map(item => <li key={item}>{item}</li>)}</ul><p>{advice.threshold}</p></details>
      </section>

      <section className="home-lab-card home-lab-roles glass-surface-base" aria-labelledby="home-lab-roles-title" data-reference="Kokonut Spotlight Cards / Animated Group / In View">
        <div className="home-lab-card-heading"><span className="home-lab-pattern">COPERTURA DELLA ROSA</span><span className="home-lab-state">PER REPARTO</span></div>
        <div className="home-lab-section-title"><div><h2 id="home-lab-roles-title">La rosa per reparti</h2><p>La priorità indicata segue il consiglio già calcolato.</p></div><button className="home-lab-text-button" onClick={onOpenSquad}>Apri la rosa →</button></div>
        <InViewGroup className="home-lab-role-list">{roles.map(role => {
          const count = totals.byRole[role];
          const target = ROLE_TARGETS[role];
          return <InViewItem key={role}><button className="home-lab-role" onPointerMove={moveSpotlight} onClick={() => onOpenPlayers(role)}>
            <span className="home-lab-role-name"><b>{role}</b><span>{roleNames[role]}</span>{priorityRole === role && <em>Priorità</em>}</span>
            <span className="home-lab-role-count">{count}<small>{config.mode === "Mantra" ? "" : ` / ${target}`}</small></span>
            <span className="home-lab-role-track" aria-hidden="true"><span style={{ width: `${Math.min(100, count / target * 100)}%` }} /></span>
          </button></InViewItem>;
        })}</InViewGroup>
        {config.mode === "Mantra" && <p className="home-lab-note">Distribuzione Classic indicativa: i vincoli Mantra dipendono dalla tua lega.</p>}
      </section>

      <section className="home-lab-card home-lab-stats glass-surface-base" aria-labelledby="home-lab-stats-title" data-reference="HyperUI Stats">
        <div className="home-lab-card-heading"><span className="home-lab-pattern">INDICATORI DI SUPPORTO</span><span className="home-lab-state">DATI ATTUALI</span></div>
        <h2 id="home-lab-stats-title">Numeri da tenere d’occhio</h2>
        <div className="home-lab-stats-grid">
          <div><span>Appetibilità media</span><strong>{avgAppeal ? `${avgAppeal}/5` : "N/D"}</strong><small>{avgAppeal ? "Giocatori già acquistati" : "Disponibile dopo il primo acquisto"}</small></div>
          <div><span>Crediti per slot libero</span><strong>{perSlot ?? "—"}</strong><small>{slots ? "Media teorica sul residuo" : "Rosa completa"}</small></div>
          <div><span>Posti da completare</span><strong>{slots}</strong><small>Su {SQUAD_SIZE} totali</small></div>
          <div><span>Spesa effettuata</span><strong>{totals.usedPercentage}%</strong><small>{totals.spent} di {config.budget} crediti</small></div>
        </div>
      </section>

      <section className="home-lab-card home-lab-diagram glass-surface-base" aria-labelledby="home-lab-diagram-title">
        <div className="home-lab-card-heading"><span className="home-lab-pattern">LA LOGICA DELLA SCELTA</span><span className="home-lab-state">COME SI ARRIVA ALLA MOSSA</span></div>
        <h2 id="home-lab-diagram-title">Dai numeri alla decisione</h2>
        <ol className="home-lab-flow">
          <li><span>01 · BUDGET</span><strong>{totals.remaining} cr.</strong><small>disponibili ora</small></li>
          <li><span>02 · SLOT</span><strong>{slots}</strong><small>ancora liberi</small></li>
          <li><span>03 · TETTO</span><strong>{safeBid ?? "—"}{safeBid === null ? "" : " cr."}</strong><small>massimo matematico</small></li>
          <li><span>04 · SCELTA</span><strong>{advice.title}</strong><small>regola già applicata</small></li>
        </ol>
        <p className="home-lab-note">Il tetto riserva almeno 1 credito per ogni altro posto. Il consiglio usa le regole e i dati già presenti.</p>
      </section>

      <section className="home-lab-card home-lab-recent glass-surface-base" aria-labelledby="home-lab-recent-title">
        <div className="home-lab-section-title"><div><p className="home-lab-kicker">DETTAGLIO</p><h2 id="home-lab-recent-title">Ultimi acquisti</h2></div><button className="home-lab-text-button" onClick={onOpenSquad}>Tutti →</button></div>
        {recent.length ? <div className="home-lab-recent-list">{recent.map(entry => <button key={entry.player.id} onClick={() => onOpenDossier(entry)}><TeamCrest team={entry.player.team} teamId={entry.player.team_id} size="sm" /><span><b>{entry.player.name}</b><small>{entry.player.team} · {entry.player.role_classic}</small></span><strong>{entry.paidPrice}<small> / {normalizedFvm(entry.player, config)} FVM</small></strong><span aria-hidden="true">›</span></button>)}</div> : <p className="home-lab-empty">Nessun acquisto registrato. Il Listone è pronto per il primo confronto.</p>}
      </section>
    </div>
    <p className="home-lab-disclaimer">Indicazioni basate su regole, budget e dati disponibili. Nessuna previsione sulle prossime partite.</p>
  </section>;
}
