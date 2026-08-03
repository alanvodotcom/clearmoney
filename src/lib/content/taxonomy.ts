import type { Hub, LifeEvent, Pillar, ToolMeta } from "./types";

export const pillars: Pillar[] = [
  {
    id: "banking-budgeting",
    title: "Banking & budgeting",
    shortLabel: "Budget",
    description:
      "Everyday money skills—accounts, budgets, saving, tax, and family finances.",
  },
  {
    id: "loans-credit-debt",
    title: "Loans, credit & debt",
    shortLabel: "Borrow",
    description:
      "Understand borrowing costs, compare loans, and get help managing debt.",
  },
  {
    id: "investing-planning",
    title: "Investing & planning",
    shortLabel: "Invest",
    description:
      "Build a plan before you invest—shares, funds, property, and risk.",
  },
  {
    id: "super-retirement",
    title: "Super & retirement",
    shortLabel: "Retire",
    description:
      "Grow your super, plan retirement income, and decide when to stop work.",
  },
  {
    id: "insurance",
    title: "Insurance",
    shortLabel: "Protect",
    description:
      "Choose cover that fits—life, home, car, and what you can safely skip.",
  },
  {
    id: "scams-safety",
    title: "Scams & online safety",
    shortLabel: "Stay safe",
    description:
      "Spot financial scams early and know how to check and report them.",
  },
  {
    id: "community",
    title: "Community resources",
    shortLabel: "Community",
    description:
      "Resources for teachers, students, First Nations communities, and more.",
  },
];

export const hubs: Hub[] = [
  // Banking & budgeting
  {
    id: "banking",
    pillar: "banking-budgeting",
    title: "Banking",
    description: "Choose accounts, avoid fees, and bank with confidence.",
  },
  {
    id: "budgeting",
    pillar: "banking-budgeting",
    title: "Budgeting",
    description: "Track income and spending so your money goes where you intend.",
  },
  {
    id: "saving",
    pillar: "banking-budgeting",
    title: "Saving",
    description: "Set goals, automate transfers, and grow an emergency buffer.",
  },
  {
    id: "work-tax",
    pillar: "banking-budgeting",
    title: "Work & tax",
    description: "Understand payslips, tax brackets, and common deductions.",
  },
  {
    id: "family",
    pillar: "banking-budgeting",
    title: "Family & relationships",
    description: "Money talks for couples, kids, and shared households.",
  },
  // Loans
  {
    id: "loans",
    pillar: "loans-credit-debt",
    title: "Personal loans",
    description: "Compare rates, fees, and whether a loan is the right move.",
  },
  {
    id: "other-borrowing",
    pillar: "loans-credit-debt",
    title: "Other ways to borrow",
    description: "BNPL, payday loans, and alternatives with clearer costs.",
  },
  {
    id: "credit-cards",
    pillar: "loans-credit-debt",
    title: "Credit cards",
    description: "Interest, interest-free periods, and paying down balances.",
  },
  {
    id: "home-loans",
    pillar: "loans-credit-debt",
    title: "Home loans",
    description: "Mortgage basics, offsets, refinancing, and repayment choices.",
  },
  {
    id: "managing-debt",
    pillar: "loans-credit-debt",
    title: "Managing debt",
    description: "Prioritise repayments and find free help when money is tight.",
  },
  // Investing
  {
    id: "how-to-invest",
    pillar: "investing-planning",
    title: "How to invest",
    description: "Goals, risk, diversification, and a simple starting plan.",
  },
  {
    id: "advice",
    pillar: "investing-planning",
    title: "Financial advice",
    description: "When advice helps, what it costs, and how to choose wisely.",
  },
  {
    id: "shares",
    pillar: "investing-planning",
    title: "Shares",
    description: "Owning companies, volatility, and long-term thinking.",
  },
  {
    id: "funds-etfs",
    pillar: "investing-planning",
    title: "Managed funds & ETFs",
    description: "Pooled investing with clearer fees and diversification.",
  },
  {
    id: "property",
    pillar: "investing-planning",
    title: "Property",
    description: "Buying to live vs invest—costs beyond the purchase price.",
  },
  {
    id: "interest-investments",
    pillar: "investing-planning",
    title: "Interest investments",
    description: "Term deposits, bonds, and cash options compared.",
  },
  {
    id: "warnings",
    pillar: "investing-planning",
    title: "Investment warnings",
    description: "Red flags, high-pressure offers, and products to avoid.",
  },
  // Super
  {
    id: "retirement",
    pillar: "super-retirement",
    title: "Retirement",
    description: "Map the income you’ll need and when you can stop working.",
  },
  {
    id: "how-super-works",
    pillar: "super-retirement",
    title: "How super works",
    description: "Contributions, taxes, insurance in super, and your statement.",
  },
  {
    id: "grow-super",
    pillar: "super-retirement",
    title: "Grow your super",
    description: "Salary sacrifice, consolidating funds, and investment choice.",
  },
  {
    id: "plan-retirement",
    pillar: "super-retirement",
    title: "Plan your retirement",
    description: "Age Pension, drawdowns, and sequencing your savings.",
  },
  {
    id: "income-sources",
    pillar: "super-retirement",
    title: "Income in retirement",
    description: "Account-based pensions, annuities, and part-time work.",
  },
  {
    id: "manage-retirement",
    pillar: "super-retirement",
    title: "Manage money in retirement",
    description: "Budgets, aged care costs, and keeping money simple.",
  },
  // Insurance
  {
    id: "life-insurance",
    pillar: "insurance",
    title: "Life insurance",
    description: "Who needs life cover and how much is enough.",
  },
  {
    id: "car-insurance",
    pillar: "insurance",
    title: "Car insurance",
    description: "Comprehensive vs third party—and excess choices that matter.",
  },
  {
    id: "home-insurance",
    pillar: "insurance",
    title: "Home insurance",
    description: "Building and contents cover that matches rebuild costs.",
  },
  {
    id: "add-on-insurance",
    pillar: "insurance",
    title: "Add-on insurance",
    description: "Extras sold with loans and gadgets—often skippable.",
  },
  {
    id: "other-insurance",
    pillar: "insurance",
    title: "Other insurance",
    description: "Travel, pet, income protection, and health extras.",
  },
  {
    id: "natural-disasters",
    pillar: "insurance",
    title: "Natural disasters",
    description: "Flood, fire, and storm cover—check your PDS carefully.",
  },
  // Scams
  {
    id: "online-safety",
    pillar: "scams-safety",
    title: "Online safety",
    description: "Passwords, MFA, and safer shopping habits.",
  },
  {
    id: "financial-scams",
    pillar: "scams-safety",
    title: "Financial scams",
    description: "Investment, romance, and impersonation scams explained.",
  },
  {
    id: "check-report",
    pillar: "scams-safety",
    title: "Check & report scams",
    description: "Verify contacts and report scams to the right places.",
  },
  // Community
  {
    id: "unclaimed-money",
    pillar: "community",
    title: "Unclaimed money",
    description: "Find lost bank accounts, shares, and super balances.",
  },
  {
    id: "teachers",
    pillar: "community",
    title: "Teachers",
    description: "Classroom-ready money lessons and printable activities.",
  },
  {
    id: "students",
    pillar: "community",
    title: "Students",
    description: "First jobs, HECS, renting, and building early habits.",
  },
  {
    id: "publications",
    pillar: "community",
    title: "Publications",
    description: "Guides and explainers you can download and share.",
  },
  {
    id: "first-nations",
    pillar: "community",
    title: "First Nations",
    description: "Culturally aware money resources and community pathways.",
  },
  {
    id: "your-stories",
    pillar: "community",
    title: "Your stories",
    description: "Real money decisions—what worked and what people changed.",
  },
];

export const tools: ToolMeta[] = [
  {
    id: "budget-planner",
    title: "Budget planner",
    description:
      "Full income & expense categories with frequencies, surplus tracking, and Excel download for offline use.",
    pillar: "banking-budgeting",
    hubs: ["budgeting"],
    href: "/tools/budget-planner",
  },
  {
    id: "savings-goals",
    title: "Savings goals calculator",
    description:
      "Save or spend modes—fixed goals, ASAP timelines, or grow as much as possible.",
    pillar: "banking-budgeting",
    hubs: ["saving"],
    href: "/tools/savings-goals",
  },
  {
    id: "income-tax",
    title: "Income tax calculator",
    description:
      "Employment and other income by frequency, with Medicare and take-home estimates.",
    pillar: "banking-budgeting",
    hubs: ["work-tax"],
    href: "/tools/income-tax",
  },
  {
    id: "compound-interest",
    title: "Compound interest calculator",
    description:
      "Lump sum plus regular deposits, delay start, and compare strategies.",
    pillar: "banking-budgeting",
    hubs: ["saving"],
    href: "/tools/compound-interest",
  },
  {
    id: "gst",
    title: "GST calculator",
    description: "Break out exclusive price, GST, and inclusive total (10%).",
    pillar: "banking-budgeting",
    hubs: ["work-tax"],
    href: "/tools/gst",
  },
  {
    id: "simple-money-manager",
    title: "Simple money manager",
    description:
      "Quick money-in vs money-out snapshot with category totals.",
    pillar: "banking-budgeting",
    hubs: ["budgeting"],
    href: "/tools/simple-money-manager",
  },
  {
    id: "mortgage",
    title: "Mortgage calculator",
    description:
      "Three modes: repayments, how much you can borrow, or repay sooner—with fees.",
    pillar: "loans-credit-debt",
    hubs: ["home-loans"],
    href: "/tools/mortgage",
  },
  {
    id: "personal-loan",
    title: "Personal loan calculator",
    description:
      "Repayments, borrowing power, or time to clear—up to 15 years.",
    pillar: "loans-credit-debt",
    hubs: ["loans"],
    href: "/tools/personal-loan",
  },
  {
    id: "credit-card",
    title: "Credit card calculator",
    description:
      "Compare minimum vs higher repayments and interest saved.",
    pillar: "loans-credit-debt",
    hubs: ["credit-cards"],
    href: "/tools/credit-card",
  },
  {
    id: "payday-loan",
    title: "Payday loan calculator",
    description:
      "AU small-amount credit costs: 20% establishment fee plus 4% monthly fees.",
    pillar: "loans-credit-debt",
    hubs: ["other-borrowing"],
    href: "/tools/payday-loan",
  },
  {
    id: "retirement-planner",
    title: "Retirement planner",
    description:
      "Compare nest-egg need with projected super growth and the gap.",
    pillar: "super-retirement",
    hubs: ["retirement", "plan-retirement"],
    href: "/tools/retirement-planner",
  },
  {
    id: "super",
    title: "Superannuation calculator",
    description:
      "Project balance to retirement with SG, extras, fees, and insurance.",
    pillar: "super-retirement",
    hubs: ["grow-super", "how-super-works"],
    href: "/tools/super",
  },
  {
    id: "employer-contributions",
    title: "Employer contributions calculator",
    description:
      "Check Super Guarantee (12%) against pay and frequency.",
    pillar: "super-retirement",
    hubs: ["how-super-works"],
    href: "/tools/employer-contributions",
  },
  {
    id: "reverse-mortgage",
    title: "Reverse mortgage calculator",
    description:
      "See how debt and remaining equity change over time.",
    pillar: "super-retirement",
    hubs: ["manage-retirement"],
    href: "/tools/reverse-mortgage",
  },
  {
    id: "loan-comparison",
    title: "Loan comparison calculator",
    description: "Side-by-side repayments and interest for two loan offers.",
    pillar: "loans-credit-debt",
    hubs: ["loans", "home-loans"],
    href: "/tools/loan-comparison",
  },
  {
    id: "offset-vs-redraw",
    title: "Offset vs extra repayments",
    description:
      "Estimate monthly interest saved with an offset balance.",
    pillar: "loans-credit-debt",
    hubs: ["home-loans"],
    href: "/tools/offset-vs-redraw",
  },
  {
    id: "investment-returns",
    title: "Investment returns calculator",
    description: "Model lump-sum growth at an assumed annual return.",
    pillar: "investing-planning",
    hubs: ["how-to-invest"],
    href: "/tools/investment-returns",
  },
  {
    id: "fee-drag",
    title: "Fee impact calculator",
    description:
      "Managed-fund style fees, contributions, and long-term fee impact.",
    pillar: "investing-planning",
    hubs: ["funds-etfs"],
    href: "/tools/fee-drag",
  },
  {
    id: "insurance-needs",
    title: "Life cover needs estimator",
    description:
      "Funeral, debts, education, and living-cost cover less existing assets.",
    pillar: "insurance",
    hubs: ["life-insurance"],
    href: "/tools/insurance-needs",
  },
  {
    id: "emergency-fund",
    title: "Emergency fund calculator",
    description: "Size a buffer based on months of essential spending.",
    pillar: "banking-budgeting",
    hubs: ["saving", "budgeting"],
    href: "/tools/emergency-fund",
  },
  {
    id: "rent-vs-buy",
    title: "Rent vs buy calculator",
    description:
      "Consumer lease vs cash/loan purchase—total cost over the term.",
    pillar: "loans-credit-debt",
    hubs: ["other-borrowing"],
    href: "/tools/rent-vs-buy",
  },
  {
    id: "hecs",
    title: "HECS-HELP repayment calculator",
    description: "Estimate compulsory study loan repayments from income.",
    pillar: "banking-budgeting",
    hubs: ["work-tax", "students"],
    href: "/tools/hecs",
  },
  {
    id: "net-worth",
    title: "Net worth tracker",
    description:
      "Assets and liabilities snapshot including super, property, and HECS.",
    pillar: "investing-planning",
    hubs: ["how-to-invest", "managing-debt"],
    href: "/tools/net-worth",
  },
  {
    id: "inflation",
    title: "Inflation calculator",
    description: "See what today’s dollars may buy in future years.",
    pillar: "investing-planning",
    hubs: ["how-to-invest"],
    href: "/tools/inflation",
  },
  {
    id: "refinance-break-even",
    title: "Mortgage switching calculator",
    description:
      "Compare current vs new loan costs, fees, and break-even time.",
    pillar: "loans-credit-debt",
    hubs: ["home-loans"],
    href: "/tools/refinance-break-even",
  },
  {
    id: "interest-only-mortgage",
    title: "Interest-only mortgage calculator",
    description:
      "See IO repayments, the jump to P&I, and extra interest versus full P&I.",
    pillar: "loans-credit-debt",
    hubs: ["home-loans"],
    href: "/tools/interest-only-mortgage",
  },
  {
    id: "super-contributions-optimiser",
    title: "Super contributions optimiser",
    description:
      "Compare SG-only growth with extra concessional and after-tax contributions.",
    pillar: "super-retirement",
    hubs: ["grow-super"],
    href: "/tools/super-contributions-optimiser",
  },
  {
    id: "super-pension-age",
    title: "Super and pension age calculator",
    description:
      "Estimate preservation age and Age Pension age from your birth date.",
    pillar: "super-retirement",
    hubs: ["plan-retirement", "how-super-works"],
    href: "/tools/super-pension-age",
  },
  {
    id: "account-based-pension",
    title: "Account-based pension calculator",
    description:
      "Project how long a retirement balance may last at a chosen drawdown.",
    pillar: "super-retirement",
    hubs: ["income-sources"],
    href: "/tools/account-based-pension",
  },
  {
    id: "life-claims-comparison",
    title: "Life insurance claims comparison",
    description:
      "Educational sample of claims metrics—replace with official data for real decisions.",
    pillar: "insurance",
    hubs: ["life-insurance"],
    href: "/tools/life-claims-comparison",
  },
];

export const lifeEvents: LifeEvent[] = [
  {
    id: "first-job",
    title: "I just got a job",
    description: "Payslips, tax, super, and a starter budget.",
    href: "/topics/banking-budgeting/work-tax/first-payslip",
  },
  {
    id: "buying-home",
    title: "I’m buying a home",
    description: "Deposits, loan types, and repayment planning.",
    href: "/topics/loans-credit-debt/home-loans/buying-a-house",
  },
  {
    id: "debt-stress",
    title: "I’m struggling with debt",
    description: "Prioritise repayments and find free support.",
    href: "/urgent",
  },
  {
    id: "retire-soon",
    title: "I’m planning retirement",
    description: "Income needs, super drawdowns, and Age Pension.",
    href: "/topics/super-retirement/retirement/retirement-checklist",
  },
  {
    id: "scam-worry",
    title: "I think I’ve been scammed",
    description: "Stop the damage and report what happened.",
    href: "/topics/scams-safety/check-report/what-to-do-if-youve-been-scammed",
  },
  {
    id: "start-investing",
    title: "I want to start investing",
    description: "Goals, risk, and simple diversified options.",
    href: "/topics/investing-planning/how-to-invest/develop-an-investing-plan",
  },
];

export function getPillar(id: string) {
  return pillars.find((p) => p.id === id);
}

export function getHubsForPillar(pillarId: string) {
  return hubs.filter((h) => h.pillar === pillarId);
}

export function getHub(pillarId: string, hubId: string) {
  return hubs.find((h) => h.pillar === pillarId && h.id === hubId);
}

export function getTool(id: string) {
  return tools.find((t) => t.id === id);
}

export function getToolsForHub(hubId: string) {
  return tools.filter((t) => t.hubs.includes(hubId));
}
