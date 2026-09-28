import { useEffect, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** A single perimeter highlight, following Aceternity's Moving Border pattern. */
export function MovingBorder() {
  return <span aria-hidden="true" className="home-lab-moving-border"><span /></span>;
}

/** Motion Primitives Text Effect: one entrance for the command label. */
export function TextEffect({ text }: { text: string }) {
  const reduced = useReducedMotion();
  return <span aria-label={text} role="text" className="home-lab-text-effect">{text.split(" ").map((word, index) => <motion.span aria-hidden="true" key={`${word}-${index}`} initial={reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.3, delay: reduced ? 0 : index * 0.07 }}>{word}{index < text.split(" ").length - 1 ? "\u00a0" : ""}</motion.span>)}</span>;
}

/** Motion Primitives Text Morph: shared glyphs move only when the roster state changes. */
export function TextMorph({ text }: { text: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <span>{text}</span>;
  const occurrences = new Map<string, number>();
  return <span aria-label={text} role="text" className="home-lab-text-morph"><AnimatePresence mode="popLayout" initial={false}>{[...text].map((char, index) => {
    const occurrence = occurrences.get(char) ?? 0;
    occurrences.set(char, occurrence + 1);
    return <motion.span aria-hidden="true" key={`${char}-${occurrence}`} layoutId={`home-lab-glyph-${char}-${occurrence}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} className="home-lab-morph-glyph">{char === " " ? "\u00a0" : char}</motion.span>;
  })}</AnimatePresence></span>;
}

/** The 21st.dev encrypted-text reveal, reserved for one short, non-numeric label. */
export function EncryptedText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [frame, setFrame] = useState(text);

  useEffect(() => {
    if (!ref.current || reduced) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.6 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (!visible || reduced) { setFrame(text); return; }
    let request = 0;
    const start = performance.now();
    let lastFlip = 0;
    const tick = (now: number) => {
      const revealed = Math.min(text.length, Math.floor((now - start) / 55));
      if (now - lastFlip > 45 || revealed === text.length) {
        setFrame([...text].map((letter, index) => index < revealed || letter === " " ? letter : glyphs[Math.floor(Math.random() * glyphs.length)]).join(""));
        lastFlip = now;
      }
      if (revealed < text.length) request = requestAnimationFrame(tick);
    };
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [text, visible, reduced]);

  return <span ref={ref} aria-label={text} role="text" className="home-lab-encrypted">{frame}</span>;
}

/** Pointer-following glow only on the coverage cards; no frame-by-frame React renders. */
export function moveSpotlight(event: PointerEvent<HTMLElement>) {
  if (event.pointerType === "touch") return;
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
}

/** One viewport-triggered group, following Animated Group / In View's stagger pattern. */
export function InViewGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={false} whileInView={reduced ? undefined : "visible"} viewport={{ once: true, amount: 0.18 }} variants={{ visible: { transition: { staggerChildren: 0.055 } } }}>{children}</motion.div>;
}

export function InViewItem({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return <motion.div variants={reduced ? undefined : { visible: { opacity: 1, y: 0 } }} initial={reduced ? false : { opacity: 0, y: 9 }} transition={{ duration: 0.28, ease: "easeOut" }}>{children}</motion.div>;
}
