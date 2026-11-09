import { test, expect } from "@playwright/test";
test("real catalog: search, details, filters, and AI capabilities", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Good finds. Better everyday." }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search products" })
    .fill("headphones");
  await page.getByRole("button", { name: "Submit search" }).click();
  await expect(
    page.getByRole("heading", { name: "Orbit wireless headphones" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: /FORM.*Orbit wireless headphones/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Orbit wireless headphones" }),
  ).toBeVisible();
  await expect(page.getByText("Bluetooth 5.3")).toBeVisible();
  await page.getByRole("link", { name: "Back to all good things" }).click();
  await page.getByRole("combobox").selectOption("price-asc");
  await expect(page).toHaveURL(/sort=price-asc/);
  await page.getByLabel("Electronics", { exact: true }).click();
  await expect(page.getByLabel("Electronics", { exact: true })).toBeChecked();
  await expect(page.getByText("3 good finds")).toBeVisible();
  await page.getByRole("button", { name: "Meet your AI" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "A good find starts here." })).toBeVisible();
  await page.getByRole("button", { name: "Close assistant" }).click();
  await page.goto("/status");
  await expect(page.getByText("Ready", { exact: true })).toHaveCount(2);
});
test("mobile catalog has no horizontal overflow and supports navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.getByRole("link", { name: "Shop all", exact: true }).click();
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.getByLabel("Outdoors", { exact: true }).click();
  await expect(page.getByLabel("Outdoors", { exact: true })).toBeChecked();
  await expect(page.getByText("1 good find", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
