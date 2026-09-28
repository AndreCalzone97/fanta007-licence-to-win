// Original source: https://ui.aceternity.com/components/floating-dock
// Approved N1: https://21st.dev/@manuarora700/components/floating-dock
// Port: literal CSS equivalents, product callbacks and accessible names/focus.
"use client";
/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(" ");
import "./floating-dock.css";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";

import { useRef, useState, type ReactNode } from "react";

type DockItem = { title: string; displayLabel?: string; icon: ReactNode; href: string; onSelect?: () => void; current?: boolean };

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
  experimental = false,
}: {
  items: DockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
  experimental?: boolean;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={cn(desktopClassName, experimental ? "home-lab-dock" : undefined)} experimental={experimental} />
      <FloatingDockMobile items={items} className={cn(mobileClassName, experimental ? "home-lab-dock" : undefined)} experimental={experimental} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
  experimental,
}: {
  items: DockItem[];
  className?: string;
  experimental: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  return (
    <div className={cn("n1-mobile", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId={experimental && reduced ? undefined : "nav"}
            className="n1-mobile-items"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                  initial={experimental && reduced ? false : { opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={experimental && reduced ? { opacity: 1, y: 0, transition: { duration: 0 } } : {
                  opacity: 0,
                  y: 10,
                  transition: { delay: idx * 0.05 },
                }}
                  transition={experimental && reduced ? { duration: 0 } : { delay: (items.length - 1 - idx) * 0.05 }}
              >
                <a
                  href={item.href}
                  aria-label={item.title}
                  aria-current={item.current ? "page" : undefined}
                  onClick={event => { if (item.onSelect) { event.preventDefault(); item.onSelect(); setOpen(false); } }}
                  key={item.title}
                  className="n1-mobile-link"
                >
                  {experimental && item.current && <span className="n1-active-surface" aria-hidden="true" />}
                  <div className="n1-mobile-icon">{item.icon}</div>
                  {experimental && <span className="n1-mobile-label" aria-hidden="true">{item.displayLabel ?? item.title}</span>}
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        aria-label="Navigazione principale" aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="n1-mobile-trigger"
      >
        <IconLayoutNavbarCollapse className="n1-toggle-icon" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
  experimental,
}: {
  items: DockItem[];
  className?: string;
  experimental: boolean;
}) => {
  let mouseX = useMotionValue(Infinity);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const activeTitle = items.find(item => item.current)?.title ?? null;
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => { mouseX.set(Infinity); setHighlighted(null); }}
      className={cn(
        "n1-desktop",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} experimental={experimental} highlighted={experimental && (highlighted ?? activeTitle) === item.title} onHighlight={setHighlighted} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  displayLabel,
  icon,
  href,
  onSelect,
  current,
  experimental,
  highlighted,
  onHighlight,
}: {
  mouseX: MotionValue;
  title: string;
  displayLabel?: string;
  icon: ReactNode;
  href: string;
  onSelect?: () => void;
  current?: boolean;
  experimental: boolean;
  highlighted: boolean;
  onHighlight: (title: string | null) => void;
}) {
  let ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], experimental ? [48, 76, 48] : [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], experimental ? [48, 76, 48] : [40, 80, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], experimental ? [24, 36, 24] : [20, 40, 20]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    experimental ? [24, 36, 24] : [20, 40, 20],
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <a href={href} aria-label={title} aria-current={current ? "page" : undefined}
      onFocus={() => { setHovered(true); if (experimental) onHighlight(title); }} onBlur={() => { setHovered(false); if (experimental) onHighlight(null); }}
      onClick={event => { if (onSelect) { event.preventDefault(); onSelect(); } }}>
      <motion.div
        ref={ref}
        style={experimental && reduced ? { width: 48, height: 48 } : { width, height }}
        onMouseEnter={() => { setHovered(true); if (experimental) onHighlight(title); }}
        onMouseLeave={() => { setHovered(false); if (experimental) onHighlight(null); }}
        className="n1-item"
      >
        {highlighted && <motion.span className="n1-active-surface" layoutId="home-lab-dock-highlight" aria-hidden="true" transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 330, damping: 31 }} />}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={experimental && reduced ? false : { opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={experimental && reduced ? { opacity: 0, y: 0, x: "-50%", transition: { duration: 0 } } : { opacity: 0, y: 2, x: "-50%" }}
              transition={experimental && reduced ? { duration: 0 } : undefined}
              className="n1-tooltip"
            >
              {displayLabel ?? title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={experimental && reduced ? { width: 24, height: 24 } : { width: widthIcon, height: heightIcon }}
          className="n1-icon"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}
