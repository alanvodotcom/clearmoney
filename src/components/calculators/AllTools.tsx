"use client";

import { useMemo, useState } from "react";
import {
  CalculatorShell,
  Field,
  ModeTabs,
  NumberInput,
  SelectInput,
  Stat,
} from "@/components/calculators/Shell";
import {
  compareTwoLoans,
  compoundGrowth,
  consumerLeaseVsBuy,
  creditCardPayoffCompare,
  emergencyFundTarget,
  employerSGDetailed,
  estimateIncomeTax,
  formatCurrency,
  formatNumber,
  formatPercent,
  fromMonthly,
  futureValue,
  futureValueWithDelay,
  gstBreakdown,
  inflationAdjust,
  lifeCoverEstimate,
  loanWithFees,
  managedFundsProjection,
  mortgageSwitching,
  paymentForFrequency,
  periodsPerYear,
  principalFromPayment,
  projectReverseMortgage,
  projectSuperBalance,
  projectSuperDetailed,
  retirementNeed,
  roughHecsRepayment,
  saccPaydayCost,
  timeToRepay,
  toAnnual,
  toMonthly,
  type FinancialYear,
  type Frequency,
} from "@/lib/calculators";
import { FREQUENCIES } from "@/lib/calculators/frequency";

const LOAN_FREQS = FREQUENCIES.filter((f) =>
  ["weekly", "fortnightly", "monthly"].includes(f.value),
);

const ALL_FREQS = FREQUENCIES;

function freqLabel(freq: Frequency): string {
  return FREQUENCIES.find((f) => f.value === freq)?.label ?? freq;
}

function formatMonths(months: number): string {
  if (!Number.isFinite(months)) return "Not reachable";
  if (months <= 0) return "0";
  const y = Math.floor(months / 12);
  const m = Math.round(months % 12);
  if (y === 0) return `${formatNumber(m)} months`;
  if (m === 0) return `${formatNumber(y)} years`;
  return `${formatNumber(y)} yr ${formatNumber(m)} mo`;
}

type LoanMode = "repayments" | "borrow" | "sooner";

function LoanTool({
  title,
  description,
  maxYears,
  defaultPrincipal,
  defaultRate,
  defaultYears,
}: {
  title: string;
  description: string;
  maxYears: number;
  defaultPrincipal: number;
  defaultRate: number;
  defaultYears: number;
}) {
  const [mode, setMode] = useState<LoanMode>("repayments");
  const [principal, setPrincipal] = useState(defaultPrincipal);
  const [rate, setRate] = useState(defaultRate);
  const [years, setYears] = useState(defaultYears);
  const [freq, setFreq] = useState<Frequency>("monthly");
  const [annualFee, setAnnualFee] = useState(0);
  const [affordablePayment, setAffordablePayment] = useState(2500);
  const [payment, setPayment] = useState(2500);

  const result = useMemo(() => {
    if (mode === "repayments") {
      const withFees = loanWithFees(principal, rate, years, annualFee, freq);
      return {
        payment: withFees.payment,
        totalInterest: withFees.totalInterest,
        totalPaid: withFees.totalCost,
        totalFees: withFees.totalFees,
        principal: withFees.principal,
        years,
      };
    }
    if (mode === "borrow") {
      const maxPrincipal = principalFromPayment(
        affordablePayment,
        rate,
        years,
        freq,
      );
      const withFees = loanWithFees(
        maxPrincipal,
        rate,
        years,
        annualFee,
        freq,
      );
      return {
        payment: affordablePayment,
        totalInterest: withFees.totalInterest,
        totalPaid: withFees.totalCost,
        totalFees: withFees.totalFees,
        principal: maxPrincipal,
        years,
      };
    }
    const months = timeToRepay(principal, payment, rate, freq);
    const periods =
      Number.isFinite(months) && months > 0
        ? Math.ceil((months / 12) * periodsPerYear(freq))
        : 0;
    const totalPaid = Number.isFinite(months) ? payment * periods : Infinity;
    const totalInterest = Number.isFinite(totalPaid)
      ? totalPaid - principal
      : Infinity;
    return {
      payment,
      totalInterest,
      totalPaid,
      totalFees: 0,
      principal,
      years: Number.isFinite(months) ? months / 12 : Infinity,
      months,
    };
  }, [
    mode,
    principal,
    rate,
    years,
    freq,
    annualFee,
    affordablePayment,
    payment,
  ]);

  return (
    <CalculatorShell
      title={title}
      description={description}
      results={
        <>
          {mode === "borrow" ? (
            <Stat
              label="You could borrow"
              value={formatCurrency(result.principal)}
              emphasize
            />
          ) : mode === "sooner" ? (
            <Stat
              label="Time to repay"
              value={formatMonths(
                "months" in result && result.months != null
                  ? result.months
                  : result.years * 12,
              )}
              emphasize
            />
          ) : (
            <Stat
              label={`${freqLabel(freq)} repayment`}
              value={formatCurrency(result.payment)}
              emphasize
            />
          )}
          {mode === "borrow" ? (
            <Stat
              label={`${freqLabel(freq)} repayment`}
              value={formatCurrency(result.payment)}
            />
          ) : null}
          <Stat
            label="Total interest"
            value={
              Number.isFinite(result.totalInterest)
                ? formatCurrency(result.totalInterest)
                : "—"
            }
          />
          <Stat
            label="Total paid"
            value={
              Number.isFinite(result.totalPaid)
                ? formatCurrency(result.totalPaid)
                : "—"
            }
          />
          {result.totalFees > 0 ? (
            <Stat label="Total fees" value={formatCurrency(result.totalFees)} />
          ) : null}
        </>
      }
    >
      <ModeTabs
        modes={[
          { id: "repayments", label: "Repayments" },
          { id: "borrow", label: "How much can I borrow" },
          { id: "sooner", label: "Pay off sooner" },
        ]}
        value={mode}
        onChange={(id) => setMode(id as LoanMode)}
      />

      {mode !== "borrow" ? (
        <Field label="Loan amount">
          <NumberInput
            value={principal}
            onChange={setPrincipal}
            min={0}
            step={1000}
            prefix="$"
          />
        </Field>
      ) : (
        <Field label="Affordable repayment">
          <NumberInput
            value={affordablePayment}
            onChange={setAffordablePayment}
            min={0}
            step={50}
            prefix="$"
          />
        </Field>
      )}

      {mode === "sooner" ? (
        <Field label={`${freqLabel(freq)} repayment`}>
          <NumberInput
            value={payment}
            onChange={setPayment}
            min={0}
            step={50}
            prefix="$"
          />
        </Field>
      ) : null}

      <Field label="Interest rate (p.a.)">
        <NumberInput
          value={rate}
          onChange={setRate}
          min={0}
          max={30}
          step={0.05}
          suffix="%"
        />
      </Field>

      {mode !== "sooner" ? (
        <Field label="Term (years)">
          <NumberInput
            value={years}
            onChange={setYears}
            min={1}
            max={maxYears}
            step={1}
          />
        </Field>
      ) : null}

      <Field label="Repayment frequency">
        <SelectInput
          value={freq}
          onChange={(v) => setFreq(v as Frequency)}
          options={LOAN_FREQS}
        />
      </Field>

      {mode === "repayments" || mode === "borrow" ? (
        <Field label="Annual fee (optional)">
          <NumberInput
            value={annualFee}
            onChange={setAnnualFee}
            min={0}
            step={10}
            prefix="$"
          />
        </Field>
      ) : null}
    </CalculatorShell>
  );
}

export function MortgageCalculator() {
  return (
    <LoanTool
      title="Mortgage calculator"
      description="Estimate home loan repayments, borrowing power, or time to pay off sooner."
      maxYears={40}
      defaultPrincipal={650000}
      defaultRate={5.8}
      defaultYears={30}
    />
  );
}

export function PersonalLoanCalculator() {
  return (
    <LoanTool
      title="Personal loan calculator"
      description="Compare personal loan repayments, borrowing power, or an accelerated payoff."
      maxYears={15}
      defaultPrincipal={15000}
      defaultRate={9.5}
      defaultYears={5}
    />
  );
}

export function CreditCardCalculator() {
  const [balance, setBalance] = useState(4000);
  const [apr, setApr] = useState(19.9);
  const [minPercent, setMinPercent] = useState(2);
  const [minFloor, setMinFloor] = useState(25);
  const [higherPayment, setHigherPayment] = useState(200);

  const result = useMemo(
    () =>
      creditCardPayoffCompare({
        balance,
        apr,
        minPercent: minPercent / 100,
        minFloor,
        higherPayment,
      }),
    [balance, apr, minPercent, minFloor, higherPayment],
  );

  return (
    <CalculatorShell
      title="Credit card calculator"
      description="Compare minimum repayments with a higher fixed payment."
      results={
        <>
          <Stat
            label="At minimum"
            value={
              Number.isFinite(result.minMonths)
                ? formatMonths(result.minMonths)
                : "Never clears"
            }
            emphasize
          />
          <Stat
            label="Interest at minimum"
            value={
              Number.isFinite(result.minInterest)
                ? formatCurrency(result.minInterest)
                : "—"
            }
          />
          <Stat
            label="At higher payment"
            value={
              Number.isFinite(result.higherMonths)
                ? formatMonths(result.higherMonths)
                : "Raise repayment"
            }
          />
          <Stat
            label="Interest at higher"
            value={
              Number.isFinite(result.higherInterest)
                ? formatCurrency(result.higherInterest)
                : "—"
            }
          />
          <Stat
            label="Interest saved"
            value={
              Number.isFinite(result.interestSaved)
                ? formatCurrency(result.interestSaved)
                : "—"
            }
          />
        </>
      }
    >
      <Field label="Balance">
        <NumberInput value={balance} onChange={setBalance} min={0} step={50} prefix="$" />
      </Field>
      <Field label="Interest rate (p.a.)">
        <NumberInput value={apr} onChange={setApr} min={0} max={40} step={0.1} suffix="%" />
      </Field>
      <Field label="Minimum payment %" hint="Percentage of the outstanding balance.">
        <NumberInput
          value={minPercent}
          onChange={setMinPercent}
          min={0}
          max={100}
          step={0.5}
          suffix="%"
        />
      </Field>
      <Field label="Minimum payment floor">
        <NumberInput value={minFloor} onChange={setMinFloor} min={0} step={5} prefix="$" />
      </Field>
      <Field label="Higher monthly payment">
        <NumberInput
          value={higherPayment}
          onChange={setHigherPayment}
          min={0}
          step={10}
          prefix="$"
        />
      </Field>
    </CalculatorShell>
  );
}

export function PaydayLoanCalculator() {
  const [amount, setAmount] = useState(500);
  const [termDays, setTermDays] = useState(30);

  const result = useMemo(
    () => saccPaydayCost({ amount, termDays }),
    [amount, termDays],
  );

  return (
    <CalculatorShell
      title="Payday loan calculator"
      description="Estimate SACC costs: 20% establishment fee plus 4% per month of the term."
      results={
        <>
          <Stat
            label="Total repayable"
            value={formatCurrency(result.totalRepayable)}
            emphasize
          />
          <Stat
            label="Establishment fee (20%)"
            value={formatCurrency(result.establishmentFee)}
          />
          <Stat
            label="Monthly fees (4%/mo)"
            value={formatCurrency(result.monthlyFee)}
          />
          <Stat
            label="Fortnightly payment"
            value={formatCurrency(result.fortnightlyPayment)}
          />
        </>
      }
    >
      <Field label="Amount borrowed" hint="Maximum $2,000 for a small amount credit contract.">
        <NumberInput
          value={amount}
          onChange={setAmount}
          min={0}
          max={2000}
          step={50}
          prefix="$"
        />
      </Field>
      <Field label="Term (days)" hint="Between 16 and 365 days.">
        <NumberInput
          value={termDays}
          onChange={setTermDays}
          min={16}
          max={365}
          step={1}
        />
      </Field>
    </CalculatorShell>
  );
}

export function IncomeTaxCalculator() {
  const [employmentIncome, setEmploymentIncome] = useState(90000);
  const [employmentFreq, setEmploymentFreq] = useState<Frequency>("annually");
  const [otherIncome, setOtherIncome] = useState(0);
  const [otherFreq, setOtherFreq] = useState<Frequency>("annually");
  const [financialYear, setFinancialYear] =
    useState<FinancialYear>("2025-26");

  const employmentAnnual = toAnnual(employmentIncome, employmentFreq);
  const otherAnnual = toAnnual(otherIncome, otherFreq);

  const result = useMemo(
    () =>
      estimateIncomeTax({
        employmentIncome: employmentAnnual,
        otherIncome: otherAnnual,
        financialYear,
      }),
    [employmentAnnual, otherAnnual, financialYear],
  );

  const takeHome = result.taxableIncome - result.totalTax;

  return (
    <CalculatorShell
      title="Income tax calculator"
      description="Rough tax estimate for an Australian resident (illustrative Stage 3 brackets)."
      results={
        <>
          <Stat
            label="Taxable income"
            value={formatCurrency(result.taxableIncome)}
          />
          <Stat label="Income tax" value={formatCurrency(result.incomeTax)} />
          <Stat
            label="Medicare levy"
            value={formatCurrency(result.medicareLevy)}
          />
          <Stat
            label="Total tax"
            value={formatCurrency(result.totalTax)}
            emphasize
          />
          <Stat label="Approx. take-home" value={formatCurrency(takeHome)} />
          <Stat
            label="Effective rate"
            value={formatPercent(result.effectiveRate * 100)}
          />
        </>
      }
    >
      <Field label="Employment income">
        <NumberInput
          value={employmentIncome}
          onChange={setEmploymentIncome}
          min={0}
          step={500}
          prefix="$"
        />
      </Field>
      <Field label="Employment income frequency">
        <SelectInput
          value={employmentFreq}
          onChange={(v) => setEmploymentFreq(v as Frequency)}
          options={ALL_FREQS}
        />
      </Field>
      <Field label="Other income">
        <NumberInput
          value={otherIncome}
          onChange={setOtherIncome}
          min={0}
          step={100}
          prefix="$"
        />
      </Field>
      <Field label="Other income frequency">
        <SelectInput
          value={otherFreq}
          onChange={(v) => setOtherFreq(v as Frequency)}
          options={ALL_FREQS}
        />
      </Field>
      <Field label="Financial year">
        <SelectInput
          value={financialYear}
          onChange={(v) => setFinancialYear(v as FinancialYear)}
          options={[
            { value: "2025-26", label: "2025–26" },
            { value: "2026-27", label: "2026–27" },
          ]}
        />
      </Field>
    </CalculatorShell>
  );
}

export function SuperCalculator() {
  const [age, setAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(67);
  const [income, setIncome] = useState(90000);
  const [balance, setBalance] = useState(120000);
  const [employerRate, setEmployerRate] = useState(12);
  const [concessionalExtra, setConcessionalExtra] = useState(0);
  const [afterTaxExtra, setAfterTaxExtra] = useState(0);
  const [returnRate, setReturnRate] = useState(6.5);
  const [feeAdminAnnual, setFeeAdminAnnual] = useState(78);
  const [feePercent, setFeePercent] = useState(0.7);
  const [insuranceAnnual, setInsuranceAnnual] = useState(200);

  const result = useMemo(
    () =>
      projectSuperDetailed({
        age,
        retirementAge,
        income,
        balance,
        employerRate: employerRate / 100,
        concessionalExtra,
        afterTaxExtra,
        returnRate,
        feeAdminAnnual,
        feePercent,
        insuranceAnnual,
      }),
    [
      age,
      retirementAge,
      income,
      balance,
      employerRate,
      concessionalExtra,
      afterTaxExtra,
      returnRate,
      feeAdminAnnual,
      feePercent,
      insuranceAnnual,
    ],
  );

  return (
    <CalculatorShell
      title="Superannuation calculator"
      description="Project your super to retirement with SG, extras, returns, and fees."
      results={
        <>
          <Stat
            label="Balance at retirement"
            value={formatCurrency(result.balanceAtRetirement)}
            emphasize
          />
          <Stat label="Total fees" value={formatCurrency(result.totalFees)} />
          <Stat
            label="Total contributions"
            value={formatCurrency(result.totalContributions)}
          />
          <Stat label="Years projected" value={formatNumber(result.years)} />
        </>
      }
    >
      <Field label="Current age">
        <NumberInput value={age} onChange={setAge} min={18} max={75} step={1} />
      </Field>
      <Field label="Retirement age">
        <NumberInput
          value={retirementAge}
          onChange={setRetirementAge}
          min={age}
          max={80}
          step={1}
        />
      </Field>
      <Field label="Annual income (OTE)">
        <NumberInput value={income} onChange={setIncome} min={0} step={1000} prefix="$" />
      </Field>
      <Field label="Current balance">
        <NumberInput value={balance} onChange={setBalance} min={0} step={1000} prefix="$" />
      </Field>
      <Field label="Employer SG rate">
        <NumberInput
          value={employerRate}
          onChange={setEmployerRate}
          min={0}
          max={20}
          step={0.5}
          suffix="%"
        />
      </Field>
      <Field label="Extra concessional (p.a.)">
        <NumberInput
          value={concessionalExtra}
          onChange={setConcessionalExtra}
          min={0}
          step={500}
          prefix="$"
        />
      </Field>
      <Field label="Extra after-tax (p.a.)">
        <NumberInput
          value={afterTaxExtra}
          onChange={setAfterTaxExtra}
          min={0}
          step={500}
          prefix="$"
        />
      </Field>
      <Field label="Assumed return (p.a.)">
        <NumberInput
          value={returnRate}
          onChange={setReturnRate}
          min={0}
          max={12}
          step={0.1}
          suffix="%"
        />
      </Field>
      <Field label="Admin fee (p.a.)">
        <NumberInput
          value={feeAdminAnnual}
          onChange={setFeeAdminAnnual}
          min={0}
          step={10}
          prefix="$"
        />
      </Field>
      <Field label="Investment fee">
        <NumberInput
          value={feePercent}
          onChange={setFeePercent}
          min={0}
          max={5}
          step={0.05}
          suffix="%"
        />
      </Field>
      <Field label="Insurance in super (p.a.)">
        <NumberInput
          value={insuranceAnnual}
          onChange={setInsuranceAnnual}
          min={0}
          step={50}
          prefix="$"
        />
      </Field>
    </CalculatorShell>
  );
}

export function RetirementPlanner() {
  const [annualSpend, setAnnualSpend] = useState(55000);
  const [yearsRetired, setYearsRetired] = useState(25);
  const [returnRate, setReturnRate] = useState(4);
  const [currentSuper, setCurrentSuper] = useState(180000);
  const [yearsToRetire, setYearsToRetire] = useState(25);
  const [growthRate, setGrowthRate] = useState(6.5);
  const [annualContribution, setAnnualContribution] = useState(12000);

  const need = useMemo(
    () => retirementNeed({ annualSpend, yearsRetired, returnRate }),
    [annualSpend, yearsRetired, returnRate],
  );

  const projected = useMemo(
    () =>
      projectSuperBalance({
        current: currentSuper,
        annualContribution,
        years: yearsToRetire,
        returnRate: growthRate,
      }),
    [currentSuper, annualContribution, yearsToRetire, growthRate],
  );

  const gap = need - projected;

  return (
    <CalculatorShell
      title="Retirement planner"
      description="Estimate the nest egg you need and compare it with projected super growth."
      results={
        <>
          <Stat label="Estimated nest egg needed" value={formatCurrency(need)} />
          <Stat
            label="Projected super"
            value={formatCurrency(projected)}
            emphasize
          />
          <Stat
            label={gap > 0 ? "Shortfall" : "Surplus"}
            value={formatCurrency(Math.abs(gap))}
          />
          <p className="text-sm text-muted">
            Simplified model—doesn’t include Age Pension, tax, or sequencing risk.
          </p>
        </>
      }
    >
      <Field label="Desired annual spending">
        <NumberInput
          value={annualSpend}
          onChange={setAnnualSpend}
          min={0}
          step={1000}
          prefix="$"
        />
      </Field>
      <Field label="Years in retirement">
        <NumberInput
          value={yearsRetired}
          onChange={setYearsRetired}
          min={1}
          max={40}
          step={1}
        />
      </Field>
      <Field label="Assumed return in retirement (p.a.)">
        <NumberInput
          value={returnRate}
          onChange={setReturnRate}
          min={0}
          max={10}
          step={0.1}
          suffix="%"
        />
      </Field>
      <Field label="Current super">
        <NumberInput
          value={currentSuper}
          onChange={setCurrentSuper}
          min={0}
          step={1000}
          prefix="$"
        />
      </Field>
      <Field label="Years to retirement">
        <NumberInput
          value={yearsToRetire}
          onChange={setYearsToRetire}
          min={0}
          max={50}
          step={1}
        />
      </Field>
      <Field label="Assumed growth before retirement (p.a.)">
        <NumberInput
          value={growthRate}
          onChange={setGrowthRate}
          min={0}
          max={12}
          step={0.1}
          suffix="%"
        />
      </Field>
      <Field label="Annual contributions until retirement">
        <NumberInput
          value={annualContribution}
          onChange={setAnnualContribution}
          min={0}
          step={500}
          prefix="$"
        />
      </Field>
    </CalculatorShell>
  );
}

export function EmployerContributionsCalculator() {
  const [earnings, setEarnings] = useState(1700);
  const [freq, setFreq] = useState<Frequency>("fortnightly");
  const [over18, setOver18] = useState("yes");
  const [hoursOver30, setHoursOver30] = useState("yes");

  const sg = useMemo(
    () =>
      employerSGDetailed({
        earnings,
        frequency: freq,
        over18: over18 === "yes",
        hoursOver30: hoursOver30 === "yes",
      }),
    [earnings, freq, over18, hoursOver30],
  );

  return (
    <CalculatorShell
      title="Employer contributions calculator"
      description="Estimate Super Guarantee contributions for a pay period."
      results={
        <>
          <Stat
            label={`SG per ${freqLabel(freq).toLowerCase()}`}
            value={formatCurrency(sg)}
            emphasize
          />
          <Stat label="Annual SG (approx.)" value={formatCurrency(toAnnual(sg, freq))} />
        </>
      }
    >
      <Field label="Ordinary time earnings">
        <NumberInput value={earnings} onChange={setEarnings} min={0} step={50} prefix="$" />
      </Field>
      <Field label="Pay frequency">
        <SelectInput
          value={freq}
          onChange={(v) => setFreq(v as Frequency)}
          options={ALL_FREQS}
        />
      </Field>
      <Field label="Aged 18 or over?">
        <SelectInput
          value={over18}
          onChange={setOver18}
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
        />
      </Field>
      {over18 === "no" ? (
        <Field label="Works more than 30 hours/week?">
          <SelectInput
            value={hoursOver30}
            onChange={setHoursOver30}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
          />
        </Field>
      ) : null}
    </CalculatorShell>
  );
}

export function ReverseMortgageCalculator() {
  const [propertyValue, setPropertyValue] = useState(900000);
  const [loanAmount, setLoanAmount] = useState(100000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(15);
  const [propertyGrowthRate, setPropertyGrowthRate] = useState(3);
  const [establishmentFee, setEstablishmentFee] = useState(0);
  const [ongoingFeeAnnual, setOngoingFeeAnnual] = useState(0);

  const rows = useMemo(
    () =>
      projectReverseMortgage({
        propertyValue,
        loanAmount,
        rate,
        years,
        propertyGrowthRate,
        establishmentFee,
        ongoingFeeAnnual,
      }),
    [
      propertyValue,
      loanAmount,
      rate,
      years,
      propertyGrowthRate,
      establishmentFee,
      ongoingFeeAnnual,
    ],
  );

  const final = rows[rows.length - 1];
  const tableRows = rows.filter(
    (r) => r.year === 0 || r.year % 5 === 0 || r.year === years,
  );

  return (
    <CalculatorShell
      title="Reverse mortgage calculator"
      description="See how equity release debt and remaining equity can change over time."
      results={
        <>
          <Stat
            label="Final debt"
            value={formatCurrency(final?.debt ?? 0)}
            emphasize
          />
          <Stat
            label="Final equity"
            value={formatCurrency(final?.equity ?? 0)}
          />
          <Stat
            label="Property value"
            value={formatCurrency(final?.propertyValue ?? 0)}
          />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-1 pr-2 font-medium">Year</th>
                  <th className="py-1 pr-2 font-medium">Debt</th>
                  <th className="py-1 font-medium">Equity</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((r) => (
                  <tr key={r.year} className="border-b border-border/60">
                    <td className="py-1.5 pr-2">{r.year}</td>
                    <td className="py-1.5 pr-2">{formatCurrency(r.debt)}</td>
                    <td className="py-1.5">{formatCurrency(r.equity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      }
    >
      <Field label="Property value">
        <NumberInput
          value={propertyValue}
          onChange={setPropertyValue}
          min={0}
          step={5000}
          prefix="$"
        />
      </Field>
      <Field label="Loan amount">
        <NumberInput
          value={loanAmount}
          onChange={setLoanAmount}
          min={0}
          step={1000}
          prefix="$"
        />
      </Field>
      <Field label="Interest rate (p.a.)">
        <NumberInput value={rate} onChange={setRate} min={0} max={15} step={0.1} suffix="%" />
      </Field>
      <Field label="Property growth (p.a.)">
        <NumberInput
          value={propertyGrowthRate}
          onChange={setPropertyGrowthRate}
          min={0}
          max={10}
          step={0.1}
          suffix="%"
        />
      </Field>
      <Field label="Years">
        <NumberInput value={years} onChange={setYears} min={1} max={40} step={1} />
      </Field>
      <Field label="Establishment fee">
        <NumberInput
          value={establishmentFee}
          onChange={setEstablishmentFee}
          min={0}
          step={100}
          prefix="$"
        />
      </Field>
      <Field label="Ongoing fee (p.a.)">
        <NumberInput
          value={ongoingFeeAnnual}
          onChange={setOngoingFeeAnnual}
          min={0}
          step={50}
          prefix="$"
        />
      </Field>
    </CalculatorShell>
  );
}

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(5000);
  const [contribution, setContribution] = useState(200);
  const [contribFreq, setContribFreq] = useState<Frequency>("monthly");
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(10);
  const [delayMonths, setDelayMonths] = useState(0);

  const compoundsPerYear = periodsPerYear(contribFreq);
  const periodContribution = contribution;

  const delayed = useMemo(
    () =>
      futureValueWithDelay({
        principal,
        contribution: periodContribution,
        annualRate: rate,
        years,
        compoundsPerYear,
        delayMonths,
      }),
    [principal, periodContribution, rate, years, compoundsPerYear, delayMonths],
  );

  const noDelay = useMemo(
    () =>
      futureValue({
        principal,
        contribution: periodContribution,
        annualRate: rate,
        years,
        compoundsPerYear,
      }),
    [principal, periodContribution, rate, years, compoundsPerYear],
  );

  const higherContrib = useMemo(
    () =>
      futureValueWithDelay({
        principal,
        contribution: periodContribution * 1.25,
        annualRate: rate,
        years,
        compoundsPerYear,
        delayMonths,
      }),
    [principal, periodContribution, rate, years, compoundsPerYear, delayMonths],
  );

  return (
    <CalculatorShell
      title="Compound interest calculator"
      description="Project growth with regular contributions — and compare delaying or contributing more."
      results={
        <>
          <Stat
            label="Future value"
            value={formatCurrency(delayed)}
            emphasize
          />
          {delayMonths > 0 ? (
            <Stat
              label="If you start now (no delay)"
              value={formatCurrency(noDelay)}
            />
          ) : (
            <Stat
              label="If you contribute 25% more"
              value={formatCurrency(higherContrib)}
            />
          )}
          {delayMonths > 0 ? (
            <Stat
              label="Cost of delaying"
              value={formatCurrency(noDelay - delayed)}
            />
          ) : (
            <Stat
              label="Extra from higher deposits"
              value={formatCurrency(higherContrib - delayed)}
            />
          )}
        </>
      }
    >
      <Field label="Starting amount">
        <NumberInput value={principal} onChange={setPrincipal} min={0} step={100} prefix="$" />
      </Field>
      <Field label="Regular contribution">
        <NumberInput
          value={contribution}
          onChange={setContribution}
          min={0}
          step={10}
          prefix="$"
        />
      </Field>
      <Field label="Contribution frequency">
        <SelectInput
          value={contribFreq}
          onChange={(v) => setContribFreq(v as Frequency)}
          options={ALL_FREQS}
        />
      </Field>
      <Field label="Rate (p.a.)">
        <NumberInput value={rate} onChange={setRate} min={0} max={20} step={0.1} suffix="%" />
      </Field>
      <Field label="Years">
        <NumberInput value={years} onChange={setYears} min={1} max={50} step={1} />
      </Field>
      <Field label="Delay before contributing (months)">
        <NumberInput
          value={delayMonths}
          onChange={setDelayMonths}
          min={0}
          max={years * 12}
          step={1}
        />
      </Field>
    </CalculatorShell>
  );
}

export function GstCalculator() {
  const [amount, setAmount] = useState(110);
  const [mode, setMode] = useState<"inclusive" | "exclusive">("inclusive");

  const result = useMemo(() => gstBreakdown(amount, mode), [amount, mode]);

  return (
    <CalculatorShell
      title="GST calculator"
      description="Break a price into GST-exclusive, GST, and GST-inclusive amounts."
      results={
        <>
          <Stat label="Exclusive of GST" value={formatCurrency(result.exclusive)} />
          <Stat label="GST (10%)" value={formatCurrency(result.gst)} emphasize />
          <Stat label="Inclusive of GST" value={formatCurrency(result.inclusive)} />
        </>
      }
    >
      <Field label="Amount">
        <NumberInput value={amount} onChange={setAmount} min={0} step={1} prefix="$" />
      </Field>
      <ModeTabs
        modes={[
          { id: "inclusive", label: "Includes GST" },
          { id: "exclusive", label: "Excludes GST" },
        ]}
        value={mode}
        onChange={(id) => setMode(id as "inclusive" | "exclusive")}
      />
    </CalculatorShell>
  );
}

export function SimpleMoneyManager() {
  const [displayFreq, setDisplayFreq] = useState<Frequency>("weekly");
  const [pay, setPay] = useState(1200);
  const [payFreq, setPayFreq] = useState<Frequency>("weekly");
  const [centrelink, setCentrelink] = useState(0);
  const [centrelinkFreq, setCentrelinkFreq] = useState<Frequency>("fortnightly");
  const [otherIn, setOtherIn] = useState(0);
  const [otherInFreq, setOtherInFreq] = useState<Frequency>("monthly");

  const [housing, setHousing] = useState(450);
  const [loans, setLoans] = useState(150);
  const [insurance, setInsurance] = useState(40);
  const [phone, setPhone] = useState(30);
  const [food, setFood] = useState(200);
  const [personal, setPersonal] = useState(50);
  const [medical, setMedical] = useState(20);
  const [entertainment, setEntertainment] = useState(60);
  const [travel, setTravel] = useState(40);
  const [children, setChildren] = useState(0);
  const [otherOut, setOtherOut] = useState(30);
  const [outFreq, setOutFreq] = useState<Frequency>("weekly");

  const moneyInMonthly =
    toMonthly(pay, payFreq) +
    toMonthly(centrelink, centrelinkFreq) +
    toMonthly(otherIn, otherInFreq);

  const moneyOutMonthly =
    toMonthly(housing, outFreq) +
    toMonthly(loans, outFreq) +
    toMonthly(insurance, outFreq) +
    toMonthly(phone, outFreq) +
    toMonthly(food, outFreq) +
    toMonthly(personal, outFreq) +
    toMonthly(medical, outFreq) +
    toMonthly(entertainment, outFreq) +
    toMonthly(travel, outFreq) +
    toMonthly(children, outFreq) +
    toMonthly(otherOut, outFreq);

  const surplusMonthly = moneyInMonthly - moneyOutMonthly;
  const surplusDisplay = fromMonthly(surplusMonthly, displayFreq);
  const inDisplay = fromMonthly(moneyInMonthly, displayFreq);
  const outDisplay = fromMonthly(moneyOutMonthly, displayFreq);

  return (
    <CalculatorShell
      title="Simple money manager"
      description="Quick snapshot of money in versus everyday spending."
      results={
        <>
          <Stat
            label={`Money in (${freqLabel(displayFreq).toLowerCase()})`}
            value={formatCurrency(inDisplay)}
          />
          <Stat
            label={`Money out (${freqLabel(displayFreq).toLowerCase()})`}
            value={formatCurrency(outDisplay)}
          />
          <Stat
            label={surplusMonthly >= 0 ? "Surplus" : "Deficit"}
            value={formatCurrency(Math.abs(surplusDisplay))}
            emphasize
          />
          <p className="text-sm text-muted">
            {surplusMonthly >= 0
              ? "You’re spending less than you earn at these amounts."
              : "Spending exceeds income — look for cuts or extra income."}
          </p>
        </>
      }
    >
      <Field label="Display frequency">
        <SelectInput
          value={displayFreq}
          onChange={(v) => setDisplayFreq(v as Frequency)}
          options={ALL_FREQS}
        />
      </Field>

      <p className="text-sm font-semibold">Money in</p>
      <Field label="Pay">
        <NumberInput value={pay} onChange={setPay} min={0} step={10} prefix="$" />
      </Field>
      <Field label="Pay frequency">
        <SelectInput
          value={payFreq}
          onChange={(v) => setPayFreq(v as Frequency)}
          options={ALL_FREQS}
        />
      </Field>
      <Field label="Centrelink">
        <NumberInput
          value={centrelink}
          onChange={setCentrelink}
          min={0}
          step={10}
          prefix="$"
        />
      </Field>
      <Field label="Centrelink frequency">
        <SelectInput
          value={centrelinkFreq}
          onChange={(v) => setCentrelinkFreq(v as Frequency)}
          options={ALL_FREQS}
        />
      </Field>
      <Field label="Other income">
        <NumberInput value={otherIn} onChange={setOtherIn} min={0} step={10} prefix="$" />
      </Field>
      <Field label="Other income frequency">
        <SelectInput
          value={otherInFreq}
          onChange={(v) => setOtherInFreq(v as Frequency)}
          options={ALL_FREQS}
        />
      </Field>

      <p className="text-sm font-semibold">Money out</p>
      <Field label="Expense frequency" hint="Applies to all expense amounts below.">
        <SelectInput
          value={outFreq}
          onChange={(v) => setOutFreq(v as Frequency)}
          options={ALL_FREQS}
        />
      </Field>
      {(
        [
          ["Housing", housing, setHousing],
          ["Loans", loans, setLoans],
          ["Insurance", insurance, setInsurance],
          ["Phone", phone, setPhone],
          ["Food", food, setFood],
          ["Personal", personal, setPersonal],
          ["Medical", medical, setMedical],
          ["Entertainment", entertainment, setEntertainment],
          ["Travel", travel, setTravel],
          ["Children", children, setChildren],
          ["Other", otherOut, setOtherOut],
        ] as const
      ).map(([label, value, setter]) => (
        <Field key={label} label={label}>
          <NumberInput value={value} onChange={setter} min={0} step={5} prefix="$" />
        </Field>
      ))}
    </CalculatorShell>
  );
}

export function LoanComparisonCalculator() {
  const [aPrincipal, setAPrincipal] = useState(30000);
  const [aRate, setARate] = useState(8);
  const [aYears, setAYears] = useState(5);
  const [bPrincipal, setBPrincipal] = useState(30000);
  const [bRate, setBRate] = useState(9.5);
  const [bYears, setBYears] = useState(4);
  const [freq, setFreq] = useState<Frequency>("monthly");

  const comparison = useMemo(
    () =>
      compareTwoLoans(
        { principal: aPrincipal, annualRate: aRate, years: aYears },
        { principal: bPrincipal, annualRate: bRate, years: bYears },
      ),
    [aPrincipal, aRate, aYears, bPrincipal, bRate, bYears],
  );

  const payA = useMemo(
    () => paymentForFrequency(aPrincipal, aRate, aYears, freq),
    [aPrincipal, aRate, aYears, freq],
  );
  const payB = useMemo(
    () => paymentForFrequency(bPrincipal, bRate, bYears, freq),
    [bPrincipal, bRate, bYears, freq],
  );

  return (
    <CalculatorShell
      title="Loan comparison calculator"
      description="Side-by-side repayments for two loan offers."
      results={
        <>
          <Stat
            label={`Loan A (${freqLabel(freq).toLowerCase()})`}
            value={formatCurrency(payA)}
          />
          <Stat
            label={`Loan B (${freqLabel(freq).toLowerCase()})`}
            value={formatCurrency(payB)}
          />
          <Stat
            label="Interest difference"
            value={formatCurrency(Math.abs(comparison.interestDifference))}
            emphasize
          />
          <p className="text-sm text-muted">
            Cheaper on interest:{" "}
            {comparison.cheaperLoan === "equal"
              ? "Similar"
              : `Loan ${comparison.cheaperLoan}`}
          </p>
        </>
      }
    >
      <Field label="Repayment frequency">
        <SelectInput
          value={freq}
          onChange={(v) => setFreq(v as Frequency)}
          options={LOAN_FREQS}
        />
      </Field>
      <p className="text-sm font-semibold">Loan A</p>
      <Field label="Amount">
        <NumberInput
          value={aPrincipal}
          onChange={setAPrincipal}
          min={0}
          step={500}
          prefix="$"
        />
      </Field>
      <Field label="Rate">
        <NumberInput value={aRate} onChange={setARate} min={0} step={0.1} suffix="%" />
      </Field>
      <Field label="Years">
        <NumberInput value={aYears} onChange={setAYears} min={1} max={40} step={1} />
      </Field>
      <p className="text-sm font-semibold">Loan B</p>
      <Field label="Amount">
        <NumberInput
          value={bPrincipal}
          onChange={setBPrincipal}
          min={0}
          step={500}
          prefix="$"
        />
      </Field>
      <Field label="Rate">
        <NumberInput value={bRate} onChange={setBRate} min={0} step={0.1} suffix="%" />
      </Field>
      <Field label="Years">
        <NumberInput value={bYears} onChange={setBYears} min={1} max={40} step={1} />
      </Field>
    </CalculatorShell>
  );
}

export function OffsetVsRedrawCalculator() {
  const [loan, setLoan] = useState(500000);
  const [rate, setRate] = useState(5.8);
  const [offset, setOffset] = useState(40000);
  const interestFull = useMemo(() => (loan * rate) / 100 / 12, [loan, rate]);
  const interestOffset = useMemo(
    () => (Math.max(loan - offset, 0) * rate) / 100 / 12,
    [loan, offset, rate],
  );
  return (
    <CalculatorShell
      title="Offset vs extra repayments"
      description="See monthly interest saved by keeping money in an offset."
      results={
        <>
          <Stat label="Interest without offset" value={formatCurrency(interestFull)} />
          <Stat
            label="Interest with offset"
            value={formatCurrency(interestOffset)}
            emphasize
          />
          <Stat
            label="Monthly saving"
            value={formatCurrency(interestFull - interestOffset)}
          />
        </>
      }
    >
      <Field label="Loan balance">
        <NumberInput value={loan} onChange={setLoan} min={0} step={1000} prefix="$" />
      </Field>
      <Field label="Interest rate">
        <NumberInput value={rate} onChange={setRate} min={0} step={0.05} suffix="%" />
      </Field>
      <Field label="Offset balance">
        <NumberInput value={offset} onChange={setOffset} min={0} step={500} prefix="$" />
      </Field>
    </CalculatorShell>
  );
}

export function InvestmentReturnsCalculator() {
  const [principal, setPrincipal] = useState(20000);
  const [contribution, setContribution] = useState(500);
  const [contribFreq, setContribFreq] = useState<Frequency>("monthly");
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(15);

  const lump = useMemo(
    () => compoundGrowth(principal, years, rate),
    [principal, rate, years],
  );

  const withContributions = useMemo(
    () =>
      futureValue({
        principal,
        contribution,
        annualRate: rate,
        years,
        compoundsPerYear: periodsPerYear(contribFreq),
      }),
    [principal, contribution, rate, years, contribFreq],
  );

  return (
    <CalculatorShell
      title="Investment returns calculator"
      description="Model lump-sum growth with optional regular contributions."
      results={
        <>
          <Stat
            label="With contributions"
            value={formatCurrency(withContributions)}
            emphasize
          />
          <Stat label="Lump sum only" value={formatCurrency(lump)} />
        </>
      }
    >
      <Field label="Starting amount">
        <NumberInput value={principal} onChange={setPrincipal} min={0} step={500} prefix="$" />
      </Field>
      <Field label="Regular contribution">
        <NumberInput
          value={contribution}
          onChange={setContribution}
          min={0}
          step={50}
          prefix="$"
        />
      </Field>
      <Field label="Contribution frequency">
        <SelectInput
          value={contribFreq}
          onChange={(v) => setContribFreq(v as Frequency)}
          options={ALL_FREQS}
        />
      </Field>
      <Field label="Assumed return">
        <NumberInput value={rate} onChange={setRate} min={0} max={15} step={0.1} suffix="%" />
      </Field>
      <Field label="Years">
        <NumberInput value={years} onChange={setYears} min={1} max={50} step={1} />
      </Field>
    </CalculatorShell>
  );
}

export function FeeDragCalculator() {
  const [principal, setPrincipal] = useState(50000);
  const [years, setYears] = useState(20);
  const [contribution, setContribution] = useState(200);
  const [contribFreq, setContribFreq] = useState<Frequency>("monthly");
  const [managementFee, setManagementFee] = useState(0.75);
  const [otherFeeAnnual, setOtherFeeAnnual] = useState(50);
  const [contributionFee, setContributionFee] = useState(0);
  const [adviceFee, setAdviceFee] = useState(0);
  const [earnings, setEarnings] = useState(7);

  const result = useMemo(
    () =>
      managedFundsProjection({
        principal,
        years,
        contribution,
        contributionFreq: contribFreq,
        managementFeePercent: managementFee,
        otherFeeAnnual,
        contributionFeePercent: contributionFee,
        adviceFeePercent: adviceFee,
        earningsPercent: earnings,
      }),
    [
      principal,
      years,
      contribution,
      contribFreq,
      managementFee,
      otherFeeAnnual,
      contributionFee,
      adviceFee,
      earnings,
    ],
  );

  return (
    <CalculatorShell
      title="Fee impact calculator"
      description="See how managed fund fees reduce long-term balances."
      results={
        <>
          <Stat
            label="Without fees"
            value={formatCurrency(result.balanceWithoutFees)}
          />
          <Stat
            label="With fees"
            value={formatCurrency(result.balanceWithFees)}
            emphasize
          />
          <Stat label="Fee impact" value={formatCurrency(result.feeImpact)} />
        </>
      }
    >
      <Field label="Starting amount">
        <NumberInput value={principal} onChange={setPrincipal} min={0} step={1000} prefix="$" />
      </Field>
      <Field label="Years">
        <NumberInput value={years} onChange={setYears} min={1} max={50} step={1} />
      </Field>
      <Field label="Regular contribution">
        <NumberInput
          value={contribution}
          onChange={setContribution}
          min={0}
          step={50}
          prefix="$"
        />
      </Field>
      <Field label="Contribution frequency">
        <SelectInput
          value={contribFreq}
          onChange={(v) => setContribFreq(v as Frequency)}
          options={ALL_FREQS}
        />
      </Field>
      <Field label="Earnings (p.a.)">
        <NumberInput
          value={earnings}
          onChange={setEarnings}
          min={0}
          max={15}
          step={0.1}
          suffix="%"
        />
      </Field>
      <Field label="Management fee">
        <NumberInput
          value={managementFee}
          onChange={setManagementFee}
          min={0}
          max={5}
          step={0.05}
          suffix="%"
        />
      </Field>
      <Field label="Other fees (p.a.)">
        <NumberInput
          value={otherFeeAnnual}
          onChange={setOtherFeeAnnual}
          min={0}
          step={10}
          prefix="$"
        />
      </Field>
      <Field label="Contribution fee">
        <NumberInput
          value={contributionFee}
          onChange={setContributionFee}
          min={0}
          max={10}
          step={0.1}
          suffix="%"
        />
      </Field>
      <Field label="Advice fee">
        <NumberInput
          value={adviceFee}
          onChange={setAdviceFee}
          min={0}
          max={5}
          step={0.05}
          suffix="%"
        />
      </Field>
    </CalculatorShell>
  );
}

export function InsuranceNeedsCalculator() {
  const [funeral, setFuneral] = useState(15000);
  const [mortgage, setMortgage] = useState(350000);
  const [otherDebts, setOtherDebts] = useState(25000);
  const [educationCosts, setEducationCosts] = useState(50000);
  const [annualLiving, setAnnualLiving] = useState(60000);
  const [livingYears, setLivingYears] = useState(10);
  const [assetsOffset, setAssetsOffset] = useState(100000);

  const result = useMemo(
    () =>
      lifeCoverEstimate({
        funeral,
        mortgage,
        otherDebts,
        educationCosts,
        annualLiving,
        livingYears,
        assetsOffset,
      }),
    [
      funeral,
      mortgage,
      otherDebts,
      educationCosts,
      annualLiving,
      livingYears,
      assetsOffset,
    ],
  );

  return (
    <CalculatorShell
      title="Life cover needs estimator"
      description="Estimate life insurance cover from debts, living costs, and existing assets."
      results={
        <>
          <Stat
            label="Suggested cover"
            value={formatCurrency(result.suggestedCover)}
            emphasize
          />
          <Stat
            label="Living costs (PV)"
            value={formatCurrency(result.livingCostsPV)}
          />
          <Stat
            label="Debts & costs"
            value={formatCurrency(result.debtsAndCosts)}
          />
          <Stat label="Assets offset" value={formatCurrency(result.assetsOffset)} />
        </>
      }
    >
      <Field label="Funeral costs">
        <NumberInput value={funeral} onChange={setFuneral} min={0} step={500} prefix="$" />
      </Field>
      <Field label="Mortgage">
        <NumberInput value={mortgage} onChange={setMortgage} min={0} step={1000} prefix="$" />
      </Field>
      <Field label="Other debts">
        <NumberInput
          value={otherDebts}
          onChange={setOtherDebts}
          min={0}
          step={500}
          prefix="$"
        />
      </Field>
      <Field label="Education costs">
        <NumberInput
          value={educationCosts}
          onChange={setEducationCosts}
          min={0}
          step={1000}
          prefix="$"
        />
      </Field>
      <Field label="Annual living / income replacement">
        <NumberInput
          value={annualLiving}
          onChange={setAnnualLiving}
          min={0}
          step={1000}
          prefix="$"
        />
      </Field>
      <Field label="Years of living costs">
        <NumberInput
          value={livingYears}
          onChange={setLivingYears}
          min={0}
          max={40}
          step={1}
        />
      </Field>
      <Field label="Assets / existing cover">
        <NumberInput
          value={assetsOffset}
          onChange={setAssetsOffset}
          min={0}
          step={1000}
          prefix="$"
        />
      </Field>
    </CalculatorShell>
  );
}

export function EmergencyFundCalculator() {
  const [essentials, setEssentials] = useState(1000);
  const [essentialsFreq, setEssentialsFreq] = useState<Frequency>("weekly");
  const [months, setMonths] = useState(3);

  const monthlyEssentials = toMonthly(essentials, essentialsFreq);
  const target = useMemo(
    () => emergencyFundTarget(monthlyEssentials, months),
    [monthlyEssentials, months],
  );

  return (
    <CalculatorShell
      title="Emergency fund calculator"
      description="Size a buffer based on months of essential spending."
      results={
        <>
          <Stat label="Target buffer" value={formatCurrency(target)} emphasize />
          <Stat
            label="Monthly essentials"
            value={formatCurrency(monthlyEssentials)}
          />
        </>
      }
    >
      <Field label="Essential spending">
        <NumberInput
          value={essentials}
          onChange={setEssentials}
          min={0}
          step={50}
          prefix="$"
        />
      </Field>
      <Field label="Spending frequency">
        <SelectInput
          value={essentialsFreq}
          onChange={(v) => setEssentialsFreq(v as Frequency)}
          options={ALL_FREQS}
        />
      </Field>
      <Field label="Months of cover">
        <NumberInput value={months} onChange={setMonths} min={1} max={12} step={1} />
      </Field>
    </CalculatorShell>
  );
}

export function RentVsBuyCalculator() {
  const [rentalPayment, setRentalPayment] = useState(80);
  const [rentalFreq, setRentalFreq] = useState<Frequency>("weekly");
  const [months, setMonths] = useState(36);
  const [cashPrice, setCashPrice] = useState(2500);
  const [useLoan, setUseLoan] = useState("no");
  const [loanAmount, setLoanAmount] = useState(2000);
  const [loanRate, setLoanRate] = useState(12);
  const [loanPayment, setLoanPayment] = useState(0);
  const [loanFreq, setLoanFreq] = useState<Frequency>("fortnightly");

  const result = useMemo(
    () =>
      consumerLeaseVsBuy({
        rentalPayment,
        rentalFreq,
        months,
        cashPrice,
        ...(useLoan === "yes"
          ? {
              loanAmount,
              loanRate: loanPayment > 0 ? undefined : loanRate,
              loanPayment: loanPayment > 0 ? loanPayment : undefined,
              loanFreq,
            }
          : {}),
      }),
    [
      rentalPayment,
      rentalFreq,
      months,
      cashPrice,
      useLoan,
      loanAmount,
      loanRate,
      loanPayment,
      loanFreq,
    ],
  );

  return (
    <CalculatorShell
      title="Consumer lease vs buy"
      description="Compare renting goods (consumer lease) with buying outright or on finance."
      results={
        <>
          <Stat
            label="Total rental cost"
            value={formatCurrency(result.totalRentalCost)}
          />
          <Stat
            label="Total buy / borrow cost"
            value={formatCurrency(result.totalBuyCost)}
            emphasize
          />
          <Stat
            label={
              result.cheaperOption === "equal"
                ? "Difference"
                : result.cheaperOption === "buy"
                  ? "Buy saves"
                  : "Lease saves"
            }
            value={formatCurrency(Math.abs(result.difference))}
          />
        </>
      }
    >
      <Field label="Rental payment">
        <NumberInput
          value={rentalPayment}
          onChange={setRentalPayment}
          min={0}
          step={5}
          prefix="$"
        />
      </Field>
      <Field label="Rental frequency">
        <SelectInput
          value={rentalFreq}
          onChange={(v) => setRentalFreq(v as Frequency)}
          options={ALL_FREQS}
        />
      </Field>
      <Field label="Lease term (months)">
        <NumberInput value={months} onChange={setMonths} min={1} max={120} step={1} />
      </Field>
      <Field label="Cash / buy price">
        <NumberInput
          value={cashPrice}
          onChange={setCashPrice}
          min={0}
          step={50}
          prefix="$"
        />
      </Field>
      <Field label="Compare with a loan?">
        <SelectInput
          value={useLoan}
          onChange={setUseLoan}
          options={[
            { value: "no", label: "No — cash purchase" },
            { value: "yes", label: "Yes — finance" },
          ]}
        />
      </Field>
      {useLoan === "yes" ? (
        <>
          <Field label="Loan amount">
            <NumberInput
              value={loanAmount}
              onChange={setLoanAmount}
              min={0}
              step={50}
              prefix="$"
            />
          </Field>
          <Field label="Loan rate (p.a.)" hint="Used when loan payment is 0.">
            <NumberInput
              value={loanRate}
              onChange={setLoanRate}
              min={0}
              max={40}
              step={0.1}
              suffix="%"
            />
          </Field>
          <Field label="Known loan payment (optional)">
            <NumberInput
              value={loanPayment}
              onChange={setLoanPayment}
              min={0}
              step={10}
              prefix="$"
            />
          </Field>
          <Field label="Loan payment frequency">
            <SelectInput
              value={loanFreq}
              onChange={(v) => setLoanFreq(v as Frequency)}
              options={LOAN_FREQS}
            />
          </Field>
        </>
      ) : null}
    </CalculatorShell>
  );
}

export function HecsCalculator() {
  const [income, setIncome] = useState(75000);
  const [incomeFreq, setIncomeFreq] = useState<Frequency>("annually");

  const annualIncome = toAnnual(income, incomeFreq);
  const result = useMemo(() => roughHecsRepayment(annualIncome), [annualIncome]);

  return (
    <CalculatorShell
      title="HECS-HELP repayment calculator"
      description="Estimate compulsory study loan repayments from income."
      results={
        <>
          <Stat
            label="Approx. annual repayment"
            value={formatCurrency(result)}
            emphasize
          />
          <Stat
            label="Approx. per fortnight"
            value={formatCurrency(result / 26)}
          />
          <Stat
            label={`Per ${freqLabel(incomeFreq).toLowerCase()}`}
            value={formatCurrency(fromMonthly(result / 12, incomeFreq))}
          />
        </>
      }
    >
      <Field label="Repayment income">
        <NumberInput value={income} onChange={setIncome} min={0} step={500} prefix="$" />
      </Field>
      <Field label="Income frequency">
        <SelectInput
          value={incomeFreq}
          onChange={(v) => setIncomeFreq(v as Frequency)}
          options={ALL_FREQS}
        />
      </Field>
    </CalculatorShell>
  );
}

export function NetWorthTracker() {
  const [home, setHome] = useState(750000);
  const [property, setProperty] = useState(0);
  const [superBal, setSuperBal] = useState(90000);
  const [shares, setShares] = useState(15000);
  const [savings, setSavings] = useState(12000);
  const [vehicle, setVehicle] = useState(18000);
  const [otherAssets, setOtherAssets] = useState(0);

  const [mortgage, setMortgage] = useState(420000);
  const [personalLoan, setPersonalLoan] = useState(8000);
  const [hecs, setHecs] = useState(15000);
  const [creditCard, setCreditCard] = useState(2000);
  const [otherLiabilities, setOtherLiabilities] = useState(0);

  const assets =
    home + property + superBal + shares + savings + vehicle + otherAssets;
  const liabilities =
    mortgage + personalLoan + hecs + creditCard + otherLiabilities;
  const net = assets - liabilities;

  return (
    <CalculatorShell
      title="Net worth tracker"
      description="Add assets and liabilities for a simple net worth snapshot."
      results={
        <>
          <Stat label="Assets" value={formatCurrency(assets)} />
          <Stat label="Liabilities" value={formatCurrency(liabilities)} />
          <Stat label="Net worth" value={formatCurrency(net)} emphasize />
        </>
      }
    >
      <p className="text-sm font-semibold">Assets</p>
      <Field label="Home">
        <NumberInput value={home} onChange={setHome} min={0} step={5000} prefix="$" />
      </Field>
      <Field label="Other property">
        <NumberInput value={property} onChange={setProperty} min={0} step={1000} prefix="$" />
      </Field>
      <Field label="Super">
        <NumberInput value={superBal} onChange={setSuperBal} min={0} step={1000} prefix="$" />
      </Field>
      <Field label="Shares / investments">
        <NumberInput value={shares} onChange={setShares} min={0} step={500} prefix="$" />
      </Field>
      <Field label="Savings / cash">
        <NumberInput value={savings} onChange={setSavings} min={0} step={100} prefix="$" />
      </Field>
      <Field label="Vehicle">
        <NumberInput value={vehicle} onChange={setVehicle} min={0} step={500} prefix="$" />
      </Field>
      <Field label="Other assets">
        <NumberInput
          value={otherAssets}
          onChange={setOtherAssets}
          min={0}
          step={100}
          prefix="$"
        />
      </Field>

      <p className="text-sm font-semibold">Liabilities</p>
      <Field label="Mortgage">
        <NumberInput value={mortgage} onChange={setMortgage} min={0} step={1000} prefix="$" />
      </Field>
      <Field label="Personal loan">
        <NumberInput
          value={personalLoan}
          onChange={setPersonalLoan}
          min={0}
          step={500}
          prefix="$"
        />
      </Field>
      <Field label="HECS-HELP">
        <NumberInput value={hecs} onChange={setHecs} min={0} step={500} prefix="$" />
      </Field>
      <Field label="Credit card">
        <NumberInput
          value={creditCard}
          onChange={setCreditCard}
          min={0}
          step={100}
          prefix="$"
        />
      </Field>
      <Field label="Other liabilities">
        <NumberInput
          value={otherLiabilities}
          onChange={setOtherLiabilities}
          min={0}
          step={100}
          prefix="$"
        />
      </Field>
    </CalculatorShell>
  );
}

export function InflationCalculator() {
  const [amount, setAmount] = useState(100);
  const [years, setYears] = useState(10);
  const [inflationRate, setInflationRate] = useState(2.5);

  const future = useMemo(
    () => inflationAdjust(amount, years, inflationRate),
    [amount, years, inflationRate],
  );

  return (
    <CalculatorShell
      title="Inflation calculator"
      description="See what today’s dollars may buy in future years."
      results={
        <>
          <Stat label="Future equivalent" value={formatCurrency(future)} emphasize />
          <Stat
            label="Purchasing power loss"
            value={formatCurrency(future - amount)}
          />
        </>
      }
    >
      <Field label="Amount today">
        <NumberInput value={amount} onChange={setAmount} min={0} step={10} prefix="$" />
      </Field>
      <Field label="Years">
        <NumberInput value={years} onChange={setYears} min={1} max={50} step={1} />
      </Field>
      <Field label="Inflation rate">
        <NumberInput
          value={inflationRate}
          onChange={setInflationRate}
          min={0}
          max={10}
          step={0.1}
          suffix="%"
        />
      </Field>
    </CalculatorShell>
  );
}

export function RefinanceBreakEvenCalculator() {
  const [currentBalance, setCurrentBalance] = useState(500000);
  const [currentRate, setCurrentRate] = useState(6.2);
  const [yearsRemaining, setYearsRemaining] = useState(25);
  const [currentFeeAnnual, setCurrentFeeAnnual] = useState(0);
  const [exitFee, setExitFee] = useState(0);
  const [newRate, setNewRate] = useState(5.4);
  const [newIntroRate, setNewIntroRate] = useState(4.9);
  const [introMonths, setIntroMonths] = useState(0);
  const [applicationFee, setApplicationFee] = useState(600);
  const [otherFees, setOtherFees] = useState(800);
  const [newFeeAnnual, setNewFeeAnnual] = useState(0);

  const result = useMemo(
    () =>
      mortgageSwitching({
        currentBalance,
        currentRate,
        yearsRemaining,
        currentFeeAnnual,
        exitFee,
        newRate,
        newIntroRate: introMonths > 0 ? newIntroRate : undefined,
        introMonths: introMonths > 0 ? introMonths : undefined,
        applicationFee,
        otherFees,
        newFeeAnnual,
      }),
    [
      currentBalance,
      currentRate,
      yearsRemaining,
      currentFeeAnnual,
      exitFee,
      newRate,
      newIntroRate,
      introMonths,
      applicationFee,
      otherFees,
      newFeeAnnual,
    ],
  );

  return (
    <CalculatorShell
      title="Refinance break-even calculator"
      description="Estimate whether switching home loans is worthwhile after upfront costs."
      results={
        <>
          <Stat
            label="Monthly saving"
            value={formatCurrency(result.monthlySaving)}
            emphasize
          />
          <Stat
            label="Break-even"
            value={
              Number.isFinite(result.breakEvenMonths)
                ? formatMonths(Math.ceil(result.breakEvenMonths))
                : "No saving"
            }
          />
          <Stat
            label="Worth switching?"
            value={result.worthSwitching ? "Likely yes" : "Probably not"}
          />
          <Stat
            label="Switch costs"
            value={formatCurrency(result.switchCost)}
          />
        </>
      }
    >
      <p className="text-sm font-semibold">Current loan</p>
      <Field label="Balance">
        <NumberInput
          value={currentBalance}
          onChange={setCurrentBalance}
          min={0}
          step={1000}
          prefix="$"
        />
      </Field>
      <Field label="Interest rate">
        <NumberInput
          value={currentRate}
          onChange={setCurrentRate}
          min={0}
          max={20}
          step={0.05}
          suffix="%"
        />
      </Field>
      <Field label="Years remaining">
        <NumberInput
          value={yearsRemaining}
          onChange={setYearsRemaining}
          min={1}
          max={40}
          step={1}
        />
      </Field>
      <Field label="Annual fee">
        <NumberInput
          value={currentFeeAnnual}
          onChange={setCurrentFeeAnnual}
          min={0}
          step={10}
          prefix="$"
        />
      </Field>
      <Field label="Exit / break fee">
        <NumberInput value={exitFee} onChange={setExitFee} min={0} step={50} prefix="$" />
      </Field>

      <p className="text-sm font-semibold">New loan</p>
      <Field label="Ongoing rate">
        <NumberInput
          value={newRate}
          onChange={setNewRate}
          min={0}
          max={20}
          step={0.05}
          suffix="%"
        />
      </Field>
      <Field label="Intro rate months (0 = none)">
        <NumberInput
          value={introMonths}
          onChange={setIntroMonths}
          min={0}
          max={36}
          step={1}
        />
      </Field>
      {introMonths > 0 ? (
        <Field label="Intro rate">
          <NumberInput
            value={newIntroRate}
            onChange={setNewIntroRate}
            min={0}
            max={20}
            step={0.05}
            suffix="%"
          />
        </Field>
      ) : null}
      <Field label="Application fee">
        <NumberInput
          value={applicationFee}
          onChange={setApplicationFee}
          min={0}
          step={50}
          prefix="$"
        />
      </Field>
      <Field label="Other switch costs">
        <NumberInput value={otherFees} onChange={setOtherFees} min={0} step={50} prefix="$" />
      </Field>
      <Field label="New annual fee">
        <NumberInput
          value={newFeeAnnual}
          onChange={setNewFeeAnnual}
          min={0}
          step={10}
          prefix="$"
        />
      </Field>
    </CalculatorShell>
  );
}
