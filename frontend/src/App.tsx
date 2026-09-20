import { lazy, Suspense, useEffect, useState } from "react";
import { useSquadPersistence } from "./hooks/useSquadPersistence";
import { SQUAD_KEY, LEGACY_SQUAD_KEY, LEGACY_LEAGUE_KEY } from "./lib/squadPersistence";
import { AgentIllustration } from "./components/AgentIllustration";
import { SectionArrival } from "./components/SectionArrival";
import { BrandLogo } from "./components/BrandLogo";
import { BottomNavigation } from "./components/BottomNavigation";
import { Onboarding } from "./components/Onboarding";
import { PlayerModal } from "./components/PlayerModal";
import { SettingsDialog } from "./components/SettingsDialog";
import { SquadEvaluation } from "./components/SquadEvaluation";
import { SquadOverview } from "./components/SquadOverview";
import { CommandCenter } from "./components/CommandCenter";
import { StudioHeader } from "./components/StudioHeader";
import { MediaReviewPage } from "./pages/MediaReviewPage";
import { PlayersPage } from "./pages/PlayersPage";
import type { AppSection, ClassicRole, LeagueConfig, NavigationSection, SquadPlayer } from "./types";

type View = "landing" | "briefing" | "accepted" | "dashboard";
const StudioWelcome = lazy(() => import("./components/StudioWelcome").then(module => ({ default: module.StudioWelcome })));

function Dashboard({ config, squad, onSquadChange, onOpenPlayers, onSettings, settingsOpen, section, onSectionChange }: {
  config: LeagueConfig;
  squad: SquadPlayer[];
  onSquadChange: (squad: SquadPlayer[]) => Promise<boolean>;
  onOpenPlayers: (role?: ClassicRole) => void;
  onSettings: () => void;
  settingsOpen: boolean;
  section: AppSection;
  onSectionChange: (section: AppSection) => void;
}) {
  const [dossier, setDossier] = useState<SquadPlayer | null>(null);
  const [removed, setRemoved] = useState<SquadPlayer | null>(null);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [section]);
  async function removePlayer(id: number) {
    const target = squad.find((entry) => entry.player.id === id) ?? null;
    if (!target) return;
    if (!await onSquadChange(squad.filter((entry) => entry.player.id !== id))) return;
    setRemoved(target);
  }

  async function undoRemove() {
    if (!removed || squad.some((entry) => entry.player.id === removed.player.id)) return;
    if (!await onSquadChange([...squad, removed])) return;
    setRemoved(null);
  }

  return <main className="ops-app">
    <StudioHeader teamName={config.teamName}><BottomNavigation active={section} onNavigate={(target) => target === "listone" ? onOpenPlayers() : onSectionChange(target)} onSettings={onSettings} settingsOpen={settingsOpen} /></StudioHeader>
    <div id="studio-content" tabIndex={-1} className="ops-content">
      <SectionArrival key={section}>
        {section === "home" && <CommandCenter config={config} squad={squad} onOpenPlayers={onOpenPlayers} onOpenSquad={() => onSectionChange("squad")} onOpenDossier={setDossier} onRemove={removePlayer} />}
        {section === "squad" && <SquadOverview config={config} squad={squad} onAdd={onOpenPlayers} onOpen={setDossier} onRemove={removePlayer} />}
        {section === "evaluation" && <SquadEvaluation config={config} squad={squad} onOpenPlayers={onOpenPlayers} />}
      </SectionArrival>
    </div>
    <PlayerModal player={dossier?.player ?? null} purchasePrice={dossier?.paidPrice} config={config} onClose={() => setDossier(null)} />
    {removed && <div className="action-toast" role="status"><span><b>{removed.player.name}</b> rimosso</span><button onClick={undoRemove}>ANNULLA</button><button aria-label="Chiudi notifica" onClick={() => setRemoved(null)}>×</button></div>}
  </main>;
}

export default function App() {
  const { config, squad, ready, busy, error, dismissError, save } = useSquadPersistence();
  const [view, setView] = useState<View>("landing");
  useEffect(() => { if (config) setView((current) => current === "landing" ? "dashboard" : current); }, [config]);
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

  async function completeBriefing(next: LeagueConfig) {
    if (!await save(next, squad)) return;
    if (editing) {
      setEditing(false);
      setView("dashboard");
    } else {
      setView("accepted");
    }
  }

  async function updateSquad(next: SquadPlayer[]) {
    return config ? save(config, next) : false;
  }

  function reset() {
    if (!window.confirm("Eliminare la configurazione e la rosa salvata su questo browser?")) return;
    localStorage.removeItem(SQUAD_KEY);
    localStorage.removeItem(LEGACY_SQUAD_KEY);
    localStorage.removeItem(LEGACY_LEAGUE_KEY);
    window.location.assign("/");
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
  // The presentation/hero is a static entry point and must remain previewable
  // even when the optional API used to hydrate a saved squad is offline.
  if (path === "/presentazione") return <div className="studio-ui"><Suspense fallback={<main className="studio-loading"><p role="status">Preparazione FANTA007…</p></main>}><StudioWelcome onStart={() => { setView("briefing"); navigate("/"); }} onResume={config ? () => { setView("dashboard"); navigate("/"); } : undefined} /></Suspense></div>;
  if (!ready) return <main className="studio-ui studio-loading"><p role="status">Caricamento della rosa…</p></main>;
  if (error && !config) return <main className="studio-ui studio-loading"><h1>Rosa non disponibile</h1><p role="alert">{error}</p><p>Il salvataggio precedente è conservato. Verifica che il backend sia disponibile; se un giocatore è assente o ha cambiato ruolo, occorre correggere la rosa salvata.</p><button onClick={() => window.location.reload()}>RIPROVA</button><button onClick={reset}>REIMPOSTA ROSA</button></main>;
  function renderView() {
  if (path === "/players" && config) return <><PlayersPage config={config} squad={squad} onSquadChange={updateSquad} onNavigate={navigateSection} onSettings={() => setSettingsOpen(true)} settingsOpen={settingsOpen} /><SettingsDialog config={config} open={settingsOpen} onClose={() => setSettingsOpen(false)} onEdit={() => { setSettingsOpen(false); setEditing(true); setView("briefing"); navigate("/"); }} onReset={reset} /></>;
  if (view === "landing") return <Suspense fallback={<main className="studio-loading"><p role="status">Preparazione FANTA007…</p></main>}><StudioWelcome onStart={() => { setView("briefing"); navigate("/"); }} onResume={config ? () => { setView("dashboard"); navigate("/"); } : undefined} /></Suspense>;
  if (view === "briefing") return <Onboarding initialConfig={config} editing={editing} onCancel={() => { setEditing(false); setView(config ? "dashboard" : "landing"); }} onComplete={completeBriefing} />;
  if (view === "accepted" && config) return <main className="accepted-screen"><BrandLogo /><AgentIllustration variant="positive" decorative className="fanta-accepted-agent" sizes="180px" /><h1>La tua rosa è pronta.</h1><p>{config.teamName} · {config.mode} · {config.budget} crediti</p><button className="primary-action" onClick={() => setView("dashboard")}>APRI LA HOME →</button></main>;
  return config ? <><Dashboard config={config} squad={squad} onSquadChange={updateSquad} onOpenPlayers={openPlayers} onSettings={() => setSettingsOpen(true)} settingsOpen={settingsOpen} section={section} onSectionChange={setSection} /><SettingsDialog config={config} open={settingsOpen} onClose={() => setSettingsOpen(false)} onEdit={() => { setSettingsOpen(false); setEditing(true); setView("briefing"); }} onReset={reset} /></> : null;
  }
  return <div className="studio-ui">{error && <div className="studio-notice" role="alert">{error} — Salvataggio precedente conservato. <button onClick={dismissError}>CHIUDI</button></div>}{busy && <p className="studio-notice" role="status">Verifica e salvataggio…</p>}<div inert={busy}>{renderView()}</div></div>;
}
