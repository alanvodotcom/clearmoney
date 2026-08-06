import type { PillarId } from "./types";

export type GuideVisualDef = {
  id: string;
  caption: string;
  pillars: PillarId[];
  hubs?: string[];
  keywords: string[];
  /** Local path under /public (downloaded Unsplash, royalty-free). */
  src: string;
  /** Photographer credit for Unsplash licence attribution */
  credit: string;
  /** Original Unsplash photo page */
  creditUrl: string;
};

/**
 * Contextual real-life photos for in-article visuals.
 * Sources: Unsplash (https://unsplash.com/license) — free to use; credit listed.
 * Files live in public/guide-photos/ (see scripts/fetch-guide-photos.mjs).
 */
export const GUIDE_VISUALS: GuideVisualDef[] = [
  {
    id: "bank-card",
    caption: "Everyday card payments still need limits you chose on purpose.",
    pillars: ["banking-budgeting"],
    hubs: ["banking"],
    keywords: ["card", "debit", "transaction", "account", "joint", "bank"],
    src: "/guide-photos/bank-card.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "direct-debit",
    caption: "Recurring bills are easier when you can see them in one place.",
    pillars: ["banking-budgeting"],
    hubs: ["banking", "budgeting"],
    keywords: ["debit", "direct", "subscription", "bill", "payment"],
    src: "/guide-photos/direct-debit.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "budget-buckets",
    caption: "A clear budget starts with real numbers from your statements.",
    pillars: ["banking-budgeting"],
    hubs: ["budgeting", "saving"],
    keywords: ["budget", "spend", "track", "cost", "living", "casual"],
    src: "/guide-photos/budget-buckets.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "savings-jar",
    caption: "Automatic transfers beat hoping something is left at month-end.",
    pillars: ["banking-budgeting"],
    hubs: ["saving"],
    keywords: ["sav", "emergency", "goal", "buffer", "compound"],
    src: "/guide-photos/savings-jar.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "payslip",
    caption: "Payslips show tax, super, and what you can actually spend.",
    pillars: ["banking-budgeting"],
    hubs: ["work-tax"],
    keywords: ["pay", "tax", "gst", "hecs", "work", "income", "casual"],
    src: "/guide-photos/payslip.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "family-money",
    caption: "Shared money works best with agreed rules both people can see.",
    pillars: ["banking-budgeting"],
    hubs: ["family"],
    keywords: ["family", "partner", "divorc", "separat", "abuse", "kids", "will"],
    src: "/guide-photos/family-money.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "loan-stack",
    caption: "List every debt before you decide what to pay first.",
    pillars: ["loans-credit-debt"],
    hubs: ["loans", "managing-debt", "other-borrowing"],
    keywords: ["loan", "debt", "borrow", "payday", "personal", "car", "bnpl"],
    src: "/guide-photos/loan-stack.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "credit-card-cycle",
    caption: "Carried balances turn convenience into ongoing interest.",
    pillars: ["loans-credit-debt"],
    hubs: ["credit-cards"],
    keywords: ["credit", "card", "interest", "repay", "limit"],
    src: "/guide-photos/credit-card-cycle.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "home-loan",
    caption: "Rate, fees, and term shape the real cost of a home loan.",
    pillars: ["loans-credit-debt"],
    hubs: ["home-loans"],
    keywords: ["mortgage", "home", "house", "offset", "redraw", "refinance", "interest-only"],
    src: "/guide-photos/home-loan.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "hardship-path",
    caption: "When money is tight, the next call matters more than a perfect plan.",
    pillars: ["loans-credit-debt"],
    hubs: ["managing-debt"],
    keywords: ["hardship", "urgent", "collector", "counsel", "complain", "bankrupt"],
    src: "/guide-photos/hardship-path.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "invest-plan",
    caption: "Write the goal and timeline before you pick a product.",
    pillars: ["investing-planning"],
    hubs: ["how-to-invest", "advice"],
    keywords: ["plan", "invest", "goal", "horizon", "risk", "advice", "adviser"],
    src: "/guide-photos/invest-plan.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "diversify-dots",
    caption: "Spreading investments reduces the damage from one bad bet.",
    pillars: ["investing-planning"],
    hubs: ["how-to-invest", "funds-etfs", "shares"],
    keywords: ["diversif", "etf", "fund", "portfolio", "spread", "concentrat"],
    src: "/guide-photos/diversify-dots.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "shares-trade",
    caption: "Buying shares is operational—orders, fees, and records included.",
    pillars: ["investing-planning"],
    hubs: ["shares"],
    keywords: ["share", "stock", "ipo", "broker", "chess", "fractional", "volatil"],
    src: "/guide-photos/shares-trade.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "property-invest",
    caption: "Investment property costs include vacancies, rates, and repairs.",
    pillars: ["investing-planning"],
    hubs: ["property"],
    keywords: ["property", "rent", "landlord", "smsf", "timeshare", "house"],
    src: "/guide-photos/property-invest.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "interest-invest",
    caption: "Higher yields on interest products often signal higher risk.",
    pillars: ["investing-planning"],
    hubs: ["interest-investments"],
    keywords: ["bond", "term", "deposit", "hybrid", "debenture", "note", "interest"],
    src: "/guide-photos/interest-invest.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "warning-triangle",
    caption: "Pressure and “guaranteed” returns are classic investment red flags.",
    pillars: ["investing-planning", "scams-safety"],
    hubs: ["warnings", "financial-scams", "check-report"],
    keywords: ["scam", "hype", "crypto", "forex", "cfd", "pump", "seminar", "alert", "fraud"],
    src: "/guide-photos/warning-triangle.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "complex-product",
    caption: "Complex products need a plain-English max-loss before you deposit.",
    pillars: ["investing-planning"],
    hubs: ["warnings", "funds-etfs"],
    keywords: ["option", "future", "cfd", "forex", "private", "credit", "peer", "hedge", "prediction"],
    src: "/guide-photos/complex-product.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "super-growth",
    caption: "Super grows from contributions and time—not tips on social media.",
    pillars: ["super-retirement"],
    hubs: ["grow-super", "how-super-works"],
    keywords: ["super", "contribut", "sg", "salary", "consolidat", "fund", "investment option"],
    src: "/guide-photos/super-growth.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "retirement-clock",
    caption: "Retirement timing depends on income needs and when you can access super.",
    pillars: ["super-retirement"],
    hubs: ["retirement", "plan-retirement", "manage-retirement"],
    keywords: ["retire", "pension", "age", "checklist", "drawdown", "age pension"],
    src: "/guide-photos/retirement-clock.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "income-sources",
    caption: "Retirement income often mixes super, Age Pension, and paid work.",
    pillars: ["super-retirement"],
    hubs: ["income-sources"],
    keywords: ["pension", "annuity", "reverse", "mortgage", "account-based", "income"],
    src: "/guide-photos/income-sources.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "insurance-shield",
    caption: "Life cover should match debts and dependants—not a brochure maximum.",
    pillars: ["insurance"],
    hubs: ["life-insurance", "other-insurance"],
    keywords: ["life", "tpd", "trauma", "income", "protection", "cover", "claim"],
    src: "/guide-photos/insurance-shield.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "car-insurance",
    caption: "Compare excess and exclusions—not only the headline premium.",
    pillars: ["insurance"],
    hubs: ["car-insurance", "add-on-insurance"],
    keywords: ["car", "vehicle", "motor", "add-on", "gap", "tyre"],
    src: "/guide-photos/car-insurance.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "home-insurance",
    caption: "Building and contents cover different losses—read both.",
    pillars: ["insurance"],
    hubs: ["home-insurance", "natural-disasters"],
    keywords: ["home", "contents", "building", "flood", "storm", "disaster", "landlord"],
    src: "/guide-photos/home-insurance.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "scam-stop",
    caption: "Pause before you pay, share codes, or install remote-access apps.",
    pillars: ["scams-safety"],
    hubs: ["online-safety", "financial-scams", "check-report"],
    keywords: ["scam", "phish", "website", "romance", "invest", "report", "cyber"],
    src: "/guide-photos/scam-stop.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "online-safety",
    caption: "Type website addresses yourself and turn on multi-factor login.",
    pillars: ["scams-safety"],
    hubs: ["online-safety"],
    keywords: ["password", "mfa", "identity", "privacy", "website", "device", "email"],
    src: "/guide-photos/online-safety.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "community-help",
    caption: "Free counselling and complaint schemes exist before paid “fixers.”",
    pillars: ["community"],
    hubs: ["publications", "students", "teachers", "first-nations", "unclaimed-money", "your-stories"],
    keywords: ["complain", "student", "teach", "nation", "unclaim", "publicat", "tip", "story"],
    src: "/guide-photos/community-help.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "money-transfer",
    caption: "Compare fees and delivery time before sending money overseas.",
    pillars: ["banking-budgeting"],
    hubs: ["banking"],
    keywords: ["overseas", "transfer", "send", "foreign", "remit"],
    src: "/guide-photos/money-transfer.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "tax-brackets",
    caption: "Tax is calculated in slices—check your payslip against expectations.",
    pillars: ["banking-budgeting"],
    hubs: ["work-tax"],
    keywords: ["tax", "bracket", "medicare", "deduction", "return"],
    src: "/guide-photos/tax-brackets.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "micro-habit",
    caption: "Small automated investing only works if fees leave something to grow.",
    pillars: ["investing-planning", "banking-budgeting"],
    hubs: ["how-to-invest", "saving"],
    keywords: ["micro", "round", "app", "automat", "habit", "fractional"],
    src: "/guide-photos/micro-habit.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
  {
    id: "checklist-board",
    caption: "Write the next three money actions—vague plans rarely move.",
    pillars: [
      "banking-budgeting",
      "loans-credit-debt",
      "investing-planning",
      "super-retirement",
      "insurance",
      "scams-safety",
      "community",
    ],
    keywords: ["next", "checklist", "step", "plan", "action"],
    src: "/guide-photos/checklist-board.jpg",
    credit: "Photo via Unsplash",
    creditUrl: "https://unsplash.com/license",
  },
];

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function visualFigureHtml(def: GuideVisualDef): string {
  const caption = escapeHtml(def.caption);
  const credit = escapeHtml(def.credit);
  const creditUrl = escapeHtml(def.creditUrl);
  const src = escapeHtml(def.src);
  const alt = escapeHtml(def.caption);
  return `<figure class="cm-visual cm-visual--photo" role="group">
  <div class="cm-visual__frame">
    <img class="cm-visual__img" src="${src}" alt="${alt}" width="960" height="640" loading="lazy" decoding="async" />
  </div>
  <figcaption class="cm-visual__caption">${caption}</figcaption>
  <p class="cm-visual__credit"><a href="${creditUrl}" rel="noopener noreferrer" target="_blank">${credit}</a></p>
</figure><!-- visual:${escapeHtml(def.id)} -->`;
}
