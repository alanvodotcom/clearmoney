import { tool } from "ai";
import { z } from "zod";
import { accountBasedPension } from "@/lib/calculators/accountBasedPension";
import { summarizeBudget } from "@/lib/calculators/budget";
import {
  creditCardPayoffCompare,
  monthsToPayOffCreditCard,
  saccPaydayCost,
} from "@/lib/calculators/credit";
import {
  emergencyFundTarget,
  futureValue,
  monthsToGoal,
  requiredContribution,
} from "@/lib/calculators/savings";
import {
  compareTwoLoans,
  loanWithFees,
  paymentForFrequency,
  principalFromPayment,
  timeToRepay,
} from "@/lib/calculators/loan";
import {
  compoundGrowth,
  feeDrag,
  inflationAdjust,
  rentVsBuy,
} from "@/lib/calculators/investing";
import { lifeCoverEstimate } from "@/lib/calculators/insurance";
import { interestOnlyMortgage } from "@/lib/calculators/interestOnlyMortgage";
import { mortgageSwitching } from "@/lib/calculators/mortgageSwitching";
import { projectDebt } from "@/lib/calculators/reverseMortgage";
import {
  employerSG,
  projectSuperDetailed,
  retirementNeed,
} from "@/lib/calculators/super";
import { superContributionsOptimiser } from "@/lib/calculators/superContributionsOptimiser";
import { superAndPensionAge } from "@/lib/calculators/superPensionAge";
import {
  estimateIncomeTax,
  gstBreakdown,
  roughHecsRepayment,
} from "@/lib/calculators/tax";

const frequencySchema = z.enum([
  "weekly",
  "fortnightly",
  "monthly",
  "quarterly",
  "annually",
]);

function withTool<T extends Record<string, unknown>>(
  toolHref: string,
  result: T,
) {
  return { toolHref, estimatesOnly: true as const, ...result };
}

export const calculatorTools = {
  estimateIncomeTax: tool({
    description:
      "Estimate AU resident income tax + Medicare levy (Stage 3 style). Returns tax and rough take-home.",
    inputSchema: z.object({
      taxableIncome: z
        .number()
        .nonnegative()
        .describe("Annual taxable income in AUD"),
      financialYear: z.enum(["2025-26", "2026-27"]).optional(),
    }),
    execute: async ({ taxableIncome, financialYear }) => {
      const est = estimateIncomeTax({ taxableIncome, financialYear });
      return withTool("/tools/income-tax", {
        ...est,
        approximateTakeHome: est.taxableIncome - est.totalTax,
      });
    },
  }),

  gstBreakdown: tool({
    description: "Break an amount into GST-exclusive, GST (10%), and inclusive.",
    inputSchema: z.object({
      amount: z.number().nonnegative(),
      mode: z.enum(["inclusive", "exclusive"]),
    }),
    execute: async ({ amount, mode }) =>
      withTool("/tools/gst", gstBreakdown(amount, mode)),
  }),

  roughHecsRepayment: tool({
    description: "Rough HECS-HELP compulsory repayment estimate from annual income.",
    inputSchema: z.object({
      income: z.number().nonnegative().describe("Annual income AUD"),
    }),
    execute: async ({ income }) =>
      withTool("/tools/hecs", {
        income,
        annualRepayment: roughHecsRepayment(income),
      }),
  }),

  mortgageRepayment: tool({
    description:
      "Home loan / mortgage repayment estimate with optional annual fee, at a chosen frequency.",
    inputSchema: z.object({
      principal: z.number().positive(),
      annualRate: z.number().nonnegative().describe("Interest rate percent, e.g. 6.5"),
      years: z.number().positive(),
      feeAnnual: z.number().nonnegative().optional().default(0),
      frequency: frequencySchema.optional().default("monthly"),
    }),
    execute: async (input) =>
      withTool(
        "/tools/mortgage",
        loanWithFees(
          input.principal,
          input.annualRate,
          input.years,
          input.feeAnnual ?? 0,
          input.frequency ?? "monthly",
        ),
      ),
  }),

  personalLoanRepayment: tool({
    description: "Personal loan repayment estimate (same maths as mortgage tool, shorter terms typical).",
    inputSchema: z.object({
      principal: z.number().positive(),
      annualRate: z.number().nonnegative(),
      years: z.number().positive().max(15),
      feeAnnual: z.number().nonnegative().optional().default(0),
      frequency: frequencySchema.optional().default("monthly"),
    }),
    execute: async (input) =>
      withTool(
        "/tools/personal-loan",
        loanWithFees(
          input.principal,
          input.annualRate,
          input.years,
          input.feeAnnual ?? 0,
          input.frequency ?? "monthly",
        ),
      ),
  }),

  borrowingPower: tool({
    description: "How much can be borrowed given a fixed periodic repayment.",
    inputSchema: z.object({
      payment: z.number().positive(),
      annualRate: z.number().nonnegative(),
      years: z.number().positive(),
      frequency: frequencySchema.optional().default("monthly"),
      tool: z.enum(["mortgage", "personal-loan"]).optional().default("mortgage"),
    }),
    execute: async (input) => {
      const principal = principalFromPayment(
        input.payment,
        input.annualRate,
        input.years,
        input.frequency ?? "monthly",
      );
      const href =
        input.tool === "personal-loan"
          ? "/tools/personal-loan"
          : "/tools/mortgage";
      return withTool(href, {
        maxPrincipal: principal,
        payment: input.payment,
        annualRate: input.annualRate,
        years: input.years,
        frequency: input.frequency ?? "monthly",
      });
    },
  }),

  timeToRepayLoan: tool({
    description: "Months to repay a loan with a fixed periodic payment.",
    inputSchema: z.object({
      principal: z.number().positive(),
      payment: z.number().positive(),
      annualRate: z.number().nonnegative(),
      frequency: frequencySchema.optional().default("monthly"),
    }),
    execute: async (input) => {
      const months = timeToRepay(
        input.principal,
        input.payment,
        input.annualRate,
        input.frequency ?? "monthly",
      );
      return withTool("/tools/mortgage", {
        months,
        yearsApprox: Number.isFinite(months) ? months / 12 : null,
        feasible: Number.isFinite(months),
      });
    },
  }),

  compareTwoLoans: tool({
    description: "Side-by-side compare two amortising loans on payment and interest.",
    inputSchema: z.object({
      loanA: z.object({
        principal: z.number().positive(),
        annualRate: z.number().nonnegative(),
        years: z.number().positive(),
      }),
      loanB: z.object({
        principal: z.number().positive(),
        annualRate: z.number().nonnegative(),
        years: z.number().positive(),
      }),
    }),
    execute: async ({ loanA, loanB }) =>
      withTool("/tools/loan-comparison", compareTwoLoans(loanA, loanB)),
  }),

  creditCardPayoff: tool({
    description: "Months to pay off a credit card with a fixed monthly payment.",
    inputSchema: z.object({
      balance: z.number().positive(),
      apr: z.number().nonnegative(),
      monthlyPayment: z.number().positive(),
    }),
    execute: async (input) => {
      const months = monthsToPayOffCreditCard(input);
      return withTool("/tools/credit-card", {
        months,
        feasible: Number.isFinite(months),
      });
    },
  }),

  creditCardComparePayments: tool({
    description:
      "Compare minimum vs higher credit card repayments and interest saved.",
    inputSchema: z.object({
      balance: z.number().positive(),
      apr: z.number().nonnegative(),
      minPercent: z
        .number()
        .positive()
        .describe("Minimum payment as fraction of balance, e.g. 0.02 for 2%"),
      minFloor: z.number().nonnegative().describe("Minimum payment floor in dollars"),
      higherPayment: z.number().positive(),
    }),
    execute: async (input) =>
      withTool("/tools/credit-card", creditCardPayoffCompare(input)),
  }),

  paydayLoanCost: tool({
    description:
      "AU SACC payday / small-amount credit cost (20% establishment + 4% monthly fees).",
    inputSchema: z.object({
      amount: z.number().positive(),
      termDays: z.number().int().positive(),
    }),
    execute: async (input) =>
      withTool("/tools/payday-loan", saccPaydayCost(input)),
  }),

  compoundInterest: tool({
    description:
      "Future value of a lump sum plus regular contributions at a constant rate.",
    inputSchema: z.object({
      principal: z.number().nonnegative(),
      contribution: z.number().nonnegative().describe("Per-period contribution"),
      annualRate: z.number().nonnegative(),
      years: z.number().positive(),
      compoundsPerYear: z.number().int().positive().optional().default(12),
    }),
    execute: async (input) =>
      withTool("/tools/compound-interest", {
        futureValue: futureValue(input),
        ...input,
      }),
  }),

  monthsToSavingsGoal: tool({
    description: "Approximate months to reach a savings goal with monthly contributions.",
    inputSchema: z.object({
      principal: z.number().nonnegative(),
      contribution: z.number().nonnegative(),
      annualRate: z.number().nonnegative(),
      goal: z.number().positive(),
    }),
    execute: async (input) => {
      const months = monthsToGoal(input);
      return withTool("/tools/savings-goals", {
        months,
        feasible: Number.isFinite(months),
      });
    },
  }),

  requiredSavingsContribution: tool({
    description: "Periodic contribution needed to hit a savings goal in a fixed time.",
    inputSchema: z.object({
      goal: z.number().positive(),
      principal: z.number().nonnegative(),
      annualRate: z.number().nonnegative(),
      years: z.number().positive(),
      compoundsPerYear: z.number().int().positive().optional().default(12),
    }),
    execute: async (input) =>
      withTool("/tools/savings-goals", {
        contribution: requiredContribution(input),
        ...input,
      }),
  }),

  emergencyFund: tool({
    description: "Suggested emergency fund size from monthly essentials × months.",
    inputSchema: z.object({
      monthlyEssentials: z.number().positive(),
      months: z.number().positive().optional().default(3),
    }),
    execute: async ({ monthlyEssentials, months }) =>
      withTool("/tools/emergency-fund", {
        target: emergencyFundTarget(monthlyEssentials, months ?? 3),
        monthlyEssentials,
        months: months ?? 3,
      }),
  }),

  simpleBudgetSnapshot: tool({
    description:
      "Quick money-in vs money-out snapshot. For a full category budget with Excel export, link /tools/budget-planner.",
    inputSchema: z.object({
      income: z.number().nonnegative().describe("Income for the period"),
      expenses: z
        .record(z.string(), z.number())
        .describe("Expense category name → amount"),
    }),
    execute: async (input) =>
      withTool("/tools/simple-money-manager", summarizeBudget(input)),
  }),

  projectSuper: tool({
    description:
      "Project super balance to retirement with SG, extras, fees, and insurance.",
    inputSchema: z.object({
      age: z.number().int().positive(),
      retirementAge: z.number().int().positive(),
      income: z.number().nonnegative().describe("Annual ordinary-time earnings"),
      balance: z.number().nonnegative(),
      returnRate: z.number().describe("Expected annual return percent"),
      employerRate: z.number().optional().default(0.12),
      concessionalExtra: z.number().nonnegative().optional().default(0),
      afterTaxExtra: z.number().nonnegative().optional().default(0),
      feeAdminAnnual: z.number().nonnegative().optional().default(0),
      feePercent: z.number().nonnegative().optional().default(0),
      insuranceAnnual: z.number().nonnegative().optional().default(0),
    }),
    execute: async (input) =>
      withTool("/tools/super", projectSuperDetailed(input)),
  }),

  employerSgCheck: tool({
    description: "Check Super Guarantee contribution against ordinary-time earnings (default 12%).",
    inputSchema: z.object({
      ordinaryTimeEarnings: z.number().nonnegative(),
      rate: z.number().positive().optional().default(0.12),
    }),
    execute: async ({ ordinaryTimeEarnings, rate }) =>
      withTool("/tools/employer-contributions", {
        ordinaryTimeEarnings,
        rate: rate ?? 0.12,
        employerContribution: employerSG(ordinaryTimeEarnings, rate ?? 0.12),
      }),
  }),

  retirementNestEgg: tool({
    description: "Lump sum needed at retirement to fund annual spending for a fixed period.",
    inputSchema: z.object({
      annualSpend: z.number().positive(),
      yearsRetired: z.number().positive(),
      returnRate: z.number().describe("Return percent during retirement"),
    }),
    execute: async (input) =>
      withTool("/tools/retirement-planner", {
        nestEggNeeded: retirementNeed(input),
        ...input,
      }),
  }),

  superContributionsCompare: tool({
    description:
      "Compare projected super with SG only vs SG + voluntary concessional/after-tax contributions.",
    inputSchema: z.object({
      currentBalance: z.number().nonnegative(),
      annualSalary: z.number().nonnegative(),
      years: z.number().positive(),
      returnRate: z.number(),
      extraConcessional: z.number().nonnegative(),
      extraAfterTax: z.number().nonnegative(),
      sgRate: z.number().optional().default(0.12),
      concessionalCap: z.number().optional().default(30_000),
    }),
    execute: async (input) =>
      withTool(
        "/tools/super-contributions-optimiser",
        superContributionsOptimiser(input),
      ),
  }),

  superPensionAge: tool({
    description: "Preservation age and Age Pension age from date of birth (simplified AU bands).",
    inputSchema: z.object({
      birthYear: z.number().int().min(1920).max(2010),
      birthMonth: z.number().int().min(1).max(12),
    }),
    execute: async (input) =>
      withTool("/tools/super-pension-age", superAndPensionAge(input)),
  }),

  accountBasedPensionProjection: tool({
    description: "Project how long an account-based pension lasts with fixed annual drawdown.",
    inputSchema: z.object({
      balance: z.number().positive(),
      annualDrawdown: z.number().positive(),
      returnRate: z.number(),
      maxYears: z.number().int().positive().optional().default(40),
    }),
    execute: async (input) => {
      const result = accountBasedPension(input);
      return withTool("/tools/account-based-pension", {
        yearsLasting: result.yearsLasting,
        depleted: result.depleted,
        finalBalance:
          result.schedule[result.schedule.length - 1]?.endBalance ?? 0,
      });
    },
  }),

  reverseMortgageProjection: tool({
    description: "Project reverse-mortgage debt growth and remaining equity.",
    inputSchema: z.object({
      propertyValue: z.number().positive(),
      loanAmount: z.number().positive(),
      rate: z.number().nonnegative(),
      years: z.number().positive(),
      propertyGrowthRate: z.number().optional().default(0),
    }),
    execute: async (input) =>
      withTool("/tools/reverse-mortgage", projectDebt(input)),
  }),

  investmentGrowth: tool({
    description: "Compound growth of a lump sum over years.",
    inputSchema: z.object({
      principal: z.number().positive(),
      years: z.number().positive(),
      returnRate: z.number(),
      compoundsPerYear: z.number().int().positive().optional().default(1),
    }),
    execute: async (input) =>
      withTool("/tools/investment-returns", {
        endingBalance: compoundGrowth(
          input.principal,
          input.years,
          input.returnRate,
          input.compoundsPerYear ?? 1,
        ),
        ...input,
      }),
  }),

  feeDragImpact: tool({
    description: "Compare ending balances with and without annual percentage fee drag.",
    inputSchema: z.object({
      principal: z.number().positive(),
      years: z.number().positive(),
      returnRate: z.number(),
      feeRate: z.number().nonnegative().describe("Annual fee percent of balance"),
    }),
    execute: async (input) => withTool("/tools/fee-drag", feeDrag(input)),
  }),

  inflationAdjust: tool({
    description: "Adjust today's dollars for inflation over a number of years.",
    inputSchema: z.object({
      amount: z.number(),
      years: z.number().positive(),
      inflationRate: z.number(),
    }),
    execute: async (input) =>
      withTool("/tools/inflation", {
        futureValue: inflationAdjust(
          input.amount,
          input.years,
          input.inflationRate,
        ),
        ...input,
      }),
  }),

  rentVsBuyCompare: tool({
    description: "Rough rent-vs-buy net-worth comparison over a holding period.",
    inputSchema: z.object({
      propertyPrice: z.number().positive(),
      deposit: z.number().nonnegative(),
      loanRate: z.number().nonnegative(),
      loanYears: z.number().positive(),
      annualRent: z.number().nonnegative(),
      propertyGrowthRate: z.number(),
      years: z.number().positive(),
      annualOwnershipCosts: z.number().nonnegative().optional().default(0),
    }),
    execute: async (input) => withTool("/tools/rent-vs-buy", rentVsBuy(input)),
  }),

  refinanceBreakEven: tool({
    description: "Estimate whether switching home loans is worthwhile and break-even months.",
    inputSchema: z.object({
      currentBalance: z.number().positive(),
      currentRate: z.number().nonnegative(),
      yearsRemaining: z.number().positive(),
      currentFeeAnnual: z.number().nonnegative().optional().default(0),
      exitFee: z.number().nonnegative().optional().default(0),
      newRate: z.number().nonnegative(),
      newIntroRate: z.number().optional(),
      introMonths: z.number().optional(),
      applicationFee: z.number().nonnegative().optional().default(0),
      otherFees: z.number().nonnegative().optional().default(0),
      newFeeAnnual: z.number().nonnegative().optional().default(0),
    }),
    execute: async (input) =>
      withTool("/tools/refinance-break-even", mortgageSwitching(input)),
  }),

  interestOnlyMortgageCompare: tool({
    description:
      "Compare interest-only then P&I vs full-term P&I mortgage (extra interest).",
    inputSchema: z.object({
      principal: z.number().positive(),
      annualRate: z.number().nonnegative(),
      ioYears: z.number().nonnegative(),
      totalYears: z.number().positive(),
    }),
    execute: async (input) =>
      withTool("/tools/interest-only-mortgage", interestOnlyMortgage(input)),
  }),

  lifeCoverNeeds: tool({
    description: "Estimate life insurance cover need from debts and living-cost replacement.",
    inputSchema: z.object({
      funeral: z.number().nonnegative().optional(),
      mortgage: z.number().nonnegative().optional(),
      otherDebts: z.number().nonnegative().optional(),
      educationCosts: z.number().nonnegative().optional(),
      annualLiving: z.number().nonnegative().optional(),
      livingYears: z.number().nonnegative().optional(),
      assetsOffset: z.number().nonnegative().optional(),
      inflation: z.number().optional(),
      returnRate: z.number().optional(),
    }),
    execute: async (input) =>
      withTool("/tools/insurance-needs", lifeCoverEstimate(input)),
  }),

  /** Utility: periodic payment helper when frequency matters but fees do not. */
  loanPaymentAtFrequency: tool({
    description: "Amortising payment at an arbitrary repayment frequency (no fees).",
    inputSchema: z.object({
      principal: z.number().positive(),
      annualRate: z.number().nonnegative(),
      years: z.number().positive(),
      frequency: frequencySchema,
    }),
    execute: async (input) =>
      withTool("/tools/mortgage", {
        payment: paymentForFrequency(
          input.principal,
          input.annualRate,
          input.years,
          input.frequency,
        ),
        ...input,
      }),
  }),
};
