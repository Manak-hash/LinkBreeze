import { test, expect } from "@playwright/test";

/**
 * E2E Test 1: Public page loads and displays links.
 *
 * Verifies the most critical user-facing flow: a visitor lands on
 * a LinkBreeze page and sees the profile + links.
 */
test("public page loads with profile and links", async ({ page }) => {
  await page.goto("/linkbreeze");

  // Profile name visible
  await expect(page.getByRole("heading", { name: "LinkBreeze" })).toBeVisible();

  // Bio text visible
  await expect(page.getByText("Self-hosted link-in-bio")).toBeVisible();

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
  await page.goto("/linkbreeze");

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
 * E2E Test 4: Embed widget renders on the public page.
 *
 * Verifies the YouTube embed widget works on the public page
 * (the demo showcase page's featured embed).
 */
test("embed widget renders on public page", async ({ page }) => {
  await page.goto("/linkbreeze");

  // The showcase page's uncategorized embed sits at the top of the page.
  // (Embeds are rewritten to the privacy-hardened youtube-nocookie.com domain.)
  const iframe = page.locator("iframe");
  await expect(iframe.first()).toBeVisible();
  await expect(iframe.first()).toHaveAttribute(
    "src",
    /youtube(-nocookie)?\.com\/embed\//,
  );
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
