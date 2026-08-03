export type AccountBasedPensionInputs = {
  balance: number;
  /** Annual drawdown as dollars. */
  annualDrawdown: number;
  /** Expected return % p.a. during retirement. */
  returnRate: number;
  /** Max years to project. */
  maxYears?: number;
};

export type AccountBasedPensionYear = {
  year: number;
  startBalance: number;
  drawdown: number;
  endBalance: number;
};

export type AccountBasedPensionResult = {
  yearsLasting: number;
  schedule: AccountBasedPensionYear[];
  depleted: boolean;
};

/**
 * Project an account-based pension with fixed annual drawdown and constant return.
 * Drawdown at start of year; growth on remaining balance (simplified).
 */
export function accountBasedPension(
  inputs: AccountBasedPensionInputs,
): AccountBasedPensionResult {
  const maxYears = inputs.maxYears ?? 40;
  const rate = inputs.returnRate / 100;
  const draw = Math.max(0, inputs.annualDrawdown);
  let balance = Math.max(0, inputs.balance);
  const schedule: AccountBasedPensionYear[] = [];

  if (balance <= 0 || draw <= 0) {
    return { yearsLasting: 0, schedule: [], depleted: true };
  }

  for (let year = 1; year <= maxYears; year++) {
    const start = balance;
    const drawdown = Math.min(draw, start);
    let end = start - drawdown;
    end = end * (1 + rate);
    schedule.push({
      year,
      startBalance: start,
      drawdown,
      endBalance: Math.max(0, end),
    });
    balance = end;
    if (balance < 1) {
      return { yearsLasting: year, schedule, depleted: true };
    }
  }

  return {
    yearsLasting: maxYears,
    schedule,
    depleted: false,
  };
}
