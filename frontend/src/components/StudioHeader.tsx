import { useEffect, useState, type ReactNode } from "react";
import { BrandLogo } from "./BrandLogo";
import { API_BASE_URL } from "../lib/api";

export function StudioHeader({ teamName, children }: { teamName: string; children?: ReactNode }) {
  const [online, setOnline] = useState<boolean | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/health`, { signal: controller.signal }).then((response) => setOnline(response.ok)).catch(() => { if (!controller.signal.aborted) setOnline(false); });
    return () => controller.abort();
  }, []);
  return <header className="ops-shell-header"><a className="skip-link" href="#studio-content">Vai al contenuto</a><BrandLogo compact />{children}<div className="ops-session"><b>{teamName}</b><span data-connected={online} role="status">{online === null ? "Connessione…" : online ? "Dati collegati" : "Dati non raggiungibili"}</span></div></header>;
}
