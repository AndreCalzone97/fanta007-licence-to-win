export const SCORING_THRESHOLDS = {
  valuePickMinimumPercent: 20,
  goodPriceMinimumPercent: 10,
  fairPriceMinimumPercent: -10,
  overpayMinimumPercent: -30,
  budgetRiskMaximumPercent: -30,
  spendPaceBufferShare: 0.1,
  eliteRoleTopPercent: 10,
  quotationDeclineMaximum: -1,
} as const;

export const SCORING_METHODS = {
  valueDifference: "(FVM normalizzato − prezzo pagato) / FVM normalizzato × 100",
  roleComposition: "Rosa Classic di riferimento: 3 P, 8 D, 8 C, 6 A",
  roleBenchmark: "Percentile di ruolo con pareggi a metà (valori inferiori + metà dei pari valore)",
} as const;
