import { motion, useReducedMotion } from "motion/react";

// Original implementation of the requested reveal pattern, not OriginKit source.
export function AppearText({ text, delay = 0 }: { text: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <span aria-label={text} className="club-appear">{text.split(" ").map((word, index) => <span className="club-word-mask" key={`${index}-${word}`} aria-hidden="true"><motion.span initial={reduced ? false : { y: "105%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: reduced ? 0 : .48, delay: reduced ? 0 : delay + index * .055, ease: [.22, 1, .36, 1] }}>{word}</motion.span>{" "}</span>)}</span>;
}
