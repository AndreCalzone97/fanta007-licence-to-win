import type { NavigationSection } from "../types";

type Props = { active: NavigationSection; onNavigate: (section: NavigationSection) => void; onSettings: () => void; settingsOpen?: boolean };
const items: Array<{ id: NavigationSection; icon: string; label: string }> = [
  { id: "home", icon: "⌂", label: "Home" },
  { id: "squad", icon: "♟", label: "La mia rosa" },
  { id: "listone", icon: "⌕", label: "Listone" },
  { id: "evaluation", icon: "⌁", label: "Valutazione" },
];

export function BottomNavigation({ active, onNavigate, onSettings, settingsOpen = false }: Props) {
  return <nav className="bottom-nav" aria-label="Navigazione principale">
    {items.map((item) => <button key={item.id} className={!settingsOpen && active === item.id ? "active" : ""} aria-current={!settingsOpen && active === item.id ? "page" : undefined} onClick={() => onNavigate(item.id)}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}
    <button className={settingsOpen ? "active" : ""} aria-label="Impostazioni" aria-current={settingsOpen ? "page" : undefined} onClick={onSettings}><span aria-hidden="true">⚙</span><span className="settings-label">Impost.</span></button>
  </nav>;
}
