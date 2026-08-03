export type CreditCardPayoffInputs = {
  balance: number;
  /** Annual percentage rate as a percent, e.g. `19.99`. */
  apr: number;
  monthlyPayment: number;
};

/**
 * Months to pay off a credit card balance with a fixed monthly payment.
 * Returns `Infinity` if the payment does not cover interest.
 */
export function monthsToPayOffCreditCard(
  inputs: CreditCardPayoffInputs,
): number {
  const { balance, apr, monthlyPayment } = inputs;
  if (balance <= 0) return 0;
  if (monthlyPayment <= 0) return Infinity;

  const r = apr / 100 / 12;
  if (r === 0) return Math.ceil(balance / monthlyPayment);

  // Payment must exceed first month's interest
  if (monthlyPayment <= balance * r) return Infinity;

  // n = log(PMT / (PMT - B*r)) / log(1+r)
  const n =
    Math.log(monthlyPayment / (monthlyPayment - balance * r)) /
    Math.log(1 + r);

  if (!Number.isFinite(n) || n < 0) return Infinity;
  return Math.ceil(n);
}

export type PaydayLoanCostResult = {
  amount: number;
  fee: number;
  termDays: number;
  totalRepayable: number;
  /** Effective cost as a percent of the borrowed amount. */
  costPercent: number;
  /** Rough annualised cost percent (simple, not a regulated comparison rate). */
  annualisedCostPercent: number;
};

/**
 * Simple payday / short-term loan cost: amount + flat fee over termDays.
 */
export function paydayLoanCost(inputs: {
  amount: number;
  fee: number;
  termDays: number;
}): PaydayLoanCostResult {
  const amount = Math.max(0, inputs.amount);
  const fee = Math.max(0, inputs.fee);
  const termDays = Math.max(1, inputs.termDays);
  const totalRepayable = amount + fee;
  const costPercent = amount > 0 ? (fee / amount) * 100 : 0;
  const annualisedCostPercent = costPercent * (365 / termDays);

  return {
    amount,
    fee,
    termDays,
    totalRepayable,
    costPercent,
    annualisedCostPercent,
  };
}

export type SaccPaydayCostInputs = {
  amount: number;
  termDays: number;
};

export type SaccPaydayCostResult = {
  amount: number;
  termDays: number;
  establishmentFee: number;
  months: number;
  monthlyFee: number;
  totalFees: number;
  totalRepayable: number;
  fortnightlyPayment: number;
  fortnightlyPeriods: number;
};

/**
 * AU SACC (small amount credit contract) payday cost model.
 * Establishment fee 20% of amount; monthly fee 4% of amount per month of term.
 */
export function saccPaydayCost(
  inputs: SaccPaydayCostInputs,
): SaccPaydayCostResult {
  const amount = Math.max(0, inputs.amount);
  const termDays = Math.max(1, inputs.termDays);
  const establishmentFee = 0.2 * amount;
  const months = Math.max(1, Math.ceil(termDays / 30));
  const monthlyFee = 0.04 * amount * months;
  const totalFees = establishmentFee + monthlyFee;
  const totalRepayable = amount + totalFees;
  const fortnightlyPeriods = Math.max(1, Math.ceil(termDays / 14));
  const fortnightlyPayment = totalRepayable / fortnightlyPeriods;

  return {
    amount,
    termDays,
    establishmentFee,
    months,
    monthlyFee,
    totalFees,
    totalRepayable,
    fortnightlyPayment,
    fortnightlyPeriods,
  };
}

export type CreditCardPayoffCompareInputs = {
  balance: number;
  /** APR as a percent. */
  apr: number;
  /** Minimum payment as a fraction of balance, e.g. `0.02` for 2%. */
  minPercent: number;
  /** Floor for the minimum payment in dollars. */
  minFloor: number;
  /** Fixed higher monthly payment to compare against the minimum. */
  higherPayment: number;
};

export type CreditCardPayoffCompareResult = {
  minMonths: number;
  minInterest: number;
  higherMonths: number;
  higherInterest: number;
  interestSaved: number;
  monthsSaved: number;
};

function simulateCardPayoff(
  balance: number,
  apr: number,
  paymentFn: (bal: number) => number,
  maxMonths = 600,
): { months: number; interest: number } {
  if (balance <= 0) return { months: 0, interest: 0 };

  const r = apr / 100 / 12;
  let bal = balance;
  let months = 0;
  let interest = 0;

  while (bal > 0.01 && months < maxMonths) {
    const interestCharge = bal * r;
    const payment = paymentFn(bal);

    if (payment <= interestCharge + 1e-9) {
      return { months: Infinity, interest: Infinity };
    }

    interest += interestCharge;
    bal = bal + interestCharge - payment;
    months += 1;

    if (bal < 0) bal = 0;
  }

  if (bal > 0.01) return { months: Infinity, interest: Infinity };
  return { months, interest };
}

/**
 * Compare paying a credit card at the minimum vs a higher fixed payment.
 */
export function creditCardPayoffCompare(
  inputs: CreditCardPayoffCompareInputs,
): CreditCardPayoffCompareResult {
  const balance = Math.max(0, inputs.balance);
  const apr = inputs.apr;
  const minPercent = Math.max(0, inputs.minPercent);
  const minFloor = Math.max(0, inputs.minFloor);
  const higherPayment = Math.max(0, inputs.higherPayment);

  const minResult = simulateCardPayoff(balance, apr, (bal) =>
    Math.max(bal * minPercent, minFloor, 0),
  );

  const higherResult = simulateCardPayoff(
    balance,
    apr,
    () => higherPayment,
  );

  const interestSaved =
    Number.isFinite(minResult.interest) &&
    Number.isFinite(higherResult.interest)
      ? minResult.interest - higherResult.interest
      : Number.isFinite(higherResult.interest)
        ? Infinity
        : 0;

  const monthsSaved =
    Number.isFinite(minResult.months) &&
    Number.isFinite(higherResult.months)
      ? minResult.months - higherResult.months
      : Number.isFinite(higherResult.months)
        ? Infinity
        : 0;

  return {
    minMonths: minResult.months,
    minInterest: minResult.interest,
    higherMonths: higherResult.months,
    higherInterest: higherResult.interest,
    interestSaved,
    monthsSaved,
  };
}
