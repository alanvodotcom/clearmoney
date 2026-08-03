/** Approximate AU resident tax brackets for 2025–26 / 2026–27 (Stage 3 rates). */
const MEDICARE_LEVY_RATE = 0.02;
const GST_RATE = 0.1;

export type FinancialYear = "2025-26" | "2026-27";

export type IncomeTaxEstimate = {
  taxableIncome: number;
  incomeTax: number;
  medicareLevy: number;
  totalTax: number;
  /** Total tax ÷ taxable income (0–1). */
  effectiveRate: number;
  financialYear: FinancialYear;
};

export type EstimateIncomeTaxInputs = {
  /** Direct taxable income (used if employment/other not provided). */
  taxableIncome?: number;
  /** Employment / salary income. */
  employmentIncome?: number;
  /** Other taxable income (investments, etc.). */
  otherIncome?: number;
  /** Financial year for brackets — same Stage 3 rates for both years. */
  financialYear?: FinancialYear;
};

function progressiveIncomeTax(income: number): number {
  if (income <= 18_200) return 0;
  if (income <= 45_000) return (income - 18_200) * 0.16;
  if (income <= 135_000) return 4_288 + (income - 45_000) * 0.3;
  if (income <= 190_000) return 31_288 + (income - 135_000) * 0.37;
  return 51_638 + (income - 190_000) * 0.45;
}

function resolveTaxableIncome(
  input: number | EstimateIncomeTaxInputs,
): { income: number; financialYear: FinancialYear } {
  if (typeof input === "number") {
    return { income: Math.max(0, input), financialYear: "2025-26" };
  }

  const financialYear = input.financialYear ?? "2025-26";
  const hasSplit =
    input.employmentIncome != null || input.otherIncome != null;

  if (hasSplit) {
    const income =
      Math.max(0, input.employmentIncome ?? 0) +
      Math.max(0, input.otherIncome ?? 0);
    return { income, financialYear };
  }

  return {
    income: Math.max(0, input.taxableIncome ?? 0),
    financialYear,
  };
}

/**
 * Rough AU resident income tax + Medicare levy (2%) estimate.
 * Brackets are Stage 3 style; `financialYear` accepted for API parity
 * (2025-26 and 2026-27 use the same brackets here).
 * Does not include offsets, MLS, or low-income shade-in rules.
 */
export function estimateIncomeTax(
  taxableIncomeOrInputs: number | EstimateIncomeTaxInputs,
): IncomeTaxEstimate {
  const { income, financialYear } = resolveTaxableIncome(
    taxableIncomeOrInputs,
  );
  const incomeTax = progressiveIncomeTax(income);
  const medicareLevy = income * MEDICARE_LEVY_RATE;
  const totalTax = incomeTax + medicareLevy;

  return {
    taxableIncome: income,
    incomeTax,
    medicareLevy,
    totalTax,
    effectiveRate: income > 0 ? totalTax / income : 0,
    financialYear,
  };
}

/** Add 10% GST to a GST-exclusive amount. */
export function gstAdd(amount: number): number {
  return Math.max(0, amount) * (1 + GST_RATE);
}

/** Remove 10% GST from a GST-inclusive amount. */
export function gstRemove(amount: number): number {
  return Math.max(0, amount) / (1 + GST_RATE);
}

export type GstBreakdown = {
  exclusive: number;
  gst: number;
  inclusive: number;
};

/**
 * Break an amount into GST-exclusive, GST, and GST-inclusive components.
 */
export function gstBreakdown(
  amount: number,
  mode: "inclusive" | "exclusive",
): GstBreakdown {
  const value = Math.max(0, amount);
  if (mode === "exclusive") {
    const inclusive = value * (1 + GST_RATE);
    return {
      exclusive: value,
      gst: inclusive - value,
      inclusive,
    };
  }
  const exclusive = value / (1 + GST_RATE);
  return {
    exclusive,
    gst: value - exclusive,
    inclusive: value,
  };
}

/**
 * Rough HECS/HELP compulsory repayment for 2025–26 style marginal bands.
 * Simplified — not a full ATO calculator.
 */
export function roughHecsRepayment(income: number): number {
  const y = Math.max(0, income);

  if (y <= 67_000) return 0;
  if (y <= 125_000) return (y - 67_000) * 0.15;
  if (y <= 179_285) return 8_700 + (y - 125_000) * 0.17;
  return y * 0.1;
}
