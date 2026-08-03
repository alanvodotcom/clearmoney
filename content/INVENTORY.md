# ClearMoney content inventory

## Guides (deep markdown)

**264 topic-specific guides** live as markdown files (includes `campaign-resources`).

```
content/guides/{pillar}/{hub}/{slug}.md
```

Loaded at build time via `src/lib/content/articles.ts` (gray-matter + reading-time).

### Depth standard

Each guide should be original ClearMoney copy (~600–1000 words) with topic-specific H2s—not a shared stub. Style brief: [`GUIDE_STYLE.md`](GUIDE_STYLE.md). Gold sample: [`guides/banking-budgeting/banking/joint-accounts.md`](guides/banking-budgeting/banking/joint-accounts.md).

Rewrite status: [`REWRITE_PROGRESS.md`](REWRITE_PROGRESS.md).

Regenerate composed bodies (never overwrites hand-crafted banking hub / joint-accounts):

```bash
npm run generate:articles
npm run validate:guides
```

MoneySmart inventory ([`MONEYSMART_CONTENT_INVENTORY.md`](MONEYSMART_CONTENT_INVENTORY.md)) is a **topic map only**—not a text source. ClearMoney copy is original.

## Excel / offline

| Tool | Offline |
|---|---|
| **Budget planner** | **Download Excel** (`.xlsx`) |
| Other tools | Browser print |

## Calculators

30 tools — see `src/lib/content/taxonomy.ts` (includes interest-only mortgage, super contributions optimiser, super/pension age, account-based pension, life claims comparison).
