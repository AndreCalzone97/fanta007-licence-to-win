// Sora Labs: https://21st.dev/@soralabs/components/dock-nav, demo 19177.
// Original saved in docs/vendor. Vite port translates utility classes to CSS,
// replaces next/image with img, and adds product callbacks and keyboard focus.
"use client";

const cn = (...values: (string | undefined)[]) => values.filter(Boolean).join(" ");

import { motion, useReducedMotion } from "motion/react";
import "./dock-nav.css";
import { type ComponentPropsWithoutRef, type ReactNode, useState } from "react";

const DOCK_EASE = [0.16, 1, 0.3, 1] as const;
const DOCK_DURATION = 0.5;

const DOCK_WIDTH = {
  base: "5rem",
  far: "6rem",
  close: "7rem",
  active: "8rem",
} as const;

const dockNavVariants = ({ className }: { align?: string; className?: string }) => cn("sora-dock", className);
const dockNavListVariants = ({ align }: { align?: string }) => "sora-dock-list sora-dock-" + align;
const dockNavItemVariants = () => "sora-dock-item";
const dockNavLinkVariants = () => "sora-dock-link";
const dockNavIconVariants = () => "sora-dock-icon";
const dockNavTooltipVariants = () => "sora-dock-tooltip";

function getItemWidth(index: number, hoveredIndex: number | null) {
  if (hoveredIndex === null) {
    return DOCK_WIDTH.base;
  }

  const distance = Math.abs(index - hoveredIndex);

  if (distance === 0) {
    return DOCK_WIDTH.active;
  }

  if (distance === 1) {
    return DOCK_WIDTH.close;
  }

  if (distance === 2) {
    return DOCK_WIDTH.far;
  }

  return DOCK_WIDTH.base;
}

export interface DockNavItem {
  /** Accessible label for the icon image. */
  alt?: string;
  /** Link destination. */
  href?: string;
  /** Custom icon node. Used when `iconSrc` is not provided. */
  icon?: ReactNode;
  /** Remote or local image URL for the dock icon. */
  iconSrc?: string;
  /** Visible tooltip label. */
  label: string;
  onSelect?: () => void;
  current?: boolean;
}

export interface DockNavProps
  extends Omit<ComponentPropsWithoutRef<"nav">, "children"> {
  align?: "center" | "start" | "end";
  /** Animation duration in seconds. */
  duration?: number;
  /** Dock entries rendered left to right. */
  items: DockNavItem[];
}

function DockNavItemIcon({
  alt,
  icon,
  iconSrc,
  label,
}: Pick<DockNavItem, "alt" | "icon" | "iconSrc" | "label">) {
  if (icon) {
    return <span className={dockNavIconVariants()}>{icon}</span>;
  }

  if (iconSrc) {
    return (
      <img
        alt={alt ?? label}
        className={dockNavIconVariants()}
        height={64}
        src={iconSrc}
        width={64}
      />
    );
  }

  return null;
}

function DockNav({
  align = "center",
  className,
  duration = DOCK_DURATION,
  items,
  ...props
}: DockNavProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : {
        duration,
        ease: DOCK_EASE,
      };

  return (
    <nav className={cn(dockNavVariants({ align, className }))} {...props}>
      <ul className={dockNavListVariants({ align })}>
        {items.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const itemKey = `${item.label}-${item.href ?? index}`;

          return (
            <motion.li
              animate={{ width: getItemWidth(index, hoveredIndex) }}
              className={dockNavItemVariants()}
              initial={false}
              key={itemKey}
              onMouseEnter={() => {
                setHoveredIndex(index);
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
              }}
              transition={transition}
            >
              <a
                className={dockNavLinkVariants()}
                aria-label={item.label}
                aria-current={item.current ? "page" : undefined}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
                href={item.href ?? "#"}
                onClick={(event) => {
                  if (!item.href || item.onSelect) {
                    event.preventDefault();
                  }
                  item.onSelect?.();
                }}
              >
                <DockNavItemIcon
                  alt={item.alt}
                  icon={item.icon}
                  iconSrc={item.iconSrc}
                  label={item.label}
                />
              </a>
              <motion.div
                animate={{
                  opacity: isHovered ? 1 : 0,
                  y: isHovered ? "-140%" : "-80%",
                }}
                className={dockNavTooltipVariants()}
                initial={false}
                transition={transition}
              >
                <div>{item.label}</div>
              </motion.div>
            </motion.li>
          );
        })}
      </ul>
    </nav>
  );
}

export {
  DockNav,
  dockNavIconVariants,
  dockNavItemVariants,
  dockNavLinkVariants,
  dockNavListVariants,
  dockNavTooltipVariants,
  dockNavVariants,
};

export default DockNav;

