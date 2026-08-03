import { describe, expect, it } from "vitest";
import {
  creditCardPayoffCompare,
  monthsToPayOffCreditCard,
  paydayLoanCost,
  saccPaydayCost,
} from "../credit";

describe("monthsToPayOffCreditCard", () => {
  it("returns 0 for zero balance", () => {
    expect(
      monthsToPayOffCreditCard({
        balance: 0,
        apr: 20,
        monthlyPayment: 100,
      }),
    ).toBe(0);
  });

  it("returns Infinity when payment is too low", () => {
    expect(
      monthsToPayOffCreditCard({
        balance: 5_000,
        apr: 20,
        monthlyPayment: 10,
      }),
    ).toBe(Infinity);
  });
});

describe("paydayLoanCost", () => {
  it("adds a flat fee", () => {
    const result = paydayLoanCost({
      amount: 500,
      fee: 75,
      termDays: 14,
    });
    expect(result.totalRepayable).toBe(575);
    expect(result.costPercent).toBeCloseTo(15, 5);
  });
});

describe("saccPaydayCost", () => {
  it("applies 20% establishment and 4% monthly fees", () => {
    const result = saccPaydayCost({ amount: 1_000, termDays: 60 });
    expect(result.establishmentFee).toBe(200);
    expect(result.months).toBe(2);
    expect(result.monthlyFee).toBeCloseTo(80, 5); // 0.04 * 1000 * 2
    expect(result.totalRepayable).toBeCloseTo(1_280, 5);
    expect(result.fortnightlyPeriods).toBe(Math.ceil(60 / 14));
    expect(result.fortnightlyPayment).toBeCloseTo(
      1_280 / result.fortnightlyPeriods,
      5,
    );
  });

  it("uses at least one month of monthly fees", () => {
    const result = saccPaydayCost({ amount: 500, termDays: 7 });
    expect(result.months).toBe(1);
    expect(result.monthlyFee).toBeCloseTo(20, 5);
  });
});

describe("creditCardPayoffCompare", () => {
  it("shows interest saved with a higher payment", () => {
    const result = creditCardPayoffCompare({
      balance: 5_000,
      apr: 19.99,
      minPercent: 0.02,
      minFloor: 25,
      higherPayment: 300,
    });
    expect(result.higherMonths).toBeLessThan(result.minMonths);
    expect(result.interestSaved).toBeGreaterThan(0);
    expect(result.monthsSaved).toBeGreaterThan(0);
  });

  it("returns Infinity months at minimum when payment never covers interest", () => {
    const result = creditCardPayoffCompare({
      balance: 10_000,
      apr: 25,
      minPercent: 0.001,
      minFloor: 1,
      higherPayment: 500,
    });
    expect(result.minMonths).toBe(Infinity);
    expect(result.higherMonths).toBeLessThan(Infinity);
  });
});
