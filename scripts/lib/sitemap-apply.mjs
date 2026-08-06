/**
 * Apply helpers for MoneySmart sitemap sync: draft guides, inventory, tools, hub overrides.
 * Bodies are original ClearMoney drafts (topic map only — never scraped ASIC text).
 * Outline packs vary by slug hash so hub siblings do not share the same H2 sequence.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");
const CONTENT = path.join(root, "content");
const GUIDES = path.join(CONTENT, "guides");
const INVENTORY_FILE = path.join(root, "scripts", "generate-articles.mjs");
const PRESERVE_FILE = path.join(root, "scripts", "rewrite-one-guide.mjs");
const TAXONOMY_FILE = path.join(root, "src", "lib", "content", "taxonomy.ts");
const HUB_OVERRIDES = path.join(CONTENT, "hub-map-overrides.json");
const PENDING_TOOLS = path.join(CONTENT, "pending-tools.json");
const AGENT_BRIEF = path.join(CONTENT, "SITEMAP_APPLY_BRIEF.md");

export function titleFromSlug(slug) {
  return slug
    .split("-")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ")
    .replace(/\bSmsf\b/g, "SMSF")
    .replace(/\bEtf\b/g, "ETF")
    .replace(/\bEtfs\b/g, "ETFs")
    .replace(/\bGst\b/g, "GST")
    .replace(/\bHecs\b/g, "HECS")
    .replace(/\bCfd\b/g, "CFD")
    .replace(/\bCfds\b/g, "CFDs")
    .replace(/\bEto\b/g, "ETO")
    .replace(/\bEtos\b/g, "ETOs");
}

function hashSlug(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

/** Distinct H2 packs — pick by hash so siblings diverge. */
const OUTLINE_PACKS = [
  [
    "What this product or pitch actually is",
    "Costs and friction people skip past",
    "Who it might suit — and who it does not",
    "Pressure tactics and lookalike scams",
    "A calmer alternative for the same goal",
  ],
  [
    "Start with the outcome you want",
    "The mechanics in plain English",
    "Where retail users usually get hurt",
    "Checks before any money moves",
    "When to walk away completely",
  ],
  [
    "Why this topic shows up in headlines",
    "Rights, obligations, and fine print",
    "Leverage, timing, and total-loss paths",
    "Education funnels that monetise hope",
    "Safer defaults for long-term wealth",
  ],
  [
    "Separate marketing from the contract",
    "Cashflow and fee drag over a year",
    "Comparison points worth writing down",
    "Red flags in ads and cold contact",
    "If you already deposited",
  ],
  [
    "A short definition without jargon theatre",
    "Upside stories versus base rates",
    "Operational risks after you click buy",
    "Licence and URL hygiene",
    "Redirecting the same energy productively",
  ],
  [
    "What Australians are usually sold",
    "How settlement and exits really work",
    "Concentration and liquidity traps",
    "Social proof that is not evidence",
    "Building a boring plan instead",
  ],
];

function relatedFor(pillar, hub, slug) {
  const dir = path.join(GUIDES, pillar, hub);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== `${slug}.md`)
    .slice(0, 4)
    .map((f) => `${pillar}/${hub}/${f.replace(/\.md$/, "")}`);
}

function draftParagraphs(title, h2, idx, slug) {
  const t = title.toLowerCase();
  const openers = [
    `${title} is easy to oversimplify. Treat the next sections as a decision checklist, not a tip sheet.`,
    `When people search for ${t}, they often want a shortcut. ClearMoney covers the trade-offs first.`,
    `This page is general information for Australians—not personal advice. ${title} still deserves careful reading before money moves.`,
  ];
  const bodies = [
    `Focus on what you hold after you click: a right, an obligation, a bet, or ordinary ownership. If the answer is fuzzy, pause. ${title} marketing often borrows language from investing while delivering something closer to speculation. Write the product name and the payoff in one sentence you could explain to a friend.`,
    `List every fee, spread, financing charge, and exit friction you can find in the product disclosure or client agreement. Compare that total to a plain diversified approach over a year—not a single lucky week. Include account fees and currency conversion if the venue is offshore.`,
    `Write down your time horizon and the largest loss you could absorb without touching rent or essentials. If ${t} only works with leverage you cannot explain in plain English, it is not a beginner tool. Size any experiment so a total loss is annoying, not devastating.`,
    `Cold calls, cloned websites, crypto-only deposits, and “unlock fee” withdrawal stories are classic harm patterns. Verify licences on official registers yourself and type URLs manually. Use [/urgent](/urgent) if funds already left or remote access was granted. Keep chat logs and transaction IDs.`,
    `Many goals are met with cash buffers, debt reduction, and a simple long-term plan—without this product. Complexity is optional. If a salesperson mocks “boring” diversified investing, that is a sales tactic, not a market insight.`,
  ];
  const extras = [
    `Ask whether a licensed adviser would put this on a written statement of advice for someone in your situation. Silence is informative.`,
    `Screenshot claims of guaranteed returns or insider access and treat them as warnings, not invitations.`,
    `If support asks for OTPs, seed phrases, or remote desktop control, stop and report—real firms do not need that to “release profits.”`,
    `Paper outcomes and demo accounts are sales tools; live spreads and emotions differ.`,
    `Keep records of deposits, chats, and wallet addresses if you need to report a scam later.`,
    `Prefer venues you can contact through a phone number published on a site you typed yourself—not a link from a stranger.`,
  ];
  const key = Math.min(idx, bodies.length - 1);
  return `${openers[hashSlug(slug + h2) % openers.length]}

${bodies[key]}

${extras[(hashSlug(slug) + idx) % extras.length]}

Related reading depends on your hub: start from ClearMoney topic pages you already trust, and avoid opening new speculative accounts while stressed or sleep-deprived.`;
}

export function buildDraftGuide(item) {
  const { pillar, hub, slug, title, msPath } = item;
  const pack = OUTLINE_PACKS[hashSlug(slug) % OUTLINE_PACKS.length];
  const related = relatedFor(pillar, hub, slug);
  const today = new Date().toISOString().slice(0, 10);
  const lead = `${title} sits in ClearMoney’s topic map because Australians meet the pitch online and in seminars. This guide explains the mechanics and risks in original words—never copy another site’s text. General information only.`;

  const sections = pack
    .map((h2, i) => `## ${h2}\n\n${draftParagraphs(title, h2, i, slug)}`)
    .join("\n\n");

  const next = `## What to do next

- Write the outcome you want in one sentence before funding anything related to ${title.toLowerCase()}.
- Verify any firm’s licence and type the URL yourself ([check before you invest](/topics/scams-safety/check-report/check-before-you-invest)).
- Prefer a plain [investing plan](/topics/investing-planning/how-to-invest/develop-an-investing-plan) if long-term wealth is the real goal.
- Report blocked withdrawals via [report an investment scam](/topics/scams-safety/check-report/report-an-investment-scam).
- Use [/urgent](/urgent) immediately if you granted remote access or cannot recover funds.`;

  const fmRelated =
    related.length > 0
      ? related.map((r) => `  - ${r}`).join("\n")
      : `  - investing-planning/how-to-invest/develop-an-investing-plan`;

  return `---
title: ${JSON.stringify(title)}
description: ${JSON.stringify(`ClearMoney guide to ${title.toLowerCase()}—risks, checks, and calmer alternatives.`)}
pillar: ${pillar}
hub: ${hub}
slug: ${slug}
updated: "${today}"
tags:
  - ${hub}
relatedGuides:
${fmRelated}
---

<!-- Auto-drafted from MoneySmart topic map ${msPath}. Expand with topic-specific detail; do not scrape ASIC copy. -->

${lead}

${sections}

${next}
`;
}

export function writeGuideDraft(item, { overwrite = false } = {}) {
  const [pillar, hub, slug] = item.cmPath.split("/");
  // Avoid drafting a second guide when the slug already exists under another hub.
  function findExistingSlug(dir, base = "") {
    if (!fs.existsSync(dir)) return null;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = base ? `${base}/${ent.name}` : ent.name;
      if (ent.isDirectory()) {
        const hit = findExistingSlug(path.join(dir, ent.name), rel);
        if (hit) return hit;
      } else if (ent.name === `${slug}.md`) {
        return rel.replace(/\.md$/, "").replace(/\\/g, "/");
      }
    }
    return null;
  }
  const existing = findExistingSlug(GUIDES);
  if (existing && existing !== `${pillar}/${hub}/${slug}`) {
    return { skipped: true, file: path.join(GUIDES, `${existing}.md`), reason: "slug-elsewhere", existing };
  }

  const dir = path.join(GUIDES, pillar, hub);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${slug}.md`);
  if (fs.existsSync(file) && !overwrite) {
    const raw = fs.readFileSync(file, "utf8");
    if (!raw.includes("draft stub") && !raw.includes("TODO: original ClearMoney") && !raw.includes("Auto-drafted from MoneySmart")) {
      return { skipped: true, file, reason: "exists" };
    }
    // Do not overwrite polished guides; only replace thin auto-drafts when overwrite requested
    if (!overwrite) return { skipped: true, file, reason: "exists" };
  }
  fs.writeFileSync(file, buildDraftGuide({ ...item, pillar, hub, slug }), "utf8");
  return { skipped: false, file };
}

export function injectInventory(item) {
  let src = fs.readFileSync(INVENTORY_FILE, "utf8");
  // Slugs must be unique across the whole inventory (pillar pages key by slug).
  if (new RegExp(`slug:\\s*"${item.slug}"`).test(src)) {
    return { skipped: true, reason: "slug-exists" };
  }

  const blockRe = new RegExp(
    `(pillar:\\s*"${item.pillar}",\\s*\\n\\s*hub:\\s*"${item.hub}",\\s*\\n\\s*guides:\\s*\\[)([\\s\\S]*?)(\\n\\s*\\],)`,
  );
  const m = src.match(blockRe);
  if (!m) return { skipped: true, error: `hub block not found: ${item.pillar}/${item.hub}` };

  const line = `      { title: ${JSON.stringify(item.title)}, slug: ${JSON.stringify(item.slug)}, description: ${JSON.stringify(`ClearMoney guide to ${item.title.toLowerCase()}.`)} },\n`;

  src = src.replace(blockRe, `$1$2${line}$3`);
  fs.writeFileSync(INVENTORY_FILE, src, "utf8");
  return { skipped: false };
}

export function appendPreserve(item) {
  const rel = `${item.pillar}/${item.hub}/${item.slug}.md`;
  let src = fs.readFileSync(PRESERVE_FILE, "utf8");
  if (src.includes(`"${rel}"`)) return { skipped: true };
  // Insert before closing of PRESERVE array — find a known neighbour pattern
  const needle = `  // super-retirement (unique outlines)`;
  if (src.includes(needle)) {
    src = src.replace(needle, `  "${rel}",\n${needle}`);
    fs.writeFileSync(PRESERVE_FILE, src, "utf8");
    return { skipped: false };
  }
  return { skipped: true, error: "preserve anchor missing" };
}

export function loadHubOverrides() {
  if (!fs.existsSync(HUB_OVERRIDES)) return {};
  try {
    return JSON.parse(fs.readFileSync(HUB_OVERRIDES, "utf8"));
  } catch {
    return {};
  }
}

export function guessMapForL2(l2) {
  const s = l2.toLowerCase();
  if (/loan|credit|debt|mortgage|borrow|bnpl|payday/.test(s))
    return { pillar: "loans-credit-debt", hub: l2.slice(0, 40) };
  if (/bank|budget|sav|tax|family|work-and/.test(s))
    return { pillar: "banking-budgeting", hub: l2.slice(0, 40) };
  if (/super|retire|pension/.test(s))
    return { pillar: "super-retirement", hub: l2.slice(0, 40) };
  if (/insur|disaster/.test(s)) return { pillar: "insurance", hub: l2.slice(0, 40) };
  if (/scam|safety|online|cyber/.test(s))
    return { pillar: "scams-safety", hub: l2.slice(0, 40) };
  if (/teach|student|publication|nation|stor|unclaim|communit/.test(s))
    return { pillar: "community", hub: l2.slice(0, 40) };
  if (/invest|share|fund|option|future|crypto|warn|complex|etf|cfd|forex/.test(s))
    return { pillar: "investing-planning", hub: "warnings" };
  return { pillar: "investing-planning", hub: l2.slice(0, 40) };
}

export function applyUnmappedOverrides(unmappedPaths) {
  const overrides = loadHubOverrides();
  let added = 0;
  for (const p of unmappedPaths) {
    const l2 = p.split("/").filter(Boolean)[0];
    if (!l2 || overrides[l2]) continue;
    overrides[l2] = guessMapForL2(l2);
    added += 1;
  }
  if (added) {
    fs.writeFileSync(HUB_OVERRIDES, JSON.stringify(overrides, null, 2) + "\n", "utf8");
  }
  return { added, overrides };
}

export function ensureTaxonomyHub(pillar, hubId) {
  let src = fs.readFileSync(TAXONOMY_FILE, "utf8");
  if (src.includes(`id: "${hubId}"`)) return { skipped: true };
  const entry = `
  {
    id: "${hubId}",
    pillar: "${pillar}",
    title: ${JSON.stringify(titleFromSlug(hubId))},
    description: "Auto-added from MoneySmart sitemap sync — refine copy.",
  },`;
  // Insert before "// Super" or end of hubs array — find first hubs closing after warnings is fragile; append before `];` of hubs
  const marker = `\n  // Super\n`;
  if (src.includes(marker)) {
    src = src.replace(marker, `${entry}${marker}`);
  } else {
    src = src.replace(
      /\nexport const tools:/,
      `${entry}\n];\n\nexport const tools:`,
    );
    // That could break if hubs already closed — only use marker path
    return { skipped: true, error: "hub insert marker missing" };
  }
  fs.writeFileSync(TAXONOMY_FILE, src, "utf8");
  return { skipped: false };
}

export function writePendingTools(tools) {
  fs.writeFileSync(
    PENDING_TOOLS,
    JSON.stringify({ generated: new Date().toISOString().slice(0, 10), tools }, null, 2) +
      "\n",
    "utf8",
  );
  return PENDING_TOOLS;
}

export function writeAgentBrief({ newGuides, newTools, unmapped, applied }) {
  const body = `# Sitemap apply brief

Generated: ${new Date().toISOString()}

## Applied this run

${applied || "_none_"}

## Still needs human / agent polish

### Guides (auto-drafted — expand to topic-specific H2s if thin)

${
  newGuides.length
    ? newGuides.map((g) => `- \`${g.cmPath}\` (MS \`${g.msPath}\`)`).join("\n")
    : "_None._"
}

### Tools (need calculator UI in \`src/components/calculators\` + taxonomy)

${
  newTools.length
    ? newTools
        .map((t) => `- \`${t.suggestedToolId}\` ← MS \`${t.msPath}\``)
        .join("\n")
    : "_None._"
}

### Unmapped (hub-map overrides may have been guessed — verify)

${
  unmapped.length
    ? unmapped.map((p) => `- \`${p}\``).join("\n")
    : "_None._"
}

## Agent checklist

1. Read \`content/GUIDE_STYLE.md\`.
2. Rewrite any auto-draft that still feels generic — unique H2s per guide.
3. For tools: add taxonomy entry + registry component (do not scrape ASIC).
4. Run \`npm run validate:guides\` and \`npm run check:links\`.
`;
  fs.writeFileSync(AGENT_BRIEF, body, "utf8");
  return AGENT_BRIEF;
}
