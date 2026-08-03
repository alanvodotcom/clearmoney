import { describe, expect, it } from "vitest";
import { mortgageSwitching } from "../mortgageSwitching";

describe("mortgageSwitching", () => {
  it("estimates monthly saving and break-even for a lower rate", () => {
    const result = mortgageSwitching({
      currentBalance: 500_000,
      currentRate: 6.5,
      yearsRemaining: 25,
      currentFeeAnnual: 0,
      exitFee: 2_000,
      newRate: 5.5,
      applicationFee: 600,
      otherFees: 400,
      newFeeAnnual: 0,
    });

    expect(result.monthlySaving).toBeGreaterThan(0);
    expect(result.switchCost).toBe(3_000);
    expect(result.breakEvenMonths).toBeCloseTo(
      3_000 / result.monthlySaving,
      5,
    );
    expect(result.breakEvenMonths).toBeLessThan(25 * 12);
    expect(result.worthSwitching).toBe(true);
  });

  it("is not worth switching when the new rate is higher", () => {
    const result = mortgageSwitching({
      currentBalance: 400_000,
      currentRate: 5,
      yearsRemaining: 20,
      currentFeeAnnual: 0,
      exitFee: 0,
      newRate: 6,
      applicationFee: 500,
      otherFees: 0,
      newFeeAnnual: 0,
    });

    expect(result.monthlySaving).toBeLessThan(0);
    expect(result.worthSwitching).toBe(false);
    expect(result.breakEvenMonths).toBe(Infinity);
  });

  it("blends an introductory rate into the new payment", () => {
    const withIntro = mortgageSwitching({
      currentBalance: 450_000,
      currentRate: 6.2,
      yearsRemaining: 30,
      currentFeeAnnual: 0,
      exitFee: 0,
      newRate: 5.8,
      newIntroRate: 4.99,
      introMonths: 24,
      applicationFee: 0,
      otherFees: 0,
      newFeeAnnual: 0,
    });
    const withoutIntro = mortgageSwitching({
      currentBalance: 450_000,
      currentRate: 6.2,
      yearsRemaining: 30,
      currentFeeAnnual: 0,
      exitFee: 0,
      newRate: 5.8,
      applicationFee: 0,
      otherFees: 0,
      newFeeAnnual: 0,
    });

    expect(withIntro.newMonthlyPayment).toBeLessThan(
      withoutIntro.newMonthlyPayment,
    );
    expect(withIntro.monthlySaving).toBeGreaterThan(
      withoutIntro.monthlySaving,
    );
  });
});
