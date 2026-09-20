import { useCallback, useState } from "react";
import type { LeagueConfig } from "../types";
import { ContextPanel } from "./ui/ContextPanel";

export function SettingsDialog({ config, open, onClose, onEdit, onReset }: { config: LeagueConfig; open: boolean; onClose: () => void; onEdit: () => void; onReset: () => void }) {
  const [resetArmed, setResetArmed] = useState(false);
  const close = useCallback(() => { setResetArmed(false); onClose(); }, [onClose]);

  if (!open) return null;
  return <ContextPanel titleId="settings-title" onClose={close} className="ops-settings"><section>
      <header><div><h2 id="settings-title">Impostazioni</h2><p>Aggiorna la lega o gestisci i dati salvati su questo dispositivo.</p></div><button className="icon-button" aria-label="Chiudi impostazioni" onClick={close}>×</button></header>
      <div className="settings-group"><span>MISSIONE</span><dl><div><dt>Squadra</dt><dd>{config.teamName}</dd></div><div><dt>Obiettivo</dt><dd>{config.goal}</dd></div></dl><button className="secondary-action" onClick={() => { setResetArmed(false); onEdit(); }}>MODIFICA NOME E OBIETTIVO</button></div>
      <div className="settings-group"><span>CONFIGURAZIONE</span><dl><div><dt>Modalità</dt><dd>{config.mode}</dd></div><div><dt>Budget</dt><dd>{config.budget} crediti</dd></div><div><dt>Partecipanti</dt><dd>{config.participants}</dd></div></dl></div>
      <div className="settings-group destructive"><span>DATI</span><p>Questa operazione eliminerà rosa, prezzi di acquisto e avanzamento della missione.</p>
        {!resetArmed
          ? <button className="danger-action" onClick={() => setResetArmed(true)}>RESETTA LA MISSIONE</button>
          : <div className="reset-confirm"><p>Vuoi davvero ricominciare da zero?</p><button className="danger-action" onClick={onReset}>SÌ, ELIMINA I DATI</button><button className="text-action" onClick={() => setResetArmed(false)}>ANNULLA</button></div>}
      </div>
    </section>
  </ContextPanel>;
}
