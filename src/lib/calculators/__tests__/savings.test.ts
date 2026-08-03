import { describe, expect, it } from "vitest";
import {
  emergencyFundTarget,
  futureValue,
  monthsToGoal,
  requiredContribution,
} from "../savings";

describe("futureValue", () => {
  it("grows a principal with monthly contributions", () => {
    // $10,000 start, $500/mo, 5% p.a., 10 years
    const fv = futureValue({
      principal: 10_000,
      contribution: 500,
      annualRate: 5,
      years: 10,
    });
    expect(fv).toBeCloseTo(94_111.23, 0);
  });

  it("handles zero rate as simple sum", () => {
    const fv = futureValue({
      principal: 1_000,
      contribution: 100,
      annualRate: 0,
      years: 1,
    });
    expect(fv).toBeCloseTo(1_000 + 100 * 12, 5);
  });

  it("grows more with beginning-of-period contributions", () => {
    const ordinary = futureValue({
      principal: 0,
      contribution: 100,
      annualRate: 6,
      years: 5,
      due: 0,
    });
    const due = futureValue({
      principal: 0,
      contribution: 100,
      annualRate: 6,
      years: 5,
      due: 1,
    });
    expect(due).toBeGreaterThan(ordinary);
  });
});

describe("monthsToGoal", () => {
  it("returns 0 when already at the goal", () => {
    expect(
      monthsToGoal({
        principal: 10_000,
        contribution: 100,
        annualRate: 5,
        goal: 10_000,
      }),
    ).toBe(0);
  });

  it("estimates months to reach a goal", () => {
    const months = monthsToGoal({
      principal: 0,
      contribution: 500,
      annualRate: 0,
      goal: 6_000,
    });
    expect(months).toBe(12);
  });

  it("returns Infinity when progress is impossible", () => {
    expect(
      monthsToGoal({
        principal: 1_000,
        contribution: 0,
        annualRate: 0,
        goal: 10_000,
      }),
    ).toBe(Infinity);
  });
});

describe("emergencyFundTarget", () => {
  it("defaults to 3 months of essentials", () => {
    expect(emergencyFundTarget(4_000)).toBe(12_000);
  });

  it("supports a custom month count", () => {
    expect(emergencyFundTarget(4_000, 6)).toBe(24_000);
  });
});

describe("requiredContribution", () => {
  it("solves for the contribution that hits the goal", () => {
    const goal = 50_000;
    const principal = 5_000;
    const annualRate = 4;
    const years = 5;
    const pmt = requiredContribution({
      goal,
      principal,
      annualRate,
      years,
    });
    const fv = futureValue({
      principal,
      contribution: pmt,
      annualRate,
      years,
    });
    expect(fv).toBeCloseTo(goal, 0);
  });

  it("returns 0 when already at the goal", () => {
    expect(
      requiredContribution({
        goal: 10_000,
        principal: 10_000,
        annualRate: 5,
        years: 5,
      }),
    ).toBe(0);
  });
});
