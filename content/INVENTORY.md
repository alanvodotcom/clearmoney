# ClearMoney content inventory

## Guides (deep markdown)

**268 topic-specific guides** live as markdown files (includes `campaign-resources`).

```
content/guides/{pillar}/{hub}/{slug}.md
```

Loaded at build time via `src/lib/content/articles.ts` (gray-matter + reading-time).

### Depth standard

Each guide is **authored separately** as original ClearMoney copy (~600–1000 words) with its **own** H2 outline—not a shared stub or single section template. Style: [`GUIDE_STYLE.md`](GUIDE_STYLE.md). Gold sample: [`guides/banking-budgeting/banking/joint-accounts.md`](guides/banking-budgeting/banking/joint-accounts.md).

Rewrite status: [`REWRITE_PROGRESS.md`](REWRITE_PROGRESS.md).

```bash
npm run generate:articles   # syncs frontmatter from inventory only — does not invent bodies
npm run rewrite:guides      # per-slug multi-format rewrite for short/templated bodies
npm run validate:guides     # stub markers, word count, What to do next
```

MoneySmart inventory ([`MONEYSMART_CONTENT_INVENTORY.md`](MONEYSMART_CONTENT_INVENTORY.md)) is a **topic map only**—not a text source. ClearMoney copy is original.

### Sitemap sync (new MoneySmart pages)

```bash
npm run sync:sitemap              # fetch MS sitemap, report + apply drafts/inventory
npm run sync:sitemap:report       # report only
npm run sync:sitemap:offline      # local XML + apply
```

Docs: [`SITEMAP_SYNC.md`](SITEMAP_SYNC.md). Weekly CI: `.github/workflows/sitemap-sync.yml`.

## Excel / offline

| Tool | Offline |
|---|---|
| **Budget planner** | **Download Excel** (`.xlsx`) |
| Other tools | Browser print |

## Calculators

30 tools — see `src/lib/content/taxonomy.ts` (includes interest-only mortgage, super contributions optimiser, super/pension age, account-based pension, life claims comparison).
