/**
 * Inventory + thin wrapper for ClearMoney guide generation.
 * Prefer: npm run generate:articles → scripts/write-guides.mjs
 */
import path from "path";
import { fileURLToPath } from "url";

/** @typedef {{ title: string, slug: string, description?: string, tools?: string[], tags?: string[] }} Guide */
/** @typedef {{ pillar: string, hub: string, guides: Guide[] }} HubGuides */

/** @type {HubGuides[]} */
export const inventory = [
  // ——— Banking & budgeting ———
  {
    pillar: "banking-budgeting",
    hub: "banking",
    guides: [
      { title: "Transaction accounts and debit cards", slug: "transaction-accounts-and-debit-cards", description: "Everyday accounts, debit cards, and fee traps to watch.", tags: ["banking"] },
      { title: "Savings accounts", slug: "savings-accounts", description: "Bonus rates, conditions, and keeping savings separate.", tools: ["savings-goals"], tags: ["saving"] },
      { title: "Joint accounts", slug: "joint-accounts", description: "How joint accounts work—and risks if a relationship changes.", tags: ["family"] },
      { title: "Direct debits", slug: "direct-debits", description: "Set up, track, and cancel direct debits without surprises." },
      { title: "Sending money overseas", slug: "sending-money-overseas", description: "Compare transfer fees, exchange rates, and safer options." },
      { title: "Unauthorised and mistaken transactions", slug: "unauthorised-and-mistaken-transactions", description: "What to do if money leaves your account without consent." },
    ],
  },
  {
    pillar: "banking-budgeting",
    hub: "budgeting",
    guides: [
      { title: "How to do a budget", slug: "how-to-do-a-budget", description: "A simple step-by-step method to see where money goes.", tools: ["budget-planner"] },
      { title: "Track your spending", slug: "track-your-spending", description: "Use statements and categories to spot leaks fast.", tools: ["budget-planner", "simple-money-manager"] },
      { title: "Cost of living help", slug: "cost-of-living-help", description: "Practical ways to stretch income when prices rise.", tools: ["budget-planner"] },
      { title: "Managing on a low income", slug: "managing-on-a-low-income", description: "Prioritise essentials and find free support.", tools: ["simple-money-manager"] },
      { title: "Managing on a casual income", slug: "managing-on-a-casual-income", description: "Budget when hours and pay vary week to week.", tools: ["budget-planner"] },
      { title: "Ways to save on food and fuel", slug: "ways-to-save-on-food-and-fuel", description: "Cut two of the biggest everyday costs without crash dieting." },
      { title: "Ways to save on energy costs", slug: "ways-to-save-on-energy-costs", description: "Bills, plans, and habits that lower power and gas spend." },
      { title: "Avoiding sales pressure", slug: "avoiding-sales-pressure", description: "Cooling-off rights and tactics when someone pushes a sale." },
    ],
  },
  {
    pillar: "banking-budgeting",
    hub: "saving",
    guides: [
      { title: "How to start saving", slug: "how-to-start-saving", description: "Start small, automate, and make progress visible.", tools: ["savings-goals"] },
      { title: "Simple ways to save money", slug: "simple-ways-to-save-money", description: "Quick wins that free cash without a full lifestyle overhaul.", tools: ["budget-planner"] },
      { title: "Save for an emergency fund", slug: "save-for-an-emergency-fund", description: "Size and park a buffer for job loss or big bills.", tools: ["emergency-fund", "savings-goals"] },
      { title: "Save for a house deposit", slug: "save-for-a-house-deposit", description: "Deposit targets, timelines, and what counts as a genuine savings history.", tools: ["savings-goals", "mortgage"] },
      { title: "Ways to buy a home sooner", slug: "ways-to-buy-a-home-sooner", description: "Deposit boosts, costs to cut, and borrowing trade-offs.", tools: ["mortgage", "savings-goals"] },
      { title: "Compound interest explained", slug: "compound-interest", description: "How interest on interest grows balances—and debts.", tools: ["compound-interest"] },
    ],
  },
  {
    pillar: "banking-budgeting",
    hub: "work-tax",
    guides: [
      { title: "Income tax basics", slug: "income-tax", description: "How Australian income tax and Medicare levy work in plain language.", tools: ["income-tax"] },
      { title: "Lodging a tax return", slug: "lodging-a-tax-return", description: "Deadlines, records, and when an agent helps." },
      { title: "Choosing an accountant", slug: "choosing-an-accountant", description: "What to ask before you pay for tax help." },
      { title: "Salary packaging", slug: "salary-packaging", description: "When packaging benefits can help—and when it doesn’t." },
      { title: "Self-employment money basics", slug: "self-employment", description: "GST, super, and separating business and personal money.", tools: ["gst"] },
      { title: "Losing your job", slug: "losing-your-job", description: "Final pay, entitlements, and a short-term money plan.", tools: ["budget-planner", "emergency-fund"] },
      { title: "Returning to work after having a baby", slug: "returning-to-work-after-having-a-baby", description: "Childcare costs, leave, and updating your budget.", tools: ["budget-planner"] },
      { title: "Reading your first payslip", slug: "first-payslip", description: "Gross, tax, super, and take-home pay decoded.", tools: ["income-tax", "employer-contributions"] },
    ],
  },
  {
    pillar: "banking-budgeting",
    hub: "family",
    guides: [
      { title: "Relationships and money", slug: "relationships-and-money", description: "Talk about money early—goals, debts, and spending styles.", tools: ["budget-planner"] },
      { title: "Marriage and money", slug: "marriage-and-money", description: "Joint bills, personal spending, and shared goals." },
      { title: "Having a baby", slug: "having-a-baby", description: "One-off costs, ongoing budgets, and leave planning.", tools: ["budget-planner"] },
      { title: "Getting a pet", slug: "getting-a-pet", description: "True cost of pets beyond the adoption fee." },
      { title: "Reducing back-to-school costs", slug: "reducing-back-to-school-costs", description: "Uniforms, devices, and fee planning without last-minute stress." },
      { title: "Teaching kids about money", slug: "teaching-kids-about-money", description: "Age-appropriate habits for earning, saving, and waiting." },
      { title: "Getting divorced or separating", slug: "getting-divorced-or-separating", description: "Money steps when a relationship ends." },
      { title: "Divorce and separation financial checklist", slug: "divorce-and-separation-financial-checklist", description: "Accounts, debts, super, and documents to gather." },
      { title: "Financial abuse", slug: "financial-abuse", description: "Spot controlling money behaviours and where to get help." },
      { title: "Dealing with illness", slug: "dealing-with-illness", description: "Income, insurance, and bills when health changes." },
      { title: "Losing your partner", slug: "losing-your-partner", description: "Practical money steps after a bereavement." },
      { title: "How to support older Australians", slug: "how-to-support-older-australians", description: "Help family with money without taking over." },
    ],
  },

  // ——— Loans ———
  {
    pillar: "loans-credit-debt",
    hub: "loans",
    guides: [
      { title: "Personal loans", slug: "personal-loans", description: "When a personal loan makes sense—and what to compare.", tools: ["personal-loan", "loan-comparison"] },
      { title: "Car loans", slug: "car-loans", description: "Dealer finance vs bank loans, and total cost of the car.", tools: ["personal-loan"] },
      { title: "Payday loans", slug: "payday-loans", description: "Why short-term credit gets expensive fast.", tools: ["payday-loan"] },
      { title: "No interest loans", slug: "no-interest-loans", description: "Community NILS-style options for essential items." },
      { title: "Going guarantor on a loan", slug: "going-guarantor-on-a-loan", description: "What you risk if you guarantee someone else’s debt." },
      { title: "Loan rejection", slug: "loan-rejection", description: "Why applications fail and what to fix before reapplying." },
    ],
  },
  {
    pillar: "loans-credit-debt",
    hub: "other-borrowing",
    guides: [
      { title: "Buy now pay later services", slug: "buy-now-pay-later-services", description: "Fees, missed payments, and how BNPL affects your budget.", tools: ["budget-planner"] },
      { title: "Consumer leases", slug: "consumer-leases", description: "Renting goods can cost more than buying—run the numbers.", tools: ["rent-vs-buy"] },
      { title: "Interest-free deals", slug: "interest-free-deals", description: "Promotional periods, deferred interest, and exit traps." },
      { title: "Pay advance services", slug: "pay-advance-services", description: "Wage advances and the real cost of getting paid early." },
    ],
  },
  {
    pillar: "loans-credit-debt",
    hub: "credit-cards",
    guides: [
      { title: "Choosing a credit card", slug: "choosing-a-credit-card", description: "Low rate vs rewards—pick for how you actually use credit.", tools: ["credit-card"] },
      { title: "Pay off your credit card", slug: "pay-off-your-credit-card", description: "Beat minimum repayments and cut interest.", tools: ["credit-card"] },
      { title: "Credit card balance transfers", slug: "credit-card-balance-transfers", description: "0% offers, transfer fees, and what happens when the deal ends." },
      { title: "Cancel a credit card", slug: "cancel-a-credit-card", description: "Close cards cleanly without hurting needed credit history." },
    ],
  },
  {
    pillar: "loans-credit-debt",
    hub: "home-loans",
    guides: [
      { title: "Buying a house", slug: "buying-a-house", description: "Deposit, costs, and borrowing without overstretching.", tools: ["mortgage", "savings-goals"] },
      { title: "Choosing a home loan", slug: "choosing-a-home-loan", description: "Fixed, variable, split, offsets, and comparison rates.", tools: ["mortgage"] },
      { title: "Interest-only home loans", slug: "interest-only-home-loans", description: "When interest-only helps—and when repayments jump later." },
      { title: "Mortgage offset accounts", slug: "mortgage-offset-accounts", description: "How offsets reduce interest while keeping cash accessible.", tools: ["offset-vs-redraw"] },
      { title: "Pay off your mortgage faster", slug: "pay-off-your-mortgage-faster", description: "Extra repayments, frequency, and redraw rules.", tools: ["mortgage"] },
      { title: "Switching home loans", slug: "switching-home-loans", description: "Refinancing steps and costs before you switch.", tools: ["refinance-break-even"] },
      { title: "Using a mortgage broker", slug: "using-a-mortgage-broker", description: "What brokers do, how they’re paid, and questions to ask." },
      { title: "Problems paying your mortgage", slug: "problems-paying-your-mortgage", description: "Hardship options if repayments become tough." },
    ],
  },
  {
    pillar: "loans-credit-debt",
    hub: "managing-debt",
    guides: [
      { title: "Urgent help with money", slug: "urgent-help-with-money", description: "Immediate steps when you can’t cover essentials." },
      { title: "Get debt under control", slug: "get-debt-under-control", description: "List debts, prioritise, and pick a repayment method.", tools: ["credit-card", "personal-loan"] },
      { title: "Financial hardship", slug: "financial-hardship", description: "Ask lenders for hardship help early." },
      { title: "Financial counselling", slug: "financial-counselling", description: "Free, confidential help to plan and negotiate." },
      { title: "Free legal advice", slug: "free-legal-advice", description: "Where to find free or low-cost legal help with debt." },
      { title: "Credit scores and credit reports", slug: "credit-scores-and-credit-reports", description: "What’s on your file and how to check it." },
      { title: "Credit repair", slug: "credit-repair", description: "Be wary of paid ‘repair’ services—know your rights." },
      { title: "Debt consolidation and refinancing", slug: "debt-consolidation-and-refinancing", description: "When combining debts helps—and when it costs more.", tools: ["loan-comparison"] },
      { title: "Dealing with debt collectors", slug: "dealing-with-debt-collectors", description: "Your rights when collectors contact you." },
      { title: "Problems paying your bills and fines", slug: "problems-paying-your-bills-and-fines", description: "Payment plans and help for utilities and fines." },
      { title: "Repossessed car or goods", slug: "repossessed-car-or-goods", description: "What happens in repossession and what to do next." },
      { title: "Bankruptcy and debt agreements", slug: "bankruptcy-and-debt-agreements", description: "Serious options—understand consequences first." },
    ],
  },

  // ——— Investing ———
  {
    pillar: "investing-planning",
    hub: "how-to-invest",
    guides: [
      { title: "Develop an investing plan", slug: "develop-an-investing-plan", description: "Goals, time horizon, and risk before picking products.", tools: ["investment-returns", "emergency-fund"] },
      { title: "Choose your investments", slug: "choose-your-investments", description: "Match products to goals—not tips or hype." },
      { title: "Diversification", slug: "diversification", description: "Why spreading investments reduces single-point risk." },
      { title: "Track your investments", slug: "track-your-investments", description: "Simple ways to review performance without obsessing.", tools: ["net-worth"] },
      { title: "Investing and tax", slug: "investing-and-tax", description: "Capital gains, dividends, and record-keeping basics.", tools: ["income-tax"] },
      { title: "Investment platforms", slug: "investment-platforms", description: "Broker and app fees, features, and safety checks." },
      { title: "Borrowing to invest", slug: "borrowing-to-invest", description: "Leverage magnifies gains and losses—know the risks." },
      { title: "ESG investing", slug: "environmental-social-governance-esg-investing", description: "What ESG labels mean—and what to verify." },
      { title: "Islamic finance in Australia", slug: "islamic-finance-in-australia", description: "Sharia-compliant banking and investment options overview." },
      { title: "What is private credit?", slug: "what-is-private-credit", description: "Private credit risks, liquidity, and who it suits." },
    ],
  },
  {
    pillar: "investing-planning",
    hub: "advice",
    guides: [
      { title: "What is financial advice?", slug: "what-is-financial-advice", description: "General vs personal advice—and why the difference matters." },
      { title: "General and personal financial advice", slug: "general-and-personal-financial-advice", description: "How advice is categorised and what you should receive in writing." },
      { title: "Choosing a financial adviser", slug: "choosing-a-financial-adviser", description: "Licensing, experience, and questions to ask." },
      { title: "Financial advice costs", slug: "financial-advice-costs", description: "Fees, commissions history, and ongoing advice costs." },
      { title: "Working with a financial adviser", slug: "working-with-a-financial-adviser", description: "What good advice engagements look like." },
      { title: "Financial advisers register", slug: "financial-advisers-register", description: "How to check an adviser is authorised." },
      { title: "Problems with a financial adviser", slug: "problems-with-a-financial-adviser", description: "Complaints, AFCA, and getting your file." },
    ],
  },
  {
    pillar: "investing-planning",
    hub: "shares",
    guides: [
      { title: "How to buy and sell shares", slug: "how-to-buy-and-sell-shares", description: "Brokers, CHESS, and settlement basics." },
      { title: "Choosing shares to buy", slug: "choosing-shares-to-buy", description: "Research habits—not tips—from social media." },
      { title: "What is an IPO?", slug: "shares-what-is-an-ipo", description: "Floats, prospectuses, and IPO risks." },
      { title: "Share market volatility", slug: "what-is-share-market-volatility", description: "Why prices swing and how long-term investors respond." },
      { title: "Employee share schemes", slug: "employee-share-schemes", description: "ESS tax timing and concentration risk." },
      { title: "Buying shares through crowd-sourced funding", slug: "buying-shares-through-crowd-sourced-funding", description: "CSF offers are high risk and often illiquid." },
    ],
  },
  {
    pillar: "investing-planning",
    hub: "funds-etfs",
    guides: [
      { title: "What is a managed fund?", slug: "what-is-a-managed-fund", description: "Pooled investing, unit prices, and fee awareness.", tools: ["fee-drag"] },
      { title: "Choosing a managed fund", slug: "choosing-a-managed-fund", description: "Objectives, fees, and past performance caveats.", tools: ["fee-drag"] },
      { title: "Exchange traded funds (ETFs)", slug: "exchange-traded-funds-etfs", description: "ETFs vs unlisted funds—trading and costs.", tools: ["fee-drag"] },
      { title: "Listed investment companies (LICs)", slug: "listed-investment-companies-lics", description: "How LICs differ from ETFs and closed-end discounts." },
      { title: "Hedge funds", slug: "hedge-funds", description: "Complex strategies, fees, and suitability limits." },
      { title: "Peer-to-peer lending", slug: "peer-to-peer-lending", description: "Lending to consumers/businesses via platforms—credit risk." },
    ],
  },
  {
    pillar: "investing-planning",
    hub: "property",
    guides: [
      { title: "Buying an investment property", slug: "buying-an-investment-property", description: "Yields, vacancies, rates, and concentration risk.", tools: ["mortgage"] },
      { title: "Property funds", slug: "property-funds", description: "Unlisted and listed property exposure without buying a house." },
      { title: "SMSFs and property", slug: "smsfs-and-property", description: "Rules and risks when an SMSF buys property." },
      { title: "Timeshares", slug: "timeshares", description: "Why timeshares are often hard to exit and poor value." },
    ],
  },
  {
    pillar: "investing-planning",
    hub: "interest-investments",
    guides: [
      { title: "Term deposits", slug: "term-deposits", description: "Lock in a rate—compare terms and early exit costs.", tools: ["compound-interest"] },
      { title: "Bonds", slug: "bonds", description: "Government and corporate bonds—interest rate risk basics." },
      { title: "Debentures, secured and unsecured notes", slug: "debentures-secured-and-unsecured-notes", description: "Higher yields often mean higher credit risk." },
      { title: "Hybrid securities and notes", slug: "hybrid-securities-and-notes", description: "Complex income securities—read the risks carefully." },
    ],
  },
  {
    pillar: "investing-planning",
    hub: "warnings",
    guides: [
      { title: "Don't get burned by investment hype", slug: "dont-get-burned-by-investment-hype", description: "Urgency, guaranteed returns, and social proof tricks." },
      { title: "Crypto assets", slug: "crypto-assets", description: "Volatility, scams, and what ‘ownership’ really means." },
      { title: "Forex trading", slug: "forex-trading", description: "Why most retail forex traders lose money." },
      { title: "Contracts for difference (CFDs)", slug: "contracts-for-difference-cfds", description: "Leverage and loss risks in CFDs." },
      { title: "Binary options", slug: "binary-options", description: "Why binary options are a red flag for retail investors." },
      { title: "Investment seminars", slug: "investment-seminars", description: "Free seminars that sell expensive courses or products." },
      { title: "Land banking", slug: "land-banking", description: "Speculative land schemes and liquidity traps." },
      { title: "Pump and dump schemes", slug: "pump-and-dump-schemes", description: "How promoters inflate prices then sell." },
      { title: "Insider trading", slug: "insider-trading", description: "What it is—and why you should never participate." },
      { title: "Company director fraud", slug: "company-director-fraud", description: "Warning signs when directors misuse investor money." },
      { title: "Bills of exchange", slug: "bills-of-exchange", description: "Exotic paper promises—treat with extreme caution." },
      { title: "Lead generation and how it works", slug: "lead-generation-and-how-it-works", description: "Your details get sold—expect sales calls after ‘free’ forms." },
    ],
  },

  // ——— Super ———
  {
    pillar: "super-retirement",
    hub: "retirement",
    guides: [
      { title: "Retirement checklist", slug: "retirement-checklist", description: "Income needs, debts, and timing your exit from work.", tools: ["retirement-planner", "super"] },
      { title: "Case study: Helen and Joe retire", slug: "case-study-helen-and-joe-retire", description: "A couple plans income from super and Age Pension." },
      { title: "Case study: Bill's mortgage decision", slug: "case-study-bills-mortgage-decision", description: "Paying off a home loan before or in retirement." },
      { title: "Case study: Lillian's health scare", slug: "case-study-lillians-health-scare", description: "Health costs and money decisions later in life." },
      { title: "First Nations retirement resources", slug: "first-nations-resources", description: "Pathways and culturally aware retirement support." },
    ],
  },
  {
    pillar: "super-retirement",
    hub: "how-super-works",
    guides: [
      { title: "Superannuation basics", slug: "superannuation", description: "What super is and why it exists.", tools: ["super"] },
      { title: "Types of super funds", slug: "types-of-super-funds", description: "Industry, retail, public sector, and SMSFs." },
      { title: "Choosing a super fund", slug: "choosing-a-super-fund", description: "Fees, insurance, and investment options to compare.", tools: ["super", "fee-drag"] },
      { title: "Stapled super fund", slug: "stapled-super-fund", description: "How stapling stops duplicate accounts when you change jobs." },
      { title: "Consolidating super funds", slug: "consolidating-super-funds", description: "Combine accounts carefully—check insurance first.", tools: ["super"] },
      { title: "Find lost super", slug: "find-lost-super", description: "Search for lost or ATO-held super." },
      { title: "Tax and super", slug: "tax-and-super", description: "Contributions tax, earnings, and withdrawals overview." },
      { title: "Getting your super", slug: "getting-your-super", description: "Preservation age and conditions of release." },
      { title: "When you can access your super early", slug: "when-you-can-access-your-super-early", description: "Limited legal early access—beware illegal schemes." },
      { title: "Self-managed super fund (SMSF)", slug: "self-managed-super-fund-smsf", description: "Who an SMSF suits—and the admin burden." },
      { title: "Who gets your super if you die", slug: "who-gets-your-super-if-you-die", description: "Beneficiaries, binding nominations, and estate interplay." },
      { title: "Claiming a super death benefit", slug: "claiming-a-super-death-benefit", description: "Steps for dependants and legal personal representatives." },
      { title: "What is payday super?", slug: "what-is-payday-super", description: "Employer contributions timed closer to payday." },
    ],
  },
  {
    pillar: "super-retirement",
    hub: "grow-super",
    guides: [
      { title: "How to check your super", slug: "how-to-check-your-super", description: "Statements, fees, insurance, and investment option.", tools: ["super"] },
      { title: "How much super should I have?", slug: "how-much-super-should-i-have", description: "Rough benchmarks—and why your number is personal.", tools: ["retirement-planner", "super"] },
      { title: "Super contributions", slug: "super-contributions", description: "Concessional and non-concessional contributions explained.", tools: ["super"] },
      { title: "Super investment options", slug: "super-investment-options", description: "Growth vs balanced vs cash—risk and time horizon." },
      { title: "Switching super funds", slug: "switching-super-funds", description: "Compare before you switch—and watch sales pressure." },
      { title: "Protect your super from pushy sales calls", slug: "protect-your-super-from-pushy-sales-calls", description: "Hang up on cold calls offering free ‘super checks’." },
      { title: "Get your super working over time", slug: "get-your-super-working-over-time", description: "Small extra contributions compound meaningfully.", tools: ["compound-interest", "super"] },
      { title: "Downsizer super contributions", slug: "downsizer-super-contributions", description: "Rules for contributing home sale proceeds to super." },
      { title: "Super for self-employed people", slug: "super-for-self-employed-people", description: "Paying your own SG-equivalent contributions." },
      { title: "Tips to keep retirement savings on track", slug: "tips-to-keep-your-retirement-savings-on-track", description: "Fees, insurance, and contribution habits that matter." },
    ],
  },
  {
    pillar: "super-retirement",
    hub: "plan-retirement",
    guides: [
      { title: "Make a retirement plan", slug: "make-a-retirement-plan", description: "Spending needs, income sources, and timing.", tools: ["retirement-planner"] },
      { title: "Work out how much you need to retire", slug: "work-out-how-much-you-need-to-retire", description: "Lifestyle budgets and nest-egg estimates.", tools: ["retirement-planner"] },
      { title: "Super and the Age Pension", slug: "super-and-the-age-pension", description: "How means tests interact with super income." },
      { title: "What happens to your super when you retire", slug: "what-happens-to-your-super-when-you-retire", description: "Pensions, lump sums, and account-based income." },
      { title: "Your home in retirement", slug: "your-home-in-retirement", description: "Staying, downsizing, or equity release trade-offs." },
      { title: "Managing unexpected retirement", slug: "managing-unexpected-retirement", description: "Job loss or health forcing an earlier exit." },
      { title: "Wills and powers of attorney", slug: "wills-and-powers-of-attorney", description: "Estate and decision-making documents for later life." },
    ],
  },
  {
    pillar: "super-retirement",
    hub: "income-sources",
    guides: [
      { title: "Types of retirement income", slug: "types-of-retirement-income", description: "Super, Age Pension, work, and other sources." },
      { title: "Account-based pensions", slug: "account-based-pensions", description: "Flexible drawdowns from your super in retirement.", tools: ["retirement-planner"] },
      { title: "Age Pension and government benefits", slug: "age-pension-and-government-benefits", description: "Eligibility basics and where to check official rules." },
      { title: "Annuities", slug: "annuities", description: "Guaranteed income products—trade-offs vs flexibility." },
      { title: "Lifetime income streams", slug: "lifetime-income-streams", description: "Products designed to last for life." },
      { title: "Super lump sum", slug: "super-lump-sum", description: "Taking a lump sum—tax and longevity considerations." },
      { title: "Transition to retirement", slug: "transition-to-retirement", description: "Accessing super while still working (rules overview)." },
      { title: "Reverse mortgage and home equity release", slug: "reverse-mortgage-and-home-equity-release", description: "Borrowing against home equity in later life.", tools: ["reverse-mortgage"] },
    ],
  },
  {
    pillar: "super-retirement",
    hub: "manage-retirement",
    guides: [
      { title: "Make your money last in retirement", slug: "make-your-money-last-in-retirement", description: "Drawdown pacing and buffers for market dips.", tools: ["retirement-planner"] },
      { title: "Retirement income and tax", slug: "retirement-income-and-tax", description: "How different income types are taxed in retirement." },
      { title: "Manage health costs in retirement", slug: "manage-health-costs-in-retirement", description: "Medicare, extras, and budgeting for care." },
      { title: "Aged care", slug: "aged-care", description: "Money aspects of home care and residential care." },
      { title: "Downsizing in retirement", slug: "downsizing-in-retirement", description: "Costs, stamp duty, and lifestyle fit." },
      { title: "Protect your money in retirement", slug: "protect-your-money-in-retirement", description: "Scams and pressure sales targeting retirees." },
      { title: "Memory loss, dementia and your money", slug: "memory-loss-dementia-and-your-money", description: "Planning supports before capacity changes." },
      { title: "Paying for your funeral", slug: "paying-for-your-funeral", description: "Funeral bonds, insurance, and prepaid options." },
      { title: "Get help in retirement", slug: "get-help-in-retirement", description: "Counselling, Centrelink, and community supports." },
    ],
  },

  // ——— Insurance ———
  {
    pillar: "insurance",
    hub: "life-insurance",
    guides: [
      { title: "Life insurance cover", slug: "life-insurance-cover", description: "Who needs life cover and how much is enough.", tools: ["insurance-needs"] },
      { title: "Income protection insurance", slug: "income-protection-insurance", description: "Waiting periods, benefit periods, and definitions." },
      { title: "TPD insurance", slug: "total-and-permanent-disability-tpd-insurance", description: "Total and permanent disability cover basics." },
      { title: "Trauma insurance", slug: "trauma-insurance", description: "Critical illness lump sums—what’s typically covered." },
      { title: "Insurance through super", slug: "insurance-through-super", description: "Default cover in super—check and adjust." },
      { title: "Making a life insurance claim", slug: "making-a-life-insurance-claim", description: "Documents and steps when claiming." },
    ],
  },
  {
    pillar: "insurance",
    hub: "car-insurance",
    guides: [
      { title: "Choosing car insurance", slug: "choosing-car-insurance", description: "Comprehensive vs third party and excess trade-offs." },
      { title: "How to save money on car insurance", slug: "how-to-save-money-on-car-insurance", description: "Compare, raise excess carefully, and cut add-ons." },
      { title: "Claiming on your car insurance", slug: "claiming-on-your-car-insurance", description: "What to do after an accident." },
      { title: "No-claim bonus on car insurance", slug: "no-claim-bonus-on-car-insurance", description: "How bonuses work—and what a claim can do." },
      { title: "Add-on car insurance", slug: "add-on-car-insurance", description: "Extras sold with cars—often skippable." },
    ],
  },
  {
    pillar: "insurance",
    hub: "home-insurance",
    guides: [
      { title: "Choosing home insurance", slug: "choosing-home-insurance", description: "Building sums insured for rebuild—not market value." },
      { title: "Contents insurance", slug: "contents-insurance", description: "Cover for belongings—renters and owners." },
      { title: "Underinsurance: what it is and how to avoid it", slug: "underinsurance-what-it-is-and-how-to-avoid-it", description: "Why rebuild costs rise and how to update cover." },
      { title: "Storm, flood and fire insurance", slug: "storm-flood-and-fire-insurance", description: "Definitions matter—check flood cover carefully." },
      { title: "How to make a home insurance claim", slug: "how-to-make-a-home-insurance-claim", description: "Evidence, temporary accommodation, and timelines." },
      { title: "How home insurance cash settlements work", slug: "how-home-insurance-cash-settlements-work", description: "Cash settlement vs repair—pros and cons." },
    ],
  },
  {
    pillar: "insurance",
    hub: "add-on-insurance",
    guides: [
      { title: "Consumer credit insurance", slug: "consumer-credit-insurance", description: "Often expensive for the protection offered." },
      { title: "Mobile phone, tablet and laptop insurance", slug: "mobile-phone-tablet-and-laptop-insurance", description: "Check excesses and whether home contents already cover devices." },
      { title: "Pet insurance", slug: "pet-insurance", description: "What’s covered, waiting periods, and exclusions." },
    ],
  },
  {
    pillar: "insurance",
    hub: "other-insurance",
    guides: [
      { title: "Travel insurance", slug: "travel-insurance", description: "Medical cover overseas and why it matters." },
      { title: "Health insurance", slug: "health-insurance", description: "Private health basics—hospital and extras." },
      { title: "Funeral insurance", slug: "funeral-insurance", description: "Total premiums can exceed the benefit—compare alternatives." },
    ],
  },
  {
    pillar: "insurance",
    hub: "natural-disasters",
    guides: [
      { title: "How to prepare for a natural disaster", slug: "how-to-prepare-for-a-natural-disaster", description: "Documents, inventories, and emergency kits." },
      { title: "What to do after a natural disaster", slug: "what-to-do-after-a-natural-disaster", description: "Safety first, then insurers and support services." },
      { title: "Recovering from a natural disaster", slug: "recovering-from-a-natural-disaster", description: "Claims, temporary housing, and financial counselling." },
      { title: "Be aware of disaster chasers", slug: "be-aware-of-disaster-chasers", description: "Door-knockers after disasters—verify licences." },
    ],
  },

  // ——— Scams ———
  {
    pillar: "scams-safety",
    hub: "online-safety",
    guides: [
      { title: "Protect yourself from scams", slug: "protect-yourself-from-scams", description: "Core habits that stop most scams." },
      { title: "How to spot a scam website", slug: "how-to-spot-a-scam-website", description: "URLs, certificates, and too-good offers." },
      { title: "Online shopping safety", slug: "online-shopping-safety", description: "Safer checkout habits and refund rights." },
      { title: "Identity theft", slug: "identity-theft", description: "If your identity is stolen—lock down accounts fast." },
      { title: "Using comparison websites", slug: "using-comparison-websites", description: "Sponsored rankings and lead-gen follow-ups." },
      { title: "What is a finfluencer?", slug: "what-is-a-finfluencer", description: "Social media money tips aren’t personal advice." },
      { title: "AI and money decisions", slug: "ai-and-money-decisions", description: "Use AI carefully—verify anything that moves money." },
    ],
  },
  {
    pillar: "scams-safety",
    hub: "financial-scams",
    guides: [
      { title: "Banking scams", slug: "banking-scams", description: "Phishing, remote access, and fake bank calls." },
      { title: "Investment scams", slug: "investment-scams", description: "Guaranteed returns and pressure to transfer now." },
      { title: "Crypto scams", slug: "crypto-scams", description: "Romance-to-crypto and fake trading platforms." },
      { title: "Superannuation scams", slug: "superannuation-scams", description: "Illegal early access and SMSF takeover tricks." },
      { title: "Ponzi schemes", slug: "ponzi-schemes", description: "Returns paid from new investors—not profits." },
      { title: "Imposter bond investment scams", slug: "imposter-bond-investment-scams", description: "Fake ‘safe’ bonds using stolen brands." },
    ],
  },
  {
    pillar: "scams-safety",
    hub: "check-report",
    guides: [
      { title: "What to do if you've been scammed", slug: "what-to-do-if-youve-been-scammed", description: "Stop payments, contact your bank, and report it." },
      { title: "Check before you invest", slug: "check-before-you-invest", description: "Licence checks and independent verification." },
      { title: "Investor alert list", slug: "investor-alert-list", description: "How regulator alert lists help you spot known risks." },
      { title: "Report an investment scam", slug: "report-an-investment-scam", description: "Where to report and what information to keep." },
    ],
  },

  // ——— Community ———
  {
    pillar: "community",
    hub: "unclaimed-money",
    guides: [
      { title: "Claim money from bank accounts and bank dividends", slug: "claim-money-from-bank-accounts-and-bank-dividends", description: "Find and claim dormant bank money." },
      { title: "Claim money from shares and investments", slug: "claim-money-from-shares-and-investments", description: "Lost shareholdings and dividends." },
      { title: "Claim money from life insurance policies", slug: "claim-money-from-life-insurance-policies", description: "Unclaimed life policy money pathways." },
      { title: "Claim money owed to a deregistered company", slug: "claim-money-owed-to-a-deregistered-company", description: "ASIC-held money from deregistered companies." },
      { title: "Money held by state governments", slug: "money-held-by-state-governments", description: "State unclaimed money registers." },
      { title: "Interest paid on unclaimed money", slug: "interest-paid-on-unclaimed-money", description: "Whether interest applies when you reclaim funds." },
      { title: "Proof of ownership for unclaimed money", slug: "proof-of-ownership-for-unclaimed-money", description: "Documents you’ll typically need to claim." },
    ],
  },
  {
    pillar: "community",
    hub: "teachers",
    guides: [
      { title: "Teaching consumer and financial literacy", slug: "teaching-consumer-and-financial-literacy", description: "Why money skills belong in the classroom." },
      { title: "Lesson plans", slug: "lesson-plans", description: "Activity ideas for budgets, needs vs wants, and scams." },
    ],
  },
  {
    pillar: "community",
    hub: "students",
    guides: [
      { title: "Studying and money", slug: "studying", description: "HECS, income support, and student budgets.", tools: ["hecs", "budget-planner"] },
      { title: "Getting a job", slug: "getting-a-job", description: "First payslips, tax file numbers, and super.", tools: ["income-tax"] },
      { title: "Moving out of home", slug: "moving-out-of-home", description: "Bonds, utilities, and a starter living budget.", tools: ["budget-planner"] },
      { title: "Rental bonds and leases", slug: "rental-bonds-and-leases", description: "Bond boards, condition reports, and rights." },
      { title: "Choosing a mobile phone plan", slug: "choosing-a-mobile-phone-plan", description: "Avoid bill shock on phones and data." },
      { title: "Buying and running a car", slug: "buying-and-running-a-car", description: "Purchase price plus fuel, insurance, and rego." },
      { title: "Credit and debt for students", slug: "credit-and-debt", description: "Credit cards and BNPL on a variable income.", tools: ["credit-card"] },
    ],
  },
  {
    pillar: "community",
    hub: "publications",
    guides: [
      { title: "Publications", slug: "publications", description: "How ClearMoney guides are structured for learning." },
      { title: "How to complain", slug: "how-to-complain", description: "Internal complaints, then AFCA or other ombudsmen." },
      { title: "Money tips in other languages", slug: "money-tips-in-other-languages", description: "Pointing to multilingual money tip topics." },
      { title: "Beware of scams (community tip)", slug: "beware-of-scams", description: "Short scam-awareness tip sheet." },
      { title: "Budgeting and saving (community tip)", slug: "budgeting-and-saving-tips", description: "Short budgeting tip sheet." },
      { title: "Credit and debt (community tip)", slug: "credit-and-debt-tips", description: "Short credit tip sheet." },
      { title: "Insurance (community tip)", slug: "insurance-tips", description: "Short insurance tip sheet." },
      { title: "Money and working in Australia", slug: "money-and-working-in-australia", description: "Payslips, tax, and super for new workers." },
      { title: "Spending and paying bills", slug: "spending-and-paying-bills", description: "Bill rhythms and avoiding late fees." },
      { title: "Superannuation (community tip)", slug: "superannuation-tips", description: "Short super tip sheet." },
      { title: "Tax in Australia (community tip)", slug: "tax-in-australia", description: "Short tax tip sheet for residents." },
    ],
  },
  {
    pillar: "community",
    hub: "first-nations",
    guides: [
      { title: "First Nations services that can help", slug: "first-nations-services-that-can-help", description: "Where to find culturally safe money help." },
      { title: "Bank accounts", slug: "bank-accounts", description: "Opening and using accounts safely." },
      { title: "How to prove your identity", slug: "how-to-prove-your-identity", description: "ID options when opening accounts or claiming money." },
      { title: "Book-up", slug: "book-up", description: "Store credit risks and safer alternatives." },
      { title: "Cash loans", slug: "cash-loans", description: "High-cost loans—know the true price.", tools: ["payday-loan"] },
      { title: "Door-to-door sales", slug: "door-to-door-sales", description: "Cooling-off rights when sellers come to you." },
      { title: "Buying a hamper", slug: "buying-a-hamper", description: "Hamper credit deals—check total cost." },
      { title: "Dealing with family pressure about money", slug: "dealing-with-family-pressure-about-money", description: "Boundaries when family asks for money." },
      { title: "Managing large sums of money", slug: "managing-large-sums-of-money", description: "Compensation or inheritance—plan before spending." },
      { title: "Superannuation for First Nations communities", slug: "superannuation", description: "Finding lost super and checking your fund.", tools: ["super"] },
      { title: "How insurance works", slug: "how-insurance-works", description: "Plain-language insurance basics." },
      { title: "How to choose insurance", slug: "how-to-choose-insurance", description: "Compare cover—not just price." },
      { title: "Making an insurance claim", slug: "making-an-insurance-claim", description: "Steps and documents for claims." },
      { title: "Paying for funerals", slug: "paying-for-funerals", description: "Funeral costs and community supports." },
    ],
  },
  {
    pillar: "community",
    hub: "your-stories",
    guides: [
      { title: "It's not too late to have aspirations for retirement", slug: "its-not-too-late-to-have-aspirations-for-retirement", description: "A story about starting retirement planning later." },
      { title: "One of my main goals is to travel Australia", slug: "one-of-my-main-goals-is-to-travel-australia", description: "Saving for travel with a clear goal." },
      { title: "Stay mindful and be resourceful", slug: "stay-mindful-and-be-resourceful", description: "Everyday habits that keep money on track." },
    ],
  },
];

/**
 * Thin wrapper: deep guide markdown is produced by write-deep-guides.mjs.
 * Prefer: npm run generate:articles
 */
const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  console.log(
    "Delegating to scripts/write-deep-guides.mjs (deep ClearMoney guides)…",
  );
  const { writeGuides } = await import("./write-deep-guides.mjs");
  writeGuides();
}
