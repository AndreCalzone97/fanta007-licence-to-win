import type { LeagueConfig, SquadPlayer } from "../types";

export const SQUAD_KEY = "fanta007.squad.v2";
export const LEGACY_SQUAD_KEY = "fanta007.squad.v1";
export const LEGACY_LEAGUE_KEY = "fanta007.league.v2";
export type StoredSquad = {
  version: 2;
  config: LeagueConfig;
  players: { player_id: number; paidPrice: number; addedAt: string }[];
};
export type ResolvedSquad = { config: LeagueConfig; squad: SquadPlayer[] };
type StoragePort = Pick<Storage, "getItem" | "setItem">;

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Salvataggio rosa non valido");
  return value as Record<string, unknown>;
}

export function readSavedSquad(storage: StoragePort): unknown | null {
  const current = storage.getItem(SQUAD_KEY);
  if (current !== null) {
    const parsed = object(JSON.parse(current));
    if (parsed.version !== 2) throw new Error("Versione del salvataggio non supportata");
    return parsed; // FastAPI validates every field before this is used by the UI.
  }
  const config = storage.getItem(LEGACY_LEAGUE_KEY);
  const old = storage.getItem(LEGACY_SQUAD_KEY);
  if (config === null && old === null) return null;
  if (config === null) throw new Error("Configurazione della rosa mancante");
  const entries: unknown = old === null ? [] : JSON.parse(old);
  if (!Array.isArray(entries)) throw new Error("Formato della vecchia rosa non valido");
  return {
    version: 2,
    config: JSON.parse(config),
    players: entries.map((item: unknown) => {
      const entry = object(item);
      return { player_id: object(entry.player).id, paidPrice: entry.paidPrice, addedAt: entry.addedAt };
    }),
  };
}

export function normalizeSquad(config: LeagueConfig, squad: SquadPlayer[]): StoredSquad {
  return { version: 2, config, players: squad.map(({ player, paidPrice, addedAt }) => ({ player_id: player.id, paidPrice, addedAt })) };
}

async function readJsonBody(response: Response): Promise<unknown | null> {
  const text = await response.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Risposta API non valida (HTTP ${response.status})`);
  }
}

export async function resolveSquad(saved: unknown, baseUrl: string, signal?: AbortSignal): Promise<ResolvedSquad> {
  const response = await fetch(`${baseUrl}/squads/resolve`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(saved), signal,
  });
  if (!response.ok) {
    const payload = await readJsonBody(response);
    const detail = payload && typeof payload === "object" && "detail" in payload
      ? (payload as { detail?: unknown }).detail
      : null;
    throw new Error(typeof detail === "string" ? detail : `Errore API nella rosa (HTTP ${response.status})`);
  }
  const payload = await readJsonBody(response);
  if (!payload || typeof payload !== "object") {
    throw new Error(`Risposta API vuota nella rosa (HTTP ${response.status})`);
  }
  return payload as ResolvedSquad;
}

export async function loadSquad(storage: StoragePort, resolver: (saved: unknown) => Promise<ResolvedSquad>): Promise<ResolvedSquad | null> {
  const saved = readSavedSquad(storage);
  if (saved === null) return null;
  const resolved = await resolver(saved);
  // One write includes config and entries. Legacy keys are retained as a backup.
  storage.setItem(SQUAD_KEY, JSON.stringify(normalizeSquad(resolved.config, resolved.squad)));
  return resolved;
}

export async function saveSquad(storage: StoragePort, config: LeagueConfig, squad: SquadPlayer[], resolver: (saved: unknown) => Promise<ResolvedSquad>): Promise<ResolvedSquad> {
  const resolved = await resolver(normalizeSquad(config, squad));
  storage.setItem(SQUAD_KEY, JSON.stringify(normalizeSquad(resolved.config, resolved.squad)));
  return resolved;
}
