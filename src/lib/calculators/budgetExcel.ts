import * as XLSX from "xlsx";
import type { BudgetCategory } from "@/lib/calculators/budget";
import { lineMonthly, summarizeFullBudget } from "@/lib/calculators/budget";
import { fromMonthly, type Frequency } from "@/lib/calculators/frequency";

const FREQ_LABEL: Record<Frequency, string> = {
  weekly: "Weekly",
  fortnightly: "Fortnightly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annually: "Annually",
};

/**
 * Build a MoneySmart-style budget workbook (.xlsx) for offline use.
 * Sheet 1: line items with amount + frequency + monthly equivalent
 * Sheet 2: category totals + surplus/deficit summary
 */
export function downloadBudgetExcel(
  categories: BudgetCategory[],
  filename = "clearmoney-budget-planner.xlsx",
) {
  const totals = summarizeFullBudget(categories);

  const detailRows: (string | number)[][] = [
    ["ClearMoney Budget Planner (offline)"],
    ["General information only — not personal financial advice."],
    [],
    ["Category", "Item", "Amount", "Frequency", "Monthly equivalent"],
  ];

  for (const cat of categories) {
    for (const line of cat.lines) {
      detailRows.push([
        cat.title,
        line.label,
        Number(line.amount.toFixed(2)),
        FREQ_LABEL[line.frequency],
        Number(lineMonthly(line).toFixed(2)),
      ]);
    }
  }

  const summaryRows: (string | number)[][] = [
    ["Summary (monthly equivalents)"],
    [],
    ["Total income (monthly)", Number(totals.incomeMonthly.toFixed(2))],
    ["Total expenses (monthly)", Number(totals.expenseMonthly.toFixed(2))],
    ["Surplus / deficit", Number(totals.surplusMonthly.toFixed(2))],
    ["Status", totals.status],
    [],
    ["Category", "Type", "Monthly total"],
    ...totals.byCategoryMonthly.map((c) => [
      c.title,
      c.kind,
      Number(c.total.toFixed(2)),
    ]),
    [],
    ["Quick reference — convert monthly to other frequencies"],
    ["Weekly", Number(fromMonthly(totals.surplusMonthly, "weekly").toFixed(2))],
    ["Fortnightly", Number(fromMonthly(totals.surplusMonthly, "fortnightly").toFixed(2))],
    ["Annually", Number(fromMonthly(totals.surplusMonthly, "annually").toFixed(2))],
  ];

  const wb = XLSX.utils.book_new();
  const detail = XLSX.utils.aoa_to_sheet(detailRows);
  const summary = XLSX.utils.aoa_to_sheet(summaryRows);
  detail["!cols"] = [{ wch: 28 }, { wch: 36 }, { wch: 12 }, { wch: 14 }, { wch: 18 }];
  summary["!cols"] = [{ wch: 36 }, { wch: 14 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, detail, "Budget");
  XLSX.utils.book_append_sheet(wb, summary, "Summary");
  XLSX.writeFile(wb, filename);
}
