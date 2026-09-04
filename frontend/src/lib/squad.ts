import type { ClassicRole, LeagueConfig, Player, SquadPlayer } from "../types";
import { SCORING_THRESHOLDS } from "../config/scoring";

export const ROLE_TARGETS: Record<ClassicRole, number> = { P: 3, D: 8, C: 8, A: 6 };
export const SQUAD_SIZE = 25;

export function normalizedFvm(player: Player, config: LeagueConfig): number {
  const source = config.mode === "Mantra" ? player.fvm_mantra : player.fvm;
  return Math.round((source * config.budget) / 1000);
}

export function valueDifference(price: number, benchmark: number): number | null {
  if (!benchmark) return null;
  return Math.round(((benchmark - price) / benchmark) * 100);
}

export function valueStatus(price: number, benchmark: number) {
  const difference = valueDifference(price, benchmark);
  if (difference === null) return { label: "N/D", tone: "info" as const };
  if (difference >= SCORING_THRESHOLDS.valuePickMinimumPercent) return { label: "AFFARE", tone: "positive" as const };
  if (difference >= SCORING_THRESHOLDS.goodPriceMinimumPercent) return { label: "BUON PREZZO", tone: "positive" as const };
  if (difference >= SCORING_THRESHOLDS.fairPriceMinimumPercent) return { label: "PREZZO CORRETTO", tone: "info" as const };
  if (difference >= SCORING_THRESHOLDS.overpayMinimumPercent) return { label: "SOPRA PREZZO", tone: "warning" as const };
  return { label: "PAGATO TROPPO", tone: "danger" as const };
}

export function squadTotals(squad: SquadPlayer[], budget: number) {
  const spent = squad.reduce((sum, entry) => sum + entry.paidPrice, 0);
  const remaining = budget - spent;
  const byRole = squad.reduce<Record<ClassicRole, number>>((counts, entry) => {
    counts[entry.player.role_classic] += 1;
    return counts;
  }, { P: 0, D: 0, C: 0, A: 0 });
  return { spent, remaining, usedPercentage: budget ? Math.round((spent / budget) * 100) : 0, byRole };
}

export function safeMaximumBid(squad: SquadPlayer[], budget: number): number {
  const totals = squadTotals(squad, budget);
  const slotsAfterPurchase = Math.max(0, SQUAD_SIZE - squad.length - 1);
  return Math.max(0, totals.remaining - slotsAfterPurchase);
}

export function acquisitionBlockReason(config: LeagueConfig, squad: SquadPlayer[], player: Player, price: number): string | null {
  const totals = squadTotals(squad, config.budget);
  if (squad.some((entry) => entry.player.id === player.id)) return "Giocatore già presente nella rosa.";
  if (squad.length >= SQUAD_SIZE) return "Rosa completa: hai già occupato tutti i 25 slot.";
  if (config.mode !== "Mantra" && totals.byRole[player.role_classic] >= ROLE_TARGETS[player.role_classic]) return `Reparto ${player.role_classic} completo (${ROLE_TARGETS[player.role_classic]} slot).`;
  if (price <= 0) return "Inserisci il prezzo di acquisto.";
  if (price > totals.remaining) return `Supera il budget disponibile di ${totals.remaining} crediti.`;
  const maximum = safeMaximumBid(squad, config.budget);
  if (price > maximum) return `Per completare la rosa lasciando almeno 1 credito per slot puoi offrire al massimo ${maximum}.`;
  return null;
}
