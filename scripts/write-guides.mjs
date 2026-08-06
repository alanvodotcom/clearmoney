/**
 * Syncs inventory frontmatter onto per-guide markdown bodies.
 * Bodies live only in content/guides/{pillar}/{hub}/{slug}.md — each guide is
 * authored separately (no shared section template).
 *
 * Run: node scripts/write-guides.mjs
 * Does NOT invent bodies. Missing files are reported; use authoring agents/editors.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { inventory } from "./generate-articles.mjs";
import { frontmatter, siblingPaths } from "./guide-bodies/_helpers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GUIDES_ROOT = path.join(__dirname, "..", "content", "guides");

function splitMatter(raw) {
  if (!raw.startsWith("---")) {
    return { fm: null, body: raw.trim() + "\n" };
  }
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { fm: null, body: raw.trim() + "\n" };
  const body = raw.slice(end + 4).replace(/^\s+/, "");
  return { fm: raw.slice(0, end + 4), body: body.trim() + "\n" };
}

export function writeGuides() {
  let synced = 0;
  const missing = [];

  for (const group of inventory) {
    const { pillar, hub, guides } = group;
    const dir = path.join(GUIDES_ROOT, pillar, hub);
    fs.mkdirSync(dir, { recursive: true });

    for (const guide of guides) {
      const fileName = `${guide.slug}.md`;
      const outFile = path.join(dir, fileName);
      const related = siblingPaths(pillar, hub, guides, guide.slug).slice(0, 4);
      const fm = frontmatter(guide, pillar, hub, related);

      if (!fs.existsSync(outFile)) {
        missing.push(`${pillar}/${hub}/${guide.slug}.md`);
        continue;
      }

      const raw = fs.readFileSync(outFile, "utf8");
      const { body } = splitMatter(raw);
      if (!body.trim()) {
        missing.push(`${pillar}/${hub}/${guide.slug}.md (empty body)`);
        continue;
      }

      fs.writeFileSync(outFile, `${fm}\n\n${body}`, "utf8");
      synced += 1;
    }
  }

  console.log(`Synced frontmatter on ${synced} guide(s).`);
  if (missing.length) {
    console.error(`Missing/empty bodies (${missing.length}):`);
    for (const m of missing.slice(0, 30)) console.error("  -", m);
    if (missing.length > 30) console.error(`  … +${missing.length - 30} more`);
    process.exitCode = 1;
  }
  return { synced, missing };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  writeGuides();
}
