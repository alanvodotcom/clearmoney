export type Frequency =
  | "weekly"
  | "fortnightly"
  | "monthly"
  | "quarterly"
  | "annually";

export const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "fortnightly", label: "Fortnightly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
];

/** Periods per year for a frequency. */
export function periodsPerYear(freq: Frequency): number {
  switch (freq) {
    case "weekly":
      return 52;
    case "fortnightly":
      return 26;
    case "monthly":
      return 12;
    case "quarterly":
      return 4;
    case "annually":
      return 1;
  }
}

/** Convert an amount at a given frequency to an annual amount. */
export function toAnnual(amount: number, freq: Frequency): number {
  return Math.max(0, amount) * periodsPerYear(freq);
}

/** Convert an amount at a given frequency to a monthly equivalent. */
export function toMonthly(amount: number, freq: Frequency): number {
  return toAnnual(amount, freq) / 12;
}

/** Convert annual amount to a display frequency. */
export function fromAnnual(annual: number, freq: Frequency): number {
  return annual / periodsPerYear(freq);
}

/** Convert monthly amount to a display frequency. */
export function fromMonthly(monthly: number, freq: Frequency): number {
  return fromAnnual(monthly * 12, freq);
}
