import { test, expect } from "@playwright/test";

test("gift conversation respects budgets, follows up, and links to real products", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open shopping assistant" }).click();
  const dialog = page.getByRole("dialog");
  const input = page.getByRole("textbox", { name: "Message your shopping assistant" });
  await input.fill("Gift for my dad under ₹2000");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(dialog.getByText(/What do they enjoy/)).toBeVisible();
  await expect(dialog.locator(".chat-product")).toHaveCount(2);
  await input.fill("He likes coffee");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(dialog.getByText("I found 1 option for you.", { exact: false })).toBeVisible();
  await expect(dialog.locator(".chat-turn").last().getByRole("link")).toHaveCount(1);
  await page.getByRole("button", { name: "Close assistant" }).click();
  await page.getByRole("button", { name: "Open shopping assistant" }).click();
  await expect(dialog.getByText("He likes coffee", { exact: true })).toBeVisible();
  await dialog.locator(".chat-turn").last().getByRole("link").click();
  await expect(page).toHaveURL(/products\/00000000-0000-4000-8000-000000000003/);
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("heading", { name: "Pour-over coffee set" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Complementary products" }).locator(".product-card")).toHaveCount(4);
});

test("homepage recommendations adapt to browsing and can be reset", async ({ page }) => {
  await page.goto("/products/00000000-0000-4000-8000-000000000001");
  await expect(page.getByRole("heading", { name: "Orbit wireless headphones" })).toBeVisible();
  await page.getByRole("link", { name: "ShopAI home" }).click();
  const recommendations = page.getByRole("region", { name: "Personal recommendations" });
  await expect(recommendations.getByRole("heading", { name: "A little more your kind of good." })).toBeVisible();
  await expect(recommendations.locator(".product-card")).toHaveCount(4);
  await expect(recommendations.locator(".product-card").first()).toContainText("Pocket Bluetooth speaker");
  await expect(recommendations.getByRole("heading", { name: "Orbit wireless headphones" })).toHaveCount(0);
  await recommendations.getByRole("button", { name: "Reset suggestions" }).click();
  await expect(recommendations.getByRole("heading", { name: "A few finds to get you started." })).toBeVisible();
  await expect(recommendations.getByRole("button", { name: "Reset suggestions" })).toHaveCount(0);
});

test("assistant recovers from service failure without duplicating the message", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/v1/ai/chat", async route => {
    attempts++;
    if (attempts === 1) await route.fulfill({ status: 503, contentType: "application/json", body: '{"detail":"unavailable"}' });
    else await route.continue();
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Open shopping assistant" }).click();
  await page.getByRole("textbox", { name: "Message your shopping assistant" }).fill("Coffee under ₹2000");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Pour-over coffee set" })).toBeVisible();
  await expect(page.getByRole("dialog").getByText("Coffee under ₹2000", { exact: true })).toHaveCount(1);
});

test("mobile assistant fits the screen and handles no matching products", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open shopping assistant" }).click();
  await page.getByRole("textbox", { name: "Message your shopping assistant" }).fill("Headphones under ₹100");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("dialog").getByText(/couldn’t find a catalog product/)).toBeVisible();
  await expect(page.getByRole("dialog").locator(".chat-product")).toHaveCount(0);
  const dialog = await page.getByRole("dialog").boundingBox();
  expect(dialog!.x).toBeGreaterThanOrEqual(0);
  expect(dialog!.width).toBeLessThanOrEqual(390);
  expect(dialog!.height).toBeLessThanOrEqual(844);
  expect(await page.getByRole("dialog").evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
  await page.getByRole("button", { name: "Start a new conversation" }).click();
  await expect(page.getByRole("dialog").getByText(/Hi! Tell me/)).toBeVisible();
});
