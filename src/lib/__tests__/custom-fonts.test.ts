import { describe, it, expect } from "vitest";
import {
  CUSTOM_FONT_PREFIX,
  isCustomFontId,
  parseCustomFontId,
  customFontFamily,
  fontWeightHint,
  buildFontFaceCss,
  customFontStack,
} from "@/lib/custom-fonts";

describe("isCustomFontId", () => {
  it("matches custom: ids, case- and whitespace-insensitive", () => {
    expect(isCustomFontId("custom:12")).toBe(true);
    expect(isCustomFontId("Custom:12")).toBe(true);
    expect(isCustomFontId("  custom:3  ")).toBe(true);
  });

  it("rejects null/empty/bundled ids", () => {
    expect(isCustomFontId(null)).toBe(false);
    expect(isCustomFontId(undefined)).toBe(false);
    expect(isCustomFontId("")).toBe(false);
    expect(isCustomFontId("inter")).toBe(false);
    expect(isCustomFontId("customization")).toBe(false);
  });
});

describe("parseCustomFontId", () => {
  it("parses valid ids", () => {
    expect(parseCustomFontId("custom:12")).toBe(12);
    expect(parseCustomFontId("Custom:1")).toBe(1);
    expect(parseCustomFontId("  custom:99  ")).toBe(99);
  });

  it("rejects malformed values", () => {
    expect(parseCustomFontId("custom:0")).toBeNull();
    expect(parseCustomFontId("custom:-4")).toBeNull();
    expect(parseCustomFontId("custom:abc")).toBeNull();
    expect(parseCustomFontId("custom:1.5")).toBeNull();
    expect(parseCustomFontId("custom:")).toBeNull();
    expect(parseCustomFontId("inter")).toBeNull();
    expect(parseCustomFontId(null)).toBeNull();
  });
});

describe("customFontFamily", () => {
  it("derives the DB family from the row id", () => {
    expect(customFontFamily(12)).toBe("LB Custom 12");
    expect(customFontFamily(1)).toBe("LB Custom 1");
  });

  it("prefix constant matches the reference format", () => {
    expect(CUSTOM_FONT_PREFIX).toBe("custom:");
  });
});

describe("customFontStack", () => {
  it("wraps the family with a generic fallback", () => {
    expect(customFontStack("LB Custom 3")).toBe("'LB Custom 3', sans-serif");
  });
});

describe("fontWeightHint", () => {
  it("says nothing for light fonts", () => {
    expect(fontWeightHint(20 * 1024)).toBeNull();
    expect(fontWeightHint(120 * 1024)).toBeNull();
  });

  it("warns for heavy fonts", () => {
    expect(fontWeightHint(150 * 1024)).toMatch(/heavier/i);
    expect(fontWeightHint(300 * 1024)).toMatch(/much heavier/i);
  });
});

describe("buildFontFaceCss", () => {
  const base = { family: "LB Custom 7", url: "/api/uploads/abc.woff2", format: "woff2" };

  it("emits a complete @font-face rule", () => {
    const css = buildFontFaceCss(base);
    expect(css).toContain("@font-face {");
    expect(css).toContain("font-family: 'LB Custom 7';");
    expect(css).toContain("src: url('/api/uploads/abc.woff2') format('woff2');");
    expect(css).toContain("font-display: swap;");
    expect(css).toContain("font-weight: 100 900;");
  });

  it("uses format woff for woff1 files", () => {
    const css = buildFontFaceCss({ ...base, format: "woff" });
    expect(css).toContain("format('woff')");
    expect(css).not.toContain("format('woff2')");
  });

  it("strips quotes from the family name (CSS injection guard)", () => {
    const css = buildFontFaceCss({
      family: "LB'; src: url(evil); x",
      url: "/api/uploads/abc.woff2",
      format: "woff2",
    });
    // Quotes removed so the payload stays inert text inside the family
    // string — it can never terminate the declaration early.
    expect(css).not.toContain("LB'");
    // The rule's actual src is exactly the url field.
    expect(css).toContain("src: url('/api/uploads/abc.woff2') format('woff2');");
  });
});
