/**
 * Sync MoneySmart sitemap → ClearMoney gap report (+ optional scaffolding).
 *
 * Usage:
 *   npm run sync:sitemap              # fetch, report, apply drafts/inventory (default)
 *   npm run sync:sitemap -- --offline # local XML only (+ apply)
 *   npm run sync:sitemap -- --report-only # gap report only, no file writes beyond report/pending
 *   npm run sync:sitemap -- --no-apply    # same as report-only for apply side effects
 *
 * Never scrapes MoneySmart page HTML. Titles come from URL slugs.
 * --apply drafts original ClearMoney starter copy (GUIDE_STYLE) — expand before treating as final.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { inventory } from "./generate-articles.mjs";
import {
  applyUnmappedOverrides,
  appendPreserve,
  ensureTaxonomyHub,
  injectInventory,
  loadHubOverrides,
  writeAgentBrief,
  writeGuideDraft,
  writePendingTools,
} from "./lib/sitemap-apply.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const CONTENT = path.join(root, "content");
const GUIDES = path.join(CONTENT, "guides");
/** Live XML urlset (not /sitemap.xml — that 404s). */
const SITEMAP_URL = "https://moneysmart.gov.au/sitemap";
const SITEMAP_URL_FALLBACKS = [
  "https://www.moneysmart.gov.au/sitemap",
];
const LOCAL_SITEMAP = path.join(CONTENT, "moneysmart-sitemap.xml");
const LOCAL_URLS = path.join(CONTENT, "moneysmart-urls.txt");
const REPORT = path.join(CONTENT, "SITEMAP_SYNC_REPORT.md");
const PENDING = path.join(CONTENT, "pending-from-sitemap.json");

const OFFLINE = process.argv.includes("--offline");
const REPORT_ONLY = process.argv.includes("--report-only");
const APPLY =
  !REPORT_ONLY &&
  (process.argv.includes("--apply") ||
    process.argv.includes("--scaffold") ||
    !process.argv.includes("--no-apply"));
// Default: apply (scaffold + draft + inventory). Use --report-only to skip writes.
/** MoneySmart L2 path segment → ClearMoney { pillar, hub } */
const HUB_MAP = {
  banking: { pillar: "banking-budgeting", hub: "banking" },
  budgeting: { pillar: "banking-budgeting", hub: "budgeting" },
  saving: { pillar: "banking-budgeting", hub: "saving" },
  "work-and-tax": { pillar: "banking-budgeting", hub: "work-tax" },
  "family-and-relationships": { pillar: "banking-budgeting", hub: "family" },
  loans: { pillar: "loans-credit-debt", hub: "loans" },
  "other-ways-to-borrow": { pillar: "loans-credit-debt", hub: "other-borrowing" },
  "credit-cards": { pillar: "loans-credit-debt", hub: "credit-cards" },
  "home-loans": { pillar: "loans-credit-debt", hub: "home-loans" },
  "managing-debt": { pillar: "loans-credit-debt", hub: "managing-debt" },
  "how-to-invest": { pillar: "investing-planning", hub: "how-to-invest" },
  "financial-advice": { pillar: "investing-planning", hub: "advice" },
  shares: { pillar: "investing-planning", hub: "shares" },
  "managed-funds-and-etfs": { pillar: "investing-planning", hub: "funds-etfs" },
  "property-investment": { pillar: "investing-planning", hub: "property" },
  "investments-paying-interest": {
    pillar: "investing-planning",
    hub: "interest-investments",
  },
  "investment-warnings": { pillar: "investing-planning", hub: "warnings" },
  "complex-investment-products": {
    pillar: "investing-planning",
    hub: "warnings",
  },
  retirement: { pillar: "super-retirement", hub: "retirement" },
  "how-super-works": { pillar: "super-retirement", hub: "how-super-works" },
  "grow-your-super": { pillar: "super-retirement", hub: "grow-super" },
  "plan-for-your-retirement": {
    pillar: "super-retirement",
    hub: "plan-retirement",
  },
  "retirement-income-sources": {
    pillar: "super-retirement",
    hub: "income-sources",
  },
  "manage-your-money-in-retirement": {
    pillar: "super-retirement",
    hub: "manage-retirement",
  },
  "how-life-insurance-works": { pillar: "insurance", hub: "life-insurance" },
  "car-insurance": { pillar: "insurance", hub: "car-insurance" },
  "home-insurance": { pillar: "insurance", hub: "home-insurance" },
  "add-on-insurance": { pillar: "insurance", hub: "add-on-insurance" },
  "other-types-of-insurance": { pillar: "insurance", hub: "other-insurance" },
  "dealing-with-natural-disasters": {
    pillar: "insurance",
    hub: "natural-disasters",
  },
  "online-safety": { pillar: "scams-safety", hub: "online-safety" },
  "financial-scams": { pillar: "scams-safety", hub: "financial-scams" },
  "check-and-report-scams": { pillar: "scams-safety", hub: "check-report" },
  "find-unclaimed-money": { pillar: "community", hub: "unclaimed-money" },
  teaching: { pillar: "community", hub: "teachers" },
  "student-life-and-money": { pillar: "community", hub: "students" },
  "publications-and-resources": { pillar: "community", hub: "publications" },
  "supporting-first-nations-people-with-money-matters": {
    pillar: "community",
    hub: "first-nations",
  },
  "your-stories": { pillar: "community", hub: "your-stories" },
};

Object.assign(HUB_MAP, loadHubOverrides());

/** Standalone MoneySmart paths → ClearMoney article path */
const STANDALONE = {
  "protect-your-super-from-pushy-sales-calls":
    "super-retirement/grow-super/protect-your-super-from-pushy-sales-calls",
};

const EXCLUDE_PREFIXES = [
  "/glossary",
  "/media-centre",
  "/about-us",
  "/contact-us",
  "/subscribe-to-our-newsletter",
  "/sitemap",
  "/accessibility",
  "/privacy",
  "/copyright",
  "/disclaimer",
  // Campaign language mirrors — not ClearMoney guide topics
  "/retirement/translated",
];

const LOCALE_SEGMENTS = new Set([
  "ar",
  "vi",
  "zh-hans",
  "zh-hant",
  "en",
]);

/** MoneySmart leaf path → ClearMoney guide path (slug remaps) */
const GUIDE_ALIASES = {
  "/publications-and-resources/money-tips-in-other-languages/budgeting-and-saving":
    "community/publications/budgeting-and-saving-tips",
  "/publications-and-resources/money-tips-in-other-languages/credit-and-debt":
    "community/publications/credit-and-debt-tips",
  "/publications-and-resources/money-tips-in-other-languages/insurance":
    "community/publications/insurance-tips",
  "/publications-and-resources/money-tips-in-other-languages/superannuation":
    "community/publications/superannuation-tips",
  // MS moved several warning topics under a new L2 hub
  "/complex-investment-products/what-is-private-credit":
    "investing-planning/how-to-invest/what-is-private-credit",
  "/complex-investment-products/crypto-assets":
    "investing-planning/warnings/crypto-assets",
  "/complex-investment-products/forex-trading":
    "investing-planning/warnings/forex-trading",
  "/complex-investment-products/contracts-for-difference-cfds":
    "investing-planning/warnings/contracts-for-difference-cfds",
  "/complex-investment-products/bills-of-exchange":
    "investing-planning/warnings/bills-of-exchange",
  "/complex-investment-products/peer-to-peer-lending":
    "investing-planning/funds-etfs/peer-to-peer-lending",
};

/**
 * Paths that are calculators/tools on MoneySmart (not guides).
 * Prefer explicit endings so guide pages like /loans/payday-loans stay guides.
 */
const TOOL_PATH_RE =
  /-(?:calculator|optimiser|optimizer)$|comparison-tool$|\/budget-planner$|\/simple-money-manager$|\/savings-goals-calculator$|\/retirement-planner$/;

/** MoneySmart tool path → ClearMoney /tools/{id} */
const TOOL_ALIASES = {
  "/grow-your-super/super-contributions-optimiser":
    "super-contributions-optimiser",
  "/how-life-insurance-works/life-insurance-claims-comparison-tool":
    "life-claims-comparison",
  "/how-super-works/superannuation-calculator": "super",
  "/plan-for-your-retirement/super-and-pension-age-calculator":
    "super-pension-age",
  "/retirement-income-sources/reverse-mortgage-calculator": "reverse-mortgage",
  "/home-loans/mortgage-switching-calculator": "refinance-break-even",
  "/managed-funds-and-etfs/managed-funds-fee-calculator": "fee-drag",
  "/how-life-insurance-works/life-insurance-calculator": "insurance-needs",
  "/loans/payday-loan-calculator": "payday-loan",
  "/loans/personal-loan-calculator": "personal-loan",
  "/credit-cards/credit-card-calculator": "credit-card",
  "/home-loans/mortgage-calculator": "mortgage",
  "/budgeting/budget-planner": "budget-planner",
  "/saving/compound-interest-calculator": "compound-interest",
  "/work-and-tax/income-tax-calculator": "income-tax",
  "/work-and-tax/gst-calculator": "gst",
};
function titleFromSlug(slug) {
  return slug
    .split("-")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ")
    .replace(/\bSmsf\b/g, "SMSF")
    .replace(/\bEtf\b/g, "ETF")
    .replace(/\bEtfs\b/g, "ETFs")
    .replace(/\bGst\b/g, "GST")
    .replace(/\bHecs\b/g, "HECS")
    .replace(/\bAi\b/g, "AI")
    .replace(/\bTpd\b/g, "TPD");
}

function parseLocs(xml) {
  const locs = [];
  const re = /<loc>\s*([^<]+)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml))) {
    locs.push(m[1].trim().replace(/\/$/, ""));
  }
  return locs;
}

async function fetchSitemapXml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "ClearMoneySitemapSync/1.0 (+local portfolio clone; not affiliated with ASIC)",
      Accept: "application/xml,text/xml,*/*",
    },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) {
    return { ok: false, status: res.status, xml: null };
  }
  const xml = await res.text();
  if (!xml.includes("<loc>")) {
    return { ok: false, status: res.status, xml: null, reason: "no-loc" };
  }
  return { ok: true, status: res.status, xml };
}

async function loadSitemap() {
  if (!OFFLINE) {
    const candidates = [SITEMAP_URL, ...SITEMAP_URL_FALLBACKS];
    for (const url of candidates) {
      try {
        const result = await fetchSitemapXml(url);
        if (result.ok) {
          fs.writeFileSync(LOCAL_SITEMAP, result.xml, "utf8");
          console.log(`Fetched live sitemap (${url}) → content/moneysmart-sitemap.xml`);
          return result.xml;
        }
        console.warn(
          `Live fetch ${url} → HTTP ${result.status}${result.reason ? ` (${result.reason})` : ""}; trying next…`,
        );
      } catch (e) {
        console.warn(`Live fetch ${url} failed (${e.message}); trying next…`);
      }
    }
    console.warn("All live sitemap URLs failed; falling back to local snapshot.");
  }
  if (!fs.existsSync(LOCAL_SITEMAP)) {
    throw new Error("No local sitemap at content/moneysmart-sitemap.xml");
  }
  console.log("Using offline snapshot content/moneysmart-sitemap.xml");
  return fs.readFileSync(LOCAL_SITEMAP, "utf8");
}

function classifyPath(pathname) {
  for (const p of EXCLUDE_PREFIXES) {
    if (pathname === p || pathname.startsWith(p + "/")) {
      return { kind: "excluded", reason: p };
    }
  }
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return { kind: "excluded", reason: "home" };
  if (LOCALE_SEGMENTS.has(parts[parts.length - 1]) && parts.length >= 3) {
    return { kind: "excluded", reason: "locale-mirror" };
  }

  // Standalone
  if (parts.length === 1 && STANDALONE[parts[0]]) {
    return {
      kind: "guide",
      msPath: pathname,
      cmPath: STANDALONE[parts[0]],
      slug: parts[0],
      title: titleFromSlug(parts[0]),
    };
  }

  // Pillar-only or insurance landing
  if (parts.length === 1) {
    if (HUB_MAP[parts[0]] || parts[0] === "insurance") {
      return { kind: "hub-or-pillar", msPath: pathname, segment: parts[0] };
    }
    return { kind: "unmapped", msPath: pathname };
  }

  const l2 = parts[0];
  const map = HUB_MAP[l2];
  if (!map) {
    return { kind: "unmapped", msPath: pathname };
  }

  // Hub landing
  if (parts.length === 1) {
    return { kind: "hub-or-pillar", msPath: pathname, segment: l2 };
  }

  // L3 leaf (or L4 under publications money-tips)
  let slug = parts[parts.length - 1];
  // Skip hub-only when path is exactly /hub
  if (parts.length === 2 && parts[1] === undefined) {
    return { kind: "hub-or-pillar", msPath: pathname, segment: l2 };
  }

  const leafPath = parts.slice(1).join("/");
  // Hub index with no leaf
  if (parts.length === 1) {
    return { kind: "hub-or-pillar", msPath: pathname, segment: l2 };
  }

  if (GUIDE_ALIASES[pathname]) {
    const cmPath = GUIDE_ALIASES[pathname];
    const segs = cmPath.split("/");
    return {
      kind: "guide",
      msPath: pathname,
      cmPath,
      pillar: segs[0],
      hub: segs[1],
      slug: segs[2],
      title: titleFromSlug(segs[2]),
    };
  }

  // /publications-and-resources/money-tips-in-other-languages/{topic}
  if (
    l2 === "publications-and-resources" &&
    parts[1] === "money-tips-in-other-languages"
  ) {
    if (parts.length === 2) {
      return {
        kind: "guide",
        msPath: pathname,
        cmPath: `${map.pillar}/${map.hub}/money-tips-in-other-languages`,
        pillar: map.pillar,
        hub: map.hub,
        slug: "money-tips-in-other-languages",
        title: "Money tips in other languages",
      };
    }
    slug = parts[2];
  }

  if (TOOL_ALIASES[pathname] || TOOL_PATH_RE.test(pathname)) {
    const toolId =
      TOOL_ALIASES[pathname] ||
      slug
        .replace(/-calculator$/, "")
        .replace(/-optimiser$/, "")
        .replace(/-optimizer$/, "")
        .replace(/-comparison-tool$/, "")
        .replace(/-tool$/, "");
    return {
      kind: "tool",
      msPath: pathname,
      suggestedToolId: toolId,
      title: titleFromSlug(toolId),
    };
  }

  if (parts.length >= 2) {
    return {
      kind: "guide",
      msPath: pathname,
      cmPath: `${map.pillar}/${map.hub}/${slug}`,
      pillar: map.pillar,
      hub: map.hub,
      slug,
      title: titleFromSlug(slug),
    };
  }

  return { kind: "unmapped", msPath: pathname };
}

function knownClearMoney() {
  const guides = new Set();
  for (const h of inventory) {
    for (const g of h.guides) {
      guides.add(`${h.pillar}/${h.hub}/${g.slug}`);
    }
  }
  // disk extras
  function walk(dir, base = "") {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = base ? `${base}/${ent.name}` : ent.name;
      if (ent.isDirectory()) walk(path.join(dir, ent.name), rel);
      else if (ent.name.endsWith(".md")) {
        const parts = rel.replace(/\.md$/, "").split("/");
        if (parts.length === 3) guides.add(parts.join("/"));
      }
    }
  }
  walk(GUIDES);

  const taxonomy = fs.readFileSync(
    path.join(root, "src", "lib", "content", "taxonomy.ts"),
    "utf8",
  );
  const tools = new Set(
    [...taxonomy.matchAll(/href:\s*"\/tools\/([^"]+)"/g)].map((m) => m[1]),
  );
  return { guides, tools };
}

function inventorySnippet(item) {
  return `      { title: ${JSON.stringify(item.title)}, slug: ${JSON.stringify(item.slug)}, description: ${JSON.stringify("TODO: write description.")} },`;
}

async function main() {
  const xml = await loadSitemap();
  const locs = parseLocs(xml);
  const urls = locs
    .map((u) => {
      try {
        return new URL(u).pathname.replace(/\/$/, "") || "/";
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  fs.writeFileSync(
    LOCAL_URLS,
    locs.join("\n") + "\n",
    "utf8",
  );

  const classified = urls.map((p) => ({ ...classifyPath(p), pathname: p }));
  const { guides: knownGuides, tools: knownTools } = knownClearMoney();

  const newGuides = [];
  const coveredGuides = [];
  const newTools = [];
  const coveredTools = [];
  const unmapped = [];
  const hubs = [];
  let excluded = 0;

  for (const c of classified) {
    if (c.kind === "excluded") {
      excluded += 1;
      continue;
    }
    if (c.kind === "hub-or-pillar") {
      hubs.push(c);
      continue;
    }
    if (c.kind === "unmapped") {
      unmapped.push(c.msPath || c.pathname);
      continue;
    }
    if (c.kind === "tool") {
      if (knownTools.has(c.suggestedToolId)) coveredTools.push(c);
      else newTools.push(c);
      continue;
    }
    if (c.kind === "guide") {
      if (knownGuides.has(c.cmPath)) coveredGuides.push(c);
      else newGuides.push(c);
    }
  }

  // Dedupe new guides by cmPath
  const seen = new Set();
  const uniqueNewGuides = [];
  for (const g of newGuides) {
    if (seen.has(g.cmPath)) continue;
    seen.add(g.cmPath);
    uniqueNewGuides.push(g);
  }
  const seenT = new Set();
  const uniqueNewTools = [];
  for (const t of newTools) {
    if (seenT.has(t.suggestedToolId)) continue;
    seenT.add(t.suggestedToolId);
    uniqueNewTools.push(t);
  }

  const today = new Date().toISOString().slice(0, 10);
  const report = `# MoneySmart sitemap sync report

Generated: **${today}**  
Source: ${OFFLINE ? "offline snapshot" : "live fetch (`/sitemap`)"}  
Sitemap URLs: **${urls.length}** (excluded noise: ${excluded})

## Summary

| Category | Count |
|---|---|
| ClearMoney guides matched | ${coveredGuides.length} |
| **New guide candidates** | **${uniqueNewGuides.length}** |
| ClearMoney tools matched (by id heuristic) | ${coveredTools.length} |
| **New tool candidates** | **${uniqueNewTools.length}** |
| Unmapped MoneySmart paths | ${unmapped.length} |
| Hub/pillar landings seen | ${hubs.length} |

## New guide candidates

${
  uniqueNewGuides.length === 0
    ? "_None — ClearMoney covers all mapped MoneySmart content leaves._\n"
    : uniqueNewGuides
        .map(
          (g) =>
            `- **${g.title}** — MS \`${g.msPath}\` → CM \`/topics/${g.cmPath}\`\n  Inventory: \`${inventorySnippet(g).trim()}\``,
        )
        .join("\n")
}

## New tool candidates

${
  uniqueNewTools.length === 0
    ? "_None detected (heuristic). Review unmapped calculator URLs manually._\n"
    : uniqueNewTools
        .map(
          (t) =>
            `- **${t.title}** — MS \`${t.msPath}\` → suggested \`/tools/${t.suggestedToolId}\``,
        )
        .join("\n")
}

## Unmapped paths (need HUB_MAP or intentional ignore)

${
  unmapped.length === 0
    ? "_None._\n"
    : unmapped
        .slice(0, 80)
        .map((p) => `- \`${p}\``)
        .join("\n") +
      (unmapped.length > 80 ? `\n\n_… +${unmapped.length - 80} more_\n` : "\n")
}

## Next steps

1. Review this report and \`content/SITEMAP_APPLY_BRIEF.md\` when apply ran.
2. Default \`npm run sync:sitemap\` already drafts guides + inventory (\`--report-only\` to skip).
3. Polish auto-drafts per \`content/GUIDE_STYLE.md\` (unique H2s; no ASIC scrape).
4. For tools: add calculator UI + \`taxonomy.ts\` (see \`content/pending-tools.json\`).
5. Run \`npm run validate:guides\` and \`npm run check:links\`.

MoneySmart inventory remains a **topic map only** — never scrape page HTML into ClearMoney copy.
`;

  fs.writeFileSync(REPORT, report, "utf8");
  fs.writeFileSync(
    PENDING,
    JSON.stringify(
      {
        generated: today,
        newGuides: uniqueNewGuides,
        newTools: uniqueNewTools,
        unmapped,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`Report → content/SITEMAP_SYNC_REPORT.md`);
  console.log(
    `New guides: ${uniqueNewGuides.length}; new tools: ${uniqueNewTools.length}; unmapped: ${unmapped.length}`,
  );

  if (!APPLY) {
    console.log("Apply skipped (--report-only / --no-apply).");
    return;
  }

  const appliedLines = [];

  // 1) Guess hub maps for unmapped L2s, then re-classify once
  let guidesToCreate = uniqueNewGuides;
  let toolsToNote = uniqueNewTools;
  let stillUnmapped = unmapped;

  if (unmapped.length) {
    const { added, overrides } = applyUnmappedOverrides(unmapped);
    if (added) {
      Object.assign(HUB_MAP, overrides);
      appliedLines.push(`Hub overrides added: ${added} (content/hub-map-overrides.json)`);
      for (const [l2, map] of Object.entries(overrides)) {
        if (map.hub && map.hub !== "warnings") {
          const hubRes = ensureTaxonomyHub(map.pillar, map.hub);
          if (!hubRes.skipped) appliedLines.push(`Taxonomy hub: ${map.pillar}/${map.hub}`);
        }
      }
      // re-diff guides after overrides
      const reclass = urls.map((p) => ({ ...classifyPath(p), pathname: p }));
      const known = knownClearMoney();
      const ng = [];
      const um = [];
      const nt = [];
      for (const c of reclass) {
        if (c.kind === "unmapped") um.push(c.msPath || c.pathname);
        if (c.kind === "guide" && !known.guides.has(c.cmPath)) ng.push(c);
        if (c.kind === "tool" && !known.tools.has(c.suggestedToolId)) nt.push(c);
      }
      const seenG = new Set();
      guidesToCreate = [];
      for (const g of ng) {
        if (seenG.has(g.cmPath)) continue;
        seenG.add(g.cmPath);
        guidesToCreate.push(g);
      }
      const seenTool = new Set();
      toolsToNote = [];
      for (const t of nt) {
        if (seenTool.has(t.suggestedToolId)) continue;
        seenTool.add(t.suggestedToolId);
        toolsToNote.push(t);
      }
      stillUnmapped = um;
      console.log(
        `After hub overrides → guides to create: ${guidesToCreate.length}; unmapped left: ${stillUnmapped.length}`,
      );
    }
  }

  let created = 0;
  let skipped = 0;
  for (const g of guidesToCreate) {
    const r = writeGuideDraft(g);
    if (r.skipped) {
      skipped += 1;
    } else {
      created += 1;
      console.log("drafted", path.relative(root, r.file));
      appliedLines.push(`Guide draft: ${g.cmPath}`);
    }
    const inv = injectInventory(g);
    if (!inv.skipped) appliedLines.push(`Inventory: ${g.slug}`);
    if (inv.error) console.warn(inv.error);
    const pre = appendPreserve(g);
    if (!pre.skipped) appliedLines.push(`Preserve: ${g.slug}`);
  }
  console.log(`Guides: drafted ${created}, skipped existing ${skipped}`);

  if (toolsToNote.length) {
    writePendingTools(toolsToNote);
    appliedLines.push(`Pending tools: ${toolsToNote.length} → content/pending-tools.json`);
    console.log(`Tools pending → content/pending-tools.json (${toolsToNote.length})`);
  }

  writeAgentBrief({
    newGuides: guidesToCreate,
    newTools: toolsToNote,
    unmapped: stillUnmapped,
    applied: appliedLines.map((l) => `- ${l}`).join("\n") || "_none_",
  });
  console.log("Brief → content/SITEMAP_APPLY_BRIEF.md");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
