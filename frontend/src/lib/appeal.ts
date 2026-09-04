import type { LeagueConfig, Player, PlayerSeasonStats } from "../types";
import scoringReference from "../config/scoringReference.json";
import { dataConfidence, type DataConfidence } from "./playerStats";

const LEVEL_THRESHOLDS = [20, 40, 62, 80] as const;
const labels = ["MOLTO BASSA", "BASSA", "INTERESSANTE", "ALTA", "ÉLITE"] as const;
type RoleReference = { fvm: number[]; fvm_mantra: number[]; qa: number[]; qa_mantra: number[]; seasons: Record<string, { fantasy_average: number[]; average_rating: number[] }> };

export type PlayerAppeal = { score: number; rating: number; level: 1 | 2 | 3 | 4 | 5; label: typeof labels[number]; confidence: DataConfidence; reasons: string[]; methodology: string };
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const percentile = (values: number[], value: number) => { if (!values.length) return 50; const less = values.filter((candidate) => candidate < value).length; const equal = values.filter((candidate) => candidate === value).length; return ((less + equal / 2) / values.length) * 100; };
const roleReference = (role: Player["role_classic"]): RoleReference => (scoringReference.roles as Record<string, RoleReference>)[role];

function seasonSignal(role: Player["role_classic"], stats: PlayerSeasonStats) {
  const season = roleReference(role).seasons[stats.season];
  if (!season || (stats.fantasy_average == null && stats.average_rating == null)) return null;
  const fantasy = stats.fantasy_average == null ? null : percentile(season.fantasy_average, stats.fantasy_average);
  const rating = stats.average_rating == null ? null : percentile(season.average_rating, stats.average_rating);
  return fantasy == null ? rating : rating == null ? fantasy : fantasy * .75 + rating * .25;
}
function historicalSignal(player: Player) {
  const entries = player.statistics.filter((entry) => (entry.appearances ?? 0) > 0 && seasonSignal(player.role_classic, entry) != null);
  if (!entries.length) return null;
  const current = entries.find((entry) => entry.season === "2026/27");
  const previous = entries.find((entry) => entry.season !== "2026/27");
  if (current && previous) { const currentWeight = clamp((current.appearances ?? 0) / ((current.appearances ?? 0) + 12), .2, .75); return (seasonSignal(player.role_classic, previous) ?? 50) * (1 - currentWeight) + (seasonSignal(player.role_classic, current) ?? 50) * currentWeight; }
  return seasonSignal(player.role_classic, current ?? previous!);
}

export function getPlayerAppeal(player: Player, config: LeagueConfig): PlayerAppeal {
  const reference = roleReference(player.role_classic);
  const listFvm = config.mode === "Mantra" ? player.fvm_mantra : player.fvm;
  const currentQa = config.mode === "Mantra" ? player.current_quotation_mantra : player.current_quotation;
  const momentum = config.mode === "Mantra" ? player.quotation_delta_mantra : player.quotation_delta;
  const fvmPct = percentile(config.mode === "Mantra" ? reference.fvm_mantra : reference.fvm, listFvm);
  const qaPct = percentile(config.mode === "Mantra" ? reference.qa_mantra : reference.qa, currentQa);
  const trendPct = clamp(50 + momentum * 10, 0, 100);
  const marketSignal = fvmPct * .62 + qaPct * .25 + trendPct * .13;
  const history = historicalSignal(player);
  const combined = history == null ? marketSignal : marketSignal * .7 + history * .3;
  const score = Math.round(clamp(combined, 0, 100));
  const level = (1 + LEVEL_THRESHOLDS.filter((threshold) => score >= threshold).length) as PlayerAppeal["level"];
  const current = player.statistics.find((entry) => entry.season === "2026/27");
  const reasons = [`FVM nel ${Math.round(fvmPct)}° percentile del ruolo`, history == null ? `Quotazione nel ${Math.round(qaPct)}° percentile (${currentQa})` : `Storico FM ponderato: ${Math.round(history)}° percentile`, current && (current.appearances ?? 0) > 0 ? `${current.appearances} presenze nella stagione corrente` : momentum > 0 ? `Quotazione in crescita di ${momentum}` : momentum < 0 ? `Quotazione in calo di ${Math.abs(momentum)}` : "Quotazione stabile"];
  return { score, rating: Math.round(score / 2) / 10, level, label: labels[level - 1], confidence: dataConfidence(player), reasons, methodology: "62% FVM e 25% QA rispetto ai pari ruolo, 13% trend quotazione. Se disponibile, lo storico FM/MV pesa il 30% con un peso maggiore alla stagione corrente solo al crescere delle presenze." };
}
export function objectiveCompatibility(appeal: PlayerAppeal, config: LeagueConfig) {
  const requirement = config.goal === "Vincere e umiliare tutti" ? 4 : config.goal === "Arrivare almeno in Top 3" ? 3 : 2;
  if (appeal.level >= requirement) return { label: "ADATTO", copy: `Per l’obiettivo “${config.goal}” è un profilo che può stare senza problemi nella tua strategia: i riferimenti di ruolo sono dalla sua parte.` };
  if (appeal.level === requirement - 1) return { label: "DA BILANCIARE", copy: `Può starci anche con l’obiettivo “${config.goal}”, ma non dovrebbe essere lui il giocatore chiamato ad alzare da solo il livello del reparto.` };
  return { label: "POCO ADATTO", copy: `Se vuoi davvero centrare “${config.goal}”, questo profilo da solo offre meno garanzie: meglio affiancarlo a un giocatore di fascia superiore o cercare un’alternativa.` };
}
