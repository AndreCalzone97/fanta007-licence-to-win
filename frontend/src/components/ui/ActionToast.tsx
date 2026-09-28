import { useEffect, useRef, useState } from "react";

type ActionToastProps = {
  message: string;
  onDismiss: () => void;
  onUndo?: () => void;
  tone?: "success" | "warning" | "error";
};

export function ActionToast({ message, onDismiss, onUndo, tone = "success" }: ActionToastProps) {
  const [exiting, setExiting] = useState(false);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    const timer = window.setTimeout(() => setExiting(true), 3500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!exiting) return;
    const timer = window.setTimeout(() => dismissRef.current(), 220);
    return () => window.clearTimeout(timer);
  }, [exiting]);

  return <div className="action-toast fanta-action-toast" data-tone={tone} data-exiting={exiting} role={tone === "error" ? "alert" : "status"} aria-live={tone === "error" ? "assertive" : "polite"}>
    <span className="fanta-toast-icon" aria-hidden="true">{tone === "success" ? "✓" : tone === "warning" ? "!" : "×"}</span>
    <span className="fanta-toast-message">{message}</span>
    {onUndo && <button type="button" className="fanta-toast-undo" onClick={onUndo}>Annulla</button>}
    <button type="button" className="fanta-toast-close" aria-label="Chiudi notifica" onClick={onDismiss}>×</button>
  </div>;
}
