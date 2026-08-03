export type ReverseMortgageProjection = {
  propertyValue: number;
  /** Assumed property value after growth (same as input if no growth rate). */
  projectedPropertyValue: number;
  startingLoan: number;
  projectedDebt: number;
  remainingEquity: number;
  years: number;
};

/**
 * Project reverse-mortgage debt growth (interest capitalised annually).
 * Optional property growth for equity estimate.
 */
export function projectDebt(inputs: {
  propertyValue: number;
  loanAmount: number;
  /** Annual interest rate as a percent. */
  rate: number;
  years: number;
  /** Optional annual property growth as a percent (default 0). */
  propertyGrowthRate?: number;
}): ReverseMortgageProjection {
  const propertyValue = Math.max(0, inputs.propertyValue);
  const startingLoan = Math.max(0, inputs.loanAmount);
  const years = Math.max(0, inputs.years);
  const r = inputs.rate / 100;
  const g = (inputs.propertyGrowthRate ?? 0) / 100;

  const projectedDebt = startingLoan * Math.pow(1 + r, years);
  const projectedPropertyValue = propertyValue * Math.pow(1 + g, years);
  const remainingEquity = projectedPropertyValue - projectedDebt;

  return {
    propertyValue,
    projectedPropertyValue,
    startingLoan,
    projectedDebt,
    remainingEquity,
    years,
  };
}

export type ReverseMortgageYearRow = {
  year: number;
  debt: number;
  propertyValue: number;
  equity: number;
};

export type ProjectReverseMortgageInputs = {
  propertyValue: number;
  loanAmount: number;
  /** Annual interest rate as a percent. */
  rate: number;
  years: number;
  /** Annual property growth as a percent. */
  propertyGrowthRate?: number;
  establishmentFee?: number;
  ongoingFeeAnnual?: number;
};

/**
 * Multi-year reverse-mortgage equity schedule.
 * Establishment fee is added to debt at year 0; ongoing fees capitalise each year.
 */
export function projectReverseMortgage(
  inputs: ProjectReverseMortgageInputs,
): ReverseMortgageYearRow[] {
  const years = Math.max(0, Math.floor(inputs.years));
  const r = inputs.rate / 100;
  const g = (inputs.propertyGrowthRate ?? 0) / 100;
  const establishmentFee = Math.max(0, inputs.establishmentFee ?? 0);
  const ongoingFee = Math.max(0, inputs.ongoingFeeAnnual ?? 0);

  let debt = Math.max(0, inputs.loanAmount) + establishmentFee;
  let propertyValue = Math.max(0, inputs.propertyValue);
  const rows: ReverseMortgageYearRow[] = [
    {
      year: 0,
      debt,
      propertyValue,
      equity: propertyValue - debt,
    },
  ];

  for (let y = 1; y <= years; y++) {
    debt = debt * (1 + r) + ongoingFee;
    propertyValue = propertyValue * (1 + g);
    rows.push({
      year: y,
      debt,
      propertyValue,
      equity: propertyValue - debt,
    });
  }

  return rows;
}
