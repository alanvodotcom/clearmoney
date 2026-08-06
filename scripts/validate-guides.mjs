/**
 * Validate ClearMoney guides against rewrite quality gates.
 * Run: node scripts/validate-guides.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { inventory } from "./generate-articles.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GUIDES_ROOT = path.join(__dirname, "..", "content", "guides");
const GOLD = path.join(
  GUIDES_ROOT,
  "banking-budgeting",
  "banking",
  "joint-accounts.md",
);

const STUB_MARKERS = [
  'Making "',
  "Making “",
  "Questions worth answering before you act",
  "A worked mini-plan for this topic",
  "Habits that keep this decision healthy",
  // Former single-template H2s — guides must not reuse this skeleton
  "## How to think about the moving parts",
  "## Upsides worth wanting",
  "## Risks and traps to watch",
  "## Details that change the decision",
  "## Practical steps for ",
];

function bodyOf(raw) {
  const parts = raw.split(/^---\s*$/m);
  if (parts.length >= 3) return parts.slice(2).join("---").trim();
  return raw;
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

const errors = [];
const warnings = [];
let checked = 0;

if (!fs.existsSync(GOLD)) {
  errors.push("Gold sample missing: joint-accounts.md");
}

for (const group of inventory) {
  const { pillar, hub, guides } = group;
  for (const guide of guides) {
    const file = path.join(GUIDES_ROOT, pillar, hub, `${guide.slug}.md`);
    checked += 1;
    if (!fs.existsSync(file)) {
      errors.push(`Missing: ${pillar}/${hub}/${guide.slug}.md`);
      continue;
    }
    const raw = fs.readFileSync(file, "utf8");
    const body = bodyOf(raw);
    const rel = `${pillar}/${hub}/${guide.slug}.md`;

    if (rel.replace(/\\/g, "/") === "banking-budgeting/banking/joint-accounts.md") {
      continue; // gold exempt from stub/word gates beyond existence
    }

    for (const marker of STUB_MARKERS) {
      if (body.includes(marker)) {
        errors.push(`Stub marker in ${rel}: ${marker}`);
      }
    }

    const h2 = [...body.matchAll(/^## .+$/gm)];
    if (h2.length < 3) {
      errors.push(`Too few H2s (${h2.length}) in ${rel}`);
    }
    if (!/^## What to do next\s*$/m.test(body)) {
      errors.push(`Missing "## What to do next" in ${rel}`);
    }

    const words = wordCount(body);
    if (words < 500) {
      errors.push(`Word count ${words} < 500 in ${rel}`);
    } else if (words < 600) {
      warnings.push(`Word count ${words} < 600 in ${rel}`);
    }
  }
}

console.log(`Checked ${checked} inventory guides.`);
if (warnings.length) {
  console.log(`Warnings (${warnings.length}):`);
  for (const w of warnings.slice(0, 20)) console.log("  -", w);
  if (warnings.length > 20) console.log(`  … +${warnings.length - 20} more`);
}
if (errors.length) {
  console.error(`Errors (${errors.length}):`);
  for (const e of errors.slice(0, 40)) console.error("  -", e);
  if (errors.length > 40) console.error(`  … +${errors.length - 40} more`);
  process.exit(1);
}
console.log("validate:guides OK");
