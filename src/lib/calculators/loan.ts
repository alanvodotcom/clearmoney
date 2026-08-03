import {
  type Frequency,
  periodsPerYear,
} from "./frequency";

export type LoanInputs = {
  principal: number;
  /** Annual interest rate as a percent, e.g. `6.5` for 6.5%. */
  annualRate: number;
  years: number;
};

export type LoanScheduleSummary = {
  monthlyPayment: number;
  totalPayments: number;
  totalPaid: number;
  totalInterest: number;
  principal: number;
  months: number;
};

export type LoanComparison = {
  loanA: LoanScheduleSummary;
  loanB: LoanScheduleSummary;
  paymentDifference: number;
  interestDifference: number;
  cheaperLoan: "A" | "B" | "equal";
};

/** Result of a frequency-aware payment / borrow / repay calculation. */
export type LoanModeResult = {
  principal: number;
  payment: number;
  annualRate: number;
  years: number;
  frequency: Frequency;
  periods: number;
  totalPaid: number;
  totalInterest: number;
};

export type LoanWithFeesResult = LoanModeResult & {
  /** Regular fee charged each payment period. */
  feePerPeriod: number;
  /** Total fees over the loan term. */
  totalFees: number;
  /** Principal + interest + fees. */
  totalCost: number;
};

function monthlyRate(annualRatePercent: number): number {
  return annualRatePercent / 100 / 12;
}

function periodRate(annualRatePercent: number, freq: Frequency): number {
  return annualRatePercent / 100 / periodsPerYear(freq);
}

function paymentCount(years: number): number {
  return Math.max(0, Math.round(years * 12));
}

function periodCount(years: number, freq: Frequency): number {
  return Math.max(0, Math.round(years * periodsPerYear(freq)));
}

/** Standard amortising loan repayment (principal & interest). */
export function monthlyPayment(
  principal: number,
  annualRate: number,
  years: number,
): number {
  if (principal <= 0 || years <= 0) return 0;

  const n = paymentCount(years);
  const r = monthlyRate(annualRate);

  if (r === 0) return principal / n;

  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}

/** Total interest paid over the full term of an amortising loan. */
export function totalInterest(
  principal: number,
  annualRate: number,
  years: number,
): number {
  if (principal <= 0 || years <= 0) return 0;
  const payment = monthlyPayment(principal, annualRate, years);
  const n = paymentCount(years);
  return payment * n - principal;
}

/** Summary of an amortising loan (no per-period schedule rows). */
export function scheduleSummary(inputs: LoanInputs): LoanScheduleSummary {
  const { principal, annualRate, years } = inputs;
  const months = paymentCount(years);
  const payment = monthlyPayment(principal, annualRate, years);
  const totalPaid = payment * months;
  const interest = totalPaid - principal;

  return {
    monthlyPayment: payment,
    totalPayments: months,
    totalPaid,
    totalInterest: interest,
    principal,
    months,
  };
}

/** Compare two amortising loans on payment and interest. */
export function compareTwoLoans(
  loanA: LoanInputs,
  loanB: LoanInputs,
): LoanComparison {
  const summaryA = scheduleSummary(loanA);
  const summaryB = scheduleSummary(loanB);
  const interestDifference = summaryA.totalInterest - summaryB.totalInterest;
  const paymentDifference = summaryA.monthlyPayment - summaryB.monthlyPayment;

  let cheaperLoan: "A" | "B" | "equal" = "equal";
  if (Math.abs(interestDifference) < 0.01) {
    cheaperLoan = "equal";
  } else if (interestDifference < 0) {
    cheaperLoan = "A";
  } else {
    cheaperLoan = "B";
  }

  return {
    loanA: summaryA,
    loanB: summaryB,
    paymentDifference,
    interestDifference,
    cheaperLoan,
  };
}

/**
 * Amortising payment at an arbitrary repayment frequency.
 */
export function paymentForFrequency(
  principal: number,
  annualRate: number,
  years: number,
  freq: Frequency,
): number {
  if (principal <= 0 || years <= 0) return 0;

  const n = periodCount(years, freq);
  if (n === 0) return 0;
  const r = periodRate(annualRate, freq);

  if (r === 0) return principal / n;

  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}

/**
 * Maximum principal that can be borrowed given a fixed periodic payment.
 */
export function principalFromPayment(
  payment: number,
  annualRate: number,
  years: number,
  freq: Frequency,
): number {
  if (payment <= 0 || years <= 0) return 0;

  const n = periodCount(years, freq);
  if (n === 0) return 0;
  const r = periodRate(annualRate, freq);

  if (r === 0) return payment * n;

  return (payment * (1 - Math.pow(1 + r, -n))) / r;
}

/**
 * Months to repay a loan with a fixed periodic payment.
 * Returns `Infinity` if the payment does not cover first-period interest.
 */
export function timeToRepay(
  principal: number,
  payment: number,
  annualRate: number,
  freq: Frequency,
): number {
  if (principal <= 0) return 0;
  if (payment <= 0) return Infinity;

  const r = periodRate(annualRate, freq);
  const ppy = periodsPerYear(freq);

  if (r === 0) {
    return Math.ceil(principal / payment) * (12 / ppy);
  }

  if (payment <= principal * r) return Infinity;

  const n =
    Math.log(payment / (payment - principal * r)) / Math.log(1 + r);

  if (!Number.isFinite(n) || n < 0) return Infinity;

  // Convert periods → months
  return Math.ceil(n) * (12 / ppy);
}

/**
 * Loan summary including a regular fee charged each payment period.
 * `feeAnnual` is converted to a per-period fee.
 */
export function loanWithFees(
  principal: number,
  annualRate: number,
  years: number,
  feeAnnual: number,
  freq: Frequency,
): LoanWithFeesResult {
  const payment = paymentForFrequency(principal, annualRate, years, freq);
  const n = periodCount(years, freq);
  const feePerPeriod = Math.max(0, feeAnnual) / periodsPerYear(freq);
  const totalPaid = payment * n;
  const totalInterest = totalPaid - Math.max(0, principal);
  const totalFees = feePerPeriod * n;
  const totalCost = totalPaid + totalFees;

  return {
    principal: Math.max(0, principal),
    payment,
    annualRate,
    years,
    frequency: freq,
    periods: n,
    totalPaid,
    totalInterest,
    feePerPeriod,
    totalFees,
    totalCost,
  };
}
