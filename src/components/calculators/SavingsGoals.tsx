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
  FREQUENCIES,
  type Frequency,
  formatCurrency,
  formatNumber,
  futureValue,
  monthsToGoal,
  periodsPerYear,
  requiredContribution,
} from "@/lib/calculators";

type Mode = "save" | "spend";
type GoalMode = "fixed" | "max";
type TimeMode = "fixed" | "asap";

const CONTRIB_FREQS = FREQUENCIES.filter((f) =>
  ["weekly", "fortnightly", "monthly", "annually"].includes(f.value),
);

/** Convert a contribution at `freq` into an equivalent monthly amount. */
function toMonthlyContribution(amount: number, freq: Frequency): number {
  return (Math.max(0, amount) * periodsPerYear(freq)) / 12;
}

/** Months until balance reaches `residual` while withdrawing regularly. */
function monthsToDeplete(inputs: {
  principal: number;
  withdrawal: number;
  annualRate: number;
  residual?: number;
}): number {
  const residual = Math.max(0, inputs.residual ?? 0);
  const principal = Math.max(0, inputs.principal);
  const withdrawal = Math.max(0, inputs.withdrawal);

  if (principal <= residual) return 0;
  if (withdrawal <= 0) return Infinity;

  const r = inputs.annualRate / 100 / 12;
  if (r === 0) {
    return Math.ceil((principal - residual) / withdrawal);
  }

  // FV = P(1+r)^n - W*((1+r)^n - 1)/r = residual
  // (1+r)^n = (residual*r - W) / (P*r - W)  when W > P*r for depletion
  const numerator = residual * r - withdrawal;
  const denominator = principal * r - withdrawal;
  if (denominator >= 0 || numerator / denominator <= 0) return Infinity;

  const n = Math.log(numerator / denominator) / Math.log(1 + r);
  if (!Number.isFinite(n) || n < 0) return Infinity;
  return Math.ceil(n);
}

/** Periodic withdrawal needed to reach a residual balance in fixed time. */
function requiredWithdrawal(inputs: {
  principal: number;
  residual: number;
  annualRate: number;
  years: number;
  compoundsPerYear?: number;
}): number {
  const {
    principal,
    residual,
    annualRate,
    years,
    compoundsPerYear = 12,
  } = inputs;
  if (years <= 0) return Math.max(0, principal - residual);
  if (principal <= residual) return 0;

  const n = years * compoundsPerYear;
  const r = annualRate / 100 / compoundsPerYear;
  const fvPrincipal =
    r === 0 ? principal : principal * Math.pow(1 + r, n);
  const excess = fvPrincipal - residual;
  if (excess <= 0) return 0;
  if (r === 0) return excess / n;
  return excess / ((Math.pow(1 + r, n) - 1) / r);
}

function formatDuration(months: number): string {
  if (!Number.isFinite(months)) return "Not reachable";
  if (months <= 0) return "Already there";
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${formatNumber(m)} months`;
  if (m === 0) return `${formatNumber(y)} years`;
  return `${formatNumber(y)} yr ${formatNumber(m)} mo`;
}

export function SavingsGoals() {
  const [mode, setMode] = useState<Mode>("save");
  const [goalMode, setGoalMode] = useState<GoalMode>("fixed");
  const [timeMode, setTimeMode] = useState<TimeMode>("asap");
  const [goal, setGoal] = useState(10000);
  const [principal, setPrincipal] = useState(1500);
  const [contribution, setContribution] = useState(400);
  const [rate, setRate] = useState(4);
  const [years, setYears] = useState(3);
  const [monthsExtra, setMonthsExtra] = useState(0);
  const [freq, setFreq] = useState<Frequency>("monthly");

  const totalYears = years + monthsExtra / 12;
  const monthlyAmount = toMonthlyContribution(contribution, freq);
  const ppy = periodsPerYear(freq);

  const result = useMemo(() => {
    if (mode === "spend") {
      if (goalMode === "max") {
        const remaining = futureValue({
          principal,
          contribution: -monthlyAmount,
          annualRate: rate,
          years: Math.max(totalYears, 0.01),
        });
        return {
          kind: "max" as const,
          balance: Math.max(0, remaining),
          totalWithdrawn: monthlyAmount * totalYears * 12,
        };
      }
      if (timeMode === "asap") {
        const residual = goalMode === "fixed" ? goal : 0;
        const months = monthsToDeplete({
          principal,
          withdrawal: monthlyAmount,
          annualRate: rate,
          residual,
        });
        return { kind: "asap" as const, months };
      }
      const withdrawal = requiredWithdrawal({
        principal,
        residual: goal,
        annualRate: rate,
        years: Math.max(totalYears, 0.01),
        compoundsPerYear: ppy,
      });
      return {
        kind: "required" as const,
        amount: withdrawal,
        perPeriod: withdrawal,
      };
    }

    // Save mode
    if (goalMode === "max") {
      const projected = futureValue({
        principal,
        contribution: monthlyAmount,
        annualRate: rate,
        years: Math.max(totalYears, 0.01),
        compoundsPerYear: 12,
      });
      return { kind: "max" as const, balance: projected, totalWithdrawn: 0 };
    }
    if (timeMode === "asap") {
      const months = monthsToGoal({
        goal,
        principal,
        contribution: monthlyAmount,
        annualRate: rate,
      });
      return { kind: "asap" as const, months };
    }
    const needed = requiredContribution({
      goal,
      principal,
      annualRate: rate,
      years: Math.max(totalYears, 0.01),
      compoundsPerYear: ppy,
    });
    return {
      kind: "required" as const,
      amount: needed,
      perPeriod: needed,
    };
  }, [
    mode,
    goalMode,
    timeMode,
    goal,
    principal,
    monthlyAmount,
    rate,
    totalYears,
    ppy,
  ]);

  return (
    <CalculatorShell
      title="Savings goals calculator"
      description="Plan how to reach a savings goal — or how long savings will last while you spend."
      results={
        <>
          {result.kind === "asap" ? (
            <Stat
              label={mode === "save" ? "Time to goal" : "Time until depleted"}
              value={formatDuration(result.months)}
              emphasize
            />
          ) : null}
          {result.kind === "required" ? (
            <Stat
              label={
                mode === "save"
                  ? `Required ${freq} deposit`
                  : `Sustainable ${freq} withdrawal`
              }
              value={formatCurrency(result.perPeriod)}
              emphasize
            />
          ) : null}
          {result.kind === "max" ? (
            <>
              <Stat
                label={
                  mode === "save" ? "Projected balance" : "Remaining balance"
                }
                value={formatCurrency(result.balance)}
                emphasize
              />
              {mode === "spend" ? (
                <Stat
                  label="Total withdrawn"
                  value={formatCurrency(result.totalWithdrawn)}
                />
              ) : null}
            </>
          ) : null}
        </>
      }
    >
      <ModeTabs
        modes={[
          { id: "save", label: "Save" },
          { id: "spend", label: "Spend" },
        ]}
        value={mode}
        onChange={(id) => setMode(id as Mode)}
      />

      <Field label="Goal">
        <SelectInput
          value={goalMode}
          onChange={(v) => setGoalMode(v as GoalMode)}
          options={[
            {
              value: "fixed",
              label: mode === "save" ? "Save a fixed amount" : "Leave a residual",
            },
            {
              value: "max",
              label:
                mode === "save"
                  ? "Save as much as possible"
                  : "Spend as much as possible",
            },
          ]}
        />
      </Field>

      {goalMode === "fixed" ? (
        <Field
          label={mode === "save" ? "Goal amount" : "Residual balance"}
          hint={
            mode === "spend"
              ? "Balance you want left when spending stops (0 to deplete)."
              : undefined
          }
        >
          <NumberInput value={goal} onChange={setGoal} min={0} step={100} prefix="$" />
        </Field>
      ) : null}

      {goalMode === "fixed" ? (
        <Field label="Time horizon">
          <SelectInput
            value={timeMode}
            onChange={(v) => setTimeMode(v as TimeMode)}
            options={[
              { value: "asap", label: "As soon as possible" },
              { value: "fixed", label: "Over a set period" },
            ]}
          />
        </Field>
      ) : null}

      {(goalMode === "max" || timeMode === "fixed") && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Years">
            <NumberInput value={years} onChange={setYears} min={0} max={50} step={1} />
          </Field>
          <Field label="Extra months">
            <NumberInput
              value={monthsExtra}
              onChange={setMonthsExtra}
              min={0}
              max={11}
              step={1}
            />
          </Field>
        </div>
      )}

      <Field label="Starting balance">
        <NumberInput value={principal} onChange={setPrincipal} min={0} step={50} prefix="$" />
      </Field>
      <Field label="Interest rate (p.a.)" hint="Capped at 10% for this tool.">
        <NumberInput value={rate} onChange={setRate} min={0} max={10} step={0.1} suffix="%" />
      </Field>
      <Field
        label={mode === "save" ? "Regular deposit" : "Regular withdrawal"}
      >
        <NumberInput
          value={contribution}
          onChange={setContribution}
          min={0}
          step={10}
          prefix="$"
        />
      </Field>
      <Field label="Frequency">
        <SelectInput
          value={freq}
          onChange={(v) => setFreq(v as Frequency)}
          options={CONTRIB_FREQS}
        />
      </Field>
    </CalculatorShell>
  );
}
