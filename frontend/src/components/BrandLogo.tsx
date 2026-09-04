import brandLogo from "../assets/agent/agent-brand-360.webp";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return <div className={`brand-logo ${compact ? "compact" : ""}`}>
    <img src={brandLogo} alt="Fanta007 — Licence to Win" width="360" height="203" decoding="async" />
  </div>;
}
