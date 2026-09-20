import type { ButtonHTMLAttributes, CSSProperties } from "react";

// Original CSS radial-reveal pattern, preserving native button semantics.
export function RadialAction({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`primary-action club-radial ${className}`} onPointerEnter={event => {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--reveal-x", `${event.clientX - box.left}px`);
    event.currentTarget.style.setProperty("--reveal-y", `${event.clientY - box.top}px`);
    props.onPointerEnter?.(event);
  }} style={{ "--reveal-x": "50%", "--reveal-y": "50%", ...props.style } as CSSProperties}><span>{children}</span><span className="club-radial-fill" aria-hidden="true" /></button>;
}
