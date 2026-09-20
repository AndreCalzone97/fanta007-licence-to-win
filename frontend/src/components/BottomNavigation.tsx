import { StudioIcon, type StudioIconName } from "./StudioIcon";
import type { NavigationSection } from "../types";
import { FloatingDock } from "./ui/FloatingDock";

type Props = { active: NavigationSection; onNavigate: (section: NavigationSection) => void; onSettings: () => void; settingsOpen?: boolean };
const items: Array<{ id: NavigationSection; icon: StudioIconName; label: string }> = [
  { id: "home", icon: "home", label: "Home" },
  { id: "squad", icon: "squad", label: "La mia rosa" },
  { id: "listone", icon: "search", label: "Listone" },
  { id: "evaluation", icon: "analysis", label: "Valutazione" },
];

export function BottomNavigation({ active, onNavigate, onSettings, settingsOpen = false }: Props) {
  return <nav className="fanta-floating-nav" aria-label="Navigazione principale"><FloatingDock items={[
    ...items.map(item => ({
      title: item.label, icon: <StudioIcon name={item.icon} />, href: "#",
      current: !settingsOpen && active === item.id, onSelect: () => onNavigate(item.id),
    })),
    { title: "Impostazioni", icon: <StudioIcon name="settings" />, href: "#", current: settingsOpen, onSelect: onSettings },
  ]} /></nav>;
}
