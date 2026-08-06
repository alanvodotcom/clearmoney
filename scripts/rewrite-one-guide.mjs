/**
 * Per-guide rewrite: each slug gets its own format pattern + topic-specific H2s.
 * Usage: node scripts/rewrite-one-guide.mjs [pillar/hub/slug]
 *        node scripts/rewrite-one-guide.mjs --all-templated
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { inventory } from "./generate-articles.mjs";
import {
  frontmatter,
  guideLink,
  hashSlug,
  needsUrgent,
  siblingPaths,
  toolLinks,
  urgentBlurb,
} from "./guide-bodies/_helpers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GUIDES_ROOT = path.join(__dirname, "..", "content", "guides");

const PRESERVE = new Set([
  "banking-budgeting/banking/joint-accounts.md",
  "banking-budgeting/banking/transaction-accounts-and-debit-cards.md",
  "banking-budgeting/banking/savings-accounts.md",
  "banking-budgeting/banking/direct-debits.md",
  "banking-budgeting/banking/sending-money-overseas.md",
  "banking-budgeting/banking/unauthorised-and-mistaken-transactions.md",
  // budgeting hub (unique outlines)
  "banking-budgeting/budgeting/how-to-do-a-budget.md",
  "banking-budgeting/budgeting/track-your-spending.md",
  "banking-budgeting/budgeting/cost-of-living-help.md",
  "banking-budgeting/budgeting/managing-on-a-low-income.md",
  "banking-budgeting/budgeting/managing-on-a-casual-income.md",
  "banking-budgeting/budgeting/ways-to-save-on-food-and-fuel.md",
  "banking-budgeting/budgeting/ways-to-save-on-energy-costs.md",
  "banking-budgeting/budgeting/avoiding-sales-pressure.md",
  // saving hub
  "banking-budgeting/saving/how-to-start-saving.md",
  "banking-budgeting/saving/simple-ways-to-save-money.md",
  "banking-budgeting/saving/save-for-an-emergency-fund.md",
  "banking-budgeting/saving/save-for-a-house-deposit.md",
  "banking-budgeting/saving/ways-to-buy-a-home-sooner.md",
  "banking-budgeting/saving/compound-interest.md",
  // work-tax hub
  "banking-budgeting/work-tax/income-tax.md",
  "banking-budgeting/work-tax/lodging-a-tax-return.md",
  "banking-budgeting/work-tax/choosing-an-accountant.md",
  "banking-budgeting/work-tax/salary-packaging.md",
  "banking-budgeting/work-tax/self-employment.md",
  "banking-budgeting/work-tax/losing-your-job.md",
  "banking-budgeting/work-tax/returning-to-work-after-having-a-baby.md",
  "banking-budgeting/work-tax/first-payslip.md",
  // family hub
  "banking-budgeting/family/relationships-and-money.md",
  "banking-budgeting/family/marriage-and-money.md",
  "banking-budgeting/family/having-a-baby.md",
  "banking-budgeting/family/getting-a-pet.md",
  "banking-budgeting/family/reducing-back-to-school-costs.md",
  "banking-budgeting/family/teaching-kids-about-money.md",
  "banking-budgeting/family/getting-divorced-or-separating.md",
  "banking-budgeting/family/divorce-and-separation-financial-checklist.md",
  "banking-budgeting/family/financial-abuse.md",
  "banking-budgeting/family/dealing-with-illness.md",
  "banking-budgeting/family/losing-your-partner.md",
  "banking-budgeting/family/how-to-support-older-australians.md",
  // scams-safety (unique outlines)
  "scams-safety/online-safety/protect-yourself-from-scams.md",
  "scams-safety/online-safety/how-to-spot-a-scam-website.md",
  "scams-safety/online-safety/online-shopping-safety.md",
  "scams-safety/online-safety/identity-theft.md",
  "scams-safety/online-safety/using-comparison-websites.md",
  "scams-safety/online-safety/what-is-a-finfluencer.md",
  "scams-safety/online-safety/ai-and-money-decisions.md",
  "scams-safety/financial-scams/banking-scams.md",
  "scams-safety/financial-scams/investment-scams.md",
  "scams-safety/financial-scams/crypto-scams.md",
  "scams-safety/financial-scams/superannuation-scams.md",
  "scams-safety/financial-scams/ponzi-schemes.md",
  "scams-safety/financial-scams/imposter-bond-investment-scams.md",
  "scams-safety/check-report/what-to-do-if-youve-been-scammed.md",
  "scams-safety/check-report/check-before-you-invest.md",
  "scams-safety/check-report/investor-alert-list.md",
  "scams-safety/check-report/report-an-investment-scam.md",
  // insurance (unique outlines)
  "insurance/life-insurance/life-insurance-cover.md",
  "insurance/life-insurance/income-protection-insurance.md",
  "insurance/life-insurance/total-and-permanent-disability-tpd-insurance.md",
  "insurance/life-insurance/trauma-insurance.md",
  "insurance/life-insurance/insurance-through-super.md",
  "insurance/life-insurance/making-a-life-insurance-claim.md",
  "insurance/car-insurance/choosing-car-insurance.md",
  "insurance/car-insurance/how-to-save-money-on-car-insurance.md",
  "insurance/car-insurance/claiming-on-your-car-insurance.md",
  "insurance/car-insurance/no-claim-bonus-on-car-insurance.md",
  "insurance/car-insurance/add-on-car-insurance.md",
  "insurance/home-insurance/choosing-home-insurance.md",
  "insurance/home-insurance/contents-insurance.md",
  "insurance/home-insurance/storm-flood-and-fire-insurance.md",
  "insurance/home-insurance/underinsurance-what-it-is-and-how-to-avoid-it.md",
  "insurance/home-insurance/how-to-make-a-home-insurance-claim.md",
  "insurance/home-insurance/how-home-insurance-cash-settlements-work.md",
  "insurance/add-on-insurance/consumer-credit-insurance.md",
  "insurance/add-on-insurance/mobile-phone-tablet-and-laptop-insurance.md",
  "insurance/add-on-insurance/pet-insurance.md",
  "insurance/other-insurance/travel-insurance.md",
  "insurance/other-insurance/health-insurance.md",
  "insurance/other-insurance/funeral-insurance.md",
  "insurance/natural-disasters/how-to-prepare-for-a-natural-disaster.md",
  "insurance/natural-disasters/what-to-do-after-a-natural-disaster.md",
  "insurance/natural-disasters/recovering-from-a-natural-disaster.md",
  "insurance/natural-disasters/be-aware-of-disaster-chasers.md",
  // loans-credit-debt (unique outlines)
  "loans-credit-debt/loans/personal-loans.md",
  "loans-credit-debt/loans/car-loans.md",
  "loans-credit-debt/loans/payday-loans.md",
  "loans-credit-debt/loans/no-interest-loans.md",
  "loans-credit-debt/loans/going-guarantor-on-a-loan.md",
  "loans-credit-debt/loans/loan-rejection.md",
  "loans-credit-debt/other-borrowing/buy-now-pay-later-services.md",
  "loans-credit-debt/other-borrowing/consumer-leases.md",
  "loans-credit-debt/other-borrowing/interest-free-deals.md",
  "loans-credit-debt/other-borrowing/pay-advance-services.md",
  "loans-credit-debt/credit-cards/choosing-a-credit-card.md",
  "loans-credit-debt/credit-cards/pay-off-your-credit-card.md",
  "loans-credit-debt/credit-cards/credit-card-balance-transfers.md",
  "loans-credit-debt/credit-cards/cancel-a-credit-card.md",
  "loans-credit-debt/home-loans/buying-a-house.md",
  "loans-credit-debt/home-loans/choosing-a-home-loan.md",
  "loans-credit-debt/home-loans/interest-only-home-loans.md",
  "loans-credit-debt/home-loans/mortgage-offset-accounts.md",
  "loans-credit-debt/home-loans/pay-off-your-mortgage-faster.md",
  "loans-credit-debt/home-loans/switching-home-loans.md",
  "loans-credit-debt/home-loans/using-a-mortgage-broker.md",
  "loans-credit-debt/home-loans/problems-paying-your-mortgage.md",
  "loans-credit-debt/managing-debt/urgent-help-with-money.md",
  "loans-credit-debt/managing-debt/get-debt-under-control.md",
  "loans-credit-debt/managing-debt/financial-hardship.md",
  "loans-credit-debt/managing-debt/financial-counselling.md",
  "loans-credit-debt/managing-debt/free-legal-advice.md",
  "loans-credit-debt/managing-debt/credit-scores-and-credit-reports.md",
  "loans-credit-debt/managing-debt/credit-repair.md",
  "loans-credit-debt/managing-debt/debt-consolidation-and-refinancing.md",
  "loans-credit-debt/managing-debt/dealing-with-debt-collectors.md",
  "loans-credit-debt/managing-debt/problems-paying-your-bills-and-fines.md",
  "loans-credit-debt/managing-debt/repossessed-car-or-goods.md",
  "loans-credit-debt/managing-debt/bankruptcy-and-debt-agreements.md",
  // community (unique outlines)
  "community/unclaimed-money/claim-money-from-bank-accounts-and-bank-dividends.md",
  "community/unclaimed-money/claim-money-from-shares-and-investments.md",
  "community/unclaimed-money/claim-money-from-life-insurance-policies.md",
  "community/unclaimed-money/claim-money-owed-to-a-deregistered-company.md",
  "community/unclaimed-money/money-held-by-state-governments.md",
  "community/unclaimed-money/interest-paid-on-unclaimed-money.md",
  "community/unclaimed-money/proof-of-ownership-for-unclaimed-money.md",
  "community/teachers/teaching-consumer-and-financial-literacy.md",
  "community/teachers/lesson-plans.md",
  "community/students/studying.md",
  "community/students/getting-a-job.md",
  "community/students/moving-out-of-home.md",
  "community/students/rental-bonds-and-leases.md",
  "community/students/choosing-a-mobile-phone-plan.md",
  "community/students/buying-and-running-a-car.md",
  "community/students/credit-and-debt.md",
  "community/publications/publications.md",
  "community/publications/how-to-complain.md",
  "community/publications/money-tips-in-other-languages.md",
  "community/publications/beware-of-scams.md",
  "community/publications/budgeting-and-saving-tips.md",
  "community/publications/credit-and-debt-tips.md",
  "community/publications/insurance-tips.md",
  "community/publications/money-and-working-in-australia.md",
  "community/publications/spending-and-paying-bills.md",
  "community/publications/superannuation-tips.md",
  "community/publications/tax-in-australia.md",
  "community/first-nations/first-nations-services-that-can-help.md",
  "community/first-nations/bank-accounts.md",
  "community/first-nations/how-to-prove-your-identity.md",
  "community/first-nations/book-up.md",
  "community/first-nations/cash-loans.md",
  "community/first-nations/door-to-door-sales.md",
  "community/first-nations/buying-a-hamper.md",
  "community/first-nations/dealing-with-family-pressure-about-money.md",
  "community/first-nations/managing-large-sums-of-money.md",
  "community/first-nations/superannuation.md",
  "community/first-nations/how-insurance-works.md",
  "community/first-nations/how-to-choose-insurance.md",
  "community/first-nations/making-an-insurance-claim.md",
  "community/first-nations/paying-for-funerals.md",
  "community/your-stories/its-not-too-late-to-have-aspirations-for-retirement.md",
  "community/your-stories/one-of-my-main-goals-is-to-travel-australia.md",
  "community/your-stories/stay-mindful-and-be-resourceful.md",
  // investing-planning (unique outlines)
  "investing-planning/how-to-invest/develop-an-investing-plan.md",
  "investing-planning/how-to-invest/choose-your-investments.md",
  "investing-planning/how-to-invest/diversification.md",
  "investing-planning/how-to-invest/track-your-investments.md",
  "investing-planning/how-to-invest/investing-and-tax.md",
  "investing-planning/how-to-invest/investment-platforms.md",
  "investing-planning/how-to-invest/borrowing-to-invest.md",
  "investing-planning/how-to-invest/environmental-social-governance-esg-investing.md",
  "investing-planning/how-to-invest/islamic-finance-in-australia.md",
  "investing-planning/how-to-invest/what-is-private-credit.md",
  "investing-planning/advice/what-is-financial-advice.md",
  "investing-planning/advice/general-and-personal-financial-advice.md",
  "investing-planning/advice/choosing-a-financial-adviser.md",
  "investing-planning/advice/financial-advice-costs.md",
  "investing-planning/advice/working-with-a-financial-adviser.md",
  "investing-planning/advice/financial-advisers-register.md",
  "investing-planning/advice/problems-with-a-financial-adviser.md",
  "investing-planning/shares/how-to-buy-and-sell-shares.md",
  "investing-planning/shares/choosing-shares-to-buy.md",
  "investing-planning/shares/shares-what-is-an-ipo.md",
  "investing-planning/shares/what-is-share-market-volatility.md",
  "investing-planning/shares/employee-share-schemes.md",
  "investing-planning/shares/buying-shares-through-crowd-sourced-funding.md",
  "investing-planning/funds-etfs/what-is-a-managed-fund.md",
  "investing-planning/funds-etfs/choosing-a-managed-fund.md",
  "investing-planning/funds-etfs/exchange-traded-funds-etfs.md",
  "investing-planning/funds-etfs/listed-investment-companies-lics.md",
  "investing-planning/funds-etfs/hedge-funds.md",
  "investing-planning/funds-etfs/peer-to-peer-lending.md",
  "investing-planning/property/buying-an-investment-property.md",
  "investing-planning/property/property-funds.md",
  "investing-planning/property/smsfs-and-property.md",
  "investing-planning/property/timeshares.md",
  "investing-planning/interest-investments/term-deposits.md",
  "investing-planning/interest-investments/bonds.md",
  "investing-planning/interest-investments/debentures-secured-and-unsecured-notes.md",
  "investing-planning/interest-investments/hybrid-securities-and-notes.md",
  "investing-planning/warnings/dont-get-burned-by-investment-hype.md",
  "investing-planning/warnings/crypto-assets.md",
  "investing-planning/warnings/forex-trading.md",
  "investing-planning/warnings/contracts-for-difference-cfds.md",
  "investing-planning/warnings/binary-options.md",
  "investing-planning/warnings/investment-seminars.md",
  "investing-planning/warnings/land-banking.md",
  "investing-planning/warnings/pump-and-dump-schemes.md",
  "investing-planning/warnings/insider-trading.md",
  "investing-planning/warnings/company-director-fraud.md",
  "investing-planning/warnings/bills-of-exchange.md",
  "investing-planning/warnings/lead-generation-and-how-it-works.md",
  "investing-planning/warnings/prediction-markets.md",
  "investing-planning/warnings/futures-contracts.md",
  "investing-planning/warnings/exchange-traded-options.md",
  "investing-planning/how-to-invest/micro-investing.md",
  "investing-planning/shares/fractional-share-trading.md",
  // super-retirement (unique outlines)
  "super-retirement/retirement/retirement-checklist.md",
  "super-retirement/retirement/case-study-helen-and-joe-retire.md",
  "super-retirement/retirement/case-study-bills-mortgage-decision.md",
  "super-retirement/retirement/case-study-lillians-health-scare.md",
  "super-retirement/retirement/first-nations-resources.md",
  "super-retirement/retirement/campaign-resources.md",
  "super-retirement/how-super-works/superannuation.md",
  "super-retirement/how-super-works/types-of-super-funds.md",
  "super-retirement/how-super-works/choosing-a-super-fund.md",
  "super-retirement/how-super-works/stapled-super-fund.md",
  "super-retirement/how-super-works/consolidating-super-funds.md",
  "super-retirement/how-super-works/find-lost-super.md",
  "super-retirement/how-super-works/tax-and-super.md",
  "super-retirement/how-super-works/getting-your-super.md",
  "super-retirement/how-super-works/when-you-can-access-your-super-early.md",
  "super-retirement/how-super-works/self-managed-super-fund-smsf.md",
  "super-retirement/how-super-works/who-gets-your-super-if-you-die.md",
  "super-retirement/how-super-works/claiming-a-super-death-benefit.md",
  "super-retirement/how-super-works/what-is-payday-super.md",
  "super-retirement/grow-super/how-to-check-your-super.md",
  "super-retirement/grow-super/how-much-super-should-i-have.md",
  "super-retirement/grow-super/super-contributions.md",
  "super-retirement/grow-super/super-investment-options.md",
  "super-retirement/grow-super/switching-super-funds.md",
  "super-retirement/grow-super/protect-your-super-from-pushy-sales-calls.md",
  "super-retirement/grow-super/downsizer-super-contributions.md",
  "super-retirement/grow-super/get-your-super-working-over-time.md",
  "super-retirement/grow-super/super-for-self-employed-people.md",
  "super-retirement/grow-super/tips-to-keep-your-retirement-savings-on-track.md",
  "super-retirement/plan-retirement/make-a-retirement-plan.md",
  "super-retirement/plan-retirement/work-out-how-much-you-need-to-retire.md",
  "super-retirement/plan-retirement/super-and-the-age-pension.md",
  "super-retirement/plan-retirement/what-happens-to-your-super-when-you-retire.md",
  "super-retirement/plan-retirement/your-home-in-retirement.md",
  "super-retirement/plan-retirement/managing-unexpected-retirement.md",
  "super-retirement/plan-retirement/wills-and-powers-of-attorney.md",
  "super-retirement/income-sources/types-of-retirement-income.md",
  "super-retirement/income-sources/account-based-pensions.md",
  "super-retirement/income-sources/age-pension-and-government-benefits.md",
  "super-retirement/income-sources/annuities.md",
  "super-retirement/income-sources/lifetime-income-streams.md",
  "super-retirement/income-sources/super-lump-sum.md",
  "super-retirement/income-sources/transition-to-retirement.md",
  "super-retirement/income-sources/reverse-mortgage-and-home-equity-release.md",
  "super-retirement/manage-retirement/make-your-money-last-in-retirement.md",
  "super-retirement/manage-retirement/retirement-income-and-tax.md",
  "super-retirement/manage-retirement/manage-health-costs-in-retirement.md",
  "super-retirement/manage-retirement/aged-care.md",
  "super-retirement/manage-retirement/downsizing-in-retirement.md",
  "super-retirement/manage-retirement/memory-loss-dementia-and-your-money.md",
  "super-retirement/manage-retirement/protect-your-money-in-retirement.md",
  "super-retirement/manage-retirement/get-help-in-retirement.md",
  "super-retirement/manage-retirement/paying-for-your-funeral.md",
]);

const TEMPLATE_MARK = "## How to think about the moving parts";

const FORMATS = [
  "explainer_steps",
  "checklist_first",
  "compare_choose",
  "story_then_rules",
  "rights_and_safety",
  "numbers_then_habits",
  "timeline_journey",
  "myths_and_fixes",
];

function relatedLines(pillar, hub, guides, slug) {
  return guides
    .filter((g) => g.slug !== slug)
    .slice(0, 3)
    .map((g) => `- See ${guideLink(pillar, hub, g.slug, g.title)}.`);
}

function toolsLine(guide) {
  const t = toolLinks(guide);
  return t.length
    ? `ClearMoney tools: ${t.join(", ")}.\n\n`
    : "";
}

function depthPad(guide, hub) {
  const t = guide.title;
  const topic = hub.replace(/-/g, " ");
  return (
    `## Context that belongs with ${t}\n\n` +
    `Inside **${topic}**, **${t.toLowerCase()}** rarely sits alone. It connects to cash-flow timing, paperwork you can prove, and people who share the consequences. ClearMoney’s angle is ordinary-language decisions: what to check, what to write down, and what to ignore when someone rushes you.\n\n` +
    `Australian settings change—rates, concessions, contribution caps, insurance definitions—so treat dollar figures you see in marketing as prompts to verify, not as permanent facts. Prefer primary documents (statements, Product Disclosure Statements, contracts) over screenshots from group chats.\n\n` +
    `If you only have fifteen minutes, spend them on the constraint that hurts most when ignored: a due date, a fee, an access authority, or a person who can move money without you. That single constraint usually explains more than another hour of comparison tabs.\n\n` +
    `Finally, decide what “good enough” means. Perfect research that never finishes leaves you on the default option—which may be the most expensive quiet choice available.\n\n` +
    `## Practical notes Australians often miss\n\nKeep a simple evidence trail: dates, amounts, who you spoke to, and reference numbers. When something goes wrong months later, memory is a weak witness. Screenshots of confirmations and PDF statements beat “I’m sure they said…”.\n\nWatch for add-ons sold beside the main decision—extended warranties, consumer credit insurance, “priority support”, or investment tips bundled with a platform. Ask whether you already hold overlapping cover or whether the add-on excludes the events you care about.\n\nIf income varies, stress-test **${t.toLowerCase()}** against a quiet month. Plans built on peak hours fail in troughs. Casual and gig workers especially need buffers and debit dates that respect payday reality.\n\nWhen the topic intersects debt stress, scams, or relationship control of money, switch from optimisation to safety and support early. [Urgent help](/urgent), free financial counselling, and 1800RESPECT (1800 737 732) exist because clever budgeting cannot fix every situation.\n\n` +
    `## A compact personal summary\n\nWrite four lines in your notes app: (1) what you are deciding about **${t.toLowerCase()}**, (2) the cost if wrong, (3) the next action with a date, (4) where the documents live. That note is more valuable than another bookmark.\n\n`
  );
}

function lead(guide, hub, slug) {
  return `${guide.description || guide.title}.${urgentBlurb(hub, slug)}\n\n`;
}

/** Unique bodies — each format uses different H2 labels built from the title. */
function bodyFor(format, guide, pillar, hub, guides) {
  const t = guide.title;
  const d = guide.description || t;
  const slug = guide.slug;
  const tools = toolsLine(guide);
  const depth = depthPad(guide, hub);
  const rel = relatedLines(pillar, hub, guides, slug).join("\n");
  const urgent =
    needsUrgent(hub, slug)
      ? `\nIf essentials are at risk, use [Urgent help](/urgent) before taking on new high-cost credit.\n`
      : "";

  switch (format) {
    case "explainer_steps":
      return (
        lead(guide, hub, slug) +
        `## What ${t} covers\n\n${d} This ClearMoney guide stays practical: what the idea means, which choices change outcomes, and what to do in the next fortnight—not a product pitch.\n\nIn the ${hub.replace(/-/g, " ")} area, people often arrive with a half-formed worry (“is this okay?”) rather than a neat product question. Naming **${t.toLowerCase()}** clearly is half the work—once you can explain it to a friend, sales language loses power.\n\n${tools}` +
        `## How ${t} usually works\n\nIn everyday terms, **${t.toLowerCase()}** sits inside broader money decisions about cash flow, risk, and paperwork. People get stuck when they chase headlines (rates, bonuses, guarantees) and skip constraints: income timing, dependants, existing debts, and how hard a mistake is to reverse.\n\nWrite your constraint list before you compare options. If two offers look identical, prefer the one with clearer fees, simpler exits, and paperwork you can keep. Australian providers must give key information, but you still choose whether the fit is real for your household.\n\n` +
        `## Steps that keep you in control\n\n1. Define the outcome in one sentence (keep, switch, cancel, wait, or get help).\n2. Gather statements, contracts, or screenshots that prove the current state.\n3. Compare like-for-like features—not marketing names.\n4. Decide, then store confirmations (PDF or email).\n5. Set a review date so set-and-forget does not drift.\n\nIf a salesperson cannot put fees and conditions in writing, treat that as a reason to pause—not a personality clash.\n\n` +
        `## Mistakes that show up again and again\n\n- Acting on urgency from a salesperson or stranger.\n- Ignoring total cost while focusing on a weekly figure or headline rate.\n- Forgetting linked automations (debits, insurance, beneficiaries).\n- Skipping official checks when thresholds or licences matter.\n- Using new credit to paper over a structural shortfall without a repayment date.\n\n` +
        `## Keep records boring and findable\n\nCreate one folder (digital or paper) for **${t.toLowerCase()}**: contracts, statements, cancellation emails, and claim or complaint reference numbers. Future-you will not remember the chat transcript from a busy Tuesday.\n\n` +
        depth +
        `## What to do next\n\n- Take the first step for **${t.toLowerCase()}** within 48 hours.\n${rel}\n- Keep written proof of any change you make.${urgent}`
      );

    case "checklist_first":
      return (
        lead(guide, hub, slug) +
        `## Checklist: ${t}\n\nUse this as a working list—tick what you finish this week.\n\n- [ ] I can explain **${t.toLowerCase()}** in one plain sentence.\n- [ ] I know what it costs in money, time, and flexibility if I am wrong.\n- [ ] I have the documents (statements, policies, IDs) within reach.\n- [ ] I know who else is affected (partner, kids, guarantor, housemate).\n- [ ] I have a cool-off plan if someone rushes me.\n- [ ] I know how I will review this in 3–6 months.\n\n${tools}` +
        `## Why this checklist exists\n\n${d} Checklists beat vibes when the topic is sticky: authorities, contracts, and scheduled payments keep running after you forget the signup conversation. In ${hub.replace(/-/g, " ")}, unfinished admin is how fees and stress grow quietly.\n\n` +
        `## Dig deeper on the risky lines\n\n**Cost if wrong** — fees, break costs, interest, or lost cover. Write the dollar range even if it is approximate.\n\n**People affected** — shared accounts and guarantees create shared pain. Name them explicitly.\n\n**Rush tactics** — pause overnight; real offers survive daylight. If someone punishes you for taking time, that is information about the offer.\n\n` +
        `## After you tick the boxes\n\nTurn the checklist into one action: a call, a cancellation, a comparison table, or a counsellor appointment. Then stop collecting browser tabs. A finished small action beats an unfinished research spiral.\n\nIf the checklist reveals essentials do not fit income, switch from optimisation to support—[Urgent help](/urgent) and free financial counselling exist for that gap.\n\n` +
        depth +
        `## What to do next\n\n- Finish the checklist above for **${t.toLowerCase()}**.\n${rel}\n- Store any confirmations where you can find them next month.${urgent}`
      );

    case "compare_choose":
      return (
        lead(guide, hub, slug) +
        `## The decision in one line\n\nFor **${t.toLowerCase()}**, you are usually choosing between: do nothing, change provider/product, or change behaviour (pay down, cancel, switch mode). ${d}\n\n${tools}` +
        `## Compare on a scrap of paper\n\nDraw three columns: **Option A**, **Option B**, **Do nothing**. Fill fees/rates, exit pain, waiting periods or conditions, and what happens if income drops. If you cannot fill a cell, that gap is the real risk.\n\nAdd a fourth row for “time cost”—hours of admin and emotional load. Cheap products that consume weekends are not cheap.\n\n` +
        `## Signals you should wait\n\n- The only “advantage” is a same-day discount.\n- You cannot get key numbers in writing.\n- You would need new debt to make the choice work.\n- Someone asks you to keep the decision secret.\n- You feel embarrassed to ask a basic question.\n\n` +
        `## Signals you can proceed\n\n- Constraints fit (cash flow, horizon, dependants).\n- Total cost is understood, not only the weekly drip.\n- You know how to reverse or review in 3–6 months.\n- Official sources (licences, PDS, government pages) match the sales story.\n\n` +
        `## After you choose\n\nDiary the review date. Map any automations that must move with the decision. Tell one trusted person if accountability helps you follow through.\n\n` +
        depth +
        `## What to do next\n\n- Build the three-column comparison for **${t.toLowerCase()}**.\n${rel}\n- Pick one option and schedule the review date.${urgent}`
      );

    case "story_then_rules":
      return (
        lead(guide, hub, slug) +
        `## A situation many people recognise\n\nSomeone dealing with **${t.toLowerCase()}** waited for a “quieter week,” then watched fees or stress compound. Another person wrote the outcome sentence, gathered two documents, and made one call—same starting point, better week.\n\n${d}\n\nThe difference was rarely intelligence. It was sequence: clarity, evidence, one action.\n\n${tools}` +
        `## Rules of thumb for ${t}\n\n- Prefer written confirmations over verbal promises.\n- Separate essentials from upgrades before you optimise.\n- If income is lumpy, plan from a low week, not a highlight reel.\n- Review after life changes (job, baby, move, separation).\n- Treat secrecy + urgency as a warning, not a compliment.\n\n` +
        `## Put the rules into a tiny system\n\n1. Name the outcome.\n2. Gather evidence.\n3. Take one reversible step.\n4. Diary a follow-up.\n\nRepeat monthly until the topic no longer owns your attention. Systems beat heroic one-offs.\n\n` +
        `## When the story involves other people\n\nShared money needs shared clarity. If you cannot talk safely about **${t.toLowerCase()}**, prioritise safety and support before product tweaks.\n\n` +
        depth +
        `## What to do next\n\n- Write your outcome sentence for **${t.toLowerCase()}**.\n${rel}\n- Take one reversible step within two days.${urgent}`
      );

    case "rights_and_safety":
      return (
        lead(guide, hub, slug) +
        `## Safety and fairness first\n\nTopics like **${t.toLowerCase()}** can involve pressure, confusing contracts, or money stress. ${d} You are allowed to pause, ask for information in writing, and seek free help.\n\n${tools}` +
        `## Your practical rights mindset\n\n- You can request hardship consideration from many essential providers and lenders.\n- You can complain through internal dispute resolution, then external schemes where relevant.\n- You should never share one-time codes or install remote access for a cold caller.\n- Secret + urgent + “guaranteed” is a warning pattern, not a privilege.\n- You can bring a support person to tough conversations.\n\n` +
        `## If you feel unsafe about money in a relationship\n\nControl of bank access, forced debt, or blocked essentials can be financial abuse. Support is available through 1800RESPECT (1800 737 732) and local services. Prioritise safety planning over “optimising” accounts.\n\n` +
        `## Calm next moves\n\nDocument dates and amounts. Contact providers on official numbers from statements or websites—not from texts. Use free financial counselling when debts stack faster than income. National Debt Helpline: 1800 007 007.\n\n` +
        depth +
        `## What to do next\n\n- If unsafe, seek support before joint financial changes.\n- Use [Urgent help](/urgent) when essentials are at risk.\n${rel}\n- Keep a call log with reference numbers.`
      );

    case "numbers_then_habits":
      return (
        lead(guide, hub, slug) +
        `## Start with numbers for ${t}\n\n${d}\n\nWrite: current balances or premiums, rates or fees, due dates, and the cash-flow impact if the number moves against you. Guessing creates false calm; statements create options.\n\n${tools}` +
        `## Translate numbers into a habit\n\nNumbers without a habit fade by next month. Pair each figure with a behaviour: an automated transfer, a renewal reminder, a spending cap, or a quarterly review of authorities.\n\nIf **${t.toLowerCase()}** involves investing or insurance, add a yearly calendar note for fees, beneficiaries, and sum insured—not only price.\n\n` +
        `## A 25-minute working block\n\nMinutes 1–5: outcome sentence.  
Minutes 6–15: dump numbers into one note.  
Minutes 16–20: circle the risk that hurts most.  
Minutes 21–25: one action with a deadline inside 48 hours.\n\n` +
        `## Keep it boring on purpose\n\nBoring systems survive busy weeks. Fancy spreadsheets you never open do not. Prefer alerts you will read over dashboards you will ignore.\n\n` +
        depth +
        `## What to do next\n\n- Capture the key numbers for **${t.toLowerCase()}** today.\n${rel}\n- Attach one habit (auto transfer, alert, or calendar).${urgent}`
      );

    case "timeline_journey":
      return (
        lead(guide, hub, slug) +
        `## Before you begin: ${t}\n\n${d} Gather ID, statements, and any existing contract. Decide who else must agree. If the topic touches credit or insurance, download the current document so you are not negotiating from memory.\n\n${tools}` +
        `## During the process\n\nExpect identity checks, cooling-off questions, and fine print on fees or waiting periods. Screenshot confirmations. Ask what happens if you change your mind in 14 days or six months. Write down names and reference numbers while you are still on the call or chat.\n\n` +
        `## After it is live\n\nMap automations, beneficiaries, and review dates. Tell a trusted person where documents live if they may need to help later. Check the first two statement cycles for surprises.\n\n` +
        `## If something goes wrong mid-way\n\nPause new payments. Contact the provider on an official channel. Escalate with a reference number if silence stretches. Do not send more money because someone claims a fee will “release” funds—that pattern is common in scams.\n\n` +
        depth +
        `## What to do next\n\n- Complete the “before” document gather for **${t.toLowerCase()}**.\n${rel}\n- Set a post-setup review reminder.${urgent}`
      );

    case "myths_and_fixes":
    default:
      return (
        lead(guide, hub, slug) +
        `## Myths around ${t}\n\n**Myth:** “If it is popular, it is safe.” **Fix:** Popularity is not a product disclosure statement.\n\n**Myth:** “The weekly amount is all that matters.” **Fix:** Total cost, exit fees, and what happens when rates or usage change matter more.\n\n**Myth:** “I can fix it later with another product.” **Fix:** Stacking products often multiplies fees.\n\n**Myth:** “Asking questions makes me difficult.” **Fix:** Clear questions are how adults buy things. ${d}\n\n${tools}` +
        `## A clearer frame\n\nTreat **${t.toLowerCase()}** as a decision with constraints. Write the constraints, then choose. If someone cannot explain fees in plain language, that is information about the offer—not about your intelligence.\n\n` +
        `## Fixes you can apply this month\n\n1. Replace one assumption with a number from a statement.\n2. Cancel or renegotiate one leftover commitment.\n3. Turn on one alert that surfaces problems early.\n4. Book one review date.\n5. Save official contact channels offline so a scam text cannot redirect you.\n\n` +
        `## What “done” looks like\n\nYou can explain the choice, the cost if wrong, and the next review date without opening fifteen tabs.\n\n` +
        depth +
        `## What to do next\n\n- Kill one myth with one document for **${t.toLowerCase()}**.\n${rel}\n- Apply one fix from the list above.${urgent}`
      );
  }
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function bodyOnly(raw) {
  const parts = raw.split(/^---\s*$/m);
  if (parts.length >= 3) return parts.slice(2).join("---").trim();
  return raw;
}

function rewriteGuide(group, guide, { force = false } = {}) {
  const { pillar, hub, guides } = group;
  const rel = `${pillar}/${hub}/${guide.slug}.md`;
  if (PRESERVE.has(rel)) return { status: "preserved", rel };

  const outFile = path.join(GUIDES_ROOT, pillar, hub, `${guide.slug}.md`);
  if (fs.existsSync(outFile) && !force) {
    const raw = fs.readFileSync(outFile, "utf8");
    const body = bodyOnly(raw);
    const short = wordCount(body) < 500;
    const templated =
      raw.includes(TEMPLATE_MARK) || raw.includes("## Upsides worth wanting");
    if (!templated && !short) {
      return { status: "skip-ok", rel };
    }
  }

  const format = FORMATS[hashSlug(guide.slug) % FORMATS.length];
  const related = siblingPaths(pillar, hub, guides, guide.slug).slice(0, 4);
  const fm = frontmatter(guide, pillar, hub, related);
  const body = bodyFor(format, guide, pillar, hub, guides).trim() + "\n";
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${fm}\n\n${body}`, "utf8");
  return { status: "wrote", rel, format };
}

function findGroup(pillar, hub) {
  return inventory.find((g) => g.pillar === pillar && g.hub === hub);
}

const args = process.argv.slice(2);
if (args[0] === "--all-templated") {
  let wrote = 0;
  for (const group of inventory) {
    for (const guide of group.guides) {
      const r = rewriteGuide(group, guide);
      if (r.status === "wrote") {
        wrote += 1;
        console.log(`wrote ${r.rel} [${r.format}]`);
      }
    }
  }
  console.log(`Done. Wrote ${wrote} guides.`);
} else if (args[0]) {
  const [pillar, hub, slug] = args[0].split("/");
  const group = findGroup(pillar, hub);
  const guide = group?.guides.find((g) => g.slug === slug);
  if (!guide) {
    console.error("Not found", args[0]);
    process.exit(1);
  }
  console.log(rewriteGuide(group, guide, { force: true }));
} else {
  console.log("Usage: node scripts/rewrite-one-guide.mjs --all-templated | pillar/hub/slug");
}
