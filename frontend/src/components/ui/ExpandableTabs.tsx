"use client";
// Victor Welander / 21st.dev source supplied by the user.
// Original structure and motion; CSS utilities translated for this plain-CSS app.
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useOnClickOutside } from "usehooks-ts";
import type { LucideIcon } from "lucide-react";
import "./expandable-tabs.css";
const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(" ");
interface Tab { title: string; icon: LucideIcon; type?: never; id?: string }
interface Separator { type: "separator"; title?: never; icon?: never; id?: never }
type TabItem = Tab | Separator;
interface ExpandableTabsProps {
  tabs: TabItem[]; className?: string; activeColor?: string;
  onChange?: (index: number | null) => void;
  activeIndex?: number; panelId?: string; label?: string;
}
export const buttonVariants = {
  initial: { gap: 0, paddingLeft: ".5rem", paddingRight: ".5rem" },
  animate: (isSelected: boolean) => ({ gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem", paddingRight: isSelected ? "1rem" : ".5rem" }),
};
export const spanVariants = {
  initial: { width: 0, opacity: 0 }, animate: { width: "auto", opacity: 1 }, exit: { width: 0, opacity: 0 },
};
export const transition = { delay: 0.1, type: "spring" as const, bounce: 0, duration: 0.6 };
export function ExpandableTabs({ tabs, className, activeColor = "expandable-primary", onChange, activeIndex, panelId, label }: ExpandableTabsProps) {
  const [selected, setSelected] = React.useState<number | null>(null);
  const outsideClickRef = React.useRef<HTMLDivElement>(null);
  const buttons = React.useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotion();
  const animationTransition = reduced ? { duration: 0, delay: 0 } : transition;
  // usehooks-ts uses the pre-React-19 RefObject type; its implementation guards null.
  useOnClickOutside(outsideClickRef as React.RefObject<HTMLDivElement>, () => { setSelected(null); onChange?.(null); });
  const handleSelect = (index: number) => { setSelected(index); onChange?.(index); };
  function navigate(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (activeIndex === undefined) return;
    const indices = tabs.flatMap((tab, i) => tab.type === "separator" ? [] : [i]);
    const position = indices.indexOf(index);
    const next = event.key === "ArrowRight" ? indices[(position + 1) % indices.length]
      : event.key === "ArrowLeft" ? indices[(position + indices.length - 1) % indices.length]
      : event.key === "Home" ? indices[0] : event.key === "End" ? indices[indices.length - 1] : undefined;
    if (next === undefined) return;
    event.preventDefault(); handleSelect(next); buttons.current[next]?.focus();
  }
  const Separator = () => <div className="expandable-separator" aria-hidden="true" />;
  return <div ref={outsideClickRef} className={cn("expandable-tabs", className)}
    role={activeIndex === undefined ? undefined : "tablist"} aria-label={label}>
    {tabs.map((tab, index) => {
      if (tab.type === "separator") return <Separator key={`separator-${index}`} />;
      const Icon = tab.icon;
      return <motion.button key={tab.title} type="button" id={tab.id}
        ref={element => { buttons.current[index] = element; }}
        role={activeIndex === undefined ? undefined : "tab"}
        aria-label={tab.title} title={tab.title}
        aria-selected={activeIndex === undefined ? undefined : activeIndex === index}
        aria-controls={panelId} tabIndex={activeIndex === undefined ? undefined : activeIndex === index ? 0 : -1}
        variants={buttonVariants} initial={false} animate="animate" custom={selected === index}
        onClick={() => handleSelect(index)} onKeyDown={event => navigate(event, index)} transition={animationTransition}
        className={cn("expandable-button", selected === index ? cn("expandable-selected", activeColor) : "expandable-inactive")}>
        <Icon size={20} aria-hidden="true" />
        <AnimatePresence initial={false}>
          {selected === index && <motion.span variants={spanVariants} initial="initial" animate="animate" exit="exit"
            transition={animationTransition} className="expandable-label">{tab.title}</motion.span>}
        </AnimatePresence>
      </motion.button>;
    })}
  </div>;
}
