/**
 * Live crawl for same-origin 404s (Playwright).
 * Usage: node scripts/crawl-404.mjs
 * Expects a server at BASE (default http://127.0.0.1:3000).
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3000";
const MAX_PAGES = Number(process.env.MAX_PAGES || 400);

const seeds = [
  "/",
  "/topics",
  "/tools",
  "/search",
  "/urgent",
  "/about",
  "/glossary",
];

function norm(href) {
  try {
    const u = new URL(href, BASE);
    if (u.origin !== new URL(BASE).origin) return null;
    let p = u.pathname;
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    return p;
  } catch {
    return null;
  }
}

const queue = [...seeds];
const seen = new Set();
const notFound = [];
const errors = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

while (queue.length && seen.size < MAX_PAGES) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);

  const res = await page.goto(BASE + path, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  }).catch((e) => {
    errors.push({ path, error: String(e.message || e) });
    return null;
  });
  if (!res) continue;

  const status = res.status();
  if (status === 404) {
    notFound.push(path);
    continue;
  }
  if (status >= 400) {
    errors.push({ path, error: `HTTP ${status}` });
    continue;
  }

  const hrefs = await page.$$eval("a[href]", (as) =>
    as.map((a) => a.getAttribute("href")),
  );
  for (const h of hrefs) {
    const p = norm(h);
    if (p && !seen.has(p) && !queue.includes(p)) queue.push(p);
  }
}

await browser.close();

console.log(`Crawled ${seen.size} pages from ${BASE}`);
console.log(`Queue remaining (capped): ${queue.length}`);
console.log(`404s: ${notFound.length}`);
for (const p of notFound) console.log(`  ${p}`);
if (errors.length) {
  console.log(`Other errors: ${errors.length}`);
  for (const e of errors.slice(0, 20)) console.log(`  ${e.path}: ${e.error}`);
}
if (notFound.length || errors.length) process.exitCode = 1;
else console.log("No 404s found in crawl.");
