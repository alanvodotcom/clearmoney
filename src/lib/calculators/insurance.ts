export type LifeCoverEstimateInputs = {
  funeral?: number;
  mortgage?: number;
  otherDebts?: number;
  educationCosts?: number;
  /** Annual living / income-replacement amount. */
  annualLiving?: number;
  /** Years of living costs to fund. */
  livingYears?: number;
  /** Assets / existing cover that reduce the need. */
  assetsOffset?: number;
  /** Inflation on living costs as a percent (default 2.5). */
  inflation?: number;
  /** Discount / investment return as a percent (default 3). */
  returnRate?: number;
  /**
   * @deprecated Legacy simple model — used only when `annualLiving` is omitted.
   */
  annualIncome?: number;
  /** @deprecated Legacy years of income replacement. */
  years?: number;
  /** @deprecated Legacy debts total. */
  debts?: number;
  /** @deprecated Legacy existing cover. */
  existingCover?: number;
};

export type LifeCoverEstimateResult = {
  livingCostsPV: number;
  debtsAndCosts: number;
  assetsOffset: number;
  suggestedCover: number;
  /** Legacy field: same as livingCostsPV for simple model. */
  incomeReplacement: number;
  debts: number;
  existingCover: number;
};

/**
 * Present value of a growing annuity (living costs rising with inflation,
 * discounted at returnRate).
 */
function growingAnnuityPV(
  annualPayment: number,
  years: number,
  inflationPct: number,
  returnPct: number,
): number {
  if (annualPayment <= 0 || years <= 0) return 0;

  const g = inflationPct / 100;
  const r = returnPct / 100;

  if (Math.abs(r - g) < 1e-12) {
    return (annualPayment * years) / (1 + r);
  }

  // PV of payments at end of each year: P * Σ ((1+g)/(1+r))^t
  const ratio = (1 + g) / (1 + r);
  return (annualPayment * ratio * (1 - Math.pow(ratio, years))) / (1 - ratio);
}

/**
 * Life insurance cover estimate.
 *
 * Rich model: funeral + mortgage + other debts + education +
 * PV of living costs (inflation & return) − assets offset.
 *
 * Legacy model (when `annualLiving` omitted): income × years + debts − cover.
 */
export function lifeCoverEstimate(
  inputs: LifeCoverEstimateInputs,
): LifeCoverEstimateResult {
  const hasRichModel =
    inputs.annualLiving != null ||
    inputs.funeral != null ||
    inputs.mortgage != null ||
    inputs.otherDebts != null ||
    inputs.educationCosts != null;

  if (!hasRichModel && inputs.annualIncome != null) {
    const annualIncome = Math.max(0, inputs.annualIncome);
    const years = Math.max(0, inputs.years ?? 0);
    const debts = Math.max(0, inputs.debts ?? 0);
    const existingCover = Math.max(0, inputs.existingCover ?? 0);
    const incomeReplacement = annualIncome * years;
    const suggestedCover = Math.max(
      0,
      incomeReplacement + debts - existingCover,
    );

    return {
      livingCostsPV: incomeReplacement,
      debtsAndCosts: debts,
      assetsOffset: existingCover,
      suggestedCover,
      incomeReplacement,
      debts,
      existingCover,
    };
  }

  const funeral = Math.max(0, inputs.funeral ?? 0);
  const mortgage = Math.max(0, inputs.mortgage ?? 0);
  const otherDebts = Math.max(0, inputs.otherDebts ?? 0);
  const educationCosts = Math.max(0, inputs.educationCosts ?? 0);
  const annualLiving = Math.max(0, inputs.annualLiving ?? 0);
  const livingYears = Math.max(0, inputs.livingYears ?? 0);
  const assetsOffset = Math.max(
    0,
    inputs.assetsOffset ?? inputs.existingCover ?? 0,
  );
  const inflation = inputs.inflation ?? 2.5;
  const returnRate = inputs.returnRate ?? 3;

  const livingCostsPV = growingAnnuityPV(
    annualLiving,
    livingYears,
    inflation,
    returnRate,
  );
  const debtsAndCosts = funeral + mortgage + otherDebts + educationCosts;
  const suggestedCover = Math.max(
    0,
    livingCostsPV + debtsAndCosts - assetsOffset,
  );

  return {
    livingCostsPV,
    debtsAndCosts,
    assetsOffset,
    suggestedCover,
    incomeReplacement: livingCostsPV,
    debts: debtsAndCosts,
    existingCover: assetsOffset,
  };
}
