import critical240 from "../assets/agent/agent-critical-240.webp";
import critical480 from "../assets/agent/agent-critical-480.webp";
import hero480 from "../assets/agent/agent-hero-480.webp";
import hero760 from "../assets/agent/agent-hero-760.webp";
import positive240 from "../assets/agent/agent-positive-240.webp";
import positive480 from "../assets/agent/agent-positive-480.webp";
import thinking240 from "../assets/agent/agent-thinking-240.webp";
import thinking480 from "../assets/agent/agent-thinking-480.webp";
import warning240 from "../assets/agent/agent-warning-240.webp";
import warning480 from "../assets/agent/agent-warning-480.webp";

export type AgentVariant = "hero" | "thinking" | "positive" | "warning" | "critical";

type Asset = {
  alt: string;
  height: number;
  large: string;
  largeWidth: number;
  small: string;
  smallWidth: number;
  width: number;
};

const assets: Record<AgentVariant, Asset> = {
  hero: { alt: "Fantagente 007 pronto a pianificare la rosa", width: 760, height: 1140, small: hero480, smallWidth: 480, large: hero760, largeWidth: 760 },
  thinking: { alt: "Fantagente 007 durante l'analisi", width: 480, height: 499, small: thinking240, smallWidth: 240, large: thinking480, largeWidth: 480 },
  positive: { alt: "Fantagente 007 con valutazione positiva", width: 480, height: 525, small: positive240, smallWidth: 240, large: positive480, largeWidth: 480 },
  warning: { alt: "Fantagente 007 segnala attenzione", width: 480, height: 519, small: warning240, smallWidth: 240, large: warning480, largeWidth: 480 },
  critical: { alt: "Fantagente 007 segnala un rischio critico", width: 480, height: 576, small: critical240, smallWidth: 240, large: critical480, largeWidth: 480 },
};

type Props = {
  alt?: string;
  className?: string;
  decorative?: boolean;
  priority?: boolean;
  sizes?: string;
  variant: AgentVariant;
};

export function AgentIllustration({ alt, className = "", decorative = false, priority = false, sizes, variant }: Props) {
  const asset = assets[variant];
  return <figure className={`agent-illustration agent-illustration--${variant} ${className}`.trim()} data-variant={variant} aria-hidden={decorative || undefined}>
    <img
      alt={decorative ? "" : (alt ?? asset.alt)}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      height={asset.height}
      loading={priority ? "eager" : "lazy"}
      sizes={sizes ?? (variant === "hero" ? "(max-width: 700px) 76vw, 430px" : "(max-width: 700px) 120px, 180px")}
      src={asset.small}
      srcSet={`${asset.small} ${asset.smallWidth}w, ${asset.large} ${asset.largeWidth}w`}
      width={asset.width}
    />
  </figure>;
}
