import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const paths = [
  "/",
  "/tools/mortgage",
  "/tools/budget-planner",
  "/topics/banking-budgeting/banking/joint-accounts",
  "/search",
  "/urgent",
];

for (const path of paths) {
  test(`a11y: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

    if (serious.length > 0) {
      const summary = serious
        .map(
          (v) =>
            `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} node(s)`,
        )
        .join("\n");
      expect(serious, summary).toEqual([]);
    }
  });
}
