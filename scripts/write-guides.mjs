/**
 * Writes original ClearMoney markdown guides from inventory + composeBody.
 * Run: node scripts/write-guides.mjs
 * SKIP_EXISTING=1 — skip any file that already exists (joint-accounts always preserved).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { inventory } from "./generate-articles.mjs";
import { composeBody } from "./guide-bodies/compose.mjs";
import {
  frontmatter,
  siblingPaths,
} from "./guide-bodies/_helpers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const GUIDES_ROOT = path.join(root, "content", "guides");
const SKIP_EXISTING = process.env.SKIP_EXISTING === "1";
const GOLD_REL = "banking-budgeting/banking/joint-accounts.md";

/** Hand-crafted guides — never overwritten by the composer. */
const PRESERVE = new Set([
  GOLD_REL,
  "banking-budgeting/banking/transaction-accounts-and-debit-cards.md",
  "banking-budgeting/banking/savings-accounts.md",
  "banking-budgeting/banking/direct-debits.md",
  "banking-budgeting/banking/sending-money-overseas.md",
  "banking-budgeting/banking/unauthorised-and-mistaken-transactions.md",
]);

function isPreserved(relPosix) {
  return PRESERVE.has(relPosix.replace(/\\/g, "/"));
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

      if (isPreserved(rel) && exists) {
        skipped += 1;
        continue;
      } else if (SKIP_EXISTING && exists) {
        skipped += 1;
        continue;
      }

      const related = siblingPaths(pillar, hub, guides, guide.slug).slice(0, 4);
      const body = composeBody(guide, pillar, hub, guides);
      const fm = frontmatter(guide, pillar, hub, related);
      fs.writeFileSync(outFile, `${fm}\n\n${body}`, "utf8");
      written += 1;
    }
  }

  // Preserve campaign-resources if present (not always in inventory)
  console.log(`Wrote ${written} guide(s); skipped ${skipped}.`);
  return { written, skipped };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  writeGuides();
}
