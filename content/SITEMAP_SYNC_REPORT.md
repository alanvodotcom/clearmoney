# MoneySmart sitemap sync report

Generated: **2026-08-06**  
Source: offline snapshot  
Sitemap URLs: **761** (excluded noise: 430)

## Summary

| Category | Count |
|---|---|
| ClearMoney guides matched | 267 |
| **New guide candidates** | **0** |
| ClearMoney tools matched (by id heuristic) | 24 |
| **New tool candidates** | **0** |
| Unmapped MoneySmart paths | 0 |
| Hub/pillar landings seen | 40 |

## New guide candidates

_None — ClearMoney covers all mapped MoneySmart content leaves._


## New tool candidates

_None detected (heuristic). Review unmapped calculator URLs manually._


## Unmapped paths (need HUB_MAP or intentional ignore)

_None._


## Next steps

1. Review this report and `content/SITEMAP_APPLY_BRIEF.md` when apply ran.
2. Default `npm run sync:sitemap` already drafts guides + inventory (`--report-only` to skip).
3. Polish auto-drafts per `content/GUIDE_STYLE.md` (unique H2s; no ASIC scrape).
4. For tools: add calculator UI + `taxonomy.ts` (see `content/pending-tools.json`).
5. Run `npm run validate:guides` and `npm run check:links`.

MoneySmart inventory remains a **topic map only** — never scrape page HTML into ClearMoney copy.
