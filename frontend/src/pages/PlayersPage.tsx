import { useState } from "react";
import type { ClassicRole, LeagueConfig, NavigationSection, Player, SquadPlayer } from "../types";
import { PlayerModal } from "../components/PlayerModal";
import { PlayerPreview } from "../components/PlayerPreview";
import { PlayerSearch } from "../components/PlayerSearch";
import { acquisitionBlockReason } from "../lib/squad";
import { BottomNavigation } from "../components/BottomNavigation";

export function PlayersPage({ config, squad, onSquadChange, onNavigate, onSettings, settingsOpen = false }: { config: LeagueConfig; squad: SquadPlayer[]; onSquadChange: (squad: SquadPlayer[]) => void; onNavigate: (section: NavigationSection) => void; onSettings: () => void; settingsOpen?: boolean }) {
  const [preview, setPreview] = useState<Player | null>(null);
  const [dossier, setDossier] = useState<Player | null>(null);
  const [lastAdded, setLastAdded] = useState<SquadPlayer | null>(null);
  const requestedRole = new URLSearchParams(window.location.search).get("role");
  const initialRole = (["P", "D", "C", "A"] as string[]).includes(requestedRole ?? "") ? requestedRole as ClassicRole : undefined;

  function add(player: Player, paidPrice: number) {
    if (acquisitionBlockReason(config, squad, player, paidPrice)) return;
    const entry = { player, paidPrice, addedAt: new Date().toISOString() };
    onSquadChange([...squad, entry]);
    setLastAdded(entry);
    setPreview(null);
  }

  function undoAdd() {
    if (!lastAdded) return;
    onSquadChange(squad.filter((entry) => entry.player.id !== lastAdded.player.id));
    setLastAdded(null);
  }

  return <>
    <BottomNavigation active="listone" onNavigate={onNavigate} onSettings={onSettings} settingsOpen={settingsOpen} />
    <PlayerSearch open config={config} variant="page" initialRole={initialRole} onClose={() => onNavigate("home")} onSelect={setPreview} excludedIds={squad.map((entry) => entry.player.id)} />
    <PlayerPreview player={preview} config={config} squad={squad} onClose={() => setPreview(null)} onAdd={add} onDossier={(player) => { setPreview(null); setDossier(player); }} />
    <PlayerModal player={dossier} purchasePrice={squad.find((entry) => entry.player.id === dossier?.id)?.paidPrice} config={config} onClose={() => setDossier(null)} primaryActionLabel="TORNA ALL'ACQUISTO" onPrimaryAction={dossier ? () => { setPreview(dossier); setDossier(null); } : undefined} />
    {lastAdded && <div className="action-toast" role="status"><span><b>{lastAdded.player.name}</b> aggiunto a {lastAdded.paidPrice}</span><button onClick={undoAdd}>ANNULLA</button><button aria-label="Chiudi notifica" onClick={() => setLastAdded(null)}>×</button></div>}
  </>;
}
