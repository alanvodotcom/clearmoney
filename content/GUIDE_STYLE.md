# ClearMoney guide style

Original financial-education copy for Australians. Not affiliated with ASIC. General information only—not advice.

## Voice

- Direct, calm, concrete. Prefer “what to do this week” over theory.
- Australian English (`organise`, `labour`, dollars as `$`).
- Second person (“you”) for actions; short paragraphs; bullets for lists.
- Never pitch products. Name fees, risks, and trade-offs plainly.
- Do not copy MoneySmart/ASIC wording. Cover the same *topics* with original prose.

## Structure (each guide chooses its own)

There is **no shared section template**. Every guide gets a unique outline that fits the topic—modeled in spirit on [`guides/banking-budgeting/banking/joint-accounts.md`](guides/banking-budgeting/banking/joint-accounts.md), not copied heading-for-heading.

Common ingredients (order and labels vary):

1. **Lead** — 1–2 sentences, no heading
2. Topic-true H2s (definitions, choices, risks, how-to, life changes—as needed)
3. A vignette **or** checklist only when it earns its place
4. **`## What to do next`** — 3–5 action bullets with internal links

Word target: **~600–1000**. At least **three** `##` headings including `## What to do next`.

Hard rule: two guides in the same hub should not share the same H2 sequence.

## Linking

- Internal guides: `/topics/{pillar}/{hub}/{slug}`
- Tools: `/tools/{id}`
- Urgent journeys: link [`/urgent`](/urgent) early when the topic involves debt stress, scams, abuse, or hardship.
- Helplines when relevant: National Debt Helpline `1800 007 007`, 1800RESPECT `1800 737 732`, Scamwatch / ReportCyber for scams.

Hard bans

- Any **shared** article skeleton applied across many slugs (same H2 sequence with title swapped)
- Shared stub blocks: `Making "…" concrete`, `Questions worth answering before you act`, `A worked mini-plan for this topic`, generic habits that only swap the title
- Wrong-topic bleed (e.g. debit-card essay on a direct-debits page)
- Legal/advice claims, guarantees of outcomes, or copying competitor page text

## Visuals (lightweight)

Guides use **real-life photos** (in-article), pillar SVG motifs (header), optional process diagrams, and CSS callouts.

### Automatic contextual visuals

Every guide gets **photographic figures** injected at render time (Unsplash licence; files in `public/guide-photos/`):

- Count ≈ **1 per 220 words** (minimum 1, maximum 5), minus any `diagram:` frontmatter or `::: diagram … :::` already in the body
- Chosen by **pillar / hub / title / slug / tag** keyword match from the photo catalog
- Placed after the lead and between H2 sections

Refresh photos with `node scripts/fetch-guide-photos.mjs`. Authors can still add explicit diagrams/callouts; auto-visuals fill the rest of the quota.

### Pillar motif

Automatic on every guide header from `pillar` (no frontmatter needed). SVG only — not a photo.

### Optional diagram (frontmatter)

```yaml
diagram: budget-three-buckets
```

Ids: `budget-three-buckets`, `debt-priority`, `invest-horizon`, `super-contrib-flow`, `insurance-needs-stack`, `scam-stop-check`, `hardship-call-order`, `diversify-vs-concentrate`.

Or mid-body:

```md
::: diagram debt-priority :::
```

### Callout shortcodes

```md
::: tip
One short practical tip.
:::

::: warning
Risk or scam pressure—link /urgent when money already moved.
:::

::: checklist
- First check
- Second check
:::

::: tool relatedTools[0]
:::
```

Use sparingly (usually 1–2 per guide). Do not invent a shared callout template across a hub.

## Authoring

Edit `content/guides/{pillar}/{hub}/{slug}.md` directly—one file per guide.  
`npm run generate:articles` only syncs frontmatter from inventory; it does **not** generate bodies.  
`npm run validate:guides` checks depth gates (no stub markers, word count, `## What to do next`).
