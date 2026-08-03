"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalculatorShell,
  Field,
  Stat,
} from "@/components/calculators/Shell";
import {
  DEFAULT_BUDGET,
  summarizeFullBudget,
  type BudgetCategory,
  type BudgetLine,
} from "@/lib/calculators/budget";
import { downloadBudgetExcel } from "@/lib/calculators/budgetExcel";
import { FREQUENCIES, type Frequency } from "@/lib/calculators/frequency";
import { formatCurrency } from "@/lib/calculators";

const STORAGE_KEY = "clearmoney-budget-v1";

function cloneDefault(): BudgetCategory[] {
  return JSON.parse(JSON.stringify(DEFAULT_BUDGET)) as BudgetCategory[];
}

export function BudgetPlanner() {
  const [categories, setCategories] = useState<BudgetCategory[]>(cloneDefault);
  const [openId, setOpenId] = useState<string>("income");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BudgetCategory[];
        if (Array.isArray(parsed) && parsed.length) setCategories(parsed);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories, hydrated]);

  const totals = useMemo(() => summarizeFullBudget(categories), [categories]);

  function updateLine(
    catId: string,
    lineId: string,
    patch: Partial<BudgetLine>,
  ) {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id !== catId
          ? cat
          : {
              ...cat,
              lines: cat.lines.map((line) =>
                line.id === lineId ? { ...line, ...patch } : line,
              ),
            },
      ),
    );
  }

  function addCustomLine(catId: string) {
    const id = `custom-${Date.now()}`;
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id !== catId
          ? cat
          : {
              ...cat,
              lines: [
                ...cat.lines,
                {
                  id,
                  label: "Custom item",
                  amount: 0,
                  frequency: "monthly" as Frequency,
                  custom: true,
                },
              ],
            },
      ),
    );
  }

  function removeLine(catId: string, lineId: string) {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id !== catId
          ? cat
          : { ...cat, lines: cat.lines.filter((l) => l.id !== lineId) },
      ),
    );
  }

  function resetBudget() {
    setCategories(cloneDefault());
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <CalculatorShell
      title="Budget planner"
      description="Track income and expenses at any frequency—see your monthly surplus or deficit. Autosaves in this browser. Download Excel for offline use."
      results={
        <>
          <Stat
            label="Income (monthly)"
            value={formatCurrency(totals.incomeMonthly)}
          />
          <Stat
            label="Expenses (monthly)"
            value={formatCurrency(totals.expenseMonthly)}
          />
          <Stat
            label={
              totals.status === "deficit"
                ? "Deficit"
                : totals.status === "surplus"
                  ? "Surplus"
                  : "Balanced"
            }
            value={formatCurrency(totals.surplusMonthly)}
            emphasize
          />
          <p className="text-sm text-muted">
            {totals.status === "surplus"
              ? "You’re spending less than you earn—direct surplus to goals or debt."
              : totals.status === "deficit"
                ? "Expenses exceed income—trim categories or raise income."
                : "Income roughly covers expenses."}
          </p>
          <ul className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            {totals.byCategoryMonthly
              .filter((c) => c.kind === "expense" && c.total > 0)
              .sort((a, b) => b.total - a.total)
              .slice(0, 6)
              .map((c) => (
                <li key={c.id} className="flex justify-between gap-4">
                  <span className="text-muted">{c.title}</span>
                  <span>{formatCurrency(c.total)}</span>
                </li>
              ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
              onClick={() => downloadBudgetExcel(categories)}
            >
              Download Excel
            </button>
            <button
              type="button"
              className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm font-semibold"
              onClick={() => window.print()}
            >
              Print
            </button>
            <button
              type="button"
              className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
              onClick={resetBudget}
            >
              Reset
            </button>
          </div>
          <p className="mt-2 text-xs text-muted print:hidden">
            Excel includes a Budget sheet (line items) and Summary sheet—same
            structure as the classic offline budget spreadsheet.
          </p>
        </>
      }
    >
      <div className="space-y-3">
        {categories.map((cat) => {
          const open = openId === cat.id;
          const panelId = `budget-panel-${cat.id}`;
          const buttonId = `budget-btn-${cat.id}`;
          const catTotal = totals.byCategoryMonthly.find(
            (c) => c.id === cat.id,
          )?.total;
          return (
            <div
              key={cat.id}
              className="rounded-[var(--radius)] border border-border"
            >
              <button
                id={buttonId}
                type="button"
                className="flex min-h-11 w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm font-semibold"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? "" : cat.id)}
              >
                <span>
                  {cat.title}
                  <span className="ml-2 font-normal text-muted">
                    ({cat.kind})
                  </span>
                </span>
                <span className="tabular-nums text-muted">
                  {formatCurrency(catTotal ?? 0)}/mo
                </span>
              </button>
              {open ? (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="space-y-3 border-t border-border px-3 py-3"
                >
                  {cat.lines.map((line) => (
                    <div
                      key={line.id}
                      className="grid gap-2 sm:grid-cols-[1fr_6rem_8rem_auto]"
                    >
                      <label className="text-sm">
                        <span className="sr-only">Label for {cat.title}</span>
                        <input
                          className="cm-control w-full rounded-[var(--radius)] border bg-background px-2 py-2"
                          value={line.label}
                          onChange={(e) =>
                            updateLine(cat.id, line.id, {
                              label: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label className="text-sm">
                        <span className="sr-only">
                          Amount in dollars for {line.label}
                        </span>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          className="cm-control w-full rounded-[var(--radius)] border bg-background px-2 py-2"
                          value={line.amount}
                          onChange={(e) =>
                            updateLine(cat.id, line.id, {
                              amount: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                      <label className="text-sm">
                        <span className="sr-only">
                          Frequency for {line.label}
                        </span>
                        <select
                          className="cm-control w-full rounded-[var(--radius)] border bg-background px-2 py-2"
                          value={line.frequency}
                          onChange={(e) =>
                            updateLine(cat.id, line.id, {
                              frequency: e.target.value as Frequency,
                            })
                          }
                        >
                          {FREQUENCIES.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      {line.custom ? (
                        <button
                          type="button"
                          className="inline-flex min-h-11 min-w-11 items-center justify-center text-sm text-urgent"
                          onClick={() => removeLine(cat.id, line.id)}
                        >
                          Remove
                        </button>
                      ) : (
                        <span />
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center text-sm font-medium text-accent"
                    onClick={() => addCustomLine(cat.id)}
                  >
                    + Add custom item
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </CalculatorShell>
  );
}
