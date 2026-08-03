import {
  type Frequency,
  fromAnnual,
  toAnnual,
} from "./frequency";

export type ProjectSuperInputs = {
  current: number;
  /** Total annual contribution (member + employer), dollars per year. */
  annualContribution: number;
  years: number;
  /** Expected annual return as a percent, e.g. `7`. */
  returnRate: number;
};

/**
 * Project super balance with annual compounding and end-of-year contributions.
 */
export function projectSuperBalance(inputs: ProjectSuperInputs): number {
  const { current, annualContribution, years, returnRate } = inputs;
  if (years <= 0) return Math.max(0, current);

  const r = returnRate / 100;
  let balance = Math.max(0, current);

  for (let i = 0; i < years; i++) {
    balance = balance * (1 + r) + annualContribution;
  }

  return balance;
}

/**
 * Employer Super Guarantee contribution.
 * Default rate 12% (SG rate from 1 July 2025).
 */
export function employerSG(
  ordinaryTimeEarnings: number,
  rate = 0.12,
): number {
  if (ordinaryTimeEarnings <= 0 || rate <= 0) return 0;
  return ordinaryTimeEarnings * rate;
}

export type RetirementNeedInputs = {
  annualSpend: number;
  yearsRetired: number;
  /** Expected real/nominal annual return during retirement as a percent. */
  returnRate: number;
};

/**
 * Lump sum needed at retirement to fund annual spending for a fixed period
 * (present value of an ordinary annuity).
 */
export function retirementNeed(inputs: RetirementNeedInputs): number {
  const { annualSpend, yearsRetired, returnRate } = inputs;
  if (annualSpend <= 0 || yearsRetired <= 0) return 0;

  const r = returnRate / 100;
  if (r === 0) return annualSpend * yearsRetired;

  return annualSpend * ((1 - Math.pow(1 + r, -yearsRetired)) / r);
}

export type ProjectSuperDetailedInputs = {
  age: number;
  retirementAge: number;
  /** Ordinary-time earnings / salary (annual). */
  income: number;
  balance: number;
  /** Employer SG rate as a fraction, default 0.12. */
  employerRate?: number;
  /** Extra concessional contributions per year. */
  concessionalExtra?: number;
  /** Extra after-tax contributions per year. */
  afterTaxExtra?: number;
  /** Expected annual return as a percent. */
  returnRate: number;
  /** Fixed admin fee per year. */
  feeAdminAnnual?: number;
  /** Investment fee as a percent of balance per year. */
  feePercent?: number;
  /** Annual insurance premiums deducted from super. */
  insuranceAnnual?: number;
};

export type ProjectSuperDetailedResult = {
  balanceAtRetirement: number;
  totalFees: number;
  totalContributions: number;
  years: number;
};

/**
 * Year-by-year super projection with employer SG, extra contributions, and fees.
 */
export function projectSuperDetailed(
  inputs: ProjectSuperDetailedInputs,
): ProjectSuperDetailedResult {
  const years = Math.max(
    0,
    Math.floor(inputs.retirementAge - inputs.age),
  );
  const employerRate = inputs.employerRate ?? 0.12;
  const concessionalExtra = Math.max(0, inputs.concessionalExtra ?? 0);
  const afterTaxExtra = Math.max(0, inputs.afterTaxExtra ?? 0);
  const r = inputs.returnRate / 100;
  const feeAdmin = Math.max(0, inputs.feeAdminAnnual ?? 0);
  const feePct = Math.max(0, inputs.feePercent ?? 0) / 100;
  const insurance = Math.max(0, inputs.insuranceAnnual ?? 0);
  const income = Math.max(0, inputs.income);

  let balance = Math.max(0, inputs.balance);
  let totalFees = 0;
  let totalContributions = 0;

  for (let i = 0; i < years; i++) {
    const employerContrib = income * employerRate;
    const yearContrib =
      employerContrib + concessionalExtra + afterTaxExtra;
    totalContributions += yearContrib;

    balance = balance * (1 + r) + yearContrib;

    const percentFee = balance * feePct;
    const yearFees = feeAdmin + percentFee + insurance;
    totalFees += yearFees;
    balance = Math.max(0, balance - yearFees);
  }

  return {
    balanceAtRetirement: balance,
    totalFees,
    totalContributions,
    years,
  };
}

export type EmployerSGDetailedInputs = {
  earnings: number;
  frequency: Frequency;
  /** Whether the employee is 18 or older. */
  over18: boolean;
  /**
   * Weekly hours (historical $450/month & under-18/30hr edge cases).
   * Modern AU SG largely applies regardless; when `over18` is false and
   * hours are ≤ 30 this returns 0 as an optional part-time edge case.
   */
  hoursOver30?: boolean;
  /** SG rate as a fraction, default 0.12. */
  rate?: number;
};

/**
 * Employer SG with optional under-18 / part-time edge case.
 *
 * Modern AU Super Guarantee mostly applies to all eligible employees.
 * If `!over18` and `hoursOver30` is not true, returns 0 (historical
 * part-time under-18 edge case). Otherwise returns 12% of earnings
 * converted to the requested frequency.
 */
export function employerSGDetailed(
  inputs: EmployerSGDetailedInputs,
): number {
  const { earnings, frequency, over18 } = inputs;
  const rate = inputs.rate ?? 0.12;
  const hoursOver30 = inputs.hoursOver30 ?? true;

  // Optional historical edge case: under 18 and not working >30 hrs/week
  if (!over18 && !hoursOver30) return 0;

  const annualEarnings = toAnnual(Math.max(0, earnings), frequency);
  const annualSG = employerSG(annualEarnings, rate);
  return fromAnnual(annualSG, frequency);
}
