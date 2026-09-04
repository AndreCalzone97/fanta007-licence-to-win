import { useEffect, useRef, type ElementType, type ReactNode } from "react";

export function Reveal({ children, as: Tag = "section", className = "", delay = 0 }: { children: ReactNode; as?: ElementType; className?: string; delay?: number }) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches || element.dataset.revealed) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      element.dataset.revealed = "true";
      element.animate([
        { opacity: .35, transform: "translateY(10px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: 360, delay, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" });
      observer.disconnect();
    }, { threshold: .08, rootMargin: "0px 0px -24px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  return <Tag ref={ref} className={`reveal ${className}`.trim()}>{children}</Tag>;
}
