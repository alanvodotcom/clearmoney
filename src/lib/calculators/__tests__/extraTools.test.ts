import { describe, expect, it } from "vitest";
import { accountBasedPension } from "../accountBasedPension";
import { interestOnlyMortgage } from "../interestOnlyMortgage";
import { compareLifeClaims } from "../lifeClaimsComparison";
import { superAndPensionAge } from "../superPensionAge";
import { superContributionsOptimiser } from "../superContributionsOptimiser";

describe("interestOnlyMortgage", () => {
  it("IO payment is interest only and P&I is higher later", () => {
    const r = interestOnlyMortgage({
      principal: 500000,
      annualRate: 6,
      ioYears: 5,
      totalYears: 30,
    });
    expect(r.ioMonthlyPayment).toBeCloseTo((500000 * 0.06) / 12, 0);
    expect(r.piMonthlyPayment).toBeGreaterThan(r.ioMonthlyPayment);
    expect(r.extraInterestVsFullPi).toBeGreaterThan(0);
  });
});

describe("superAndPensionAge", () => {
  it("returns preservation age 60 for births from 1964", () => {
    const r = superAndPensionAge({ birthYear: 1990, birthMonth: 3 });
    expect(r.preservationAge).toBe(60);
    expect(r.agePensionAge).toBe(67);
  });
});

describe("superContributionsOptimiser", () => {
  it("flags over-cap concessional totals", () => {
    const r = superContributionsOptimiser({
      currentBalance: 100000,
      annualSalary: 200000,
      years: 10,
      returnRate: 6,
      extraConcessional: 20000,
      extraAfterTax: 0,
      concessionalCap: 30000,
    });
    expect(r.sgAnnual).toBe(24000);
    expect(r.overCap).toBe(true);
    expect(r.uplift).toBeGreaterThan(0);
  });
});

describe("accountBasedPension", () => {
  it("depletes when drawdown is high", () => {
    const r = accountBasedPension({
      balance: 100000,
      annualDrawdown: 30000,
      returnRate: 3,
    });
    expect(r.depleted).toBe(true);
    expect(r.yearsLasting).toBeLessThan(10);
  });
});

describe("compareLifeClaims", () => {
  it("ranks sample insurers", () => {
    const r = compareLifeClaims();
    expect(r.insurers.length).toBe(3);
    expect(r.bestAcceptance).toContain("C");
  });
});
