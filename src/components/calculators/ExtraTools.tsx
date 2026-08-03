"use client";

import { useMemo, useState } from "react";
import {
  CalculatorShell,
  Field,
  NumberInput,
  Stat,
} from "@/components/calculators/Shell";
import {
  accountBasedPension,
  compareLifeClaims,
  formatCurrency,
  formatNumber,
  formatPercent,
  interestOnlyMortgage,
  SAMPLE_LIFE_CLAIM_INSURERS,
  superAndPensionAge,
  superContributionsOptimiser,
} from "@/lib/calculators";

export function InterestOnlyMortgageCalculator() {
  const [principal, setPrincipal] = useState(600000);
  const [rate, setRate] = useState(5.8);
  const [ioYears, setIoYears] = useState(5);
  const [totalYears, setTotalYears] = useState(30);
  const result = useMemo(
    () => interestOnlyMortgage({ principal, annualRate: rate, ioYears, totalYears }),
    [principal, rate, ioYears, totalYears],
  );

  return (
    <CalculatorShell
      title="Interest-only mortgage calculator"
      description="Compare repayments during an interest-only period with the jump to principal-and-interest—and the extra interest versus a full P&I loan."
      results={
        <>
          <Stat
            label="IO monthly repayment"
            value={formatCurrency(result.ioMonthlyPayment)}
            emphasize
          />
          <Stat
            label="P&I monthly after IO"
            value={formatCurrency(result.piMonthlyPayment)}
          />
          <Stat
            label="Total interest (IO then P&I)"
            value={formatCurrency(result.totalInterest)}
          />
          <Stat
            label="Full P&I monthly (same term)"
            value={formatCurrency(result.comparablePiMonthly)}
          />
          <Stat
            label="Extra interest vs full P&I"
            value={formatCurrency(result.extraInterestVsFullPi)}
          />
        </>
      }
    >
      <Field label="Loan amount">
        <NumberInput value={principal} onChange={setPrincipal} min={0} step={1000} prefix="$" />
      </Field>
      <Field label="Interest rate (p.a.)">
        <NumberInput value={rate} onChange={setRate} min={0} max={20} step={0.05} suffix="%" />
      </Field>
      <Field label="Interest-only period (years)">
        <NumberInput value={ioYears} onChange={setIoYears} min={0} max={10} step={1} />
      </Field>
      <Field label="Total loan term (years)">
        <NumberInput value={totalYears} onChange={setTotalYears} min={1} max={40} step={1} />
      </Field>
    </CalculatorShell>
  );
}

export function SuperContributionsOptimiser() {
  const [balance, setBalance] = useState(150000);
  const [salary, setSalary] = useState(90000);
  const [years, setYears] = useState(20);
  const [returnRate, setReturnRate] = useState(6.5);
  const [extraC, setExtraC] = useState(5000);
  const [extraA, setExtraA] = useState(0);
  const result = useMemo(
    () =>
      superContributionsOptimiser({
        currentBalance: balance,
        annualSalary: salary,
        years,
        returnRate,
        extraConcessional: extraC,
        extraAfterTax: extraA,
      }),
    [balance, salary, years, returnRate, extraC, extraA],
  );

  return (
    <CalculatorShell
      title="Super contributions optimiser"
      description="See how extra concessional or after-tax contributions could lift your balance—and whether concessional amounts approach a simple annual cap."
      results={
        <>
          <Stat label="Employer SG (annual)" value={formatCurrency(result.sgAnnual)} />
          <Stat
            label="Concessional total"
            value={formatCurrency(result.concessionalTotal)}
          />
          {result.overCap ? (
            <p className="text-sm text-urgent">
              About {formatCurrency(result.overCapAmount)} over the illustrative
              concessional cap—check current ATO limits before contributing.
            </p>
          ) : (
            <p className="text-sm text-muted">Within illustrative concessional cap.</p>
          )}
          <Stat label="Balance with SG only" value={formatCurrency(result.balanceBase)} />
          <Stat
            label="Balance with extras"
            value={formatCurrency(result.balanceWithExtras)}
            emphasize
          />
          <Stat label="Uplift" value={formatCurrency(result.uplift)} />
        </>
      }
    >
      <Field label="Current super balance">
        <NumberInput value={balance} onChange={setBalance} min={0} step={1000} prefix="$" />
      </Field>
      <Field label="Annual salary (OTE proxy)">
        <NumberInput value={salary} onChange={setSalary} min={0} step={500} prefix="$" />
      </Field>
      <Field label="Years to retirement">
        <NumberInput value={years} onChange={setYears} min={1} max={45} step={1} />
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
      <Field label="Extra concessional (p.a.)">
        <NumberInput value={extraC} onChange={setExtraC} min={0} step={500} prefix="$" />
      </Field>
      <Field label="Extra after-tax (p.a.)">
        <NumberInput value={extraA} onChange={setExtraA} min={0} step={500} prefix="$" />
      </Field>
    </CalculatorShell>
  );
}

export function SuperPensionAgeCalculator() {
  const [birthYear, setBirthYear] = useState(1985);
  const [birthMonth, setBirthMonth] = useState(6);
  const result = useMemo(
    () => superAndPensionAge({ birthYear, birthMonth }),
    [birthYear, birthMonth],
  );

  return (
    <CalculatorShell
      title="Super and pension age calculator"
      description="Estimate your preservation age (when you can generally access super) and Age Pension age from your birth date. Rules are simplified—confirm with official sources."
      results={
        <>
          <Stat
            label="Preservation age"
            value={`${formatNumber(result.preservationAge)} years`}
            emphasize
          />
          <Stat label="Around" value={result.preservationDateLabel} />
          <Stat
            label="Age Pension age"
            value={`${formatNumber(result.agePensionAge)} years`}
          />
          <Stat label="Around" value={result.agePensionDateLabel} />
        </>
      }
    >
      <Field label="Birth year">
        <NumberInput
          value={birthYear}
          onChange={setBirthYear}
          min={1930}
          max={2010}
          step={1}
        />
      </Field>
      <Field label="Birth month (1–12)">
        <NumberInput
          value={birthMonth}
          onChange={setBirthMonth}
          min={1}
          max={12}
          step={1}
        />
      </Field>
    </CalculatorShell>
  );
}

export function AccountBasedPensionCalculator() {
  const [balance, setBalance] = useState(400000);
  const [drawdown, setDrawdown] = useState(28000);
  const [returnRate, setReturnRate] = useState(4);
  const result = useMemo(
    () =>
      accountBasedPension({
        balance,
        annualDrawdown: drawdown,
        returnRate,
      }),
    [balance, drawdown, returnRate],
  );

  return (
    <CalculatorShell
      title="Account-based pension calculator"
      description="Project how long a super balance may last with a fixed annual drawdown and assumed return."
      results={
        <>
          <Stat
            label={result.depleted ? "Years until depleted" : "Years projected"}
            value={formatNumber(result.yearsLasting)}
            emphasize
          />
          {!result.depleted ? (
            <p className="text-sm text-muted">
              Balance still positive after {result.yearsLasting} years at these
              assumptions.
            </p>
          ) : null}
          <div className="mt-4 max-h-64 overflow-auto text-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="py-1 pr-2">Year</th>
                  <th className="py-1 pr-2">Start</th>
                  <th className="py-1 pr-2">Draw</th>
                  <th className="py-1">End</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.filter((r) => r.year % 5 === 1 || r.year === result.yearsLasting).map((row) => (
                  <tr key={row.year} className="border-b border-border/60">
                    <td className="py-1 pr-2">{row.year}</td>
                    <td className="py-1 pr-2">{formatCurrency(row.startBalance)}</td>
                    <td className="py-1 pr-2">{formatCurrency(row.drawdown)}</td>
                    <td className="py-1">{formatCurrency(row.endBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      }
    >
      <Field label="Starting balance">
        <NumberInput value={balance} onChange={setBalance} min={0} step={5000} prefix="$" />
      </Field>
      <Field label="Annual drawdown">
        <NumberInput value={drawdown} onChange={setDrawdown} min={0} step={500} prefix="$" />
      </Field>
      <Field label="Assumed return (p.a.)">
        <NumberInput
          value={returnRate}
          onChange={setReturnRate}
          min={0}
          max={10}
          step={0.1}
          suffix="%"
        />
      </Field>
    </CalculatorShell>
  );
}

export function LifeClaimsComparisonTool() {
  const result = useMemo(() => compareLifeClaims(SAMPLE_LIFE_CLAIM_INSURERS), []);

  return (
    <CalculatorShell
      title="Life insurance claims comparison"
      description="Educational comparison of sample claim metrics. Figures are illustrative placeholders—not live insurer data. Always check current AFCA / insurer disclosures."
      results={
        <>
          <Stat label="Highest acceptance (sample)" value={result.bestAcceptance} emphasize />
          <Stat label="Fastest decision (sample)" value={result.fastest} />
          <Stat label="Fewest complaints (sample)" value={result.fewestComplaints} />
          <div className="mt-4 overflow-x-auto text-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="py-1 pr-2">Insurer</th>
                  <th className="py-1 pr-2">Accept %</th>
                  <th className="py-1 pr-2">Weeks</th>
                  <th className="py-1">Complaints/100</th>
                </tr>
              </thead>
              <tbody>
                {result.insurers.map((ins) => (
                  <tr key={ins.id} className="border-b border-border/60">
                    <td className="py-1 pr-2">{ins.name}</td>
                    <td className="py-1 pr-2">{formatPercent(ins.acceptanceRate)}</td>
                    <td className="py-1 pr-2">{formatNumber(ins.avgWeeksToDecision)}</td>
                    <td className="py-1">{formatNumber(ins.complaintsPer100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      }
    >
      <p className="text-sm text-muted">
        MoneySmart publishes a claims comparison using regulatory data. ClearMoney
        shows the same <em>idea</em> with sample rows so you can explore the UX.
        Do not choose cover based on these placeholders.
      </p>
      <p className="text-sm text-muted">
        When comparing for real, look for claims acceptance rates, median time to
        decision, and dispute rates from official sources—and read the PDS
        definitions for TPD, trauma, and exclusions.
      </p>
    </CalculatorShell>
  );
}
