import type { ClassicRole, Player, PlayerSeasonStats } from "../types";

export interface PlayerStatsProvider {
  id: string;
  label: string;
  seasons(player: Player): PlayerSeasonStats[];
}

export const embeddedStatsProvider: PlayerStatsProvider = {
  id: "embedded-verified",
  label: "Dataset verificato Fanta007",
  seasons: (player) => [...player.statistics]
    .filter((season) => Boolean(season.source && season.season))
    .sort((a, b) => b.season.localeCompare(a.season)),
};

export type DataConfidence = "HIGH" | "MEDIUM" | "LOW";

export function dataConfidence(player: Player): DataConfidence {
  const seasons = embeddedStatsProvider.seasons(player);
  if (!seasons.length) return "LOW";
  const distinctSeasons = new Set(seasons.map((entry) => entry.season)).size;
  const primaryHistory = seasons.some((entry) => entry.season !== "2026/27" && /fantacalcio\.it/i.test(entry.source) && !/euroleghe/i.test(entry.source));
  const appearances = seasons.reduce((sum, entry) => sum + (entry.appearances ?? 0), 0);
  const coverage = seasons.reduce((sum, entry) => sum + [entry.appearances, entry.average_rating, entry.fantasy_average, entry.goals, entry.assists, entry.minutes].filter((value) => value != null).length, 0);
  const current = seasons.find((entry) => entry.season === "2026/27");
  // Early-season rows with fewer than five appearances are useful context, but not yet reliable evidence.
  if (distinctSeasons === 1 && current && (current.appearances ?? 0) < 5) return "LOW";
  let evidence = 0;
  if (distinctSeasons >= 2) evidence += 2;
  if (primaryHistory) evidence += 2;
  if (appearances >= 20) evidence += 2;
  if (coverage >= 6) evidence += 1;
  if (seasons.some((entry) => /serie a/i.test(entry.competition))) evidence += 1;
  return evidence >= 6 ? "HIGH" : evidence >= 3 ? "MEDIUM" : "LOW";
}

export function seasonContext(season: PlayerSeasonStats, currentSeason = "2026/27") {
  return season.season === currentSeason ? "STAGIONE CORRENTE" : "STAGIONE PRECEDENTE";
}

export function roleAwareStats(role: ClassicRole, season: PlayerSeasonStats) {
  const stats: Array<readonly [string, number | null | undefined]> = [
    ["PV", season.appearances],
    ["Minuti", season.minutes],
    ["MV", season.average_rating],
    ["FM", season.fantasy_average],
  ];

  if (role === "P") {
    stats.push(
      ["Gol subiti", season.goals_conceded],
      ["Rigori parati", season.penalties_saved],
      ["Gialli", season.yellow_cards],
      ["Rossi", season.red_cards],
    );
  } else {
    // Per D/C/A i bonus offensivi sono metriche di primo livello e vengono sempre letti
    // dai campi ufficiali `goals` e `assists` del record stagionale.
    stats.push(["Gol segnati", season.goals], ["Assist", season.assists]);

    if (role === "A") {
      stats.push(["Rigori segnati", season.penalties_scored], ["Rigori sbagliati", season.penalties_missed]);
    }

    stats.push(["Gialli", season.yellow_cards], ["Rossi", season.red_cards]);
  }

  return stats.filter(([, value]) => value != null);
}

export function isNewSerieAArrival(player: Player) {
  const previous = embeddedStatsProvider.seasons(player).find((season) => season.season !== "2026/27");
  return Boolean(previous && previous.competition && !/serie a/i.test(previous.competition));
}
