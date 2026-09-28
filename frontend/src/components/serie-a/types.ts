export type Standing = { position: number; team: string; teamLogo?: string | null; played: number | null; won: number | null; drawn: number | null; lost: number | null; goalsFor: number | null; goalsAgainst: number | null; goalDifference: number | null; points: number | null };
export type Match = { id: string | number; matchday: string; date: string | null; status: string; homeTeam: string; awayTeam: string; homeLogo?: string | null; awayLogo?: string | null; homeScore: number | null; awayScore: number | null };
export type Feed = { mode: "demo" | "live" | "stale"; source: string; updatedAt: string | null; standings: Standing[]; nextMatches: Match[]; lastMatches: Match[] };
export type MatchDetail = { match: Match; mode: Feed["mode"]; events: { minute: number | null; extraMinute?: number | null; team: string | null; player: string | null; type: string | null; detail: string | null }[]; lineups: { team: string | null; formation: string | null; players: string[] }[]; statistics: { team: string | null; items: { type: string; value: string | number | null }[] }[] };

export const emptyFeed: Feed = { mode: "demo", source: "Feed non connesso · dati non disponibili", updatedAt: null, standings: [], nextMatches: [], lastMatches: [] };
export function isMatch(value: unknown): value is Match {
  if (!value || typeof value !== "object") return false;
  const match = value as Partial<Match>;
  return (typeof match.id === "string" || typeof match.id === "number") && typeof match.matchday === "string" && typeof match.status === "string" && typeof match.homeTeam === "string" && typeof match.awayTeam === "string";
}
export function isFeed(value: unknown): value is Feed {
  if (!value || typeof value !== "object") return false;
  const feed = value as Partial<Feed>;
  return ["demo", "live", "stale"].includes(feed.mode ?? "") && typeof feed.source === "string" && Array.isArray(feed.standings) && feed.standings.every(row => row && typeof row.team === "string" && typeof row.position === "number") && Array.isArray(feed.nextMatches) && feed.nextMatches.every(isMatch) && Array.isArray(feed.lastMatches) && feed.lastMatches.every(isMatch);
}
export function formatMatchDate(value: string | null) {
  if (!value) return "Data da definire";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Data da definire" : date.toLocaleString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
export function score(match: Match) { return typeof match.homeScore !== "number" || typeof match.awayScore !== "number" ? "—" : `${match.homeScore} : ${match.awayScore}`; }
