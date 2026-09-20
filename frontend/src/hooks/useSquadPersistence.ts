import { useEffect, useRef, useState } from "react";
import { loadSquad, resolveSquad, saveSquad } from "../lib/squadPersistence";
import type { LeagueConfig, SquadPlayer } from "../types";
import { API_BASE_URL } from "../lib/api";

export function useSquadPersistence() {
  const [config, setConfig] = useState<LeagueConfig | null>(null);
  const [squad, setSquad] = useState<SquadPlayer[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  const resolver = (saved: unknown) => resolveSquad(saved, API_BASE_URL);

  useEffect(() => {
    const controller = new AbortController();
    loadSquad(localStorage, (saved) => resolveSquad(saved, API_BASE_URL, controller.signal))
      .then((loaded) => {
        if (controller.signal.aborted) return;
        if (loaded) { setConfig(loaded.config); setSquad(loaded.squad); }
        setReady(true);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          const rawMessage = reason instanceof Error ? reason.message : String(reason);
          const message = reason instanceof TypeError || /Unexpected end of JSON input|Failed to execute 'json' on 'Response'/i.test(rawMessage)
            ? "Backend non raggiungibile o risposta API vuota dalla preview. Avvia l’API locale e premi Riprova; i dati salvati nel browser non sono stati modificati."
            : rawMessage;
          setError(message);
          setReady(true);
        }
      });
    return () => controller.abort();
  }, []);

  async function save(nextConfig: LeagueConfig, nextSquad: SquadPlayer[]) {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      const saved = await saveSquad(localStorage, nextConfig, nextSquad, resolver);
      setConfig(saved.config);
      setSquad(saved.squad);
      return true;
    } catch (reason) {
      setError(String(reason));
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return { config, squad, ready, busy, error, dismissError: () => setError(null), save };
}
