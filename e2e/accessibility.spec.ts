import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Result } from "axe-core";

/**
 * Accessibility regression tests (axe-core).
 *
 * Scans key user-facing pages for WCAG 2.2 AA violations so that
 * a11y regressions are caught at the E2E layer before they ship.
 *
 * Run only this suite:
 *   npx playwright test e2e/accessibility.spec.ts
 * or by title:
 *   npx playwright test -g "Accessibility (axe-core)"
 *
 * Coverage tags: wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa.
 */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/**
 * Build an axe result set for the given page restricted to the WCAG tag set.
 * Third-party embeds (YouTube iframes) are excluded — their internals are
 * not ours to fix and axe cannot always traverse them reliably cross-origin.
 */
async function scanPage(page: Page) {
  return await new AxeBuilder({ page })
    .exclude("iframe")
    .withTags(WCAG_TAGS)
    .analyze();
}

/**
 * Render axe violations as a readable, actionable error string.
 * Each violation lists its rule id, impact, affected node count, and a help URL.
 */
function describeViolations(violations: Result[]) {
  if (violations.length === 0) return "";
  const lines = violations.map((v) => {
    const nodeCount = v.nodes.length;
    return `  • [${v.impact ?? "minor"}] ${v.id}: ${v.help} (${nodeCount} node${nodeCount === 1 ? "" : "s"}) — ${v.helpUrl}`;
  });
  return `\n${violations.length} accessibility violation(s) found:\n${lines.join("\n")}`;
}

test.describe("Accessibility (axe-core)", () => {
  test("public link page (/linkbreeze) has no WCAG violations", async ({ page }) => {
    await page.goto("/linkbreeze");
    // Wait for the profile + links to render so we scan the real DOM.
    await expect(page.getByRole("heading").first()).toBeVisible();

    const { violations } = await scanPage(page);
    expect.soft(violations.length, describeViolations(violations)).toBe(0);
    expect(violations, describeViolations(violations)).toHaveLength(0);
  });

  test("login page (/login) has no WCAG violations", async ({ page }) => {
    await page.goto("/login");
    // Wait for the form to render.
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();

    const { violations } = await scanPage(page);
    expect.soft(violations.length, describeViolations(violations)).toBe(0);
    expect(violations, describeViolations(violations)).toHaveLength(0);
  });

  test("404 page has no WCAG violations", async ({ page }) => {
    const response = await page.goto("/this-slug-does-not-exist-12345");
    // Sanity check that we actually hit the 404 route before scanning it.
    expect(response?.status()).toBe(404);

    const { violations } = await scanPage(page);
    expect.soft(violations.length, describeViolations(violations)).toBe(0);
    expect(violations, describeViolations(violations)).toHaveLength(0);
  });
});
