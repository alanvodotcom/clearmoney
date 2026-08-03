import { monthlyPayment } from "./loan";

export type MortgageSwitchingInputs = {
  currentBalance: number;
  /** Current annual rate as a percent. */
  currentRate: number;
  yearsRemaining: number;
  /** Ongoing annual fee on the current loan. */
  currentFeeAnnual: number;
  /** Exit / break fee to leave the current loan. */
  exitFee: number;
  /** Ongoing (or post-intro) annual rate on the new loan as a percent. */
  newRate: number;
  /** Optional introductory rate as a percent. */
  newIntroRate?: number;
  /** Months the intro rate applies. */
  introMonths?: number;
  applicationFee: number;
  otherFees: number;
  /** Ongoing annual fee on the new loan. */
  newFeeAnnual: number;
};

export type MortgageSwitchingResult = {
  currentMonthlyPayment: number;
  newMonthlyPayment: number;
  /** Average monthly payment saving (interest + fee effect, first-year style). */
  monthlySaving: number;
  switchCost: number;
  breakEvenMonths: number;
  worthSwitching: boolean;
  currentTotalInterestApprox: number;
  newTotalInterestApprox: number;
};

/**
 * Estimate whether switching home loans is worthwhile.
 * Uses amortising payments; intro rate averaged into an effective first-period rate
 * when provided. Break-even = upfront switch costs ÷ monthly saving.
 */
export function mortgageSwitching(
  inputs: MortgageSwitchingInputs,
): MortgageSwitchingResult {
  const balance = Math.max(0, inputs.currentBalance);
  const years = Math.max(0, inputs.yearsRemaining);
  const months = Math.round(years * 12);

  const currentMonthly = monthlyPayment(
    balance,
    inputs.currentRate,
    years,
  );
  const currentFeeMonthly = Math.max(0, inputs.currentFeeAnnual) / 12;
  const currentTotalMonthly = currentMonthly + currentFeeMonthly;

  const introMonths = Math.max(
    0,
    Math.min(months, Math.round(inputs.introMonths ?? 0)),
  );
  const hasIntro =
    inputs.newIntroRate != null && introMonths > 0 && months > 0;

  let newMonthly: number;
  if (hasIntro) {
    const introPayment = monthlyPayment(
      balance,
      inputs.newIntroRate!,
      years,
    );
    // Approximate remaining balance after intro, then ongoing payment
    const introR = inputs.newIntroRate! / 100 / 12;
    let bal = balance;
    for (let m = 0; m < introMonths; m++) {
      const interest = bal * introR;
      bal = Math.max(0, bal - (introPayment - interest));
    }
    const remainingYears = Math.max(0, (months - introMonths) / 12);
    const ongoingPayment =
      remainingYears > 0
        ? monthlyPayment(bal, inputs.newRate, remainingYears)
        : 0;

    // Blended monthly for comparison over remaining term
    const totalPaidApprox =
      introPayment * introMonths + ongoingPayment * (months - introMonths);
    newMonthly = months > 0 ? totalPaidApprox / months : 0;
  } else {
    newMonthly = monthlyPayment(balance, inputs.newRate, years);
  }

  const newFeeMonthly = Math.max(0, inputs.newFeeAnnual) / 12;
  const newTotalMonthly = newMonthly + newFeeMonthly;

  const monthlySaving = currentTotalMonthly - newTotalMonthly;
  const switchCost =
    Math.max(0, inputs.exitFee) +
    Math.max(0, inputs.applicationFee) +
    Math.max(0, inputs.otherFees);

  const breakEvenMonths =
    monthlySaving > 0 ? switchCost / monthlySaving : Infinity;

  const currentTotalInterestApprox =
    currentMonthly * months - balance + currentFeeMonthly * months;
  const newTotalInterestApprox =
    newMonthly * months - balance + newFeeMonthly * months + switchCost;

  const worthSwitching =
    monthlySaving > 0 &&
    Number.isFinite(breakEvenMonths) &&
    breakEvenMonths < months &&
    newTotalInterestApprox < currentTotalInterestApprox;

  return {
    currentMonthlyPayment: currentTotalMonthly,
    newMonthlyPayment: newTotalMonthly,
    monthlySaving,
    switchCost,
    breakEvenMonths,
    worthSwitching,
    currentTotalInterestApprox,
    newTotalInterestApprox,
  };
}
