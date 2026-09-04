import { useEffect, useState } from "react";
import { AgentIllustration } from "./components/AgentIllustration";
import { BrandLogo } from "./components/BrandLogo";
import { BottomNavigation } from "./components/BottomNavigation";
import { Onboarding } from "./components/Onboarding";
import { PlayerModal } from "./components/PlayerModal";
import { SettingsDialog } from "./components/SettingsDialog";
import { SquadEvaluation } from "./components/SquadEvaluation";
import { SquadOverview } from "./components/SquadOverview";
import { getAgentAdvice } from "./lib/advice";
import { getDepartmentHighlights, getDepartmentScores } from "./lib/departmentScore";
import { ROLE_TARGETS, squadTotals } from "./lib/squad";
import { MediaReviewPage } from "./pages/MediaReviewPage";
import { PlayersPage } from "./pages/PlayersPage";
import type { AppSection, ClassicRole, LeagueConfig, NavigationSection, SquadPlayer } from "./types";

const LEAGUE_KEY = "fanta007.league.v2";
const SQUAD_KEY = "fanta007.squad.v1";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
type View = "landing" | "briefing" | "accepted" | "dashboard";

function readStorage<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch {
    return null;
  }
}

function Landing({ onStart, onResume }: { onStart: () => void; onResume?: () => void }) {
  return <main className="landing">
    <header className="landing-nav"><BrandLogo /><span>LICENZA DI VINCERE</span></header>
    <section className="landing-hero">
      <div className="landing-copy">
        <p className="eyebrow">FANTAGENTE 007 · PRONTO</p>
        <h1>La tua asta.<br /><em>Sotto controllo.</em></h1>
        <p>Un agente personale per leggere il Listone, proteggere il budget e costruire una rosa all’altezza della missione.</p>
        <div className="landing-actions"><button className="primary-action" onClick={onStart}>INIZIA LA MISSIONE <span>→</span></button>{onResume && <button className="secondary-action" onClick={onResume}>RIPRENDI OPERAZIONE</button>}</div>
        <p className="landing-proof">Listone reale · valutazioni spiegabili · nessun dato inventato</p>
      </div>
      <div className="landing-visual" aria-hidden="true">
        <AgentIllustration variant="hero" className="landing-agent" decorative priority />
        <div className="landing-signal"><span>FANTAGENTE 007</span><b>Missione pronta</b></div>
      </div>
    </section>
  </main>;
}

function MissionHome({ config, squad, onOpenPlayers, onOpenSquad, onOpenDossier, onRemove }: {
  config: LeagueConfig;
  squad: SquadPlayer[];
  onOpenPlayers: (role?: ClassicRole) => void;
  onOpenSquad: () => void;
  onOpenDossier: (entry: SquadPlayer) => void;
  onRemove: (id: number) => void;
}) {
  const totals = squadTotals(squad, config.budget);
  const advice = getAgentAdvice(config, squad);
  const agentVariant = advice.type === "RISK" ? "critical" : advice.type === "WARNING" ? "warning" : squad.length ? "positive" : "thinking";
  const progress = Math.min(100, Math.round(squad.length / 25 * 100));
  const complete = squad.length >= 25;
  const departments = getDepartmentScores(config, squad);
  const { strongest, weakest } = getDepartmentHighlights(departments);
  const adviceState = advice.type === "RISK" ? "Attenzione al budget" : advice.type === "WARNING" ? "Da monitorare" : "Consiglio";
  const nextRole = advice.recommendedRole ? ({ P: "portieri", D: "difensori", C: "centrocampisti", A: "attaccanti" } as Record<ClassicRole, string>)[advice.recommendedRole] : null;

  return <section className="mission-control">
    <header className="mission-header"><div><h1>Bentornato, Agente.</h1><p><b>{config.teamName}</b><span aria-hidden="true"> · </span>{config.goal}</p></div></header>
    <div className="command-deck">
      <article className="mission-map">
        <div className="mission-map-top"><span className="roster-state">{complete ? "Rosa completa" : `${squad.length} giocatori in rosa`}</span><span>{config.mode}</span></div>
        <h2>{complete ? "La rosa è completa. Vediamo dove hai speso meglio." : squad.length ? "La tua rosa sta prendendo forma." : "Partiamo dal primo acquisto."}</h2>
        <p>{complete ? `Hai ancora ${totals.remaining} crediti. Ora puoi leggere il resoconto completo della rosa.` : squad.length ? `Ti mancano ancora ${25 - squad.length} giocatori. Con ${totals.remaining} crediti disponibili, ogni reparto conta.` : `Hai ${config.budget} crediti a disposizione. Cerca un giocatore e confronta il prezzo con il suo FVM.`}</p>
        <div className="mission-progress"><div><span>Completamento rosa</span><b>{squad.length}/25</b></div><i><em style={{ width: `${progress}%` }} /></i></div>
        <div className="mission-kpis"><div><span>Disponibili</span><strong className={totals.remaining < 0 ? "negative" : ""}>{totals.remaining}</strong><small>crediti</small></div><div><span>Investiti</span><strong>{totals.spent}</strong><small>{totals.usedPercentage}% budget</small></div><div><span>Slot liberi</span><strong>{Math.max(0, 25 - squad.length)}</strong><small>su 25</small></div></div>
        <div className="mission-glance" aria-label="Sintesi reparti"><div><span>Punto forte</span><strong>{strongest ? `${strongest.name} · ${strongest.score.toFixed(1)}/5` : "Da scoprire"}</strong></div><div><span>Da rinforzare</span><strong>{weakest ? `${weakest.name} · ${weakest.score.toFixed(1)}/5` : "Inizia dal Listone"}</strong></div></div>
        <div className="mission-actions"><button className="primary-action" onClick={() => onOpenPlayers()}>APRI IL LISTONE →</button><button className="secondary-action" onClick={onOpenSquad}>VEDI LA ROSA</button></div>
      </article>
      <aside className={`agent-command ${advice.type.toLowerCase()}`}>
        <AgentIllustration key={agentVariant} variant={agentVariant} className="command-agent" decorative sizes="(max-width: 820px) 290px, 390px" />
        <div className="agent-message"><span>FANTAGENTE 007 · {adviceState}</span><h3>{advice.title}</h3><p>{advice.verdict}</p><button onClick={() => onOpenPlayers(advice.recommendedRole)}>{nextRole ? `CERCA ${nextRole.toUpperCase()}` : "VEDI IL LISTONE"} →</button></div>
      </aside>
    </div>
    <div className="department-rail">{(["P", "D", "C", "A"] as ClassicRole[]).map((role) => <button key={role} onClick={() => onOpenPlayers(role)}><span>{role}</span><div><b>{({ P: "Portieri", D: "Difensori", C: "Centrocampisti", A: "Attaccanti" } as Record<ClassicRole, string>)[role]}</b><small>{totals.byRole[role]}/{config.mode === "Mantra" ? "—" : ROLE_TARGETS[role]} selezionati</small></div><i>›</i></button>)}</div>
    <SquadOverview title="Ultimi acquisti" previewLimit={4} config={config} squad={squad} onAdd={() => onOpenPlayers()} onOpen={onOpenDossier} onRemove={onRemove} />
  </section>;
}

function Dashboard({ config, squad, onSquadChange, onOpenPlayers, onSettings, settingsOpen, section, onSectionChange }: {
  config: LeagueConfig;
  squad: SquadPlayer[];
  onSquadChange: (squad: SquadPlayer[]) => void;
  onOpenPlayers: (role?: ClassicRole) => void;
  onSettings: () => void;
  settingsOpen: boolean;
  section: AppSection;
  onSectionChange: (section: AppSection) => void;
}) {
  const [dossier, setDossier] = useState<SquadPlayer | null>(null);
  const [removed, setRemoved] = useState<SquadPlayer | null>(null);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [displayedSection, setDisplayedSection] = useState(section);
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "exit" | "enter">("idle");
  useEffect(() => {
    fetch(`${API_BASE_URL}/health`).then((response) => setApiOnline(response.ok)).catch(() => setApiOnline(false));
  }, []);

  useEffect(() => {
    if (section === displayedSection) return;
    setTransitionPhase("exit");
    let finishTimer: number | undefined;
    const exitTimer = window.setTimeout(() => {
      setDisplayedSection(section);
      setTransitionPhase("enter");
      finishTimer = window.setTimeout(() => setTransitionPhase("idle"), 260);
    }, 150);
    return () => { window.clearTimeout(exitTimer); if (finishTimer) window.clearTimeout(finishTimer); };
  }, [section]);

  function removePlayer(id: number) {
    const target = squad.find((entry) => entry.player.id === id) ?? null;
    if (!target) return;
    onSquadChange(squad.filter((entry) => entry.player.id !== id));
    setRemoved(target);
  }

  function undoRemove() {
    if (!removed || squad.some((entry) => entry.player.id === removed.player.id)) return;
    onSquadChange([...squad, removed]);
    setRemoved(null);
  }

  return <main className="app-shell">
    <header className="app-topbar"><BrandLogo compact />{apiOnline === false && <div className="api-status"><span />DATI OFFLINE</div>}</header>
    <BottomNavigation active={section} onNavigate={(target) => target === "listone" ? onOpenPlayers() : onSectionChange(target)} onSettings={onSettings} settingsOpen={settingsOpen} />
    <div className="dashboard-content">
      <div key={displayedSection} className={`view-stage is-${transitionPhase}`}>
        {displayedSection === "home" && <MissionHome config={config} squad={squad} onOpenPlayers={onOpenPlayers} onOpenSquad={() => onSectionChange("squad")} onOpenDossier={setDossier} onRemove={removePlayer} />}
        {displayedSection === "squad" && <SquadOverview config={config} squad={squad} onAdd={() => onOpenPlayers()} onOpen={setDossier} onRemove={removePlayer} />}
        {displayedSection === "evaluation" && <SquadEvaluation config={config} squad={squad} onOpenPlayers={onOpenPlayers} />}
      </div>
    </div>
    <PlayerModal player={dossier?.player ?? null} purchasePrice={dossier?.paidPrice} config={config} onClose={() => setDossier(null)} />
    {removed && <div className="action-toast" role="status"><span><b>{removed.player.name}</b> rimosso</span><button onClick={undoRemove}>ANNULLA</button><button aria-label="Chiudi notifica" onClick={() => setRemoved(null)}>×</button></div>}
  </main>;
}

export default function App() {
  const [config, setConfig] = useState<LeagueConfig | null>(() => readStorage(LEAGUE_KEY));
  const [squad, setSquad] = useState<SquadPlayer[]>(() => readStorage(SQUAD_KEY) ?? []);
  const [view, setView] = useState<View>(() => readStorage(LEAGUE_KEY) ? "dashboard" : "landing");
  const [editing, setEditing] = useState(false);
  const [path, setPath] = useState(window.location.pathname);
  const [section, setSection] = useState<AppSection>("home");
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const syncPath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  function navigate(next: string) {
    window.history.pushState({}, "", next);
    setPath(window.location.pathname);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }

  function completeBriefing(next: LeagueConfig) {
    localStorage.setItem(LEAGUE_KEY, JSON.stringify(next));
    setConfig(next);
    if (editing) {
      setEditing(false);
      setView("dashboard");
    } else {
      setView("accepted");
    }
  }

  function updateSquad(next: SquadPlayer[]) {
    localStorage.setItem(SQUAD_KEY, JSON.stringify(next));
    setSquad(next);
  }

  function reset() {
    localStorage.removeItem(LEAGUE_KEY);
    localStorage.removeItem(SQUAD_KEY);
    setConfig(null);
    setSquad([]);
    setEditing(false);
    setSettingsOpen(false);
    setView("landing");
    navigate("/");
  }

  function openPlayers(role?: ClassicRole) {
    navigate(role ? `/players?role=${role}` : "/players");
  }

  function navigateSection(target: NavigationSection) {
    if (target === "listone") return openPlayers();
    setSection(target);
    navigate("/");
    if (config) setView("dashboard");
  }

  if (path === "/admin/media-review") return <MediaReviewPage onClose={() => navigate("/")} />;
  if (path === "/players" && config) return <><PlayersPage config={config} squad={squad} onSquadChange={updateSquad} onNavigate={navigateSection} onSettings={() => setSettingsOpen(true)} settingsOpen={settingsOpen} /><SettingsDialog config={config} open={settingsOpen} onClose={() => setSettingsOpen(false)} onEdit={() => { setSettingsOpen(false); setEditing(true); setView("briefing"); navigate("/"); }} onReset={reset} /></>;
  if (view === "landing") return <Landing onStart={() => setView("briefing")} onResume={config ? () => setView("dashboard") : undefined} />;
  if (view === "briefing") return <Onboarding initialConfig={config} editing={editing} onCancel={() => { setEditing(false); setView(config ? "dashboard" : "landing"); }} onComplete={completeBriefing} />;
  if (view === "accepted" && config) return <main className="accepted-screen"><BrandLogo /><AgentIllustration variant="positive" className="accepted-agent" decorative sizes="300px" /><p className="eyebrow">DOSSIER CONFIGURATO</p><h1>MISSIONE<br />ACCETTATA</h1><p>{config.teamName} · {config.mode} · {config.budget} crediti</p><button className="primary-action" onClick={() => setView("dashboard")}>APRI IL DOSSIER →</button></main>;
  return config ? <><Dashboard config={config} squad={squad} onSquadChange={updateSquad} onOpenPlayers={openPlayers} onSettings={() => setSettingsOpen(true)} settingsOpen={settingsOpen} section={section} onSectionChange={setSection} /><SettingsDialog config={config} open={settingsOpen} onClose={() => setSettingsOpen(false)} onEdit={() => { setSettingsOpen(false); setEditing(true); setView("briefing"); }} onReset={reset} /></> : null;
}
