import brandLogo from "../assets/landing/fanta007-logo-v2.webp";

export function BrandLogo({ compact = false, withoutTagline = false }: { compact?: boolean; withoutTagline?: boolean }) {
  return <div className={`brand-logo studio-brand fanta-brand ${compact ? "compact" : ""}${withoutTagline ? " fanta-brand-clean" : ""}`}>
    {withoutTagline ? <svg viewBox="120 135 1900 420" role="img" aria-label="FANTA007" preserveAspectRatio="xMinYMid meet">
      <defs><clipPath id="fanta-home-logo-crop" clipPathUnits="userSpaceOnUse"><rect x="0" y="0" width="530" height="724" /><rect x="530" y="0" width="1642" height="450" /></clipPath></defs>
      <image href={brandLogo} width="2172" height="724" clipPath="url(#fanta-home-logo-crop)" />
    </svg> : <img src={brandLogo} alt="FANTA007 — Licence to Win" width="2172" height="724" decoding="async" />}
  </div>;
}
