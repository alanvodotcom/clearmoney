/**
 * Writes deep, topic-specific ClearMoney markdown guides from inventory.
 * Run: node scripts/write-deep-guides.mjs
 * SKIP_EXISTING=1 — skip any file that already exists (joint-accounts always preserved).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { inventory } from "./generate-articles.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const GUIDES_ROOT = path.join(root, "content", "guides");
const UPDATED = "2026-08-03";
const SKIP_EXISTING = process.env.SKIP_EXISTING === "1";
const GOLD_REL = path.join(
  "banking-budgeting",
  "banking",
  "joint-accounts.md",
);

const URGENT_HUBS = new Set([
  "managing-debt",
  "financial-scams",
  "check-report",
  "online-safety",
  "natural-disasters",
]);

const URGENT_SLUG_RE =
  /urgent|hardship|scam|abuse|debt-collector|bankruptcy|repossess|payday|identity-theft|fraud/;

function yamlList(items) {
  if (!items?.length) return "[]";
  return `\n${items.map((i) => `  - ${i}`).join("\n")}`;
}

function yamlQuote(str) {
  return JSON.stringify(String(str));
}

function frontmatter(guide, pillar, hub, relatedGuides) {
  const tags = guide.tags?.length
    ? guide.tags
    : [hub.replace(/-/g, " ")];
  const tools = guide.tools?.length ? guide.tools : undefined;
  return `---
title: ${yamlQuote(guide.title)}
description: ${yamlQuote(guide.description || guide.title)}
pillar: ${pillar}
hub: ${hub}
slug: ${guide.slug}
updated: "${UPDATED}"
tags: ${yamlList(tags)}
${tools ? `relatedTools: ${yamlList(tools)}\n` : ""}relatedGuides: ${yamlList(relatedGuides)}
---`;
}

function toolLabel(id) {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function toolsBlock(guide) {
  if (!guide.tools?.length) return "";
  const lines = guide.tools
    .map((id) => `- [${toolLabel(id)}](/tools/${id})`)
    .join("\n");
  return `## Related tools\n\nClearMoney calculators that pair with **${guide.title}**:\n\n${lines}\n\n`;
}

function needsUrgent(hub, slug) {
  return URGENT_HUBS.has(hub) || URGENT_SLUG_RE.test(slug);
}

function urgentSentence(hub, slug) {
  if (!needsUrgent(hub, slug)) return "";
  return ` If you cannot cover essentials this week, start at [Urgent help](/urgent).`;
}

function siblingPaths(pillar, hub, siblings, selfSlug) {
  return siblings
    .filter((g) => g.slug !== selfSlug)
    .slice(0, 4)
    .map((g) => `${pillar}/${hub}/${g.slug}`);
}

function nextSteps(bullets) {
  return `## What to do next\n\n${bullets.map((b) => `- ${b}`).join("\n")}\n`;
}

function open(guide, extra = "") {
  const d = (guide.description || guide.title).replace(/\.$/, "");
  return `When Australians search for help with **${guide.title}**, they usually want a clear read on costs, risks, and what to do this week—not a product pitch. In practice that means understanding that ${d.charAt(0).toLowerCase()}${d.slice(1)}. ClearMoney walks through the decision in everyday language, with checks you can actually use.${extra}\n\n`;
}

/** Extra hub-aware depth so each guide lands near 600–900 words without a shared stub. */
function depthBlock(guide, hub, siblings) {
  const t = guide.title;
  const d = guide.description || t;
  const hubLabel = hub.replace(/-/g, " ");
  const others = siblings
    .filter((s) => s.slug !== guide.slug)
    .slice(0, 3)
    .map((s) => s.title);
  const also = others.length
    ? `Nearby guides in this hub—such as ${others.map((x) => `“${x}”`).join(", ")}—cover adjacent decisions you may hit next.`
    : `Other ClearMoney guides in the ${hubLabel} hub cover adjacent decisions you may hit next.`;

  const angle =
    {
      banking:
        "Banking choices are sticky: authorities, debit cards, and direct debits keep working long after you forget how you set them up. Review access and alerts whenever people move in or out of your household.",
      budgeting:
        "Budgets fail when they ignore irregular bills or assume perfect behaviour. Build a plan you can keep on a tired Tuesday, then tighten it once the basics are stable.",
      saving:
        "Saving works best when the money is named and automated. Leftover-at-month-end saving is really lifestyle-first spending in disguise.",
      "work-tax":
        "Work and tax settings change with jobs, side gigs, and family leave. A tidy folder of income records saves more stress in June than any last-minute tip.",
      family:
        "Family money is emotional. Write down agreements about bills and access so you are not renegotiating under pressure every payday.",
      loans:
        "Loans turn future income into today’s purchase. If the repayment only works in a best-case month, the loan is too large.",
      "other-borrowing":
        "Alternative credit often hides cost in late fees, mark-ups, or timing. Add up every dollar you will pay before you swipe or click.",
      "credit-cards":
        "Cards are flexible and expensive when balances linger. Interest-free periods only help if you truly pay in full.",
      "home-loans":
        "Home loans are long commitments. Small rate and fee differences compound for years—compare total cost and features you will actually use.",
      "managing-debt":
        "Debt stress shrinks your options the longer you wait. Early hardship talks and free counselling preserve more pathways than silence.",
      "how-to-invest":
        "Investing is optional until your buffer and high-interest debts are under control. Markets do not owe you a return on any schedule.",
      advice:
        "Advice quality depends on licensing, incentives, and whether the recommendation is personal to you. Ask how the adviser is paid before you share your whole balance sheet.",
      shares:
        "Shares can grow wealth and also fall hard. Diversification and costs matter more than a tip from someone who does not know your goals.",
      "funds-etfs":
        "Pooled products simplify diversification—but fees, strategy, and liquidity still deserve a careful read of the documents.",
      property:
        "Property ties up capital and adds ongoing costs. Run vacancy, rate, and maintenance scenarios before you fall in love with a listing.",
      "interest-investments":
        "Income-style investments still carry credit and rate risk. Higher advertised yields are usually compensation for something.",
      warnings:
        "Hype thrives on urgency and social proof. Slow verification is a feature, not a missed opportunity.",
      retirement:
        "Retirement is a cashflow problem as much as a balance problem. Estimate spending before you celebrate a target number.",
      "how-super-works":
        "Super rules reward patience and punish shortcuts. Illegal early-access offers are a major scam pattern—hang up.",
      "grow-super":
        "Growing super is usually boring on purpose: contributions, fees, and time beat stock tips inside your fund.",
      "plan-retirement":
        "Plans beat vibes. Sequence housing, debt, and income decisions so you are not improvising in the first year off work.",
      "income-sources":
        "Retirement income products trade flexibility for certainty in different ways. Know what you give up before you lock in.",
      "manage-retirement":
        "Longevity, health costs, and scams targeting retirees are the quiet risks after the farewell lunch.",
      "life-insurance":
        "Life-risk cover is about who relies on your income. Definitions in the PDS decide what a claim actually pays.",
      "car-insurance":
        "Car cover is a mix of legal minimums and optional protection. Excess and exclusions change the real price of a claim.",
      "home-insurance":
        "Rebuild cost—not market value—drives building sums insured. Underinsurance shows up on the worst day.",
      "add-on-insurance":
        "Add-ons sold at the counter deserve a pause. Check whether you already have overlapping cover elsewhere.",
      "other-insurance":
        "Travel, health, and funeral products vary widely in value. Read waiting periods and exclusions before you compare premiums alone.",
      "natural-disasters":
        "Disasters scramble documents and decision-making. Preparation and verified contractors matter as much as the policy.",
      "online-safety":
        "Most financial scams start with a believable message and a rushed click. Slowing down is a money skill.",
      "financial-scams":
        "Scammers script urgency. Independent verification on a second channel stops many losses before the transfer.",
      "check-report":
        "Reporting protects others and starts recovery pathways. Banks and official portals beat random “recovery agents.”",
      "unclaimed-money":
        "Unclaimed money searches are slow admin wins. Use official registers and keep proof of identity tidy.",
      teachers:
        "Classroom money skills stick when students practise decisions, not just definitions—and when sales materials stay out.",
      students:
        "Student contracts (phones, rentals, credit) can outlast the semester. Read total cost before you sign.",
      publications:
        "Short tip sheets help when you need a checklist. Escalate complaints with evidence and reference numbers.",
      "first-nations":
        "Culturally safe help, clear account access, and caution on high-cost credit are practical foundations.",
      "your-stories":
        "Stories are encouragement, not a mandatory blueprint. Steal one habit that fits your income and ignore the rest.",
    }[hub] ||
    `Treat “${t}” as a decision with trade-offs—not a quiz you must ace in one sitting.`;

  const slugHint = guide.slug.replace(/-/g, " ");

  return (
    `## Making “${t}” concrete\n\n` +
    `${d.replace(/\.$/, "")}. Within the **${hubLabel}** topic, that usually means translating a vague worry into numbers, documents, and dates. ${angle}\n\n` +
    `Start by writing a one-sentence outcome (“I want to know whether to keep, change, or cancel this”). Then list the constraints you cannot ignore: income timing, dependants, existing debts, or a deadline someone else set. Constraints explain why a tip that worked for a friend may be wrong for you. For “${slugHint}”, those constraints are often more important than the marketing comparison table.\n\n` +
    `## Questions worth answering before you act\n\n` +
    `- What problem does **${t}** solve for me in the next 12 months?\n` +
    `- What does it cost in dollars, time, and flexibility if I am wrong?\n` +
    `- Who else is affected (partner, guarantor, housemate, dependants)?\n` +
    `- What evidence would make me change my mind?\n` +
    `- Which official page or licence register do I need to check?\n\n` +
    `If you cannot answer those questions, you are not “behind”—you are early. Gather statements, contracts, or screenshots before you speak to a salesperson. People who arrive organised hear clearer answers and spot upsells faster. If someone refuses to put key numbers in writing, treat that as information about the offer.\n\n` +
    `## A worked mini-plan for this topic\n\n` +
    `Block 25 minutes. Minute 1–5: write the outcome sentence for **${t}**. Minute 6–15: dump every related balance, rate, due date, or policy number you can find into one note. Minute 16–20: circle the single risk that would hurt most if ignored. Minute 21–25: choose one action you can finish within 48 hours (a call, a cancellation, a transfer, or a comparison). Small finished actions beat large unfinished research projects.\n\n` +
    `## Habits that keep this decision healthy\n\n` +
    `Revisit **${t}** when income, health, housing, or relationships change—not only when an ad retargets you. Keep a simple note of why you chose what you chose; future-you will forget the context. Prefer written confirmations over phone promises. ${also}\n\n` +
    `ClearMoney is general information for Australia, not personal financial advice. Rules, rates, and eligibility change. Confirm details on official sources, and get licensed or free counselling help when the stakes are high.${needsUrgent(hub, guide.slug) ? " If essentials are at risk, use [Urgent help](/urgent)." : ""}\n\n`
  );
}

/* ——— Hub body builders ——— */

function bankingBody(guide, pillar, hub, siblings) {
  const { title, slug } = guide;
  const lower = title.toLowerCase();
  let what = "";
  let how = "";
  let benefits = "";
  let risks = "";
  let setup = "";

  if (slug.includes("transaction") || slug.includes("debit")) {
    what = `A **transaction account** is your everyday money hub: pay comes in, bills leave, and a debit card spends from the same balance. Unlike credit, you are spending your own funds (or a small arranged overdraft if you have one). Debit cards are convenient, but fees, ATM networks, and “payWave” habits can quietly drain a budget if you never look at the statement.`;
    how = `Banks and credit unions compete on monthly fees, ATM access, and app features. Some waive account fees if you deposit a minimum each month; others are free but charge for paper statements or certain transfers. Debit cards usually process instantly for purchases; some merchants place temporary holds (fuel, hotels) that reduce available balance until they clear. International purchases may add currency conversion margins on top of any foreign transaction fee.`;
    benefits = `Keeping day-to-day spending in one account makes it easier to spot leaks. A linked savings account (without a card, or with card spending blocked) creates a speed bump before you raid long-term money. Many people also use account nicknames and spending categories in the banking app so “groceries” and “subscriptions” are obvious at a glance.`;
    risks = `Fee traps include monthly account fees you do not notice, ATM fees outside your network, and overdrawn-account charges when a direct debit hits an empty balance. Card details stolen in a breach or skimmed at a terminal can lead to unauthorised transactions—report quickly. Sharing your PIN or approving remote-access “bank help” calls is a common scam path.`;
    setup = `Compare fee schedules side by side, not just the headline “fee-free” claim. Turn on transaction alerts for amounts above a threshold you choose. If you switch banks, map every direct debit and scheduled payment first so nothing bounces mid-move.`;
  } else if (slug.includes("savings-account")) {
    what = `A **savings account** is designed to hold money you are not spending this week—emergency buffers, holidays, or a house deposit. Bonus interest rates often come with conditions: a minimum deposit, no withdrawals, or a linked transaction account. Miss a condition and the rate can drop to a much lower base.`;
    how = `Interest is usually calculated on the daily balance and paid monthly. Introductory or bonus rates are marketing tools: read the product disclosure for how long the bonus lasts and what resets it. Some accounts limit withdrawals per month; others allow unlimited access but pay less. Keeping savings in a separate product reduces the temptation to spend them with the same debit card you use for coffee.`;
    benefits = `Separating savings from everyday money is one of the simplest behavioural wins in personal finance. Visible progress toward a named goal (deposit, car, buffer) keeps motivation higher than a vague “spare cash” balance. Automation—transferring on payday—beats relying on leftover money at month end.`;
    risks = `Chasing the highest advertised rate without reading conditions can leave you worse off if you withdraw once and lose the bonus for months. Multiple micro-accounts can also create confusion about where the emergency fund actually lives. Online-only banks can be excellent value, but check how you would deposit cash or resolve disputes if something goes wrong.`;
    setup = `Decide the goal and a target balance first. Open (or rename) one savings account for that goal, set an automatic transfer the day after payday, and review the rate conditions every time your bank emails a “rate change” notice.`;
  } else if (slug.includes("direct-debit")) {
    what = `A **direct debit** lets a business pull money from your account on a schedule—rent, gym, utilities, insurance, or streaming. It is convenient when cashflow is predictable; it is stressful when a payment hits before payday or after you thought you cancelled.`;
    how = `You authorise a biller with your BSB and account number (or card details for some recurring card payments). The biller initiates the pull; your bank pays if funds are available. Cancellations usually require contacting the biller *and* checking the bank’s list of active authorities. Some providers make cancellation deliberately hard—keep confirmation emails.`;
    benefits = `On-time bills protect your credit record and avoid late fees. Automation removes the mental load of remembering due dates. Grouping debits a few days after payday can align cashflow so the account is funded when pulls land.`;
    risks = `Forgotten subscriptions, duplicate charities, and old gym contracts are classic leaks. A failed debit can trigger merchant fees *and* bank dishonour fees. If someone else has authority on a joint account, they may set up debits you did not expect.`;
    setup = `Once a quarter, export or screenshot every direct debit and recurring card payment. Cancel what you do not use, move essential debits to the day after payday, and keep a one-page list of who to call to cancel each one.`;
  } else if (slug.includes("overseas") || slug.includes("sending-money")) {
    what = `**Sending money overseas** means moving Australian dollars into another currency for family support, education fees, or buying property abroad. The headline fee is rarely the full cost—the exchange rate margin often matters more.`;
    how = `Banks, money transfer operators, and specialist FX providers quote a rate and a fee. Compare the *amount the recipient receives* for a fixed AUD send, not the fee alone. Transfers can be bank-to-bank, cash pickup, or mobile wallet depending on the corridor. Timing, identity checks, and receiving-bank details (IBAN, SWIFT) all affect speed and success.`;
    benefits = `Specialist providers often beat big-bank retail FX margins for common corridors. Scheduling regular remittances can lock in a process so you are not rushing at the last minute. Keeping records helps for tax or gift documentation if amounts are large.`;
    risks = `Scammers impersonate relatives in crisis and push urgent overseas transfers—verify through a second channel. Informal transfer networks can be cheaper but may lack consumer protections. Wrong account details can delay or lose funds. Large transfers may trigger bank security holds.`;
    setup = `For a non-urgent transfer, get quotes from your bank and at least two specialists on the same day. Confirm the recipient’s exact bank details in writing. Send a small test amount first if the corridor or provider is new to you.`;
  } else if (slug.includes("unauthorised") || slug.includes("mistaken")) {
    what = `**Unauthorised or mistaken transactions** cover money leaving your account without your genuine consent—or a payment you sent to the wrong person. Acting fast improves your chances of recovery; waiting rarely helps.`;
    how = `Contact your bank immediately via a number *you look up*, not one from a text. Ask them to freeze cards, reverse or recall the payment if possible, and issue a dispute reference. For mistaken internet transfers, Australian banks have processes to contact the receiving bank; success depends on whether funds remain. Keep a timeline of calls, chat logs, and screenshots.`;
    benefits = `Early reporting can stop further theft, trigger card reissue, and start chargeback or mistaken-payment pathways. Documenting everything supports complaints to AFCA later if the bank’s response is inadequate.`;
    risks = `Scammers who gain remote access may also change your contact details so bank alerts go to them. Admitting a password or one-time code to a “bank officer” can weaken your position in a dispute. Do not keep using a compromised device for banking until it is cleaned.`;
    setup = `Save your bank’s official fraud number in your phone now. If money is missing: call the bank, change passwords from a clean device, and write a one-page incident summary the same day.`;
  } else {
    what = `**${title}** sits in everyday banking: how money moves, who can access it, and what protections you have when something goes wrong. Getting the account setup right matters as much as the interest rate.`;
    how = `Australian banks and credit unions offer products with different fee schedules, digital tools, and dispute pathways. Read the terms for who can operate the account, how notifications work, and what happens if a payment fails. Keep BSB and account details private in the same way you protect card numbers.`;
    benefits = `Clear account design—everyday spending separate from savings, alerts on, and known direct debits—reduces surprise fees and makes budgeting honest. Knowing how to escalate a problem (bank complaints, then AFCA) is part of being banking-literate.`;
    risks = `Shared access, weak passwords, phishing, and forgotten authorities create most banking headaches. Relationship changes (separation, housemates moving out) are high-risk moments for joint or shared setups.`;
    setup = `Review account authorities, cards on the account, and scheduled payments at least twice a year—or whenever your household changes.`;
  }

  return (
    open(guide) +
    `## What it is\n\n${what}\n\n` +
    `## How it works\n\n${how}\n\n` +
    `## Benefits\n\n${benefits}\n\n` +
    `## Risks and traps\n\n${risks}\n\n` +
    `## How to set up or fix it\n\n${setup}\n\n` +
    toolsBlock(guide) +
    nextSteps([
      `Write one sentence describing why you care about ${lower} right now.`,
      "List every account, card, and direct debit involved—then close or cancel what you do not need.",
      siblings[0] && siblings[0].slug !== slug
        ? `Read the sibling guide on ${siblings.find((s) => s.slug !== slug)?.title || "related banking"} for the next decision.`
        : "Compare fees and conditions on your bank’s site, not just an ad.",
      "Turn on balance and large-transaction alerts this week.",
      "Keep written confirmation whenever you open, close, or change an authority.",
    ])
  );
}

function budgetingBody(guide, pillar, hub, siblings) {
  const { title, slug } = guide;
  let why = "";
  let method = "";
  let traps = "";
  let tools = "";

  if (slug.includes("how-to-do-a-budget") || slug === "how-to-do-a-budget") {
    why = `A budget is not a punishment spreadsheet—it is a map of where money actually goes so you can choose what to change. Without one, “I earn enough” and “I have nothing left” can both feel true.`;
    method = `1. List take-home income for a typical month (average the last three if pay varies).\n2. List fixed essentials: rent/mortgage, utilities, transport, groceries, minimum debt payments, insurance.\n3. List flexible spending: eating out, subscriptions, hobbies.\n4. Subtract. The gap (positive or negative) is your starting truth.\n5. Assign every leftover dollar a job: buffer, goal, or debt—before lifestyle upgrades.`;
    traps = `Budgets fail when they use fantasy grocery numbers, ignore annual bills (rego, insurance), or require perfection. A budget that assumes zero coffee forever usually collapses in week two. Build a small “fun” line so the plan survives real life.`;
  } else if (slug.includes("track")) {
    why = `Tracking spending turns vague guilt into specific choices. Most people underestimate small recurring spends and overestimate rare big ones.`;
    method = `Pull 30–90 days of statements. Tag each line into categories you care about (housing, food, transport, subscriptions, debt). Spot the top three categories you did not expect. Decide one change per category—not ten. Re-check in a month.`;
    traps = `Tracking every cent forever burns people out. A monthly review of categories beats daily receipt agony for most households. Ignoring cash and “buy now pay later” instalments hides the real picture.`;
  } else if (slug.includes("cost-of-living") || slug.includes("low-income")) {
    why = `When prices rise faster than income, budgeting shifts from optimisation to triage: protect essentials, cut high-cost credit, and find support early.`;
    method = `Rank costs: housing and energy first, then food and transport, then everything else. Call providers about hardship or payment plans before you miss a payment. Check concessions and energy comparison options. Free financial counselling can help negotiate and prioritise.`;
    traps = `High-interest credit to “smooth” a shortfall often deepens the hole. Skipping insurance or medical care to free cash can create larger bills later. Shame delays help-seeking—counsellors have seen every situation.`;
  } else if (slug.includes("casual")) {
    why = `Casual and variable income breaks monthly budgets that assume a fixed payday. The goal is to average good weeks into a baseline and protect bad weeks.`;
    method = `Estimate a conservative monthly income (for example, your lowest recent month, or 70% of a good month). Budget essentials to that floor. Park surplus from strong weeks into a holding account labelled “lean weeks.” Review every four weeks, not every pay if pays are irregular.`;
    traps = `Lifestyle rising with the best weeks is the classic trap. Committing to long contracts (phone, car, gym) on a peak-pay basis creates stress in quiet months.`;
  } else if (slug.includes("food") || slug.includes("fuel") || slug.includes("energy")) {
    why = `Food, fuel, and energy are large, recurring costs—small percentage cuts free meaningful cash without touching rent.`;
    method = `For food: plan dinners before shopping, use a list, and cut waste. For fuel: combine trips, check tyre pressure, and compare supermarket fuel offers carefully. For energy: compare plans, understand peak rates, and tackle draughts and standby power before buying gadgets.`;
    traps = `Extreme couponing that costs time and stress, or switching energy plans without checking exit fees and solar feed-in rates. “Saving” that increases takeaway because cooking feels harder is not saving.`;
  } else if (slug.includes("sales-pressure")) {
    why = `Sales pressure turns a maybe into a signed contract before you have compared alternatives. Cooling-off rights help—but prevention is cheaper.`;
    method = `Use a personal rule: no same-day decisions above a dollar limit you set. Ask for the total cost in writing, including interest and fees. Leave, sleep on it, and compare at least one other option. Know door-to-door and unsolicited consumer agreement cooling-off rules that may apply.`;
    traps = `“Today-only” discounts, friendship pitches, and finance paperwork rushed at a dealership. Signing to “just hold the deal” still binds you.`;
  } else {
    why = `**${title}** is about making limited money cover what matters most without constant crisis mode.`;
    method = `Name the problem in one line. Gather income and the last month of spending. Choose one lever: cut a cost, raise income, or reschedule a bill. Measure the change after two weeks.`;
    traps = `Trying to fix everything simultaneously. Ignoring irregular bills. Using credit as income.`;
  }

  tools = guide.tools?.length
    ? `Use ClearMoney tools such as ${guide.tools.map((id) => `[${id}](/tools/${id})`).join(" and ")} to turn guesses into numbers you can trust.`
    : `A simple notebook or spreadsheet is enough—consistency beats fancy software.`;

  return (
    open(guide) +
    `## Why it matters\n\n${why}\n\n` +
    `## Step-by-step method\n\n${method}\n\n` +
    `## Common traps\n\n${traps}\n\n` +
    `## Tools that help\n\n${tools} Revisit numbers when rent, hours, or household size changes—not only on New Year’s Day.\n\n` +
    toolsBlock(guide) +
    nextSteps([
      "Block 30 minutes this week to list income and essential costs.",
      "Pick one category to change and one number that will prove it worked.",
      "Put annual bills (rego, insurance) into monthly sinking amounts.",
      needsUrgent(hub, slug)
        ? "If essentials are at risk, open [Urgent help](/urgent) before taking high-cost credit."
        : "Share the plan with anyone who shares the household money.",
      siblings.find((s) => s.slug !== slug)
        ? `Skim “${siblings.find((s) => s.slug !== slug).title}” for a related angle.`
        : "Schedule a monthly 20-minute money check-in.",
    ])
  );
}

function savingBody(guide) {
  const { title, slug } = guide;
  let why = "";
  let howMuch = "";
  let where = "";
  let auto = "";

  if (slug.includes("emergency")) {
    why = `An emergency fund is money for job loss, urgent car repairs, or essential medical gaps—not for sales. It buys time so you do not reach for payday credit.`;
    howMuch = `A common starting target is $1,000, then one month of essential costs, then building toward three months if your income is stable. Casual workers often aim higher because income gaps are more likely. Perfect is the enemy of started: a partial buffer still helps.`;
    where = `Keep the fund in a separate high-interest savings account you can access in 24 hours—not shares, not crypto, not a term deposit you cannot break without pain.`;
    auto = `Automate a transfer the day after payday. Name the account “Emergency—do not touch.” Refill it after you use it before restarting other goals.`;
  } else if (slug.includes("house") || slug.includes("home") || slug.includes("deposit")) {
    why = `A house deposit is a multi-year project for most people. Clear targets and genuine savings history matter to lenders as much as the raw balance.`;
    howMuch = `Deposit size depends on price, lender rules, and whether lenders mortgage insurance applies. Add stamp duty, conveyancing, and moving costs—buying costs are not just the deposit.`;
    where = `Use a dedicated savings account (or offset if you already have a mortgage strategy that fits). Avoid speculative investments for money you need within a few years.`;
    auto = `Increase automated transfers whenever income rises. Track progress monthly so lifestyle creep does not silently cancel the plan.`;
  } else if (slug.includes("compound")) {
    why = `Compound interest is interest earning interest. It grows savings helpfully—and grows debts painfully when you only pay minimums.`;
    howMuch = `Time and rate both matter. Starting earlier with smaller amounts often beats starting later with heroic sums. On debt, the same math works against you.`;
    where = `Everyday compounding shows up in savings accounts and term deposits; investment returns compound differently and are not guaranteed.`;
    auto = `Automate contributions so compounding has deposits to work on. Check fees that can quietly offset gains.`;
  } else if (slug.includes("start") || slug.includes("simple-ways")) {
    why = `Starting to save beats waiting for a perfect surplus. Small automated amounts create proof you can do it—then you scale.`;
    howMuch = `Begin with an amount you will not notice in week one (even $20–$50). After four weeks, raise it. Pair saving with one spending cut so the money is real.`;
    where = `A separate savings account with no debit card removes friction the wrong way (temptation) and adds friction the right way (pause before spending).`;
    auto = `Payday automation is the whole game. If pay varies, automate a percentage instead of a fixed dollar amount.`;
  } else {
    why = `**${title}** is about turning intention into balances you can see. Saving without a purpose account often gets spent.`;
    howMuch = `Tie the amount to a goal date: divide the target by months remaining for a weekly or fortnightly number.`;
    where = `Match the account to the timeline—accessible cash for near goals, longer products only when you understand exit costs.`;
    auto = `Automate first; budget the remainder. Review rates when banks change bonus conditions.`;
  }

  return (
    open(guide) +
    `## Why save for this\n\n${why}\n\n` +
    `## How much to aim for\n\n${howMuch}\n\n` +
    `## Where to keep the money\n\n${where}\n\n` +
    `## Automation that sticks\n\n${auto}\n\n` +
    toolsBlock(guide) +
    nextSteps([
      `Name the goal behind “${title}” in six words or fewer.`,
      "Open or rename a dedicated account this week.",
      "Set an automatic transfer for the next payday.",
      "Write the conditions of any bonus interest rate in your notes app.",
      "Celebrate milestones (25%, 50%) without draining the balance.",
    ])
  );
}

function workTaxBody(guide) {
  const { title, slug } = guide;
  let how = "";
  let check = "";
  let records = "";
  let mistakes = "";

  if (slug.includes("income-tax") || slug === "income-tax") {
    how = `Australia taxes most employment and business income progressively: higher slices of income face higher marginal rates. The Medicare levy generally applies as well. Employers withhold Pay As You Go (PAYG) amounts from salary so you are not left with a huge bill at year end—though refunds or debts still happen when the annual return is lodged.`;
    check = `Check your tax file number is correct with the employer, review withholding if you have two jobs, and understand offsets or deductions you might claim. Thresholds and rates change—confirm current figures on official ATO pages before making big decisions.`;
    records = `Keep payment summaries/income statements, deduction receipts, and private health documentation if relevant. Digital folders named by financial year beat a shoebox in June.`;
    mistakes = `Claiming deductions without records, ignoring side-gig income, and assuming a tax refund means you “won” (it often means you over-withheld) are common.`;
  } else if (slug.includes("lodging") || slug.includes("tax-return")) {
    how = `Most people lodge online through myGov linked to the ATO, or via a registered tax agent. Deadlines differ if you use an agent. The return reconciles income, tax already withheld, deductions, and private health/Medicare settings.`;
    check = `Wait for pre-fill data where possible, but still verify every figure. Include all income sources: employment, bank interest, shares, crypto, and foreign income if applicable.`;
    records = `Keep records for five years in many cases. Photograph receipts as you go. Note work-from-home methods if you claim them—rules have changed over time.`;
    mistakes = `Missing income that the ATO already knows about, last-minute lodgement without documents, and paying for “max refund” marketing that pushes aggressive claims.`;
  } else if (slug.includes("accountant")) {
    how = `A registered tax agent or accountant can help when affairs are complex: investments, rentals, business structures, or overseas income. Simple salary-and-bank-interest returns may not need paid help.`;
    check = `Confirm registration, fee structure (fixed vs hourly), what is included, and how they handle ATO queries. Ask whether they will represent you if something is reviewed.`;
    records = `Arrive organised: income statements, prior-year return, and a list of questions. Messy shoeboxes cost you in fees.`;
    mistakes = `Choosing solely on “biggest refund” ads, or never asking how deductions are justified.`;
  } else if (slug.includes("salary-packaging")) {
    how = `Salary packaging (salary sacrifice) redirects pre-tax pay into certain benefits—common in some not-for-profit and hospital settings—subject to rules and caps. It can help, but only if the benefit and fees beat taking the cash.`;
    check = `Model take-home pay with and without packaging. Include packaging fees and any impact on leave loading or future borrowing assessments.`;
    records = `Keep packaging agreements and annual summaries with your tax records.`;
    mistakes = `Packaging things you would not otherwise buy, or ignoring that some benefits affect centrelink or loan serviceability differently.`;
  } else if (slug.includes("self-employment")) {
    how = `Self-employed people handle GST (if registered), income tax instalments, super contributions, and separating business versus personal spending. Cashflow planning matters as much as tax rates.`;
    check = `Know your GST turnover threshold obligations, set aside tax from every invoice, and decide a super contribution habit even when business is quiet.`;
    records = `Use a separate business account. Keep invoices, expense evidence, and BAS workings.`;
    mistakes = `Spending gross invoice amounts, mixing personal expenses, and ignoring super until “later.”`;
  } else if (slug.includes("losing-your-job")) {
    how = `Job loss triggers final pay (wages, leave, sometimes redundancy). Tax treatment of employment termination payments can differ from regular salary—read the payment summary carefully.`;
    check = `Confirm entitlements in writing, update your budget within a week, claim income support if eligible, and pause non-essential direct debits.`;
    records = `Keep termination letters, payslips, and Centrelink correspondence.`;
    mistakes = `Raiding super illegally, ignoring creditor calls, or waiting until accounts bounce before seeking hardship help.`;
  } else if (slug.includes("baby") || slug.includes("returning-to-work")) {
    how = `Returning to work after parental leave reshapes childcare costs, tax withholding, and household cashflow. Leave balances and government payments may also change.`;
    check = `Rebuild a budget with childcare as a fixed cost. Update tax file number declarations if needed. Check whether salary packaging or flexible work changes net pay.`;
    records = `Keep childcare invoices and leave approvals.`;
    mistakes = `Underestimating casual care days and commuting costs; forgetting to restart automated savings.`;
  } else if (slug.includes("payslip") || slug.includes("first-payslip")) {
    how = `A payslip shows gross pay, tax withheld, super contributions, and net (“take-home”) pay. Understanding each line prevents confusion when comparing job offers or spotting underpayment.`;
    check = `Verify hours, pay rate, tax, and super guarantee amounts. Ask payroll early if something looks wrong—delays make fixes harder.`;
    records = `Save every payslip for the financial year.`;
    mistakes = `Looking only at net pay when comparing jobs; ignoring super as part of total reward.`;
  } else {
    how = `**${title}** sits at the intersection of work income and Australian tax settings. Rules and thresholds change—treat this as a map, then confirm details on official sources.`;
    check = `List the decisions you need (withholding, deductions, structure) and the dates that matter (lodgement, BAS, payday).`;
    records = `Keep income evidence and claim support documents by financial year.`;
    mistakes = `Guessing instead of checking, and mixing personal advice marketing with general information.`;
  }

  return (
    open(guide) +
    `## How it works in Australia\n\n${how}\n\n` +
    `## What to check\n\n${check}\n\n` +
    `## Records worth keeping\n\n${records}\n\n` +
    `## Common mistakes\n\n${mistakes}\n\n` +
    toolsBlock(guide) +
    nextSteps([
      `Note the financial-year deadlines that affect “${title}".`,
      "Create or tidy a digital folder for this year’s income documents.",
      "Confirm figures against official ATO information before acting.",
      "If your situation is complex, ask a registered agent specific questions—not social media.",
      "Revisit withholding or set-asides when income changes.",
    ])
  );
}

function familyBody(guide) {
  const { title, slug } = guide;
  let overview = "";
  let conversations = "";
  let checklist = "";
  let help = "";

  if (slug.includes("financial-abuse")) {
    overview = `Financial abuse is when someone controls or exploits your money to limit freedom—blocking access to accounts, forcing debt, or monitoring every purchase with intimidation. It is a form of family and domestic violence.`;
    conversations = `Safety comes before money lectures. If it is safe, document access to accounts and important numbers from a trusted device. Trusted friends, family, or specialists can help plan exits that include money access.`;
    checklist = `Secure a sole account if safe to do so, change passwords from a clean device, keep copies of ID and key documents, and know how joint account authorities work. Note debts in your name.`;
    help = `Contact 1800RESPECT (1800 737 732) for confidential support. Banks increasingly have specialist hardship and family-violence pathways—ask for them. Free legal and financial counselling services can help with debts and safety planning.`;
  } else if (slug.includes("divorced") || slug.includes("separation") || slug.includes("divorce")) {
    overview = `Separation rearranges housing, bills, debts, super, and parenting costs—often under emotional stress. Early practical steps protect both safety and future options.`;
    conversations = `Agree (in writing where possible) who pays which bills in the short term. Avoid informal promises about the house or super without advice when amounts are large.`;
    checklist = `List accounts, loans, assets, and super. Redirect income to a sole account you control. Update beneficiaries where appropriate. Gather statements for the last 12 months.`;
    help = `Family relationship services, community legal centres, and financial counsellors can help. Property and super splits often need proper legal process—not just bank transfers.`;
  } else if (slug.includes("baby") || slug.includes("pet") || slug.includes("school")) {
    overview = `**${title}** usually means new recurring costs plus some one-off setup spend. Optimism bias underestimates the ongoing line items.`;
    conversations = `Agree who pays for what before the cost arrives. For kids and pets, discuss lifestyle changes (work hours, insurance, emergency buffers) as money topics—not only cute logistics.`;
    checklist = `Price the first year honestly: setup gear, ongoing food/care, and a contingency. Update the household budget and emergency fund target.`;
    help = `Compare free community resources (toy libraries, school second-hand shops, bulk-billing where relevant) before financing purchases.`;
  } else if (slug.includes("teaching-kids") || slug.includes("kids")) {
    overview = `Kids learn money from what adults do more than from lectures. Age-appropriate pocket money, waiting for purchases, and talking about needs versus wants build lifelong habits.`;
    conversations = `Keep talks calm and concrete: saving for a toy, comparing prices, noticing ads. Avoid shame language around money mistakes.`;
    checklist = `Pick one habit to practise this month (save a portion of pocket money, price-compare a purchase, or track a small goal).`;
    help = `School and community financial literacy resources can reinforce home conversations without selling products.`;
  } else if (slug.includes("illness") || slug.includes("partner") || slug.includes("older")) {
    overview = `Health changes, bereavement, and ageing shift income, insurance, and who makes decisions. Administrative load spikes when energy is lowest.`;
    conversations = `Ask permission before taking over someone’s money management. Clarify powers of attorney and key account access *before* a crisis when possible.`;
    checklist = `Locate insurance policies, super nominations, wills, and bill lists. Note upcoming renewals and direct debits.`;
    help = `Centrelink, insurers, funeral support services, and financial counsellors each cover different pieces—you rarely need to solve it alone in one afternoon.`;
  } else {
    overview = `**${title}** is as much about communication and power dynamics as it is about products. Money styles collide in shared households.`;
    conversations = `Talk early about goals, debts, spending autonomy, and what “ours” versus “mine” means. Short, regular check-ins beat rare blow-ups.`;
    checklist = `List shared bills, individual debts, and access to accounts. Agree a simple rule for spending above a set amount without a chat.`;
    help = `If conversations are unsafe or controlling, that is a safety issue—see financial abuse support pathways, not just budgeting tips.`;
  }

  const urgent =
    slug.includes("abuse") || slug.includes("illness") || slug.includes("divorced")
      ? urgentSentence("managing-debt", slug)
      : "";

  return (
    open(guide, urgent) +
    `## Situation overview\n\n${overview}\n\n` +
    `## Money conversations\n\n${conversations}\n\n` +
    `## Practical checklist\n\n${checklist}\n\n` +
    `## Where to get help\n\n${help}\n\n` +
    toolsBlock(guide) +
    nextSteps([
      "Write down the household money decision that feels most urgent.",
      "Book a calm 20-minute talk—or a support call if talking at home is unsafe.",
      "List accounts, debts, and upcoming bills on one page.",
      "Update direct debits and account access if living arrangements change.",
      "Keep copies of key documents in a place only you control if needed.",
    ])
  );
}

function borrowingBody(guide, hub) {
  const { title, slug } = guide;
  const isCard = hub === "credit-cards";
  const isHome = hub === "home-loans";
  const isOther = hub === "other-borrowing";

  let what = `**${title}** is a form of borrowed money with a price—interest, fees, or both—and rules for repayment.`;
  let costs = `Compare the comparison rate or total amount repayable where available, not only the advertised rate. Include establishment fees, ongoing fees, and early exit costs.`;
  let risks = `Missing payments damages credit files and adds fees. Borrowing more than your surplus can handle turns a useful tool into long-term stress.`;
  let alternatives = `Paying from savings, delaying the purchase, negotiating a smaller scope, or using a lower-cost credit option may beat the first offer you see.`;
  let checklist = `1. Name the purpose and the maximum you will borrow.\n2. Check the weekly repayment against a realistic budget.\n3. Read default and hardship clauses.\n4. Avoid add-on insurance you do not understand.\n5. Keep the contract and payoff quote pathway.`;

  if (slug.includes("payday")) {
    what = `Payday and similar small-amount credit can feel like the only option for a shortfall—but fees make a small loan expensive very quickly.`;
    costs = `Look at the total cost to borrow, not the dollar amount advanced. Repeat borrowing is where harm compounds.`;
    risks = `Debt cycles, multiple loans, and using credit for ongoing living costs rather than a one-off gap.`;
    alternatives = `Free financial counselling, hardship requests on existing bills, payment plans, and community NILS-style loans for essential goods are safer first calls. See [Urgent help](/urgent).`;
  } else if (slug.includes("guarantor")) {
    what = `Going guarantor means you promise to pay if the borrower does not. It is not a character reference—it is a legal liability.`;
    costs = `Your borrowing capacity and equity can be affected even if you never miss a payment yourself.`;
    risks = `Relationship damage, forced sale scenarios, and credit damage if the primary borrower defaults.`;
    alternatives = `Smaller loan amounts, longer saving time, or lenders that do not require a guarantor.`;
  } else if (isCard) {
    what = `Credit cards offer revolving credit with interest-free periods if you pay in full—and expensive interest if you do not.`;
    costs = `Purchase rates, cash advance rates, annual fees, and reward opportunity cost all matter. Balance transfer offers have windows and fees.`;
    risks = `Minimum repayments stretch balances for years. Multiple cards raise temptation and utilisation on credit files.`;
    alternatives = `A debit card plus sinking fund, or a fixed-term personal loan for a planned purchase, can be clearer than revolving credit.`;
  } else if (isHome) {
    what = `Home loans are large, long-term debts secured against property. Features like offsets, redraw, fixed periods, and packages change the real cost.`;
    costs = `Compare comparison rates, package fees, discharge fees, and break costs on fixed rates. A tiny rate difference compounds over decades.`;
    risks = `Overborrowing against optimistic income, interest-only cliffs, and hardship if rates or jobs change.`;
    alternatives = `Smaller purchase price, longer saving for deposit, or delaying buy versus rent decisions until the budget has spare capacity.`;
  } else if (isOther || slug.includes("bnpl") || slug.includes("buy-now") || slug.includes("lease") || slug.includes("interest-free") || slug.includes("pay-advance")) {
    what = `**${title}** sits outside traditional personal loans—often marketed as easy or fee-light while shifting cost into late fees, mark-ups, or wage timing.`;
    costs = `Add up every instalment, late fee, and account fee. For leases, compare total payable versus buying outright.`;
    risks = `Stacked BNPL plans, deferred interest traps after “interest-free” periods, and dependence on pay advances.`;
    alternatives = `Wait, save a sinking fund, or use a transparent low-rate product only if the purchase is necessary.`;
  } else if (slug.includes("car-loan")) {
    what = `Car loans finance a depreciating asset. Dealer finance can be convenient and expensive at the same time.`;
    costs = `Compare bank/credit-union loan total cost versus dealer offers including balloon payments.`;
    risks = `Negative equity, balloons you cannot refinance, and add-on products sold in the finance office.`;
  }

  return (
    open(guide, needsUrgent(hub, slug) || slug.includes("payday") ? urgentSentence("managing-debt", slug) : "") +
    `## What it is\n\n${what}\n\n` +
    `## Costs to compare\n\n${costs}\n\n` +
    `## Risks\n\n${risks}\n\n` +
    `## Alternatives\n\n${alternatives}\n\n` +
    `## Checklist before you sign\n\n${checklist}\n\n` +
    toolsBlock(guide) +
    nextSteps([
      "Write the purpose of the borrowing in one line—and a maximum dollar amount.",
      "Price at least two options using total cost, not marketing rate alone.",
      "Test the repayment in your budget for a ‘bad month,’ not a best month.",
      "Remove add-ons you do not understand before signing.",
      "Save the hardship contact path from the contract in your notes.",
    ])
  );
}

function managingDebtBody(guide) {
  const { title, slug } = guide;
  let act = "";
  let prioritise = "";
  let freeHelp = "";
  let rights = "";

  if (slug.includes("urgent")) {
    act = `When you cannot cover rent, food, medicine, or power, treat it as urgent—not embarrassing. Stabilise essentials first; optimisation comes later. Start at [Urgent help](/urgent).`;
    prioritise = `Housing and energy before discretionary debt. Call providers early for hardship. Pause non-essential direct debits.`;
  } else if (slug.includes("hardship")) {
    act = `Financial hardship arrangements exist because lenders and utilities know income shocks happen. Asking early usually preserves more options than waiting for default.`;
    prioritise = `Contact each creditor with a simple statement of what changed and what you can pay temporarily. Get agreements in writing.`;
  } else if (slug.includes("counselling") || slug.includes("legal")) {
    act = `Free financial counselling and community legal help can prioritise debts, negotiate, and explain options without selling a loan.`;
    prioritise = `Bring a list of debts, income, and overdue notices. Be honest about all creditors—partial lists lead to weak plans.`;
  } else if (slug.includes("collector")) {
    act = `Debt collectors must follow rules about contact and conduct. You still owe valid debts, but you do not have to accept harassment.`;
    prioritise = `Ask for debt validation in writing. Negotiate through a counsellor if contact feels overwhelming. Keep a call log.`;
  } else if (slug.includes("bankruptcy") || slug.includes("debt-agreement")) {
    act = `Bankruptcy and debt agreements are serious legal options with long consequences for credit and some occupations. They are not a casual “reset button.”`;
    prioritise = `Get free specialised advice before signing anything from a paid debt firm that rushes you.`;
  } else if (slug.includes("credit-repair") || slug.includes("credit-score") || slug.includes("credit-report")) {
    act = `Your credit file records identification data, accounts, and repayment history. Scores are used by lenders—but paid “repair” services often charge for things you can do yourself.`;
    prioritise = `Get your free or low-cost credit report, dispute errors with evidence, and focus on on-time payments going forward.`;
  } else if (slug.includes("consolidation")) {
    act = `Consolidation can help if the new loan’s total cost and term truly improve your position—not just lower the weekly payment by stretching years.`;
    prioritise = `Compare total interest, fees, and whether secured debt puts your home at risk.`;
  } else {
    act = `For **${title}**, acting early beats hoping balances shrink on their own. List every debt with rate, minimum, and arrears status.`;
    prioritise = `Prioritise by urgency (housing, essential utilities, secured debts) and cost (high interest), with a written plan you can follow on a bad week.`;
  }

  freeHelp = `National Debt Helpline (1800 007 007) connects you to free financial counsellors. Community legal centres can help with certain debt and consumer issues. See also [Urgent help](/urgent).`;
  rights = `You generally have rights to hardship consideration, fair collection conduct, and complaint pathways through internal dispute resolution and AFCA for many financial firms. Do not ignore court documents—get advice quickly.`;

  return (
    open(guide, " " + urgentSentence("managing-debt", slug).trim()) +
    `## Act early\n\n${act}\n\n` +
    `## Prioritise what matters most\n\n${prioritise}\n\n` +
    `## Free help\n\n${freeHelp}\n\n` +
    `## Your rights\n\n${rights}\n\n` +
    toolsBlock(guide) +
    nextSteps([
      "List every debt with balances, rates, and due dates today.",
      "Call hardship lines for any essential bill you may miss.",
      "Contact a free financial counsellor before paying for debt firms.",
      "Open [Urgent help](/urgent) if food, housing, or medicine is at risk.",
      "Keep a folder of agreements and complaint reference numbers.",
    ])
  );
}

function investingBody(guide, hub) {
  const { title, slug } = guide;
  let before = `Before you buy anything marketed as an investment, write your goal, time horizon, and how much loss you could tolerate without derailing essentials. Money needed within a few years usually does not belong in volatile assets.`;
  let how = `**${title}** involves putting money at risk expecting a return. Returns are not guaranteed; diversification and costs shape outcomes as much as picking “winners.”`;
  let risks = `Market falls, liquidity traps, scams, leverage, and concentration in one stock or property can all hurt. Complexity is not a virtue.`;
  let fees = `Fees compound against you: brokerage, management fees, advice fees, and spreads. A low-cost option that you understand often beats a flashy product you do not.`;
  let steps = `1. Build an emergency buffer first.\n2. Pay down toxic high-interest debt.\n3. Define the goal and timeframe.\n4. Choose a simple, diversified approach unless you have a clear reason not to.\n5. Document why you bought—so you are less likely to panic-sell on headlines.`;

  if (hub === "advice") {
    before = `Decide whether you need personal advice (tailored to you) or are consuming general information. The distinction affects what an adviser must consider and document.`;
    how = `Licensed advisers provide services under an Australian financial services licence. Advice should be appropriate to your situation when it is personal advice—ask how they are paid and what you receive in writing.`;
    risks = `Conflicted remuneration history, ongoing fees for little contact, and pressure to move products quickly are warning signs.`;
    fees = `Know the advice fee, product commissions if any remain relevant, and exit path. Cheap advice that pushes unsuitable products is not cheap.`;
    steps = `1. Check the adviser’s authorisation on the official register.\n2. Ask about experience with your situation.\n3. Request a clear fee quote.\n4. Read the Statement of Advice carefully.\n5. Keep copies of everything.`;
  } else if (hub === "shares") {
    how = `Shares are ownership slices of companies traded on markets (or offered in floats and crowd-sourced funding). Prices move with news, rates, and sentiment.`;
    risks = `Single-stock risk, IPO hype, employee share concentration, and illiquid CSF offers. Social media tips are not research.`;
  } else if (hub === "funds-etfs") {
    how = `Managed funds and ETFs pool money across assets. You buy units or listed securities rather than building every holding yourself.`;
    risks = `Fee drag, strategy drift, liquidity differences between listed and unlisted products, and misunderstanding distributions versus returns.`;
  } else if (hub === "property") {
    how = `Investment property and property funds expose you to rents, vacancies, rates, maintenance, and interest costs—or to fund-level leverage and fees.`;
    risks = `Concentration in one asset, interest-rate shock, vacancy, and SMSF property rule complexity. Timeshares are often hard to exit.`;
  } else if (hub === "interest-investments") {
    how = `Term deposits, bonds, and hybrids offer income-like returns with different credit and interest-rate risks. Higher yield usually means higher risk.`;
    risks = `Credit default, rate moves affecting bond prices, complexity in hybrids, and early-exit costs on term deposits.`;
  } else if (hub === "warnings") {
    before = `If an opportunity emphasises urgency, guaranteed high returns, or secrecy, pause. Hype is a distribution strategy—not evidence.`;
    how = `**${title}** highlights products or schemes that frequently harm retail investors: leverage, opacity, or outright fraud.`;
    risks = `Total loss, borrowed money magnifying losses, and social-engineering pressure.`;
    fees = `Promoters may profit from courses, spreads, or dumping stock onto late buyers. Your “fee” might be the entire investment.`;
    steps = `1. Hang up on pressure.\n2. Verify licences independently.\n3. Search for regulator alerts.\n4. Never install remote-access software for “advisers.”\n5. Report suspected scams and seek [Urgent help](/urgent) if money already moved.`;
  }

  if (slug.includes("borrow") || slug.includes("leverage") || slug.includes("cfd") || slug.includes("forex")) {
    risks += ` Leverage can wipe out more than your deposit quickly.`;
  }

  return (
    open(guide, hub === "warnings" ? urgentSentence("warnings", "scam") : "") +
    `## Before you start\n\n${before}\n\n` +
    `## How it works\n\n${how}\n\n` +
    `## Risks\n\n${risks}\n\n` +
    `## Fees and costs\n\n${fees}\n\n` +
    `## Practical steps\n\n${steps}\n\n` +
    toolsBlock(guide) +
    nextSteps([
      "Write goal, timeframe, and money you can truly put at risk.",
      "List fees for any product you are considering.",
      "Verify licences and beware guaranteed-return language.",
      "Prefer simplicity unless complexity clearly pays for itself.",
      "Schedule an annual review—not daily price watching.",
    ])
  );
}

function superRetirementBody(guide, hub) {
  const { title, slug } = guide;
  let overview = `**${title}** sits inside Australia’s superannuation and retirement system—long-term money with tax settings, access rules, and investment choices.`;
  let rules = `Super is generally preserved until a condition of release (such as reaching preservation age and retiring). Contribution caps, tax on concessional contributions, and fund insurance defaults are easy to miss. Confirm current thresholds on official sources before acting.`;
  let decisions = `Key decisions include which fund, which investment option, how much to contribute above the compulsory amount, and—later—how to draw an income.`;
  let mistakes = `Multiple forgotten accounts, cancelling insurance without a plan, chasing hot tips inside super, and illegal early-access schemes.`;
  let toolsLine = guide.tools?.length
    ? `ClearMoney tools like ${guide.tools.map((id) => `[${id}](/tools/${id})`).join(", ")} help you model balances and contributions.`
    : `Use your fund’s calculator and official estimators as a starting point—not a promise.`;

  if (hub === "retirement" || hub === "plan-retirement") {
    overview = `Retirement planning connects spending needs, debts, home plans, and income sources—not only a super balance number.`;
    decisions = `When to finish work, whether to downsize, how the Age Pension might interact, and how to sequence drawdowns.`;
  } else if (hub === "grow-super") {
    overview = `Growing super is mostly about time, contributions, fees, and investment risk—not stock tips.`;
    decisions = `Extra contributions, consolidating accounts carefully, and choosing an investment option that matches your horizon.`;
  } else if (hub === "income-sources") {
    overview = `Retirement income can mix account-based pensions, Age Pension, annuities, part-time work, and home equity products—each with trade-offs.`;
    decisions = `Flexibility versus longevity protection; lump sum versus income stream; how means tests may apply.`;
  } else if (hub === "manage-retirement") {
    overview = `Once retired, the job shifts to making money last, handling health and aged-care costs, and staying scam-aware.`;
    decisions = `Drawdown pace, buffers for market dips, and who can help if capacity changes.`;
    mistakes = `Overspending early, underestimating health costs, and trusting cold-call “pension optimisers.”`;
  } else if (hub === "how-super-works") {
    if (slug.includes("smsf")) {
      rules = `SMSFs offer control with significant trustee obligations, costs, and compliance risk. They suit a minority of people with the time, skill, and scale.`;
    } else if (slug.includes("early")) {
      rules = `Early access is tightly limited. Illegal early-access schemes are a major scam vector—treat cold offers as hostile.`;
      mistakes = `Paying promoters to “unlock” super, signing over control of an SMSF, or sending codes to strangers.`;
    }
  }

  return (
    open(guide) +
    `## Overview\n\n${overview}\n\n` +
    `## Key rules in plain language\n\n${rules}\n\n` +
    `## Decisions to make\n\n${decisions}\n\n` +
    `## Mistakes to avoid\n\n${mistakes}\n\n` +
    `## Tools\n\n${toolsLine}\n\n` +
    toolsBlock(guide) +
    nextSteps([
      "Log in to your fund (or myGov) and confirm your balance, fees, and insurance.",
      "Write your expected retirement timing and spending style in rough terms.",
      "Check for lost super and duplicate accounts before contributing extra.",
      "Confirm any strategy against official contribution and preservation rules.",
      "Revisit investment options when your time horizon shortens.",
    ])
  );
}

function insuranceBody(guide, hub) {
  const { title, slug } = guide;
  let cover = `**${title}** is about transferring specific risks to an insurer in exchange for premiums—subject to definitions, exclusions, waiting periods, and excesses.`;
  let pds = `The Product Disclosure Statement (PDS) and policy schedule define what is actually covered. Marketing pages are not the contract. Check definitions (for example flood, total permanent disability, or comprehensive vs third party), exclusions, and claim limits.`;
  let traps = `Underinsurance, duplicate cover, add-ons with poor value, and assuming a claim will be paid the way a friend described theirs.`;
  let claims = `After an incident: prioritise safety, document damage, contact the insurer promptly, keep receipts for emergency expenses, and note claim numbers. Ask what evidence they need before you dispose of damaged goods.`;

  if (hub === "life-insurance") {
    cover = `Life, TPD, trauma, and income protection each pay differently—lump sum versus monthly income—and may sit inside or outside super.`;
    traps = `Default super cover that is too little or too expensive for your age, overlapping policies, and definitions that are harder to meet than you expect.`;
  } else if (hub === "car-insurance") {
    cover = `Car insurance ranges from compulsory third party (state schemes) to comprehensive cover for your vehicle and others’. Excess choices change premiums.`;
    traps = `Shopping on price alone, unused add-ons, and not updating kilometres or parking address.`;
  } else if (hub === "home-insurance") {
    cover = `Building cover should reflect rebuild cost—not market value. Contents cover protects belongings for owners and renters.`;
    traps = `Underinsurance as rebuild costs rise, assuming flood is included, and letting sums insured lag for years.`;
  } else if (hub === "add-on-insurance") {
    cover = `Add-on policies sold with loans, phones, or cars are often optional and sometimes poor value compared with existing cover.`;
    traps = `Buying in a rush at the point of sale, overlapping with home contents, and high excesses relative to device value.`;
  } else if (hub === "natural-disasters") {
    cover = `Disasters test preparation, policy wording, and recovery logistics. Insurance is only one pillar beside documents, kits, and community support.`;
    claims = `Photograph damage, keep a room-by-room inventory if possible, beware unsolicited “disaster chaser” contractors, and ask the insurer about temporary accommodation entitlements.`;
    traps = `Cash settlements that do not rebuild fully, incomplete inventories, and unverified trades knocking on doors.`;
  }

  return (
    open(guide) +
    `## What the cover does\n\n${cover}\n\n` +
    `## What to check in the PDS\n\n${pds}\n\n` +
    `## Common traps\n\n${traps}\n\n` +
    `## Claims tips\n\n${claims}\n\n` +
    toolsBlock(guide) +
    nextSteps([
      "Locate your policy schedule and PDS for this cover type.",
      "Update sums insured, beneficiaries, or vehicle details if life has changed.",
      "Cut add-ons you cannot explain in one sentence.",
      "Store insurer contacts and policy numbers in your phone.",
      "Review cover at renewal—not only when something goes wrong.",
    ])
  );
}

function scamsSafetyBody(guide, hub) {
  const { title, slug } = guide;
  let how = `**${title}** exploits trust, fear, or greed—usually through urgency and secrecy. Scammers impersonate banks, agencies, loves, bosses, or investment gurus.`;
  let signs = `Unexpected requests for codes, remote access, gift cards, crypto transfers, or secrecy from family are classic warning signs. Too-good returns and countdown timers are not normal investing.`;
  let now = `Stop contact, do not send more money, use a different device to call your bank on a published number, change passwords, and preserve evidence (screenshots, wallet addresses, reference numbers).`;
  let report = `Report to your bank, Scamwatch, and police where appropriate. If investments are involved, check regulator alert lists and report through official channels. See [Urgent help](/urgent) if you cannot cover essentials after a loss.`;

  if (hub === "online-safety") {
    how = `Online safety habits—strong unique passwords, scepticism toward cold links, and careful shopping—prevent many financial crimes before they start.`;
    if (slug.includes("finfluencer") || slug.includes("ai-and-money")) {
      how = `Social media creators and AI tools can share useful general tips—but they are not your adviser, and they can be wrong, sponsored, or unsafe to follow with real money.`;
      signs = `Guaranteed strategies, pressure to use a specific broker, and advice that ignores your whole financial position.`;
    }
  } else if (hub === "check-report") {
    how = `Verification and reporting close the loop: check licences before you invest, and report quickly if something is wrong so others are warned and recovery pathways can start.`;
    now = `If funds already left: bank first, then reports. Speed matters more than perfect paperwork—you can supplement details later.`;
  }

  return (
    open(guide, urgentSentence(hub, slug)) +
    `## How it works\n\n${how}\n\n` +
    `## Warning signs\n\n${signs}\n\n` +
    `## What to do now\n\n${now}\n\n` +
    `## Report\n\n${report}\n\n` +
    toolsBlock(guide) +
    nextSteps([
      "Save official bank and government contact numbers in your phone.",
      "Enable MFA on email and banking—without sharing codes with callers.",
      "Agree a family code-word for urgent money requests.",
      "Report attempted or successful scams through official channels.",
      "Open [Urgent help](/urgent) if the loss affects rent, food, or medicine.",
    ])
  );
}

function communityBody(guide, hub) {
  const { title, slug } = guide;
  let context = `**${title}** is written for people navigating money in community, study, work, or cultural contexts—practical steps without jargon.`;
  let steps = `1. Identify the exact problem in one sentence.\n2. Gather ID and any reference numbers you already have.\n3. Use official search or claim pathways—not paid “finders” who cold-call.\n4. Keep copies of lodgement receipts.\n5. Follow up if timelines slip.`;
  let cautions = `Be wary of anyone who offers to “fast-track” claims for a large upfront fee, or who asks for remote access or secrecy.`;
  let next = `Use ClearMoney hub pages and linked tools where they exist, and confirm eligibility on official sites when rules matter.`;

  if (hub === "unclaimed-money") {
    context = `Unclaimed money can sit with banks, insurers, share registries, ASIC, or state bodies after accounts go quiet. Claiming usually requires proof you are the owner or entitled person.`;
    steps = `1. Search relevant official unclaimed money registers.\n2. Match names, old addresses, and account clues.\n3. Prepare ID and ownership evidence.\n4. Lodge through the official form—not a random intermediary.\n5. Record claim numbers and dates.`;
    cautions = `Scam sites mimic claim portals. Always navigate from a known government or institution domain.`;
  } else if (hub === "teachers") {
    context = `Teachers shape lifelong money habits when consumer and financial literacy is taught with real scenarios—budgets, advertising, and scams.`;
    steps = `1. Pick one capability (needs vs wants, budgeting, or scam spotting).\n2. Use short activities over one-off lectures.\n3. Keep product-selling materials out of the classroom.\n4. Adapt for year level.\n5. Reflect with students on decisions, not just definitions.`;
  } else if (hub === "students") {
    context = `Student life mixes tight cashflow with first-time contracts—phones, cars, rentals, and credit. Small mistakes can echo for years.`;
    steps = `1. Build a bare-bones weekly budget.\n2. Read rental and phone contracts before signing.\n3. Treat BNPL and credit cards as debt, not income.\n4. Check payslips and super when you start work.\n5. Ask for help early if bills slip.`;
  } else if (hub === "first-nations") {
    context = `**${title}** focuses on practical money steps with respect for community realities—including pressure, book-up, and access to culturally safe help.`;
    steps = `1. Use services that understand First Nations contexts where possible.\n2. Keep your own bank access and ID pathway clear.\n3. Check total costs on store credit, hampers, and cash loans.\n4. Pause on door-to-door sales—know cooling-off rights.\n5. For large sums, plan before spending.`;
    cautions = `High-cost credit and book-up can drain income quietly. Family money pressure is common—boundaries are allowed.`;
  } else if (hub === "your-stories") {
    context = `Real stories show that money progress is uneven—people start late, travel, or rebuild after setbacks. Use them as encouragement, not a script you must copy.`;
    steps = `1. Note what goal the storyteller chose.\n2. Adapt one habit to your income.\n3. Ignore comparison pressure.\n4. Write your own next small step.\n5. Revisit when motivation dips.`;
  } else if (hub === "publications") {
    context = `Short tip sheets and complaint guides help when you need a checklist, not a novel. **${title}** points you to clear actions and escalation paths.`;
    if (slug.includes("complain")) {
      steps = `1. Complain to the firm in writing first.\n2. Keep reference numbers.\n3. Escalate to AFCA or the relevant ombudsman if unresolved.\n4. Watch time limits.\n5. Stay factual and attach evidence.`;
    }
  }

  return (
    open(guide) +
    `## Context\n\n${context}\n\n` +
    `## Practical steps\n\n${steps}\n\n` +
    `## Cautions\n\n${cautions}\n\n` +
    `## Where to go next\n\n${next}\n\n` +
    toolsBlock(guide) +
    nextSteps([
      `Decide the single outcome you want from “${title}".`,
      "Use official websites and phone numbers you look up yourself.",
      "Keep a paper or phone folder of claim and complaint references.",
      "Ask a trusted person or free counsellor if the process feels overwhelming.",
      "Return to ClearMoney guides when the next life stage starts.",
    ])
  );
}

/**
 * @param {{ title: string, slug: string, description?: string, tools?: string[], tags?: string[] }} guide
 * @param {string} pillar
 * @param {string} hub
 * @param {{ title: string, slug: string }[]} siblings
 */
export function buildBody(guide, pillar, hub, siblings) {
  let body;
  switch (hub) {
    case "banking":
      body = bankingBody(guide, pillar, hub, siblings);
      break;
    case "budgeting":
      body = budgetingBody(guide, pillar, hub, siblings);
      break;
    case "saving":
      body = savingBody(guide);
      break;
    case "work-tax":
      body = workTaxBody(guide);
      break;
    case "family":
      body = familyBody(guide);
      break;
    case "loans":
    case "other-borrowing":
    case "credit-cards":
    case "home-loans":
      body = borrowingBody(guide, hub);
      break;
    case "managing-debt":
      body = managingDebtBody(guide);
      break;
    case "how-to-invest":
    case "advice":
    case "shares":
    case "funds-etfs":
    case "property":
    case "interest-investments":
    case "warnings":
      body = investingBody(guide, hub);
      break;
    case "retirement":
    case "how-super-works":
    case "grow-super":
    case "plan-retirement":
    case "income-sources":
    case "manage-retirement":
      body = superRetirementBody(guide, hub);
      break;
    case "life-insurance":
    case "car-insurance":
    case "home-insurance":
    case "add-on-insurance":
    case "other-insurance":
    case "natural-disasters":
      body = insuranceBody(guide, hub);
      break;
    case "online-safety":
    case "financial-scams":
    case "check-report":
      body = scamsSafetyBody(guide, hub);
      break;
    case "unclaimed-money":
    case "teachers":
    case "students":
    case "publications":
    case "first-nations":
    case "your-stories":
      body = communityBody(guide, hub);
      break;
    default:
      body =
        open(guide) +
        `## Overview\n\nThis guide covers **${guide.title}** with practical ClearMoney steps.\n\n` +
        `## What to know\n\n${guide.description || guide.title}\n\n` +
        `## Practical steps\n\n1. Clarify your goal.\n2. Gather numbers.\n3. Compare options.\n4. Keep records.\n\n` +
        `## Cautions\n\nPrefer official sources for thresholds and eligibility. Pause on urgency and secrecy.\n\n` +
        toolsBlock(guide) +
        nextSteps([
          "Write your goal in one sentence.",
          "Gather the documents that matter.",
          "Compare at least two options.",
          "Keep written confirmations.",
          "Revisit when your situation changes.",
        ]);
  }

  const depth = depthBlock(guide, hub, siblings);
  if (body.includes("## What to do next")) {
    return body.replace("## What to do next", `${depth}## What to do next`);
  }
  return body + depth;
}

function isGoldSample(relPosix) {
  return relPosix.replace(/\\/g, "/") === "banking-budgeting/banking/joint-accounts.md";
}

export function writeGuides() {
  let written = 0;
  let skipped = 0;

  for (const group of inventory) {
    const { pillar, hub, guides } = group;
    const dir = path.join(GUIDES_ROOT, pillar, hub);
    fs.mkdirSync(dir, { recursive: true });

    for (const guide of guides) {
      const fileName = `${guide.slug}.md`;
      const outFile = path.join(dir, fileName);
      const rel = path.join(pillar, hub, fileName);
      const exists = fs.existsSync(outFile);

      if (isGoldSample(rel)) {
        if (exists) {
          skipped += 1;
          continue;
        }
      } else if (SKIP_EXISTING && exists) {
        skipped += 1;
        continue;
      }

      const relatedGuides = siblingPaths(pillar, hub, guides, guide.slug);
      // Prefer 2–4 siblings; if hub is tiny, take what we have
      const related = relatedGuides.slice(0, Math.min(4, Math.max(relatedGuides.length, 0)));
      if (related.length > 4) related.length = 4;

      const body = buildBody(guide, pillar, hub, guides).trim() + "\n";
      const fm = frontmatter(guide, pillar, hub, related.slice(0, 4));
      fs.writeFileSync(outFile, `${fm}\n\n${body}`, "utf8");
      written += 1;
    }
  }

  console.log(`Wrote ${written} guide(s); skipped ${skipped}.`);
  return { written, skipped };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  writeGuides();
}
