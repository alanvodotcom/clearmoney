import type { Frequency } from "./frequency";
import { toMonthly } from "./frequency";

export type BudgetLine = {
  id: string;
  label: string;
  amount: number;
  frequency: Frequency;
  custom?: boolean;
};

export type BudgetCategory = {
  id: string;
  title: string;
  kind: "income" | "expense";
  lines: BudgetLine[];
};

export type BudgetTotals = {
  incomeMonthly: number;
  expenseMonthly: number;
  surplusMonthly: number;
  status: "surplus" | "balanced" | "deficit";
  byCategoryMonthly: { id: string; title: string; kind: "income" | "expense"; total: number }[];
};

export const DEFAULT_BUDGET: BudgetCategory[] = [
  {
    id: "income",
    title: "Income",
    kind: "income",
    lines: [
      { id: "take-home", label: "Your take-home pay", amount: 0, frequency: "fortnightly" },
      { id: "partner-pay", label: "Partner take-home pay", amount: 0, frequency: "fortnightly" },
      { id: "bonuses", label: "Bonuses & overtime", amount: 0, frequency: "annually" },
      { id: "invest-income", label: "Income from savings & investments", amount: 0, frequency: "annually" },
      { id: "centrelink", label: "Centrelink benefits", amount: 0, frequency: "fortnightly" },
      { id: "family-benefits", label: "Family benefits / payments", amount: 0, frequency: "fortnightly" },
      { id: "child-support-in", label: "Child support received", amount: 0, frequency: "fortnightly" },
      { id: "other-income", label: "Other income", amount: 0, frequency: "monthly" },
    ],
  },
  {
    id: "home",
    title: "Home & utilities",
    kind: "expense",
    lines: [
      { id: "rent-mortgage", label: "Mortgage / rent", amount: 0, frequency: "monthly" },
      { id: "body-corp", label: "Body corporate / strata", amount: 0, frequency: "quarterly" },
      { id: "rates", label: "Council rates", amount: 0, frequency: "quarterly" },
      { id: "furniture", label: "Furniture & appliances", amount: 0, frequency: "annually" },
      { id: "renovations", label: "Renovations & maintenance", amount: 0, frequency: "annually" },
      { id: "electricity", label: "Electricity", amount: 0, frequency: "quarterly" },
      { id: "gas", label: "Gas", amount: 0, frequency: "quarterly" },
      { id: "water", label: "Water", amount: 0, frequency: "quarterly" },
      { id: "internet", label: "Internet", amount: 0, frequency: "monthly" },
      { id: "paytv", label: "Streaming / Pay TV", amount: 0, frequency: "monthly" },
      { id: "home-phone", label: "Home phone", amount: 0, frequency: "monthly" },
      { id: "mobile", label: "Mobile phone", amount: 0, frequency: "monthly" },
      { id: "other-home", label: "Other home & utilities", amount: 0, frequency: "monthly" },
    ],
  },
  {
    id: "insurance-finance",
    title: "Insurance & financial",
    kind: "expense",
    lines: [
      { id: "car-ins", label: "Car insurance", amount: 0, frequency: "annually" },
      { id: "home-ins", label: "Home & contents insurance", amount: 0, frequency: "annually" },
      { id: "life-ins", label: "Life insurance", amount: 0, frequency: "monthly" },
      { id: "health-ins", label: "Health insurance", amount: 0, frequency: "monthly" },
      { id: "car-loan", label: "Car loan repayments", amount: 0, frequency: "monthly" },
      { id: "cc-interest", label: "Credit card interest / repayments", amount: 0, frequency: "monthly" },
      { id: "other-loans", label: "Other loan repayments", amount: 0, frequency: "monthly" },
      { id: "debt", label: "Paying off other debt", amount: 0, frequency: "monthly" },
      { id: "savings", label: "Savings contributions", amount: 0, frequency: "fortnightly" },
      { id: "invest-super", label: "Investments & extra super", amount: 0, frequency: "monthly" },
      { id: "charity", label: "Charity / donations", amount: 0, frequency: "monthly" },
      { id: "other-finance", label: "Other insurance & financial", amount: 0, frequency: "monthly" },
    ],
  },
  {
    id: "groceries",
    title: "Groceries & food at home",
    kind: "expense",
    lines: [
      { id: "supermarket", label: "Supermarket", amount: 0, frequency: "weekly" },
      { id: "butcher", label: "Butcher", amount: 0, frequency: "weekly" },
      { id: "fruit-veg", label: "Fruit & vegetables", amount: 0, frequency: "weekly" },
      { id: "bakery", label: "Bakery / deli", amount: 0, frequency: "weekly" },
      { id: "pet-food", label: "Pet food", amount: 0, frequency: "weekly" },
      { id: "other-groceries", label: "Other groceries", amount: 0, frequency: "weekly" },
    ],
  },
  {
    id: "personal",
    title: "Personal & medical",
    kind: "expense",
    lines: [
      { id: "cosmetics", label: "Cosmetics & toiletries", amount: 0, frequency: "monthly" },
      { id: "hair", label: "Haircuts & beauty", amount: 0, frequency: "monthly" },
      { id: "pharmacy", label: "Pharmacy", amount: 0, frequency: "monthly" },
      { id: "dental", label: "Dental", amount: 0, frequency: "annually" },
      { id: "doctors", label: "Doctors & specialists", amount: 0, frequency: "annually" },
      { id: "clothing", label: "Clothing & shoes", amount: 0, frequency: "monthly" },
      { id: "gym", label: "Gym / fitness", amount: 0, frequency: "monthly" },
      { id: "education", label: "Education / courses", amount: 0, frequency: "annually" },
      { id: "pet-care", label: "Pet care / vet", amount: 0, frequency: "annually" },
      { id: "other-personal", label: "Other personal & medical", amount: 0, frequency: "monthly" },
    ],
  },
  {
    id: "entertainment",
    title: "Entertainment & eating out",
    kind: "expense",
    lines: [
      { id: "coffee", label: "Coffee & snacks", amount: 0, frequency: "weekly" },
      { id: "lunches", label: "Lunches bought", amount: 0, frequency: "weekly" },
      { id: "takeaway", label: "Takeaway & delivery", amount: 0, frequency: "weekly" },
      { id: "alcohol", label: "Alcohol", amount: 0, frequency: "weekly" },
      { id: "restaurants", label: "Restaurants & bars", amount: 0, frequency: "monthly" },
      { id: "movies", label: "Movies & events", amount: 0, frequency: "monthly" },
      { id: "holidays", label: "Holidays", amount: 0, frequency: "annually" },
      { id: "gifts", label: "Gifts & celebrations", amount: 0, frequency: "annually" },
      { id: "other-ent", label: "Other entertainment", amount: 0, frequency: "monthly" },
    ],
  },
  {
    id: "transport",
    title: "Transport & auto",
    kind: "expense",
    lines: [
      { id: "public-transport", label: "Public transport", amount: 0, frequency: "weekly" },
      { id: "petrol", label: "Petrol / charging", amount: 0, frequency: "weekly" },
      { id: "tolls", label: "Tolls & parking", amount: 0, frequency: "weekly" },
      { id: "rego", label: "Registration", amount: 0, frequency: "annually" },
      { id: "repairs", label: "Repairs & servicing", amount: 0, frequency: "annually" },
      { id: "fines", label: "Fines", amount: 0, frequency: "annually" },
      { id: "airfares", label: "Airfares", amount: 0, frequency: "annually" },
      { id: "other-transport", label: "Other transport", amount: 0, frequency: "monthly" },
    ],
  },
  {
    id: "children",
    title: "Children",
    kind: "expense",
    lines: [
      { id: "childcare", label: "Childcare", amount: 0, frequency: "weekly" },
      { id: "school-fees", label: "School fees", amount: 0, frequency: "annually" },
      { id: "uniforms", label: "Uniforms & books", amount: 0, frequency: "annually" },
      { id: "sports", label: "Sports & activities", amount: 0, frequency: "term" as Frequency },
      { id: "babysitting", label: "Babysitting", amount: 0, frequency: "monthly" },
      { id: "child-support-out", label: "Child support paid", amount: 0, frequency: "fortnightly" },
      { id: "other-children", label: "Other children costs", amount: 0, frequency: "monthly" },
    ],
  },
];

// Fix sports frequency - "term" isn't valid. Use quarterly instead in the actual default.
DEFAULT_BUDGET.forEach((cat) => {
  cat.lines.forEach((line) => {
    if ((line.frequency as string) === "term") {
      line.frequency = "quarterly";
    }
  });
});

export function lineMonthly(line: BudgetLine): number {
  return toMonthly(line.amount, line.frequency);
}

export function summarizeFullBudget(categories: BudgetCategory[]): BudgetTotals {
  const byCategoryMonthly = categories.map((cat) => ({
    id: cat.id,
    title: cat.title,
    kind: cat.kind,
    total: cat.lines.reduce((sum, line) => sum + lineMonthly(line), 0),
  }));

  const incomeMonthly = byCategoryMonthly
    .filter((c) => c.kind === "income")
    .reduce((s, c) => s + c.total, 0);
  const expenseMonthly = byCategoryMonthly
    .filter((c) => c.kind === "expense")
    .reduce((s, c) => s + c.total, 0);
  const surplusMonthly = incomeMonthly - expenseMonthly;

  let status: BudgetTotals["status"] = "balanced";
  if (surplusMonthly > 1) status = "surplus";
  else if (surplusMonthly < -1) status = "deficit";

  return { incomeMonthly, expenseMonthly, surplusMonthly, status, byCategoryMonthly };
}

/** Legacy simple summarizer kept for Simple Money Manager. */
export type BudgetSummary = {
  income: number;
  totalExpenses: number;
  remaining: number;
  expenses: Record<string, number>;
  expenseRatio: number;
};

export function summarizeBudget(inputs: {
  income: number;
  expenses: Record<string, number>;
}): BudgetSummary {
  const income = Math.max(0, inputs.income);
  const expenses: Record<string, number> = {};
  let totalExpenses = 0;

  for (const [key, value] of Object.entries(inputs.expenses)) {
    const amount = Number.isFinite(value) ? Math.max(0, value) : 0;
    expenses[key] = amount;
    totalExpenses += amount;
  }

  const remaining = income - totalExpenses;

  return {
    income,
    totalExpenses,
    remaining,
    expenses,
    expenseRatio: income > 0 ? totalExpenses / income : 0,
  };
}
