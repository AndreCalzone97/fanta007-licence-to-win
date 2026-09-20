import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "../../hooks/useFocusTrap";

/** Controlled responsive detail: desktop side drawer, mobile bottom sheet. */
export function ContextPanel({ children, titleId, onClose, wide = false, className = "" }: { children: ReactNode; titleId: string; onClose: () => void; wide?: boolean; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const overflow = document.body.style.overflow;
    const root = document.getElementById("root");
    const inert = root?.inert ?? false;
    document.body.style.overflow = "hidden";
    if (root) root.inert = true;
    return () => { document.body.style.overflow = overflow; if (root) root.inert = inert; };
  }, []);
  useFocusTrap(ref, true, onClose);
  const surface = <div className="studio-ui ops-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={ref} className={`ops-panel ${wide ? "ops-panel-wide" : ""} ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="ops-panel-handle" aria-hidden="true" />{children}
    </section>
  </div>;
  return typeof document === "undefined" ? surface : createPortal(surface, document.body);
}
