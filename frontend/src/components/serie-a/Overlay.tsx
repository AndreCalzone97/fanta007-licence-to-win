import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";

const openOverlays: symbol[] = [];

export function Overlay({ title, variant, layoutId, onClose, children }: { title: string; variant: "dialog" | "sheet" | "drawer"; layoutId?: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const token = Symbol("serie-a-overlay");
    openOverlays.push(token);
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (openOverlays.at(-1) !== token) return;
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !ref.current) return;
      const focusables = [...ref.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')];
      if (!focusables.length) return;
      if (event.shiftKey && document.activeElement === focusables[0]) { event.preventDefault(); focusables.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === focusables.at(-1)) { event.preventDefault(); focusables[0].focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); openOverlays.splice(openOverlays.indexOf(token), 1); document.body.style.overflow = previousOverflow; previous?.focus(); };
  }, [onClose]);
  return createPortal(<div className={`serie-a-overlay serie-a-overlay--${variant}`} onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <motion.div className="serie-a-overlay-panel" layoutId={reducedMotion ? undefined : layoutId} transition={{ type: "spring", stiffness: 340, damping: 34 }} role="dialog" aria-modal="true" aria-label={title} ref={ref}>
      <div className="serie-a-overlay-head"><strong>{title}</strong><button type="button" onClick={onClose} aria-label="Chiudi">×</button></div>
      <div className="serie-a-overlay-body">{children}</div>
    </motion.div>
  </div>, document.body);
}
