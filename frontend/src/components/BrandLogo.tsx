import brandLogo from "../assets/agent/agent-brand-360.webp";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return <div className={`brand-logo studio-brand fanta-brand ${compact ? "compact" : ""}`}>
    <img src={brandLogo} alt="" width="360" height="203" decoding="async" />
    <div>Fanta007<small>Licence to Win</small></div>
  </div>;
}
