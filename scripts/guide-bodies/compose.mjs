/**
 * Compose original ClearMoney guide bodies (topic-specific H2s, no hub stubs).
 */
import {
  guideLink,
  needsUrgent,
  nextStepsSection,
  pick,
  toolLinks,
  urgentBlurb,
} from "./_helpers.mjs";

const NAMES = [
  ["Jordan", "Sam"],
  ["Priya", "Alex"],
  ["Mei", "Chris"],
  ["Noah", "Riley"],
  ["Aisha", "Taylor"],
  ["Luca", "Morgan"],
  ["Harper", "Drew"],
  ["Sofia", "Casey"],
];

function names(slug) {
  return pick(NAMES, slug);
}

function lowerTitle(title) {
  return title.charAt(0).toLowerCase() + title.slice(1);
}

function topicNoun(title) {
  return title.replace(/\?$/, "");
}

/** Hub-level framing used to keep prose on-topic without shared stubs. */
const HUB_FRAME = {
  banking:
    "Banking choices stick: cards, authorities, and scheduled payments keep running after you forget how you set them up.",
  budgeting:
    "A budget is a map of cash in and cash out—not a personality test. Numbers first, judgement later.",
  saving:
    "Saving works when money moves before you can spend it, and when the goal has a name and a date.",
  "work-tax":
    "Work and tax decisions change take-home pay, super, and how much buffer you need between paydays.",
  family:
    "Family money decisions affect more than one person. Clarity and safety matter as much as the spreadsheet.",
  loans:
    "Borrowing is buying money now and paying for it later—compare the total cost, not only the weekly repayment.",
  "other-borrowing":
    "Buy-now-pay-later, overdrafts, and fringe credit can look small until fees and timing stack up.",
  "credit-cards":
    "Credit cards are useful tools when you repay in full; they become expensive debt when balances roll.",
  "home-loans":
    "A home loan is usually the largest debt most people take on—rate, fees, and buffers decide comfort.",
  "managing-debt":
    "Debt stress shrinks options. Prioritise essentials, talk early, and use free help before high-cost credit.",
  "how-to-invest":
    "Investing is trading certainty for the chance of growth. Time horizon and fees matter more than tips.",
  advice:
    "Paid advice can help complex decisions—but only if the adviser is appropriately licensed and clear about fees.",
  shares:
    "Shares are ownership slices. Prices move daily; your plan should not.",
  "funds-etfs":
    "Funds and ETFs bundle many investments so you are not picking every company yourself.",
  property:
    "Property mixes a place to live with a leveraged investment—costs and illiquidity are easy to underestimate.",
  "interest-investments":
    "Interest products prioritise income and capital stability; returns are usually lower than growth assets over long periods.",
  warnings:
    "Investment warnings exist because some offers are illegal, unsuitable, or designed to rush you.",
  retirement:
    "Retirement money is a multi-decade project: super, Age Pension, and spending habits interact.",
  "how-super-works":
    "Super is compulsory saving for later life, with rules on contributions, investments, and when you can access it.",
  "grow-super":
    "Growing super is usually about contributions, fees, insurance inside super, and investment mix—not one hot tip.",
  "plan-retirement":
    "Retirement planning turns a vague ‘enough’ into a spending estimate, an income mix, and a timing plan.",
  "income-sources":
    "Retirement income can come from super, Age Pension, work, and other assets—each with different rules.",
  "manage-retirement":
    "In retirement, the job shifts from accumulation to drawing down sustainably and keeping paperwork tidy.",
  "life-insurance":
    "Life and personal insurance replace income or cover costs when health or life events hit.",
  "car-insurance":
    "Car insurance levels of cover trade premium against how much you pay after a crash or theft.",
  "home-insurance":
    "Home and contents insurance protect against sudden loss—sum insured and exclusions decide whether a claim helps.",
  "add-on-insurance":
    "Add-on insurance sold with another product is often expensive for the cover you actually get.",
  "other-insurance":
    "Specialist policies fill gaps—but only if you understand waiting periods, exclusions, and claim paths.",
  "natural-disasters":
    "Disasters scramble cash flow fast: documents, temporary housing, and insurance claims need a simple order of operations.",
  "online-safety":
    "Online money safety is mostly habits: slow down, verify, and never share one-time codes.",
  "financial-scams":
    "Scams succeed by urgency and secrecy. Real institutions do not need you to move money ‘to keep it safe’.",
  "check-report":
    "Checking and reporting quickly limits damage—and helps others avoid the same pitch.",
  "unclaimed-money":
    "Unclaimed money sits with governments and companies when contact details go stale—worth a periodic search.",
  teachers:
    "Classroom money education works best with short activities, real examples, and clear links to student life.",
  students:
    "Student money pressure is real: income is lumpy, costs are fixed, and credit can look like a shortcut.",
  publications:
    "ClearMoney publications are starting points—use them with your own numbers and official sources for thresholds.",
  "first-nations":
    "First Nations money guides respect community contexts while covering practical banking, debt, and consumer rights.",
  "your-stories":
    "Stories show how money decisions feel in real life—use them as mirrors, not prescriptions.",
};

const TYPE_STEPS = {
  compare: [
    "Write the outcome you want in one sentence (keep, switch, cancel, or wait).",
    "List fees, rates, waiting periods, or conditions side by side—not marketing headlines.",
    "Check exit costs and how long any bonus or honeymoon period lasts.",
    "Set a calendar reminder to review the choice in 3–6 months.",
  ],
  setup: [
    "Gather ID, income evidence, and any existing contracts or statements.",
    "Confirm who else is affected (partner, guarantor, dependants) before you sign.",
    "Complete the application or setup deliberately—screenshot confirmations.",
    "Turn on alerts and store reference numbers where you can find them.",
  ],
  fix: [
    "Map what is broken: amount, date, account, and who authorised it.",
    "Contact the provider in writing (app chat or email) and keep the transcript.",
    "Ask for a timeframe and a reference number; escalate if silence stretches.",
    "Update related automations so the same issue cannot recur quietly.",
  ],
  save: [
    "Name the goal and a rough target date.",
    "Automate a transfer on payday to a separate account.",
    "Cut one recurring leak before you cut joy spending.",
    "Review progress monthly and nudge the amount when income rises.",
  ],
  borrow: [
    "Calculate the total amount repayable, not only the weekly figure.",
    "Compare at least two lenders or credit types with the same loan amount and term.",
    "Stress-test repayments if rates rise or hours drop.",
    "Avoid stacking new credit to pay old credit without a written plan.",
  ],
  invest: [
    "Define the time horizon and what would force you to sell early.",
    "List fees (management, brokerage, advice) in dollars per year if you can.",
    "Diversify enough that one tip cannot wreck the plan.",
    "Ignore urgency: legitimate offers survive a night’s sleep.",
  ],
  insure: [
    "List the risks you actually need covered versus nice-to-haves.",
    "Compare sum insured, excess, exclusions, and waiting periods.",
    "Check whether cover already exists inside super, bank, or another policy.",
    "Store policy numbers and claim phone lines offline as well as in the app.",
  ],
  scam: [
    "Stop contact with the suspected scammer and do not send more money.",
    "Call your bank or card provider on a number from their official site.",
    "Change passwords starting with email, then banking, then social.",
    "Report via Scamwatch and keep evidence (messages, receipts, wallet addresses).",
  ],
  debt: [
    "List debts with balances, rates, and minimums; mark essentials separately.",
    "Contact lenders early and ask about hardship options in writing.",
    "Speak with a free financial counsellor if repayments no longer fit.",
    "Avoid high-cost short-term credit as a ‘bridge’ without a repayment date.",
  ],
  community: [
    "Skim for the one action that helps this week.",
    "Note any official registers, forms, or hotlines mentioned.",
    "Adapt the idea to your household—not every tip fits every culture or income.",
    "Share useful steps with someone who asked for help, with consent.",
  ],
};

function classify(hub, slug, title) {
  const s = `${hub} ${slug} ${title}`.toLowerCase();
  if (/scam|fraud|phishing|identity|report|check-if/.test(s)) return "scam";
  if (/debt|hardship|bankrupt|collect|repossess|payday|urgent-help/.test(s))
    return "debt";
  if (/insur|claim|excess|policy|cover/.test(s)) return "insure";
  if (/invest|share|etf|fund|property|return|risk|crypto|warning|advice|smsf/.test(s))
    return "invest";
  if (/loan|mortgage|borrow|credit-card|guarantor|bnpl|overdraft|lease/.test(s))
    return "borrow";
  if (/save|deposit|emergency|compound|goal/.test(s)) return "save";
  if (/unauthorised|mistaken|cancel|fix|switch|dispute/.test(s)) return "fix";
  if (/teacher|student|publication|first-nations|your-stories|unclaimed/.test(s))
    return "community";
  if (/budget|track|cost|spend|food|fuel|energy|sales/.test(s)) return "setup";
  if (/open|start|how-to|set-up|choosing|compare/.test(s)) return "compare";
  return "setup";
}

function toolsParagraph(guide) {
  const links = toolLinks(guide);
  if (!links.length) return "";
  return `ClearMoney calculators that pair with this topic: ${links.join(", ")}. Use them to turn guesses into numbers before you commit.\n\n`;
}

function relatedBullets(pillar, hub, siblings, guide) {
  const others = siblings.filter((g) => g.slug !== guide.slug).slice(0, 3);
  return others.map(
    (g) => `Read ${guideLink(pillar, hub, g.slug, g.title)} for a related decision.`,
  );
}

function lead(guide, hub, slug) {
  const frame = HUB_FRAME[hub] || "Clear decisions beat rushed ones.";
  const desc =
    guide.description ||
    `Practical steps for ${lowerTitle(guide.title)}.`;
  return `${desc}${urgentBlurb(hub, slug)} ${frame}\n\n`;
}

function definitionSection(guide, hub) {
  const noun = topicNoun(guide.title);
  const frame = HUB_FRAME[hub] || "";
  const h2 = pick(
    [
      `## What is ${noun}?`,
      `## Understanding ${noun}`,
      `## ${noun}: the clear version`,
    ],
    guide.slug,
    1,
  );
  return `${h2}\n\n**${guide.title}** is worth understanding because small wording differences—fees, waiting periods, authorities, or exclusions—change outcomes. ${guide.description || ""} ${frame}\n\nTreat this page as a decision aid: gather your numbers, compare options, and keep written confirmations. Thresholds and eligibility can change, so verify critical figures with official sources or your provider before you act.\n\nIn Australia, providers must give key information, but it is still your job to check whether the product or process fits your cash flow. If a brochure uses jargon, rewrite it in one plain sentence you could explain to a friend.\n\n`;
}

function howSection(guide, hub, slug) {
  const type = classify(hub, slug, guide.title);
  const angles = {
    compare: `Start by separating **must-haves** from marketing. For **${guide.title}**, write down the constraints you cannot ignore: income timing, dependants, existing debts, or a hard deadline. Then compare like-for-like features in a short table of your own—rate or premium, fees, exit costs, and what happens if life changes.`,
    setup: `Setup quality decides whether **${lowerTitle(guide.title)}** helps or nags you later. Confirm identity and contact details, choose alerts you will actually read, and decide who else can see or move money. If a salesperson is present, ask for the key numbers in writing before you sign.`,
    fix: `Fixing problems around **${lowerTitle(guide.title)}** is mostly documentation. Note dates, amounts, reference numbers, and screenshots. Providers respond faster when you describe the timeline calmly and ask for a clear next step with a date.`,
    save: `Saving linked to **${lowerTitle(guide.title)}** works when the transfer is automatic and the destination account is slightly inconvenient to raid. Pair a named goal with a payday rule, then protect the balance from everyday debit-card spend.`,
    borrow: `For **${lowerTitle(guide.title)}**, translate marketing into cash-flow reality. What is the total repayable? What happens if rates rise or hours fall? Can you still cover rent, food, and utilities after the repayment leaves?`,
    invest: `With **${lowerTitle(guide.title)}**, match the product to your time horizon. Money you may need within a few years usually should not sit in volatile assets. Fees and diversification matter more than a single tip from social media.`,
    insure: `Insurance decisions for **${lowerTitle(guide.title)}** are about the claim you hope never happens. Read exclusions and waiting periods before you compare price alone. Check whether you already hold overlapping cover elsewhere.`,
    scam: `If **${lowerTitle(guide.title)}** involves suspected fraud, speed and verification beat cleverness. Use official phone numbers from a statement or the organisation’s website—not numbers from a text. Never share one-time codes.`,
    debt: `When **${lowerTitle(guide.title)}** collides with debt stress, order of operations matters: essentials first, then contact lenders, then free counselling if you cannot see a path. Silence usually makes options worse.`,
    community: `Use **${lowerTitle(guide.title)}** as a toolkit. Take what fits your household, leave what does not, and prefer official registers and licensed help for high-stakes steps.`,
  };
  return `## How to think about the moving parts\n\n${angles[type]}\n\nPeople often skip the boring middle: documents, dates, and who else is affected. Write those down before you compare shiny features. If two options look identical, the tie-breaker is usually fees, exit flexibility, or how painful a mistake would be to reverse.\n\n${toolsParagraph(guide)}`;
}

function benefitsRisks(guide, hub, slug) {
  const type = classify(hub, slug, guide.title);
  const benefitLines = {
    compare: [
      "Clearer trade-offs when fees and conditions sit side by side",
      "Fewer surprises after honeymoon rates or promo periods end",
      "A paper trail you can revisit when life changes",
    ],
    setup: [
      "Automations that reduce missed payments and late fees",
      "Alerts that surface problems while they are still small",
      "Shared understanding when more than one person is involved",
    ],
    fix: [
      "Faster resolution when evidence is organised",
      "Less repeat contact for the same issue",
      "Better odds of reversing or remapping payments correctly",
    ],
    save: [
      "Visible progress toward a named goal",
      "Less reliance on high-cost credit for shocks",
      "Habit formation that survives busy weeks",
    ],
    borrow: [
      "Access to a lump sum when cash flow cannot stretch",
      "Predictable repayments if the rate and term are understood",
      "A chance to refinance or restructure later if you keep records",
    ],
    invest: [
      "Potential growth above cash over long periods",
      "Diversification that reduces single-company drama",
      "Alignment with goals like retirement or a distant home deposit",
    ],
    insure: [
      "A financial backstop after insured events",
      "Clearer recovery planning when documents are ready",
      "Peace of mind when sums insured match rebuild or replace costs",
    ],
    scam: [
      "Limiting further loss by freezing channels quickly",
      "Helping others when reports feed warning systems",
      "Recovering access to accounts and identity credentials",
    ],
    debt: [
      "Hardship programs that can pause or reshape repayments",
      "Reduced stress when there is a written plan",
      "Protection pathways if collectors breach the rules",
    ],
    community: [
      "Shared language for classrooms, families, or community groups",
      "Pointers to free or low-cost support",
      "Practical checklists you can adapt locally",
    ],
  };
  const riskLines = {
    compare: [
      "Comparing headline rates while ignoring fees and conditions",
      "Switching so often that exit costs cancel the gain",
      "Trusting a quote that is not the final offer",
    ],
    setup: [
      "Set-and-forget errors (wrong account, wrong amount, wrong date)",
      "Giving too much authority to another person",
      "Missing fine print on fees or cooling-off rights",
    ],
    fix: [
      "Delaying contact until evidence disappears",
      "Approving remote access for ‘bank staff’ who are not",
      "Fixing one payment while leaving related direct debits untouched",
    ],
    save: [
      "Bonus rates that collapse after conditions fail",
      "Saving while high-interest debt grows faster",
      "Raiding the goal account for lifestyle spend",
    ],
    borrow: [
      "Focusing on weekly repayments instead of total cost",
      "Guarantor or security risks you did not price emotionally",
      "Stacking credit products until cash flow snaps",
    ],
    invest: [
      "Buying under social pressure or FOMO",
      "Concentrated bets and high fees",
      "Needing the money earlier than the investment can recover",
    ],
    insure: [
      "Underinsurance and uncovered flood or temporary accommodation gaps",
      "Overlapping policies that still leave a hole",
      "Add-ons that cost more than the likely benefit",
    ],
    scam: [
      "Sending more money because someone claims fees will ‘release’ funds",
      "Deleting evidence before reporting",
      "Shame delays that shrink recovery options",
    ],
    debt: [
      "Ignoring contact until default listing or legal steps begin",
      "Using payday-style credit to patch structural shortfalls",
      "Signing payment plans you cannot keep",
    ],
    community: [
      "Treating a tip as universal advice",
      "Out-of-date thresholds if you skip official checks",
      "Sharing someone else’s story without consent",
    ],
  };
  const benefits = benefitLines[type];
  const risks = riskLines[type];
  return `## Upsides worth wanting\n\n${benefits.map((b) => `- ${b}`).join("\n")}\n\n## Risks and traps to watch\n\n### Easy-to-miss costs\n\n${risks[0]}. For **${guide.title}**, read the conditions that turn a good deal average.\n\n### Timing and people problems\n\n${risks[1]}. ${pick(
    [
      "Write down who can authorise changes.",
      "Put review dates in your calendar.",
      "If someone rushes you, that is data—slow down.",
    ],
    slug,
  )}\n\n### Recovery friction\n\n${risks[2]}. Keep PDFs and screenshots; verbal promises are hard to enforce later.\n\n`;
}

function vignette(guide, hub, slug) {
  const [a, b] = names(slug);
  const type = classify(hub, slug, guide.title);
  const stories = {
    compare: `${a} almost switched for a flashy rate, then noticed a monthly fee and a condition that failed on casual income. ${b} built a three-row comparison instead—and stayed put for six months with alerts on.`,
    setup: `${a} set everything up in a hurry and only noticed the wrong account after a payment bounced. ${b} now screenshots every confirmation and nicknames accounts so automations are obvious.`,
    fix: `${a} spotted an unfamiliar transaction on Sunday night and waited until ‘a quieter day’. By then another debit had cleared. ${b} called immediately, froze the card, and kept the chat transcript.`,
    save: `${a} tried to save whatever was left on Sunday—usually nothing. ${b} renamed a savings account after the goal and automated $40 on payday; the balance finally moved.`,
    borrow: `${a} chose the lowest weekly repayment with a long term and paid far more interest. ${b} compared total cost and picked a shorter term they could still stress-test if hours dropped.`,
    invest: `${a} bought after a viral tip and sold in a panic three weeks later. ${b} wrote a one-page plan: horizon, fee budget, and a rule not to check prices daily.`,
    insure: `${a} discovered after a claim that the sum insured was years out of date. ${b} now reviews cover at renewal with rebuild and contents lists, not just the premium.`,
    scam: `${a} nearly transferred savings after a convincing ‘bank fraud’ call. ${b} hung up, dialled the number on the back of the card, and learned the real bank had not called.`,
    debt: `${a} avoided lender calls until fees stacked. ${b} asked for hardship in writing, listed essentials first, and booked a free counsellor session the same week.`,
    community: `${a} shared a tip that worked for a dual-income household with a student living on casual shifts—and it backfired. ${b} now checks constraints before recommending a step.`,
  };
  return `## A short story: ${pick(
    ["when the fine print mattered", "when timing changed the outcome", "when a simple system helped"],
    slug,
  )}\n\n${stories[type]} The lesson for **${lowerTitle(guide.title)}**: slow clarity beats fast regret.\n\n`;
}

function stepsSection(guide, hub, slug) {
  const type = classify(hub, slug, guide.title);
  const steps = TYPE_STEPS[type];
  return `## Practical steps for ${topicNoun(guide.title)}\n\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nIf you feel pressured, pause. A decision that cannot survive overnight scrutiny rarely deserves your signature.\n\n`;
}

function detailSection(guide, hub, slug) {
  const packs = {
    banking: `Banks compete on fees, ATM access, and app features—but the quiet settings matter more: who can authorise payments, whether overdrawing is allowed, and how quickly you hear about unusual transactions. For **${guide.title}**, map every automation that touches the account (salary, rent, subscriptions) before you change anything. If you share money with someone else, write down the operating authority in plain language, not only bank jargon.`,
    budgeting: `A usable budget separates **essentials**, **commitments**, and **flexible spend**. Essentials keep you housed and fed; commitments are contracts you already signed; flexible spend is where most leaks hide. For **${guide.title}**, use one month of statements—not memory—as the source of truth. If income varies, budget from a low month and treat surplus as savings or debt repayment, not a permanent lifestyle upgrade.`,
    saving: `High rates often come with conditions: deposit amounts, no withdrawals, or bonus periods that expire. Read those rules before you chase 0.1% differences. For **${guide.title}**, name the account after the goal and keep the debit card locked or unlinked. If you still hold high-interest debt, running the numbers on repayment versus saving usually beats collecting a small interest credit.`,
    "work-tax": `Payslips hide the story: gross pay, tax withheld, super, and deductions. For **${guide.title}**, keep records across the year—receipts, mileage logs, and private health details if relevant—so lodgement is not a scavenger hunt. Job changes and parental leave reset assumptions about take-home pay; rebuild the budget when the first new payslip arrives.`,
    family: `Households break when money rules are unspoken. Decide what is shared, what is personal, and how you will talk about shortfalls without blame. For **${guide.title}**, safety outranks efficiency: if someone uses money to control or frighten you, seek support before optimising accounts. Write down bill owners and due dates so one person’s illness or travel does not create late fees.`,
    loans: `The sticker rate is not the whole cost. Establishment fees, monthly fees, insurance add-ons, and longer terms change the total repayable. For **${guide.title}**, ask what happens on early repayment and whether the loan is secured. If a dealer or broker rushes you, take the contract home—urgency is a sales tool.`,
    "other-borrowing": `Small, frequent credit can feel invisible until several due dates land in the same week. For **${guide.title}**, list every BNPL, overdraft, and store card limit as if it were a loan balance. If you cannot clear short-term credit from the next payday without skipping essentials, pause new purchases and rebuild the cash buffer first.`,
    "credit-cards": `Interest-free periods disappear when you carry a balance or miss a payment. For **${guide.title}**, know the cash-advance rate, international fees, and whether a balance transfer has a revert rate that hurts later. Paying more than the minimum—and ideally the full statement—keeps the card a tool instead of a trap.`,
    "home-loans": `Serviceability calculators and lender buffers exist because rates and life both move. For **${guide.title}**, include strata, council rates, insurance, and maintenance in the ‘can we afford this’ test—not only the loan repayment. Offset and redraw features help only if you actually park spare cash there and understand access rules.`,
    "managing-debt": `Collectors and lenders have rules; you have rights to request hardship consideration and to be treated fairly. For **${guide.title}**, keep a call log and prefer written agreements. Free financial counsellors help you prioritise and negotiate—use them before selling essentials or borrowing more to patch interest.`,
    "how-to-invest": `Write the purpose of the money before you pick a product. For **${guide.title}**, if the horizon is short, capital stability usually beats growth stories. Dollar-cost averaging and broad diversification are boring on purpose—they reduce the chance that one tip defines your outcome.`,
    advice: `Licensed advice should come with a clear fee, a scope, and documents you can keep. For **${guide.title}**, ask how the adviser is paid and what happens if you say no to a product. If someone guarantees returns or pushes you to act today, treat that as a warning sign.`,
    shares: `Company news moves prices; your plan should not move with every headline. For **${guide.title}**, understand brokerage, tax lots, and concentration risk if one stock becomes a large share of your wealth. Dividends are not ‘free money’—they are part of total return and can be cut.`,
    "funds-etfs": `Management fees compound against you quietly. For **${guide.title}**, compare what the fund owns, how liquid it is, and whether you are duplicating the same exposure across multiple products. Rebalancing annually beats tinkering weekly.`,
    property: `Stamp duty, inspections, strata issues, vacancy, and interest rate resets all sit outside the auction adrenaline. For **${guide.title}**, run a cash-flow sheet with pessimistic rent and rate assumptions. Illiquidity means you cannot easily reverse a mistake next Tuesday.`,
    "interest-investments": `Term deposits and bonds prioritise predictability. For **${guide.title}**, ladder maturity dates so not all cash unlocks at once, and understand what happens if you break a term early. Inflation can erode real returns even when the nominal rate looks fine.`,
    warnings: `Cold calls, secret tips, and ‘recovery rooms’ after a loss are classic patterns. For **${guide.title}**, verify licences, ignore urgency, and never install remote-access software for a stranger. If an offer targets your super or equity, slow down further.`,
    retirement: `Spending in retirement is the plan; products are tools. For **${guide.title}**, estimate annual costs, then map income sources and buffers for health and home repairs. Longevity risk—living longer than the money—deserves as much attention as investment returns.`,
    "how-super-works": `Contributions, investment options, insurance inside super, and fees interact. For **${guide.title}**, log in, download a statement, and note beneficiary nominations. Multiple funds often mean multiple fee drags—consolidation can help after you check insurance loss risks.`,
    "grow-super": `Extra contributions only help if cash flow can carry them and rules allow them. For **${guide.title}**, compare concessional versus after-tax pathways with current caps in mind, and watch insurance premiums deducted from your balance.`,
    "plan-retirement": `A retirement age is a hypothesis until health, work, and housing cooperate. For **${guide.title}**, model a ‘base’ and a ‘frugal’ budget, then test what happens if you retire two years earlier or later. Include Age Pension assumptions carefully—they are means-tested.`,
    "income-sources": `Account-based pensions, Age Pension, wages, and annuities each behave differently when markets fall. For **${guide.title}**, write which bills each income stream is meant to cover. Keep a cash buffer so you are not forced to sell growth assets in a downturn.`,
    "manage-retirement": `Administration mistakes—wrong tax file details, lapsed insurance, ignored required drawdowns—create avoidable stress. For **${guide.title}**, set a yearly review: beneficiaries, spending, fees, and whether the investment mix still matches your drawdown pace.`,
    "life-insurance": `Cover amounts should reflect debts, dependants, and how long income would need replacing. For **${guide.title}**, check definitions for total and permanent disability and income protection waiting periods. Stepped premiums can rise sharply with age—know the path.`,
    "car-insurance": `Comprehensive, third party, and fire/theft covers different worlds of loss. For **${guide.title}**, match cover to the car’s value and your excess comfort. List drivers accurately; undeclared drivers sink claims.`,
    "home-insurance": `Sums insured should reflect rebuild cost, not market price. For **${guide.title}**, confirm flood and temporary accommodation wording for your address. Keep a contents inventory with photos.`,
    "add-on-insurance": `Add-ons sold at the counter often duplicate existing cover or exclude the events you care about. For **${guide.title}**, ask what is already covered by your credit card, home policy, or manufacturer warranty before you tick yes.`,
    "other-insurance": `Travel, pet, and specialty policies live on waiting periods and exclusions. For **${guide.title}**, read what happens for pre-existing conditions and how claims are evidenced. Cheap premiums with hollow cover are not a bargain.`,
    "natural-disasters": `In the first 72 hours, safety and documents outrank perfect paperwork. For **${guide.title}**, photograph damage, keep emergency receipts, and contact insurers early. Watch for contractors demanding large upfront cash without written scope.`,
    "online-safety": `Phishing works because it looks almost right. For **${guide.title}**, bookmark official login pages, turn on multi-factor authentication, and treat unexpected payment requests as hostile until proven otherwise.`,
    "financial-scams": `Romance, investment, and impersonation scams share a script: isolation, urgency, and a story about why you must not tell anyone. For **${guide.title}**, break the script—call a trusted person and verify via independent channels.`,
    "check-report": `Reporting is not only for large losses. For **${guide.title}**, gather messages, wallet addresses, and receipts, then file with the right channel and your bank. Early reports can freeze funds still in transit.`,
    "unclaimed-money": `People move, change names, and lose statements. For **${guide.title}**, search periodically with previous addresses and name variants. Keep tax file and ID details ready so claims are not stuck on verification.`,
    teachers: `Short activities beat lectures. For **${guide.title}**, tie lessons to payslips, phone plans, and scam screenshots students already see. Avoid shaming language about poverty or family choices.`,
    students: `Irregular shifts and fixed rent create fragile months. For **${guide.title}**, build a bare-bones budget and a tiny buffer before lifestyle upgrades. Treat credit as expensive, not as income.`,
    publications: `Use checklists as prompts, then replace sample numbers with yours. For **${guide.title}**, note the date you read a guide and re-check official thresholds when acting on dollar figures.`,
    "first-nations": `Practical money steps should respect kinship, remote access barriers, and community obligations. For **${guide.title}**, prefer culturally safe services and confirm rights around banking, Centrelink interactions, and consumer credit.`,
    "your-stories": `A story is one path, not a template. For **${guide.title}**, notice which constraint made the difference—income, housing, health, or support networks—before copying someone’s tactic.`,
  };
  // Fix typo for home-insurance if I introduced one
  const text =
    packs[hub] ||
    `For **${guide.title}**, write constraints, gather evidence, and prefer written confirmations over verbal promises.`;
  return `## Details that change the decision\n\n${text}\n\nAlso ask: what would make you reverse this choice in six months, and how expensive would that reverse be? Keep a one-page note with today’s balances, rates, and due dates so you are not reconstructing history from memory later.\n\nIf you only have fifteen minutes, spend them on the constraint that hurts most when ignored—usually cash timing, a fee, or a person who shares access—not on reading every marketing page.\n\n`;
}

function edgeSection(guide, hub, slug) {
  const bits = [];
  if (needsUrgent(hub, slug)) {
    bits.push(
      `- **Money stress now** — prioritise rent, food, utilities, and medicine, then use [Urgent help](/urgent). National Debt Helpline: 1800 007 007.`,
    );
  }
  if (/abuse|family|separat|divorce|partner/.test(`${hub} ${slug}`)) {
    bits.push(
      `- **Safety first** — if someone controls money as a form of harm, see ClearMoney’s financial abuse guidance and 1800RESPECT (1800 737 732).`,
    );
  }
  if (/scam|fraud|identity|phishing/.test(slug)) {
    bits.push(
      `- **After a scam** — contact your bank, change passwords, and report via Scamwatch; keep evidence.`,
    );
  }
  if (/super|retire|pension/.test(`${hub} ${slug}`)) {
    bits.push(
      `- **Rule changes** — contribution caps, preservation ages, and Age Pension settings change; confirm current figures before acting.`,
    );
  }
  if (/insur|disaster|flood|claim/.test(`${hub} ${slug}`)) {
    bits.push(
      `- **Claims** — photograph damage, keep receipts for emergency spends, and ask about temporary accommodation cover if you cannot stay home.`,
    );
  }
  if (!bits.length) {
    bits.push(
      `- **Life changes** — job loss, a new dependant, or a move can invalidate last year’s choice; schedule a review.`,
      `- **Records** — keep PDFs of contracts, statements, and cancellation confirmations for at least a year.`,
    );
  }
  return `## When life changes\n\n${bits.join("\n")}\n\n`;
}

function nextSteps(guide, pillar, hub, siblings) {
  const type = classify(hub, guide.slug, guide.title);
  const bullets = [
    `Decide the next action for **${lowerTitle(guide.title)}** in the next 48 hours (one call, one comparison, or one cancellation).`,
    ...relatedBullets(pillar, hub, siblings, guide).slice(0, 2),
  ];
  const tools = toolLinks(guide);
  if (tools[0]) bullets.push(`Run the numbers with ${tools[0]}.`);
  if (needsUrgent(hub, guide.slug)) {
    bullets.push(`If essentials are at risk, open [Urgent help](/urgent) before taking on new credit.`);
  } else {
    bullets.push(
      pick(
        [
          "Write your constraints on paper so a sales pitch cannot rewrite them.",
          "Set a calendar reminder to revisit this decision after the next statement cycle.",
          "Tell one trusted person your plan if accountability helps you follow through.",
        ],
        guide.slug,
        3,
      ),
    );
  }
  // Ensure uniqueness flavour by type
  if (type === "scam") {
    bullets[0] =
      "Call your bank from an official number and report the scam channels you used.";
  }
  return nextStepsSection(bullets.slice(0, 5));
}

/**
 * @param {object} guide
 * @param {string} pillar
 * @param {string} hub
 * @param {object[]} siblings
 */
export function composeBody(guide, pillar, hub, siblings) {
  // Gold sample is never composed here—writer skips the file.
  return (
    lead(guide, hub, guide.slug) +
    definitionSection(guide, hub) +
    howSection(guide, hub, guide.slug) +
    benefitsRisks(guide, hub, guide.slug) +
    detailSection(guide, hub, guide.slug) +
    vignette(guide, hub, guide.slug) +
    stepsSection(guide, hub, guide.slug) +
    edgeSection(guide, hub, guide.slug) +
    nextSteps(guide, pillar, hub, siblings)
  ).trim() + "\n";
}
