import { useId } from "react";
import { FileText, ChartNoAxesColumn, ScanSearch, MessageSquare } from "lucide-react";
import { ExpandableTabs } from "./ExpandableTabs";

export type DossierTab = "overview" | "performance" | "intelligence" | "advice";
const tabs: Array<[DossierTab, string]> = [["overview", "Scheda"], ["performance", "Statistiche"], ["intelligence", "Analisi"], ["advice", "Consiglio"]];

export function DossierTabs({ value, onChange, id: suppliedId }: { value: DossierTab; onChange: (value: DossierTab) => void; id?: string }) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const icons = [FileText, ChartNoAxesColumn, ScanSearch, MessageSquare];
  return <div className="dossier-expandable-shell"><ExpandableTabs
    tabs={tabs.map(([tab, title], index) => ({ title, icon: icons[index], id: `${id}-${tab}` }))}
    activeIndex={tabs.findIndex(([tab]) => tab === value)} panelId={`${id}-panel`} label="Sezioni dossier"
    onChange={index => { if (index !== null) onChange(tabs[index][0]); }}
  /></div>;
}
