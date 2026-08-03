const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const NUMBER = new Intl.NumberFormat("en-AU", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const PERCENT = new Intl.NumberFormat("en-AU", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Format a number as Australian dollars, e.g. `$1,234.56`. */
export function formatCurrency(n: number): string {
  if (!Number.isFinite(n)) return AUD.format(0);
  return AUD.format(n);
}

/**
 * Format a percentage value.
 * Pass the percent figure (e.g. `5.25` for 5.25%), not a decimal rate.
 */
export function formatPercent(n: number): string {
  if (!Number.isFinite(n)) return "0%";
  return `${PERCENT.format(n)}%`;
}

/** Format a plain number with en-AU grouping. */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return NUMBER.format(n);
}
