import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

// A single entrance grammar for every section; no transformed ancestor remains
// after arrival, so fixed dossier dialogs stay attached to the viewport.
export function SectionArrival({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return <motion.div className="section-arrival" initial={{ opacity: reduced ? 1 : .55, y: reduced ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .2, ease: [.22, 1, .36, 1] }}>{children}</motion.div>;
}
