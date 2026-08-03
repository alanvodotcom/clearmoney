import { test, expect } from "@playwright/test";

test("home loads with brand and primary CTAs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Money decisions",
  );
  await expect(page.getByRole("link", { name: "Open tools" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Urgent help" }).first()).toBeVisible();
});

test("tools index and mortgage calculator", async ({ page }) => {
  await page.goto("/tools");
  await expect(page.getByRole("heading", { name: "Tools" })).toBeVisible();
  await page.goto("/tools/mortgage");
  await expect(
    page.getByRole("heading", { name: "Mortgage calculator" }),
  ).toBeVisible();
  await expect(page.getByText("Monthly repayment")).toBeVisible();
});

test("topic hub navigation", async ({ page }) => {
  await page.goto("/topics/banking-budgeting/budgeting");
  await expect(page.getByRole("heading", { name: "Budgeting" })).toBeVisible();
});
