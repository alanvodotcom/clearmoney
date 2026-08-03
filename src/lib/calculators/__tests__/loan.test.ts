import { describe, expect, it } from "vitest";
import {
  compareTwoLoans,
  monthlyPayment,
  paymentForFrequency,
  principalFromPayment,
  scheduleSummary,
  timeToRepay,
  totalInterest,
} from "../loan";

describe("monthlyPayment", () => {
  it("calculates a standard P&I repayment", () => {
    // $500,000 at 6% over 30 years ≈ $2,997.75
    const payment = monthlyPayment(500_000, 6, 30);
    expect(payment).toBeCloseTo(2997.75, 1);
  });

  it("handles zero interest as principal ÷ months", () => {
    expect(monthlyPayment(12_000, 0, 1)).toBeCloseTo(1000, 5);
  });

  it("returns 0 for non-positive principal or term", () => {
    expect(monthlyPayment(0, 6, 30)).toBe(0);
    expect(monthlyPayment(100_000, 6, 0)).toBe(0);
  });
});

describe("totalInterest", () => {
  it("equals total paid minus principal", () => {
    const principal = 400_000;
    const interest = totalInterest(principal, 5.5, 25);
    const payment = monthlyPayment(principal, 5.5, 25);
    expect(interest).toBeCloseTo(payment * 25 * 12 - principal, 2);
  });
});

describe("scheduleSummary", () => {
  it("returns a consistent summary", () => {
    const summary = scheduleSummary({
      principal: 300_000,
      annualRate: 6,
      years: 30,
    });
    expect(summary.months).toBe(360);
    expect(summary.monthlyPayment).toBeCloseTo(1798.65, 1);
    expect(summary.totalPaid).toBeCloseTo(
      summary.monthlyPayment * 360,
      2,
    );
    expect(summary.totalInterest).toBeCloseTo(
      summary.totalPaid - 300_000,
      2,
    );
  });
});

describe("compareTwoLoans", () => {
  it("flags the lower-interest loan as cheaper", () => {
    const result = compareTwoLoans(
      { principal: 500_000, annualRate: 6.5, years: 30 },
      { principal: 500_000, annualRate: 5.5, years: 30 },
    );
    expect(result.cheaperLoan).toBe("B");
    expect(result.interestDifference).toBeGreaterThan(0);
  });
});

describe("principalFromPayment", () => {
  it("inverts paymentForFrequency for monthly loans", () => {
    const principal = 400_000;
    const rate = 5.5;
    const years = 25;
    const payment = paymentForFrequency(principal, rate, years, "monthly");
    const borrowed = principalFromPayment(payment, rate, years, "monthly");
    expect(borrowed).toBeCloseTo(principal, 0);
  });

  it("returns 0 for non-positive payment", () => {
    expect(principalFromPayment(0, 6, 30, "monthly")).toBe(0);
  });
});

describe("timeToRepay", () => {
  it("returns Infinity when payment is too low", () => {
    expect(timeToRepay(100_000, 10, 6, "monthly")).toBe(Infinity);
  });
});
