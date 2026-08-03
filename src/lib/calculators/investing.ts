import {
  type Frequency,
  periodsPerYear,
  toAnnual,
} from "./frequency";

/**
 * Compound growth of a principal over years.
 * @param returnRate Annual return as a percent, e.g. `7`.
 * @param compoundsPerYear Defaults to 1 (annual).
 */
export function compoundGrowth(
  principal: number,
  years: number,
  returnRate: number,
  compoundsPerYear = 1,
): number {
  if (principal <= 0 || years <= 0) return Math.max(0, principal);
  const r = returnRate / 100 / compoundsPerYear;
  const n = years * compoundsPerYear;
  return principal * Math.pow(1 + r, n);
}

export type FeeDragInputs = {
  principal: number;
  years: number;
  /** Gross annual return as a percent. */
  returnRate: number;
  /** Annual fee as a percent of balance, e.g. `0.75`. */
  feeRate: number;
};

export type FeeDragResult = {
  withoutFees: number;
  withFees: number;
  feeCost: number;
};

/**
 * Compare ending balances with and without an annual percentage fee drag.
 */
export function feeDrag(inputs: FeeDragInputs): FeeDragResult {
  const { principal, years, returnRate, feeRate } = inputs;
  const withoutFees = compoundGrowth(principal, years, returnRate);
  const netRate = returnRate - feeRate;
  const withFees = compoundGrowth(principal, years, netRate);

  return {
    withoutFees,
    withFees,
    feeCost: withoutFees - withFees,
  };
}

/**
 * Adjust a today's-dollar amount for inflation over a number of years.
 * @param inflationRate Annual inflation as a percent, e.g. `2.5`.
 */
export function inflationAdjust(
  amount: number,
  years: number,
  inflationRate: number,
): number {
  if (amount === 0 || years <= 0) return amount;
  return amount * Math.pow(1 + inflationRate / 100, years);
}

export type RentVsBuyInputs = {
  propertyPrice: number;
  deposit: number;
  /** Loan annual rate as a percent. */
  loanRate: number;
  loanYears: number;
  annualRent: number;
  /** Assumed annual property growth as a percent. */
  propertyGrowthRate: number;
  years: number;
  /** Optional annual ownership costs (rates, maintenance, insurance). */
  annualOwnershipCosts?: number;
};

export type RentVsBuyResult = {
  buyNetWorth: number;
  rentNetWorth: number;
  difference: number;
  betterOption: "buy" | "rent" | "equal";
  propertyValue: number;
  loanBalanceApprox: number;
  totalRentPaid: number;
};

/**
 * Rough rent-vs-buy comparison over a holding period.
 * Assumes loan amortises with constant payments; deposit otherwise invested
 * at the loan rate when renting (opportunity baseline).
 */
export function rentVsBuy(inputs: RentVsBuyInputs): RentVsBuyResult {
  const {
    propertyPrice,
    deposit,
    loanRate,
    loanYears,
    annualRent,
    propertyGrowthRate,
    years,
    annualOwnershipCosts = 0,
  } = inputs;

  const loanPrincipal = Math.max(0, propertyPrice - deposit);
  const propertyValue = compoundGrowth(
    propertyPrice,
    years,
    propertyGrowthRate,
  );

  // Approximate remaining loan balance after `years` of amortising payments
  const monthlyRate = loanRate / 100 / 12;
  const totalMonths = Math.max(1, Math.round(loanYears * 12));
  const elapsedMonths = Math.min(Math.round(years * 12), totalMonths);

  let monthlyPayment = 0;
  if (loanPrincipal > 0) {
    if (monthlyRate === 0) {
      monthlyPayment = loanPrincipal / totalMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      monthlyPayment = (loanPrincipal * monthlyRate * factor) / (factor - 1);
    }
  }

  let loanBalanceApprox = loanPrincipal;
  for (let m = 0; m < elapsedMonths; m++) {
    const interest = loanBalanceApprox * monthlyRate;
    const principalPaid = monthlyPayment - interest;
    loanBalanceApprox = Math.max(0, loanBalanceApprox - principalPaid);
  }

  const totalOwnershipCosts = annualOwnershipCosts * years;
  const equity = propertyValue - loanBalanceApprox;
  const buyNetWorth = equity - totalOwnershipCosts;

  // Renter: pay rent, invest the deposit, keep leftover vs buy cashflows invested simply
  const totalRentPaid = annualRent * years;
  const investedDeposit = compoundGrowth(deposit, years, loanRate);
  // Rough: money not spent on loan payments (vs rent) is ignored beyond deposit growth
  // for a simple comparison focused on housing equity vs cash + rent cost.
  const rentNetWorth = investedDeposit - totalRentPaid;

  const difference = buyNetWorth - rentNetWorth;
  let betterOption: "buy" | "rent" | "equal" = "equal";
  if (Math.abs(difference) < 1) betterOption = "equal";
  else if (difference > 0) betterOption = "buy";
  else betterOption = "rent";

  return {
    buyNetWorth,
    rentNetWorth,
    difference,
    betterOption,
    propertyValue,
    loanBalanceApprox,
    totalRentPaid,
  };
}

export type ManagedFundsProjectionInputs = {
  principal: number;
  years: number;
  contribution: number;
  /** Contribution frequency (periods per year). */
  contributionFreq: Frequency;
  /** Management fee as a percent of balance p.a. */
  managementFeePercent: number;
  /** Other fixed fees per year. */
  otherFeeAnnual: number;
  /** Fee as a percent of each contribution. */
  contributionFeePercent: number;
  /** Advice fee as a percent of balance p.a. */
  adviceFeePercent: number;
  /** Gross earnings / return as a percent p.a. */
  earningsPercent: number;
};

export type ManagedFundsProjectionResult = {
  balanceWithFees: number;
  balanceWithoutFees: number;
  feeImpact: number;
};

/**
 * Managed-funds style projection with contribution, management, advice, and other fees.
 * Simulates monthly steps for smoother fee drag (MoneySmart-style fee impact).
 */
export function managedFundsProjection(
  inputs: ManagedFundsProjectionInputs,
): ManagedFundsProjectionResult {
  const years = Math.max(0, inputs.years);
  const months = Math.round(years * 12);
  const ppy = periodsPerYear(inputs.contributionFreq);
  const contribPerPeriod = Math.max(0, inputs.contribution);
  const monthlyEarnings = inputs.earningsPercent / 100 / 12;
  const monthlyMgmt = inputs.managementFeePercent / 100 / 12;
  const monthlyAdvice = inputs.adviceFeePercent / 100 / 12;
  const otherFeeMonthly = Math.max(0, inputs.otherFeeAnnual) / 12;
  const contribFeeRate = Math.max(0, inputs.contributionFeePercent) / 100;

  // Contribution lands this many months apart
  const contribInterval = Math.max(1, Math.round(12 / ppy));

  function simulate(applyFees: boolean): number {
    let bal = Math.max(0, inputs.principal);
    for (let m = 1; m <= months; m++) {
      bal *= 1 + monthlyEarnings;

      if (m % contribInterval === 0) {
        const feeOnContrib = applyFees
          ? contribPerPeriod * contribFeeRate
          : 0;
        bal += contribPerPeriod - feeOnContrib;
      }

      if (applyFees) {
        bal -= bal * monthlyMgmt;
        bal -= bal * monthlyAdvice;
        bal -= otherFeeMonthly;
      }

      if (bal < 0) bal = 0;
    }
    return bal;
  }

  const balanceWithFees = simulate(true);
  const balanceWithoutFees = simulate(false);

  return {
    balanceWithFees,
    balanceWithoutFees,
    feeImpact: balanceWithoutFees - balanceWithFees,
  };
}

export type ConsumerLeaseVsBuyInputs = {
  rentalPayment: number;
  rentalFreq: Frequency;
  months: number;
  cashPrice: number;
  loanAmount?: number;
  /** Loan annual rate as a percent. */
  loanRate?: number;
  loanPayment?: number;
  loanFreq?: Frequency;
};

export type ConsumerLeaseVsBuyResult = {
  totalRentalCost: number;
  totalBuyCost: number;
  difference: number;
  cheaperOption: "lease" | "buy" | "equal";
  /** Amount still owed / paid toward ownership under buy path. */
  ownershipValue: number;
};

/**
 * Consumer lease (rent-to-own / goods rental) vs buying outright or on finance.
 */
export function consumerLeaseVsBuy(
  inputs: ConsumerLeaseVsBuyInputs,
): ConsumerLeaseVsBuyResult {
  const months = Math.max(0, inputs.months);
  const annualRent = toAnnual(
    Math.max(0, inputs.rentalPayment),
    inputs.rentalFreq,
  );
  const totalRentalCost = (annualRent / 12) * months;

  const cashPrice = Math.max(0, inputs.cashPrice);
  let totalBuyCost = cashPrice;
  let ownershipValue = cashPrice;

  if (
    inputs.loanAmount != null &&
    inputs.loanAmount > 0 &&
    (inputs.loanPayment != null || inputs.loanRate != null)
  ) {
    const loanAmount = inputs.loanAmount;
    const loanFreq = inputs.loanFreq ?? "monthly";
    const ppy = periodsPerYear(loanFreq);
    const periods = Math.ceil((months / 12) * ppy);

    let payment = inputs.loanPayment;
    if (payment == null && inputs.loanRate != null) {
      const r = inputs.loanRate / 100 / ppy;
      if (r === 0) {
        payment = loanAmount / Math.max(1, periods);
      } else {
        const factor = Math.pow(1 + r, periods);
        payment = (loanAmount * r * factor) / (factor - 1);
      }
    }

    payment = payment ?? 0;
    const totalLoanPayments = payment * periods;
    // Deposit = cash price − loan (if any)
    const deposit = Math.max(0, cashPrice - loanAmount);
    totalBuyCost = deposit + totalLoanPayments;
    ownershipValue = cashPrice;
  }

  const difference = totalRentalCost - totalBuyCost;
  let cheaperOption: "lease" | "buy" | "equal" = "equal";
  if (Math.abs(difference) < 1) cheaperOption = "equal";
  else if (difference > 0) cheaperOption = "buy";
  else cheaperOption = "lease";

  return {
    totalRentalCost,
    totalBuyCost,
    difference,
    cheaperOption,
    ownershipValue,
  };
}
