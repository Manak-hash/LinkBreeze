import { describe, it, expect } from "vitest";
import { resolveFont, resolveThemeTokens, buildThemeStyleBlock, FONT_REGISTRY } from "@/lib/theme-tokens";

describe("resolveFont", () => {
  it("returns fallback for null/undefined/empty", () => {
    const fallback = "var(--font-sans), sans-serif";
    expect(resolveFont(null)).toBe(fallback);
    expect(resolveFont(undefined)).toBe(fallback);
    expect(resolveFont("")).toBe(fallback);
    expect(resolveFont("   ")).toBe(fallback);
  });

  it("resolves registered font keys", () => {
    expect(resolveFont("inter")).toBe(FONT_REGISTRY["inter"]);
    expect(resolveFont("poppins")).toBe(FONT_REGISTRY["poppins"]);
    expect(resolveFont("playfair")).toBe(FONT_REGISTRY["playfair"]);
    expect(resolveFont("jetbrains")).toBe(FONT_REGISTRY["jetbrains"]);
  });

  it("is case-insensitive", () => {
    expect(resolveFont("Inter")).toBe(FONT_REGISTRY["inter"]);
    expect(resolveFont("INTER")).toBe(FONT_REGISTRY["inter"]);
    expect(resolveFont("Poppins")).toBe(FONT_REGISTRY["poppins"]);
  });

  it("passes through unregistered CSS as-is (backward compat)", () => {
    const custom = "Georgia, serif";
    expect(resolveFont(custom)).toBe(custom);
  });
});

describe("resolveThemeTokens", () => {
  it("returns defaults for empty theme", () => {
    const { cssVars, keyframes } = resolveThemeTokens({});
    expect(cssVars["--lb-accent"]).toBeDefined();
    expect(cssVars["--lb-text"]).toBeDefined();
    expect(cssVars["--lb-card-bg"]).toBeDefined();
    expect(keyframes).toBeDefined();
  });

  it("applies custom colors", () => {
    const { cssVars } = resolveThemeTokens({
      primaryColor: "#ff0000",
      secondaryColor: "#00ff00",
      textColor: "#000000",
    });
    expect(cssVars["--lb-accent"]).toContain("#ff0000");
    expect(cssVars["--lb-secondary"]).toContain("#00ff00");
    expect(cssVars["--lb-text"]).toContain("#000000");
  });

  it("falls back for null values", () => {
    const { cssVars } = resolveThemeTokens({
      primaryColor: null,
      textColor: null,
      secondaryColor: null,
    });
    expect(cssVars["--lb-accent"]).toBeDefined();
    expect(cssVars["--lb-text"]).toBeDefined();
  });

  it("handles font family override", () => {
    const { cssVars } = resolveThemeTokens({ fontFamily: "poppins" });
    expect(cssVars["--lb-font"]).toBe(FONT_REGISTRY["poppins"]);
  });

  it("produces a style block string from buildThemeStyleBlock", () => {
    const { cssVars } = resolveThemeTokens({ primaryColor: "#ff0000" });
    const html = buildThemeStyleBlock(cssVars);
    expect(html).toContain(":root");
    expect(html).toContain("--lb-accent");
  });
});
