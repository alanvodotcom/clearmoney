# MoneySmart sitemap → ClearMoney sync

ClearMoney tracks MoneySmart **topics** via the public XML urlset at `https://moneysmart.gov.au/sitemap` (note: **not** `/sitemap.xml`, which 404s). We never scrape page HTML into guides.

## Commands

```bash
npm run sync:sitemap                 # fetch + report + apply (default)
npm run sync:sitemap:offline         # local XML + apply
npm run sync:sitemap -- --report-only  # report/pending only (no drafts)
```

**Apply** (default) when gaps exist:

1. Guess `content/hub-map-overrides.json` for unmapped L2 hubs (and taxonomy hub stubs when needed)
2. Draft original ClearMoney starter guides under `content/guides/...` (unique H2 packs by slug hash)
3. Inject inventory lines into `scripts/generate-articles.mjs`
4. Add paths to the rewrite preserve list
5. Write `content/pending-tools.json` for new calculators (UI still manual)
6. Write `content/SITEMAP_APPLY_BRIEF.md` for agent polish

Outputs:

| File | Purpose |
|---|---|
| [`SITEMAP_SYNC_REPORT.md`](SITEMAP_SYNC_REPORT.md) | Human-readable gap report |
| [`pending-from-sitemap.json`](pending-from-sitemap.json) | Machine-readable gaps |
| [`SITEMAP_APPLY_BRIEF.md`](SITEMAP_APPLY_BRIEF.md) | What apply did + polish checklist |
| [`hub-map-overrides.json`](hub-map-overrides.json) | Auto-guessed L2 → pillar/hub |
| [`pending-tools.json`](pending-tools.json) | Calculators still needing UI |
| [`moneysmart-sitemap.xml`](moneysmart-sitemap.xml) / [`moneysmart-urls.txt`](moneysmart-urls.txt) | Snapshots |

Auto-drafts are **starters**. There is **no** separate `npm` command that finishes them (`rewrite:guides` is only for old templated stubs).

**After sync creates drafts:**

1. Ask the agent to polish guides listed in [`SITEMAP_APPLY_BRIEF.md`](SITEMAP_APPLY_BRIEF.md) (or edit them to [`GUIDE_STYLE.md`](GUIDE_STYLE.md)).
2. `npm run validate:guides`
3. `npm run check:links`

Hub slug mapping: `scripts/sync-moneysmart-sitemap.mjs` (`HUB_MAP`) + overrides JSON.

## CI

[`.github/workflows/sitemap-sync.yml`](../.github/workflows/sitemap-sync.yml) runs weekly: apply sync, validate guides, commit snapshots/report/new drafts when changed.

## Cursor schedule (optional)

In Cursor Automations (Agents Window), schedule a weekly agent that runs `npm run sync:sitemap`, reads `SITEMAP_APPLY_BRIEF.md`, and polishes any new auto-drafts.
