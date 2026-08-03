export {
  formatCurrency,
  formatPercent,
  formatNumber,
} from "./format";

export {
  type Frequency,
  FREQUENCIES,
  periodsPerYear,
  toAnnual,
  toMonthly,
  fromAnnual,
  fromMonthly,
} from "./frequency";

export {
  monthlyPayment,
  totalInterest,
  scheduleSummary,
  compareTwoLoans,
  paymentForFrequency,
  principalFromPayment,
  timeToRepay,
  loanWithFees,
  type LoanInputs,
  type LoanScheduleSummary,
  type LoanComparison,
  type LoanModeResult,
  type LoanWithFeesResult,
} from "./loan";

export {
  futureValue,
  monthsToGoal,
  emergencyFundTarget,
  requiredContribution,
  futureValueWithDelay,
  type FutureValueInputs,
  type MonthsToGoalInputs,
  type RequiredContributionInputs,
  type FutureValueWithDelayInputs,
} from "./savings";

export {
  estimateIncomeTax,
  gstAdd,
  gstRemove,
  gstBreakdown,
  roughHecsRepayment,
  type IncomeTaxEstimate,
  type EstimateIncomeTaxInputs,
  type FinancialYear,
  type GstBreakdown,
} from "./tax";

export {
  projectSuperBalance,
  employerSG,
  retirementNeed,
  projectSuperDetailed,
  employerSGDetailed,
  type ProjectSuperInputs,
  type RetirementNeedInputs,
  type ProjectSuperDetailedInputs,
  type ProjectSuperDetailedResult,
  type EmployerSGDetailedInputs,
} from "./super";

export {
  monthsToPayOffCreditCard,
  paydayLoanCost,
  saccPaydayCost,
  creditCardPayoffCompare,
  type CreditCardPayoffInputs,
  type PaydayLoanCostResult,
  type SaccPaydayCostInputs,
  type SaccPaydayCostResult,
  type CreditCardPayoffCompareInputs,
  type CreditCardPayoffCompareResult,
} from "./credit";

export {
  compoundGrowth,
  feeDrag,
  inflationAdjust,
  rentVsBuy,
  managedFundsProjection,
  consumerLeaseVsBuy,
  type FeeDragInputs,
  type FeeDragResult,
  type RentVsBuyInputs,
  type RentVsBuyResult,
  type ManagedFundsProjectionInputs,
  type ManagedFundsProjectionResult,
  type ConsumerLeaseVsBuyInputs,
  type ConsumerLeaseVsBuyResult,
} from "./investing";

export {
  lifeCoverEstimate,
  type LifeCoverEstimateInputs,
  type LifeCoverEstimateResult,
} from "./insurance";

export {
  summarizeBudget,
  summarizeFullBudget,
  DEFAULT_BUDGET,
  lineMonthly,
  type BudgetSummary,
  type BudgetCategory,
  type BudgetLine,
  type BudgetTotals,
} from "./budget";

export { downloadBudgetExcel } from "./budgetExcel";

export {
  projectDebt,
  projectReverseMortgage,
  type ReverseMortgageProjection,
  type ReverseMortgageYearRow,
  type ProjectReverseMortgageInputs,
} from "./reverseMortgage";

export {
  mortgageSwitching,
  type MortgageSwitchingInputs,
  type MortgageSwitchingResult,
} from "./mortgageSwitching";

export {
  interestOnlyMortgage,
  type InterestOnlyMortgageInputs,
  type InterestOnlyMortgageResult,
} from "./interestOnlyMortgage";

export {
  superAndPensionAge,
  type SuperPensionAgeInputs,
  type SuperPensionAgeResult,
} from "./superPensionAge";

export {
  superContributionsOptimiser,
  type SuperContributionsOptimiserInputs,
  type SuperContributionsOptimiserResult,
} from "./superContributionsOptimiser";

export {
  accountBasedPension,
  type AccountBasedPensionInputs,
  type AccountBasedPensionResult,
  type AccountBasedPensionYear,
} from "./accountBasedPension";

export {
  compareLifeClaims,
  SAMPLE_LIFE_CLAIM_INSURERS,
  type LifeClaimInsurer,
  type LifeClaimsComparisonResult,
} from "./lifeClaimsComparison";
