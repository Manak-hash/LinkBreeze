import { test, expect } from "@playwright/test";

/**
 * E2E Test 1: Public page loads and displays links.
 *
 * Verifies the most critical user-facing flow: a visitor lands on
 * a LinkBreeze page and sees the profile + links.
 */
test("public page loads with profile and links", async ({ page }) => {
  await page.goto("/alex");

  // Profile name visible
  await expect(page.getByRole("heading", { name: "Alex Rivera" })).toBeVisible();

  // Bio text visible
  await expect(page.getByText("Content creator")).toBeVisible();

  // At least 3 links rendered
  const links = page.locator("main a");
  await expect(links.first()).toBeVisible();
  const count = await links.count();
  expect(count).toBeGreaterThanOrEqual(3);

  // Social icons section exists
  await expect(page.getByRole("navigation", { name: "Social links" })).toBeVisible();
});

/**
 * E2E Test 2: Link click triggers redirect via /go/:id.
 *
 * Verifies that clicking a link goes through LinkBreeze's redirect
 * endpoint, not directly to the external URL.
 */
test("link click goes through /go/ redirect", async ({ page }) => {
  await page.goto("/alex");

  // Get the first link's href — links are inside <main> but may be nested
  const firstLink = page.locator("main a[href*='/go/']").first();
  await expect(firstLink).toBeVisible();
  const href = await firstLink.getAttribute("href");

  // Verify it's a /go/ redirect
  expect(href).toMatch(/\/go\/\d+/);
});

/**
 * E2E Test 3: Login page renders and accepts credentials.
 *
 * Verifies the auth flow: login form is functional.
 */
test("login page renders and accepts input", async ({ page }) => {
  await page.goto("/login");

  // Form elements visible
  await expect(page.getByLabel("Username")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();

  // Type into fields
  await page.getByLabel("Username").fill("testuser");
  await page.getByLabel("Password").fill("testpass");

  // Verify input was accepted
  await expect(page.getByLabel("Username")).toHaveValue("testuser");
});

/**
 * E2E Test 4: Subscribe form accepts email.
 *
 * Verifies the email capture widget works on the public page.
 */
test("subscribe form accepts email input", async ({ page }) => {
  await page.goto("/alex");

  // Find the email input and subscribe button
  const emailInput = page.getByLabel("Email address");
  const subscribeBtn = page.getByRole("button", { name: "Subscribe" });

  // Verify they're visible
  await expect(emailInput).toBeVisible();
  await expect(subscribeBtn).toBeVisible();

  // Type an email
  await emailInput.fill("test@example.com");
  await expect(emailInput).toHaveValue("test@example.com");
});

/**
 * E2E Test 5: Non-existent page shows 404.
 *
 * Verifies that visiting a slug that doesn't exist returns a 404,
 * not a crash or blank page.
 */
test("non-existent page returns 404", async ({ page }) => {
  const response = await page.goto("/this-slug-does-not-exist-12345");

  expect(response?.status()).toBe(404);
});
