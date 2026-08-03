import { monthlyPayment, totalInterest } from "./loan";

export type InterestOnlyMortgageInputs = {
  principal: number;
  /** Annual rate as percent. */
  annualRate: number;
  /** Interest-only period in years. */
  ioYears: number;
  /** Remaining term after IO, as P&I years (total loan years = ioYears + piYears often, but MS style: full term with IO then P&I for remainder). */
  totalYears: number;
};

export type InterestOnlyMortgageResult = {
  ioMonthlyPayment: number;
  piMonthlyPayment: number;
  ioInterestTotal: number;
  piInterestTotal: number;
  totalInterest: number;
  totalPaid: number;
  comparablePiMonthly: number;
  comparablePiInterest: number;
  extraInterestVsFullPi: number;
};

/**
 * Interest-only then principal-and-interest mortgage comparison.
 * During IO: pay interest only. After IO: amortise remaining principal over leftover term.
 * Also compares to a full-term P&I loan at the same rate.
 */
export function interestOnlyMortgage(
  inputs: InterestOnlyMortgageInputs,
): InterestOnlyMortgageResult {
  const principal = Math.max(0, inputs.principal);
  const rate = Math.max(0, inputs.annualRate);
  const ioYears = Math.max(0, inputs.ioYears);
  const totalYears = Math.max(ioYears, inputs.totalYears);
  const piYears = Math.max(0.01, totalYears - ioYears);

  const monthlyRate = rate / 100 / 12;
  const ioMonths = Math.round(ioYears * 12);
  const ioMonthlyPayment = principal * monthlyRate;
  const ioInterestTotal = ioMonthlyPayment * ioMonths;

  const piMonthlyPayment = monthlyPayment(principal, rate, piYears);
  const piInterestTotal = totalInterest(principal, rate, piYears);
  const piMonths = Math.round(piYears * 12);

  const totalInterestPaid = ioInterestTotal + piInterestTotal;
  const totalPaid =
    ioMonthlyPayment * ioMonths + piMonthlyPayment * piMonths;

  const comparablePiMonthly = monthlyPayment(principal, rate, totalYears);
  const comparablePiInterest = totalInterest(principal, rate, totalYears);

  return {
    ioMonthlyPayment,
    piMonthlyPayment,
    ioInterestTotal,
    piInterestTotal,
    totalInterest: totalInterestPaid,
    totalPaid,
    comparablePiMonthly,
    comparablePiInterest,
    extraInterestVsFullPi: totalInterestPaid - comparablePiInterest,
  };
}
