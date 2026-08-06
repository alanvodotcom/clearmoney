/**
 * Static internal-link checker — finds paths that would 404.
 * Usage: node scripts/check-internal-links.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { inventory } from "./generate-articles.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const staticRoutes = new Set([
  "/",
  "/about",
  "/glossary",
  "/search",
  "/tools",
  "/topics",
  "/urgent",
]);

const articles = new Set();
const hubs = new Set();
const pillars = new Set();

for (const h of inventory) {
  pillars.add("/topics/" + h.pillar);
  hubs.add("/topics/" + h.pillar + "/" + h.hub);
  for (const g of h.guides) {
    articles.add(`/topics/${h.pillar}/${h.hub}/${g.slug}`);
  }
}

// Disk walk for extras (e.g. campaign-resources)
function walkGuides(dir, base = "") {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${ent.name}` : ent.name;
    if (ent.isDirectory()) walkGuides(path.join(dir, ent.name), rel);
    else if (ent.name.endsWith(".md")) {
      const parts = rel.replace(/\.md$/, "").split("/");
      if (parts.length === 3) {
        articles.add(`/topics/${parts.join("/")}`);
        pillars.add(`/topics/${parts[0]}`);
        hubs.add(`/topics/${parts[0]}/${parts[1]}`);
      }
    }
  }
}
walkGuides(path.join(root, "content", "guides"));

const taxonomySrc = fs.readFileSync(
  path.join(root, "src", "lib", "content", "taxonomy.ts"),
  "utf8",
);
const tools = new Set(
  [...taxonomySrc.matchAll(/href:\s*"(\/tools\/[^"]+)"/g)].map((m) => m[1]),
);

function exists(pathname) {
  if (staticRoutes.has(pathname)) return true;
  if (pathname === "/topics" || pillars.has(pathname) || hubs.has(pathname))
    return true;
  if (articles.has(pathname)) return true;
  if (pathname.startsWith("/tools/") && tools.has(pathname)) return true;
  if (pathname === "/tools") return true;
  return false;
}

const linkRe =
  /(?:\]\(|href=["']|href:\s*["'`])(\/(?:topics|tools|urgent|about|glossary|search)[^)"'\s`]*)/g;

const broken = [];
const checkedFiles = [];

function scanFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const rel = path.relative(root, filePath).replace(/\\/g, "/");
  let m;
  const found = new Set();
  linkRe.lastIndex = 0;
  while ((m = linkRe.exec(text)) !== null) {
    let url = m[1].split("#")[0].split("?")[0];
    if (url.length > 1 && url.endsWith("/")) url = url.slice(0, -1);
    found.add(url);
  }
  // relatedGuides frontmatter paths
  if (rel.startsWith("content/guides/")) {
    const related = text.match(/relatedGuides:\s*\n((?:\s+-\s+[^\n]+\n?)+)/);
    if (related) {
      for (const line of related[1].split("\n")) {
        const p = line.match(/-\s+([a-z0-9/-]+)/);
        if (p) found.add("/topics/" + p[1]);
      }
    }
    const relatedTools = text.match(/relatedTools:\s*\n((?:\s+-\s+[^\n]+\n?)+)/);
    if (relatedTools) {
      for (const line of relatedTools[1].split("\n")) {
        const p = line.match(/-\s+([a-z0-9-]+)/);
        if (p) found.add("/tools/" + p[1]);
      }
    }
  }
  for (const url of found) {
    if (!exists(url)) broken.push({ file: rel, url });
  }
  checkedFiles.push(rel);
}

function walkScan(dir, filter) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === ".next") continue;
      walkScan(full, filter);
    } else if (filter(ent.name)) scanFile(full);
  }
}

walkScan(path.join(root, "content", "guides"), (n) => n.endsWith(".md"));
walkScan(path.join(root, "src"), (n) => /\.(tsx|ts|jsx|js|mdx)$/.test(n));

// Deduplicate
const uniq = new Map();
for (const b of broken) {
  const key = `${b.url}@@${b.file}`;
  uniq.set(key, b);
}
const list = [...uniq.values()].sort((a, b) =>
  a.url.localeCompare(b.url) || a.file.localeCompare(b.file),
);

console.log(`Scanned ${checkedFiles.length} files.`);
console.log(
  `Known routes: ${articles.size} articles, ${tools.size} tools, ${hubs.size} hubs, ${pillars.size} pillars.`,
);
console.log(`Broken internal links: ${list.length}`);
for (const b of list) {
  console.log(`  ${b.url}`);
  console.log(`    ← ${b.file}`);
}
if (list.length) process.exitCode = 1;
