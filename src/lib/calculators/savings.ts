export type FutureValueInputs = {
  /** Starting balance. */
  principal: number;
  /** Regular contribution each period (default: monthly). */
  contribution: number;
  /** Annual interest rate as a percent, e.g. `4.5`. */
  annualRate: number;
  /** Number of years to project. */
  years: number;
  /**
   * Compounding / contribution frequency per year.
   * Defaults to 12 (monthly) — common for AU savings calculators.
   */
  compoundsPerYear?: number;
  /**
   * When `1`, contributions are made at the beginning of each period (annuity due).
   * Defaults to `0` (end-of-period / ordinary annuity).
   */
  due?: 0 | 1;
};

/**
 * Future value of a lump sum plus regular contributions,
 * compounded at a constant rate.
 */
export function futureValue(inputs: FutureValueInputs): number {
  const {
    principal,
    contribution,
    annualRate,
    years,
    compoundsPerYear = 12,
    due = 0,
  } = inputs;

  if (years <= 0) return Math.max(0, principal);

  const n = years * compoundsPerYear;
  const r = annualRate / 100 / compoundsPerYear;

  if (r === 0) return principal + contribution * n;

  const growth = Math.pow(1 + r, n);
  const fvPrincipal = principal * growth;
  let fvContributions = contribution * ((growth - 1) / r);
  if (due === 1) {
    fvContributions *= 1 + r;
  }
  return fvPrincipal + fvContributions;
}

export type MonthsToGoalInputs = {
  principal: number;
  contribution: number;
  /** Annual interest rate as a percent. */
  annualRate: number;
  goal: number;
};

/**
 * Approximate months to reach a savings goal with monthly contributions.
 * Returns `Infinity` if the goal cannot be reached (e.g. zero/negative cashflow).
 */
export function monthsToGoal(inputs: MonthsToGoalInputs): number {
  const { principal, contribution, annualRate, goal } = inputs;

  if (goal <= principal) return 0;
  if (contribution <= 0 && annualRate <= 0) return Infinity;

  const r = annualRate / 100 / 12;

  if (r === 0) {
    if (contribution <= 0) return Infinity;
    return Math.ceil((goal - principal) / contribution);
  }

  // Solve: FV = P(1+r)^n + PMT*((1+r)^n - 1)/r  for n
  // (1+r)^n = (goal * r + PMT) / (P * r + PMT)
  const numerator = goal * r + contribution;
  const denominator = principal * r + contribution;

  if (denominator <= 0 || numerator / denominator <= 0) return Infinity;

  const n = Math.log(numerator / denominator) / Math.log(1 + r);
  if (!Number.isFinite(n) || n < 0) return Infinity;
  return Math.ceil(n);
}

/**
 * Suggested emergency fund size.
 * AU guidance often uses 3–6 months of essential expenses; default months = 3.
 */
export function emergencyFundTarget(
  monthlyEssentials: number,
  months = 3,
): number {
  if (monthlyEssentials <= 0 || months <= 0) return 0;
  return monthlyEssentials * months;
}

export type RequiredContributionInputs = {
  goal: number;
  principal: number;
  /** Annual interest rate as a percent. */
  annualRate: number;
  years: number;
  compoundsPerYear?: number;
  /** `1` = beginning-of-period contributions (annuity due). */
  due?: 0 | 1;
};

/**
 * Periodic contribution needed to reach a savings goal in a fixed time.
 */
export function requiredContribution(
  inputs: RequiredContributionInputs,
): number {
  const {
    goal,
    principal,
    annualRate,
    years,
    compoundsPerYear = 12,
    due = 0,
  } = inputs;

  if (years <= 0) return Math.max(0, goal - principal);
  if (goal <= principal) return 0;

  const n = years * compoundsPerYear;
  const r = annualRate / 100 / compoundsPerYear;
  const fvPrincipal =
    r === 0 ? principal : principal * Math.pow(1 + r, n);
  const shortfall = goal - fvPrincipal;

  if (shortfall <= 0) return 0;

  if (r === 0) return shortfall / n;

  // Ordinary annuity: PMT = shortfall / (((1+r)^n - 1) / r)
  let pmt = shortfall / ((Math.pow(1 + r, n) - 1) / r);
  if (due === 1) {
    pmt /= 1 + r;
  }
  return pmt;
}

export type FutureValueWithDelayInputs = FutureValueInputs & {
  /** Months to wait before contributions start (principal still compounds). */
  delayMonths: number;
};

/**
 * Future value where contributions start after a delay.
 * Principal compounds during the delay; then regular contributions begin.
 */
export function futureValueWithDelay(
  inputs: FutureValueWithDelayInputs,
): number {
  const {
    principal,
    contribution,
    annualRate,
    years,
    compoundsPerYear = 12,
    due = 0,
    delayMonths,
  } = inputs;

  const delayYears = Math.max(0, delayMonths) / 12;
  const contributeYears = Math.max(0, years - delayYears);

  // Grow principal alone during the delay
  const afterDelay = futureValue({
    principal,
    contribution: 0,
    annualRate,
    years: Math.min(years, delayYears),
    compoundsPerYear,
  });

  if (contributeYears <= 0) return afterDelay;

  return futureValue({
    principal: afterDelay,
    contribution,
    annualRate,
    years: contributeYears,
    compoundsPerYear,
    due,
  });
}
