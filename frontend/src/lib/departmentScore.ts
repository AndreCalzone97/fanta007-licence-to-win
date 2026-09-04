import type { ClassicRole, LeagueConfig, SquadPlayer } from "../types";
import { getPlayerAppeal } from "./appeal";
import { normalizedFvm, ROLE_TARGETS, valueDifference } from "./squad";

export const DEPARTMENT_META: Record<ClassicRole, { name: string; plural: string }> = {
  P: { name: "Porta", plural: "portieri" },
  D: { name: "Difesa", plural: "difensori" },
  C: { name: "Centrocampo", plural: "centrocampisti" },
  A: { name: "Attacco", plural: "attaccanti" },
};

export type DepartmentScore = {
  role: ClassicRole;
  name: string;
  count: number;
  target: number;
  score: number;
  reasons: string[];
  verdict: string;
  action: string;
};

const roles: ClassicRole[] = ["P", "D", "C", "A"];
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const roundOne = (value: number) => Math.round(value * 10) / 10;

export function getDepartmentScores(config: LeagueConfig, squad: SquadPlayer[]): DepartmentScore[] {
  return roles.map((role) => {
    const entries = squad.filter((entry) => entry.player.role_classic === role);
    const target = ROLE_TARGETS[role];
    if (!entries.length) return {
      role,
      name: DEPARTMENT_META[role].name,
      count: 0,
      target,
      score: 0,
      verdict: "Reparto ancora da costruire.",
      reasons: [`Mancano ${target} ${DEPARTMENT_META[role].plural}`, "Nessun acquisto ancora valutabile"],
      action: `Apri il Listone e copri i ${target} slot di ${DEPARTMENT_META[role].name.toLowerCase()}.`,
    };

    const appealValues = entries.map((entry) => getPlayerAppeal(entry.player, config));
    const averageAppeal = appealValues.reduce((sum, appeal) => sum + appeal.rating, 0) / appealValues.length;
    const quality = appealValues.reduce((sum, appeal) => sum + appeal.score, 0) / appealValues.length / 100;
    const valueSignals = entries.map((entry) => valueDifference(entry.paidPrice, normalizedFvm(entry.player, config))).filter((value): value is number => value !== null);
    const averageValue = valueSignals.length ? valueSignals.reduce((sum, value) => sum + value, 0) / valueSignals.length : 0;
    const priceEfficiency = clamp(.5 + averageValue / 100, 0, 1);
    const completeness = clamp(entries.length / target, 0, 1);
    const departmentSpent = entries.reduce((sum, entry) => sum + entry.paidPrice, 0);
    const budgetShare = config.budget > 0 ? departmentSpent / config.budget * 100 : 0;
    // Formula unica e deterministica: qualità del Listone 55%, prezzo pagato 25%, completezza 20%.
    const score = roundOne(clamp((quality * .55 + priceEfficiency * .25 + completeness * .2) * 5, 0, 5));
    const ranked = [...entries].sort((a, b) => getPlayerAppeal(b.player, config).score - getPlayerAppeal(a.player, config).score);
    const leader = ranked[0];
    const weakest = ranked[ranked.length - 1];
    const priceReason = averageValue >= 10
      ? `Nel complesso hai comprato bene: il reparto è circa ${Math.round(averageValue)}% sotto il riferimento FVM`
      : averageValue <= -15
        ? `Qui hai speso sopra riferimento: mediamente circa ${Math.abs(Math.round(averageValue))}% oltre il FVM`
        : `I prezzi sono abbastanza allineati al FVM, senza scostamenti medi estremi`;
    const reasons = [
      completeness >= 1 ? `Reparto completo: ${entries.length}/${target} slot coperti` : `${target - entries.length} slot ancora da coprire`,
      leader ? `${leader.player.name} è il riferimento del reparto (${getPlayerAppeal(leader.player, config).rating.toFixed(1)}/5); media reparto ${averageAppeal.toFixed(1)}/5` : "Nessun acquisto ancora valutabile",
      `${departmentSpent} crediti investiti, pari a circa il ${Math.round(budgetShare)}% del budget iniziale`,
      priceReason,
    ];
    const verdict = score >= 4.25
      ? `${DEPARTMENT_META[role].name} di livello alto: qualità media e gestione dei crediti stanno lavorando nella stessa direzione.`
      : score >= 3.5
        ? `${DEPARTMENT_META[role].name} convincente. La base è buona e non richiede rivoluzioni, ma c’è ancora margine per alzare il picco del reparto.`
        : score >= 2.75
          ? `${DEPARTMENT_META[role].name} utilizzabile, ma non ancora un vero punto di forza. Per il tuo obiettivo serve almeno un salto di qualità o più efficienza nella spesa.`
          : score >= 1.75
            ? `${DEPARTMENT_META[role].name} da rinforzare: oggi è un reparto che può reggere, ma rischia di essere corto o poco incisivo rispetto alle ambizioni della rosa.`
            : `${DEPARTMENT_META[role].name} fragile: tra qualità, completezza e prezzo pagato ci sono troppi segnali deboli per considerarlo già sistemato.`;
    const action = !completeness || entries.length < target ? `Confronta nel Listone nuovi ${DEPARTMENT_META[role].plural} prima di chiudere l’asta.` : averageValue <= -15 ? `Rivedi i prezzi pagati in ${DEPARTMENT_META[role].name.toLowerCase()} e cerca un’alternativa più efficiente.` : getPlayerAppeal(weakest.player, config).score < 45 ? `Cerca un profilo più affidabile per alzare il livello della ${DEPARTMENT_META[role].name.toLowerCase()}.` : `Tieni sotto controllo la ${DEPARTMENT_META[role].name.toLowerCase()} nelle prossime giornate.`;
    return { role, name: DEPARTMENT_META[role].name, count: entries.length, target, score, reasons, verdict, action };
  });
}

export function getDepartmentHighlights(departments: DepartmentScore[]) {
  const active = departments.filter((department) => department.count > 0);
  if (!active.length) return { strongest: null, weakest: null };
  const strongest = [...active].sort((a, b) => b.score - a.score)[0];
  const weakest = [...departments].sort((a, b) => a.score - b.score || a.count / a.target - b.count / b.target)[0];
  return { strongest, weakest };
}
