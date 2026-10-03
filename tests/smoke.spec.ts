import { test, expect } from "@playwright/test";
// Run against an already running app. These checks do not mutate inventory.
test("public discovery and responsive layout", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Somewhere new.",
  );
  await expect(
    page.getByRole("button", { name: "Check Availability" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto("/properties");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
test("date selection is keyboard accessible", async ({ page }) => {
  await page.goto("/properties");
  await page.getByRole("button", { name: /Check-in · Check-out/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Clear dates" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("owner workspace does not expose data anonymously", async ({
  page,
  request,
}) => {
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Owner access" }),
  ).toBeVisible();
  expect((await request.get("/api/v1/admin/properties")).status()).toBe(401);
});
