import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRight, RotateCcw, X } from "lucide-react";
import type { LeagueConfig } from "../types";
import { ContextPanel } from "./ui/ContextPanel";
import "../styles/settings-v21.css";

export function SettingsDialog({ config, open, onClose, onEdit, onReset }: { config: LeagueConfig; open: boolean; onClose: () => void; onEdit: () => void; onReset: () => void }) {
  const [resetArmed, setResetArmed] = useState(false);
  const resetTriggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => { setResetArmed(false); onClose(); }, [onClose]);

  useEffect(() => {
    if (!open || !resetArmed) return;
    cancelRef.current?.focus();
    return () => { if (open) resetTriggerRef.current?.focus(); };
  }, [open, resetArmed]);

  const handleResetDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setResetArmed(false);
    } else if (event.key === "Tab") {
      event.stopPropagation();
      if (event.shiftKey && document.activeElement === cancelRef.current) {
        event.preventDefault();
        confirmRef.current?.focus();
      } else if (!event.shiftKey && document.activeElement === confirmRef.current) {
        event.preventDefault();
        cancelRef.current?.focus();
      }
    }
  };

  if (!open) return null;
  return <ContextPanel titleId="settings-title" onClose={resetArmed ? () => setResetArmed(false) : close} className="ops-settings ops-settings-v21">
    <section className="settings-center">
      <div className="settings-center-content" inert={resetArmed}>
        <header className="settings-center-header">
          <div>
            <span className="settings-center-kicker">FANTA007 <span aria-hidden="true">/</span> CONTROL CENTER</span>
            <h2 id="settings-title">Impostazioni</h2>
            <p>La tua missione, le regole della lega e i dati salvati.</p>
          </div>
          <button className="settings-center-close" aria-label="Chiudi impostazioni" onClick={close}><X size={20} aria-hidden="true" /></button>
        </header>

        <div className="settings-center-sections">
          <section className="settings-center-group" aria-labelledby="settings-mission-title">
            <div className="settings-center-section-heading"><span className="settings-center-marker" aria-hidden="true">01</span><h3 id="settings-mission-title">Missione</h3></div>
            <div className="settings-center-card settings-center-mission-card glass-surface-base">
              <dl>
                <div><dt>Squadra</dt><dd>{config.teamName}</dd></div>
                <div><dt>Obiettivo</dt><dd>{config.goal}</dd></div>
              </dl>
              <button className="settings-center-edit" onClick={() => { setResetArmed(false); onEdit(); }}>Modifica nome e obiettivo <ArrowUpRight size={16} aria-hidden="true" /></button>
            </div>
          </section>

          <section className="settings-center-group" aria-labelledby="settings-config-title">
            <div className="settings-center-section-heading"><span className="settings-center-marker" aria-hidden="true">02</span><h3 id="settings-config-title">Configurazione</h3></div>
            <div className="settings-center-card settings-center-config-card glass-surface-base">
              <dl>
                <div><dt>Modalità</dt><dd>{config.mode}</dd></div>
                <div><dt>Budget iniziale</dt><dd>{config.budget} <span>crediti</span></dd></div>
                <div><dt>Partecipanti</dt><dd>{config.participants}</dd></div>
              </dl>
            </div>
          </section>

          <section className="settings-center-group" aria-labelledby="settings-data-title">
            <div className="settings-center-section-heading"><span className="settings-center-marker" aria-hidden="true">03</span><h3 id="settings-data-title">Dati</h3></div>
            <div className="settings-center-card settings-center-danger-card glass-surface-strong">
              <div><strong>Ricomincia la missione</strong><p>Elimina rosa, prezzi di acquisto e avanzamento salvati su questo dispositivo.</p></div>
              <button ref={resetTriggerRef} className="settings-center-reset-trigger" onClick={() => setResetArmed(true)}><RotateCcw size={16} aria-hidden="true" /> Resetta la missione</button>
            </div>
          </section>
        </div>
      </div>

      {resetArmed && <div className="settings-reset-overlay">
        <div className="settings-reset-dialog" role="alertdialog" aria-modal="true" aria-labelledby="settings-reset-title" aria-describedby="settings-reset-description" onKeyDown={handleResetDialogKeyDown}>
          <span className="settings-reset-eyebrow">Conferma richiesta</span>
          <h3 id="settings-reset-title">Resettare la missione?</h3>
          <p id="settings-reset-description">Rosa, prezzi di acquisto e avanzamento verranno eliminati da questo dispositivo. L’operazione non può essere annullata.</p>
          <div className="settings-reset-actions">
            <button ref={cancelRef} className="settings-reset-cancel" onClick={() => setResetArmed(false)}>Annulla</button>
            <button ref={confirmRef} className="settings-reset-confirm" onClick={onReset}>Sì, elimina i dati</button>
          </div>
        </div>
      </div>}
    </section>
  </ContextPanel>;
}
