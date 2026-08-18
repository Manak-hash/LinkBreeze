import { describe, it, expect } from "vitest";
import { resolveFont, resolveThemeTokens, buildThemeStyleBlock, FONT_REGISTRY } from "@/lib/theme-tokens";

/** FALLBACK_FONT — not exported; keep in sync with theme-tokens.ts. */
const FALLBACK_FONT = "var(--font-sans), sans-serif";

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

describe("resolveFont — custom fonts (#82)", () => {
  const fonts = new Map<number, { family: string }>([
    [12, { family: "LB Custom 12" }],
  ]);

  it("resolves custom:<id> to the uploaded font's stack", () => {
    expect(resolveFont("custom:12", fonts)).toBe("'LB Custom 12', sans-serif");
    expect(resolveFont("Custom:12", fonts)).toBe("'LB Custom 12', sans-serif");
  });

  it("falls back to the default font for unknown ids", () => {
    expect(resolveFont("custom:999", fonts)).toBe(FALLBACK_FONT);
  });

  it("falls back to the default font when no lookup is provided", () => {
    expect(resolveFont("custom:12")).toBe(FALLBACK_FONT);
    expect(resolveFont("custom:12", undefined)).toBe(FALLBACK_FONT);
  });

  it("falls back for malformed custom ids", () => {
    expect(resolveFont("custom:abc", fonts)).toBe(FALLBACK_FONT);
    expect(resolveFont("custom:-1", fonts)).toBe(FALLBACK_FONT);
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

describe("buildThemeStyleBlock — custom fonts (#82)", () => {
  it("prefixes the @font-face rule ahead of the token block", () => {
    const cssVars = resolveThemeTokens({ fontFamily: "custom:12" }).cssVars;
    const fontFace = "@font-face { font-family: 'LB Custom 12'; src: url('/api/uploads/x.woff2') format('woff2'); }";
    const html = buildThemeStyleBlock(cssVars, { fontFaceCss: fontFace });
    expect(html.startsWith(fontFace)).toBe(true);
    expect(html).toContain(":root");
    const tokenIdx = html.indexOf(":root");
    const fontFaceIdx = html.indexOf("@font-face");
    expect(fontFaceIdx).toBeLessThan(tokenIdx);
  });

  it("resolves --lb-font through the customFonts lookup", () => {
    const { cssVars } = resolveThemeTokens(
      { fontFamily: "custom:12" },
      { customFonts: new Map([[12, { family: "LB Custom 12" }]]) },
    );
    expect(cssVars["--lb-font"]).toBe("'LB Custom 12', sans-serif");
  });
});
