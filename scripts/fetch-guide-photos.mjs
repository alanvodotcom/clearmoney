/**
 * Download curated Unsplash photos into public/guide-photos/.
 * Licence: https://unsplash.com/license (free to use; attribution appreciated).
 *
 * Run: node scripts/fetch-guide-photos.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "guide-photos");

/** id → Unsplash images CDN URL (fixed photo ids, cropped). */
const PHOTOS = {
  "bank-card":
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=960&h=640&fit=crop&q=75&auto=format",
  "direct-debit":
    "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=960&h=640&fit=crop&q=75&auto=format",
  "budget-buckets":
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=960&h=640&fit=crop&q=75&auto=format",
  "savings-jar":
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=960&h=640&fit=crop&q=75&auto=format",
  payslip:
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=960&h=640&fit=crop&q=75&auto=format",
  "family-money":
    "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=960&h=640&fit=crop&q=75&auto=format",
  "loan-stack":
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=960&h=640&fit=crop&q=75&auto=format",
  "credit-card-cycle":
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=960&h=640&fit=crop&q=75&auto=format",
  "home-loan":
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=960&h=640&fit=crop&q=75&auto=format",
  "hardship-path":
    "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=960&h=640&fit=crop&q=75&auto=format",
  "invest-plan":
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=960&h=640&fit=crop&q=75&auto=format",
  "diversify-dots":
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=960&h=640&fit=crop&q=75&auto=format",
  "shares-trade":
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=960&h=640&fit=crop&q=75&auto=format",
  "property-invest":
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=960&h=640&fit=crop&q=75&auto=format",
  "interest-invest":
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=960&h=640&fit=crop&q=75&auto=format",
  "warning-triangle":
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=960&h=640&fit=crop&q=75&auto=format",
  "complex-product":
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=960&h=640&fit=crop&q=75&auto=format",
  "super-growth":
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=960&h=640&fit=crop&q=75&auto=format",
  "retirement-clock":
    "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=960&h=640&fit=crop&q=75&auto=format",
  "income-sources":
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=960&h=640&fit=crop&q=75&auto=format",
  "insurance-shield":
    "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=960&h=640&fit=crop&q=75&auto=format",
  "car-insurance":
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=960&h=640&fit=crop&q=75&auto=format",
  "home-insurance":
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=960&h=640&fit=crop&q=75&auto=format",
  "scam-stop":
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=960&h=640&fit=crop&q=75&auto=format",
  "online-safety":
    "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=960&h=640&fit=crop&q=75&auto=format",
  "community-help":
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=960&h=640&fit=crop&q=75&auto=format",
  "money-transfer":
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=960&h=640&fit=crop&q=75&auto=format",
  "tax-brackets":
    "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=960&h=640&fit=crop&q=75&auto=format",
  "micro-habit":
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=960&h=640&fit=crop&q=75&auto=format",
  "checklist-board":
    "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=960&h=640&fit=crop&q=75&auto=format",
};

fs.mkdirSync(outDir, { recursive: true });

async function fetchOne(id, url) {
  const dest = path.join(outDir, `${id}.jpg`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 10_000) {
    console.log("skip", id);
    return;
  }
  const res = await fetch(url, {
    headers: {
      "User-Agent": "ClearMoneyGuidePhotos/1.0 (local portfolio; Unsplash licence)",
      Accept: "image/avif,image/webp,image/jpeg,*/*",
    },
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) throw new Error(`${id} HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  console.log("saved", id, `${Math.round(buf.length / 1024)}kb`);
}

async function main() {
  for (const [id, url] of Object.entries(PHOTOS)) {
    try {
      await fetchOne(id, url);
    } catch (e) {
      console.error("fail", id, e.message);
    }
  }
}

main();
