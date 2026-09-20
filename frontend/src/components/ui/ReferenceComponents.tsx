import { useReducedMotion, motion } from "motion/react";
import { useMemo, useRef } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";

type VariableStyle = CSSProperties & Record<`--${string}`, string | number>;

export function DitherReveal({ src, alt, className = "", children }: { src: string; alt: string; className?: string; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const bounds = ref.current.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    ref.current.style.setProperty("--dither-x", `${Math.max(0, Math.min(100, x))}%`);
    ref.current.style.setProperty("--dither-y", `${Math.max(0, Math.min(100, y))}%`);
  };
  return <div ref={ref} className={`reference-dither ${className}`} onPointerMove={move}>
    <img src={src} alt={alt} loading="eager" />
    <span className="reference-dither-noise" aria-hidden="true" />
    {children}
  </div>;
}

export function MorphingGlyphCloud({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const glyphs = useMemo(() => ["✦", "·", "◌", "✚", "✧", "·", "◇", "◦", "✦", "⊹", "·", "◌", "✚", "✧", "◇", "·"], []);
  return <div className={`reference-glyph-cloud ${className}`} aria-hidden="true">
    {glyphs.map((glyph, index) => <motion.span key={`${glyph}-${index}`} animate={reduced ? undefined : { opacity: [0.18, 0.62, 0.18], y: [0, index % 3 === 0 ? -8 : 6, 0], rotate: [0, index % 2 ? 10 : -8, 0] }} transition={reduced ? undefined : { duration: 3.8 + index * 0.16, repeat: Infinity, ease: "easeInOut", delay: index * 0.08 }}>{glyph}</motion.span>)}
  </div>;
}

export function ParticleEnfold({ className = "", count = 14 }: { className?: string; count?: number }) {
  const reduced = useReducedMotion();
  const particles = useMemo(() => Array.from({ length: count }, (_, index) => ({ left: `${(index * 37) % 100}%`, top: `${(index * 61) % 100}%`, size: `${3 + (index % 3)}px`, delay: `${(index % 7) * 0.4}s` })), [count]);
  return <div className={`reference-particle-enfold ${className}`} aria-hidden="true">
    {particles.map((particle, index) => <span key={index} style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size, animationDelay: reduced ? "0s" : particle.delay }} />)}
  </div>;
}

export function ParticleInterlockLoader({ label = "Caricamento" }: { label?: string }) {
  return <div className="reference-interlock-loader" role="status" aria-live="polite" aria-label={label}><span className="reference-interlock-orbit" aria-hidden="true"><i /><i /><i /></span><span>{label}</span></div>;
}

export function AsciiFlameBall({ label = "Elaborazione" }: { label?: string }) {
  return <div className="reference-ascii-flame" role="status" aria-label={label}><span>{label}</span></div>;
}

export function NeonBorder({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`reference-neon-border ${className}`}><div>{children}</div></div>;
}

export function HoverImageReveal({ src, alt, eyebrow, title, className = "" }: { src: string; alt: string; eyebrow?: string; title?: string; className?: string }) {
  return <figure className={`reference-hover-image ${className}`}><img src={src} alt={alt} loading="lazy" /><figcaption>{eyebrow && <span>{eyebrow}</span>}{title && <strong>{title}</strong>}</figcaption></figure>;
}

export function ClickEffectButton({ className = "", children, onPointerMove, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const move = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const style = event.currentTarget.style as unknown as VariableStyle;
    style["--click-x"] = `${event.clientX - bounds.left}px`;
    style["--click-y"] = `${event.clientY - bounds.top}px`;
    onPointerMove?.(event);
  };
  return <button {...props} className={`${className} reference-click-button`.trim()} onPointerMove={move}>{children}</button>;
}

export function GradientSlider({ id, value, min, max, step = 1, onChange, disabled = false, "aria-label": ariaLabel }: { id: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void; disabled?: boolean; "aria-label": string }) {
  const percentage = max === min ? 0 : ((value - min) / (max - min)) * 100;
  return <div className="reference-slider-wrap"><span className="reference-slider-bound" aria-hidden="true">{min}</span><input id={id} className="reference-slider" type="range" min={min} max={max} step={step} value={value} disabled={disabled} aria-label={ariaLabel} aria-valuetext={`${value} crediti`} style={{ "--slider-progress": `${Math.max(0, Math.min(100, percentage))}%` } as VariableStyle} onChange={(event) => onChange(Number(event.target.value))} /><span className="reference-slider-bound" aria-hidden="true">{max}</span><output className="reference-slider-value" htmlFor={id}>{value > 0 ? `${value} cr.` : "Imposta"}</output></div>;
}
