# ClearMoney

A fully rebranded, minimal, mobile-first financial guidance site—portfolio take on the MoneySmart-style experience with clearer IA and performance-first engineering.

**Not affiliated with ASIC or the Australian Government.** Original copy inspired by public financial-education themes.

## What improved vs MoneySmart-style IA

- **Tools are first-class** — persistent `/tools` index instead of burying calculators in topic trees
- **Urgent help** always visible for debt stress and scam response
- **Life-event entry** on the homepage alongside topic pillars
- **Minimal chrome** — calm teal accent, Newsreader + IBM Plex Sans, no card clutter or horizontal-scroll discovery
- **Mobile-first** layout with skip link, sticky header, and accessible forms

## Stack (resume signal)

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + design tokens |
| Content | Typed content modules + Markdown rendering |
| Calculators | Pure functions in `src/lib/calculators` |
| Validation-ready | Zod installed for forms |
| Tests | Vitest (math) + Playwright (smoke + axe a11y) |

## Project structure

```
src/app/                 # Routes (home, topics, tools, urgent, search…)
src/components/          # Layout, UI, calculators
src/lib/content/         # Taxonomy + markdown guide loader
src/lib/calculators/     # Pure math (unit tested)
content/guides/          # 263 deep markdown guides
content/INVENTORY.md     # Content & tools inventory
e2e/                     # Playwright smoke tests
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run test      # Vitest calculator math
npm run build     # Production build
npm run e2e       # Playwright (starts/reuses dev server)
npm run test:a11y # axe-core on critical paths (serious/critical = 0)
```

## Accessibility

ClearMoney targets **WCAG 2.2 Level AA**. Automated checks use `@axe-core/playwright` on home, mortgage calculator, budget planner, a TOC article, search, and urgent help (`npm run test:a11y`). Manual keyboard and screen-reader smoke steps live in [content/A11Y_CHECKLIST.md](content/A11Y_CHECKLIST.md).

Known limits: calculator outputs are estimates, not advice; sample claims data is illustrative; authenticating flows and full WCAG AAA are out of scope.

## Coverage

- **7 pillars · 38 hubs · 264 deep markdown guides · 30 calculators**
- Guides stored as `content/guides/**/*.md` (topic-specific bodies; joint-accounts is the depth gold sample)
- Task-first homepage, topic directory, search, glossary, about, urgent help
- Disclaimers on tools and guides (general information only)
- **Budget planner Excel download** (offline `.xlsx`) — MoneySmart’s only spreadsheet tool, replicated
- Feature parity on flagship calculators — see [content/INVENTORY.md](content/INVENTORY.md)
- Topic/article coverage aligned to the live MoneySmart sitemap (content leaves)

## Performance notes

- Server Components by default; calculator UIs are small client leaves
- `next/font` with `display: swap` for Newsreader + IBM Plex Sans
- Static generation for topic/tool routes via `generateStaticParams`
- Avoided heavy homepage carousels and decorative image weight
