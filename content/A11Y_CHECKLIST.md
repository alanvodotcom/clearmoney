# Accessibility checklist (WCAG 2.2 AA)

Use after `npm run test:a11y` is green. Tick items during a manual pass (keyboard + one screen reader).

## Automated gate

- [ ] `npm run test:a11y` — axe serious/critical = 0 on `/`, `/tools/mortgage`, `/tools/budget-planner`, joint-accounts article, `/search`, `/urgent`

## Keyboard

- [ ] Skip link → `#main` works on first Tab
- [ ] Header: open mobile menu, Tab cycles inside panel, Escape closes and returns focus
- [ ] Calculator ModeTabs: Space/Enter selects mode; focus ring visible
- [ ] Budget planner: category disclosure open/close; Add/Remove hit areas usable
- [ ] Search: results status updates without trapping focus
- [ ] Article TOC links land with heading not under sticky header

## Screen reader smoke (NVDA or VoiceOver)

- [ ] Landmarks: banner, main, contentinfo; skip link announced
- [ ] Mode switcher exposes radiogroup / checked state
- [ ] Form fields have names; invalid numbers announce errors
- [ ] Search live region announces guide/tool counts or empty state
- [ ] Urgent helpline `tel:` and “opens in a new tab” cues present

## Visual / non-text

- [ ] Control borders readable against page background (≥ 3:1)
- [ ] Focus ring always visible on keyboard navigation
- [ ] Text contrast on body and muted copy still passes AA

## Sign-off

| Date | Tester | Notes |
|---|---|---|
| | | |
