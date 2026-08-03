import { projectSuperBalance } from "./super";

export type SuperContributionsOptimiserInputs = {
  currentBalance: number;
  annualSalary: number;
  /** Years until retirement. */
  years: number;
  /** Assumed return % p.a. */
  returnRate: number;
  /** Employer SG rate as decimal, default 0.12. */
  sgRate?: number;
  /** Extra concessional contribution per year (salary sacrifice etc.). */
  extraConcessional: number;
  /** Extra after-tax contribution per year. */
  extraAfterTax: number;
  /** Illustrative concessional cap (dollars). */
  concessionalCap?: number;
};

export type SuperContributionsOptimiserResult = {
  sgAnnual: number;
  concessionalTotal: number;
  overCap: boolean;
  overCapAmount: number;
  balanceBase: number;
  balanceWithExtras: number;
  uplift: number;
};

/**
 * Compare projected super with SG only vs SG + voluntary contributions.
 * Flags if concessional total exceeds a simple annual cap.
 */
export function superContributionsOptimiser(
  inputs: SuperContributionsOptimiserInputs,
): SuperContributionsOptimiserResult {
  const sgRate = inputs.sgRate ?? 0.12;
  const cap = inputs.concessionalCap ?? 30_000;
  const salary = Math.max(0, inputs.annualSalary);
  const sgAnnual = salary * sgRate;
  const extraC = Math.max(0, inputs.extraConcessional);
  const extraA = Math.max(0, inputs.extraAfterTax);
  const concessionalTotal = sgAnnual + extraC;
  const overCapAmount = Math.max(0, concessionalTotal - cap);

  const years = Math.max(0, inputs.years);
  const rate = Math.max(0, inputs.returnRate);
  const current = Math.max(0, inputs.currentBalance);

  const balanceBase = projectSuperBalance({
    current,
    annualContribution: sgAnnual,
    years,
    returnRate: rate,
  });
  const balanceWithExtras = projectSuperBalance({
    current,
    annualContribution: sgAnnual + extraC + extraA,
    years,
    returnRate: rate,
  });

  return {
    sgAnnual,
    concessionalTotal,
    overCap: overCapAmount > 0,
    overCapAmount,
    balanceBase,
    balanceWithExtras,
    uplift: balanceWithExtras - balanceBase,
  };
}
