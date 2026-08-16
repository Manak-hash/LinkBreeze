import { describe, it, expect } from "vitest";
import { resolveBackground, resolveThemeTokens, normalizeOpacity } from "@/lib/theme-tokens";

/**
 * Image-background overlay path.
 *
 * Desired behavior: an image background WITH an overlay renders as a
 * translucent color layer composited ON TOP of the image — a 2-stop
 * linear-gradient where BOTH stops are the overlay color at the requested
 * alpha, followed by the url().
 *
 *   linear-gradient(#00000080, #00000080), url('https://x/bg.jpg')
 *
 * The customizer slider stores 0–100 ("50" = 50%); legacy rows stored 0–1
 * fractions ("0.5"). Both must render as alpha 0x80.
 */
describe("resolveBackground — image with overlay", () => {
  it("renders a slider-scale (0–100) overlay as a uniform translucent layer", () => {
    const out = resolveBackground({
      backgroundType: "image",
      backgroundImageUrl: "https://example.com/bg.jpg",
      overlayColor: "#000000",
      overlayOpacity: "50",
    });
    // 50 (percent) → 0.5 → 0.5 * 255 = 127.5 → rounds to 128 = 0x80
    expect(out).toBe(
      `linear-gradient(#00000080, #00000080), url('https://example.com/bg.jpg') 50% 50%/cover no-repeat #0a0820`,
    );
  });

  it("renders a legacy 0–1 fraction overlay identically", () => {
    const out = resolveBackground({
      backgroundType: "image",
      backgroundImageUrl: "https://example.com/bg.jpg",
      overlayColor: "#000000",
      overlayOpacity: "0.5",
    });
    expect(out).toBe(
      `linear-gradient(#00000080, #00000080), url('https://example.com/bg.jpg') 50% 50%/cover no-repeat #0a0820`,
    );
  });

  it("renders a 100% overlay as a fully opaque layer", () => {
    const out = resolveBackground({
      backgroundType: "image",
      backgroundImageUrl: "https://example.com/bg.jpg",
      overlayColor: "#1a1a2e",
      overlayOpacity: "100",
    });
    expect(out).toBe(
      `linear-gradient(#1a1a2eff, #1a1a2eff), url('https://example.com/bg.jpg') 50% 50%/cover no-repeat #0a0820`,
    );
  });

  it("renders no overlay when opacity is 0", () => {
    const out = resolveBackground({
      backgroundType: "image",
      backgroundImageUrl: "https://example.com/bg.jpg",
      overlayColor: "#000000",
      overlayOpacity: "0",
    });
    expect(out).toBe(`url('https://example.com/bg.jpg') 50% 50%/cover no-repeat #0a0820`);
  });

  it("falls back to backgroundValue when no image URL is set", () => {
    const out = resolveBackground({
      backgroundType: "image",
      backgroundValue: "#1a1a2e",
      overlayColor: "#000000",
      overlayOpacity: "50",
    });
    expect(out).toBe("#1a1a2e");
  });
});

describe("normalizeOpacity", () => {
  it.each([
    ["50", 0.5],
    ["100", 1],
    ["0", 0],
    ["0.5", 0.5],
    ["1", 1],
    ["0.75", 0.75],
    [null, 0],
    [undefined, 0],
    ["", 0],
    ["garbage", 0],
    ["-5", 0],
    ["250", 1],
  ] as const)("normalizes %s → %f", (raw, expected) => {
    expect(normalizeOpacity(raw)).toBe(expected);
  });
});

describe("resolveThemeTokens — aurora + noise", () => {
  it("drives aurora colors from the theme", () => {
    const { cssVars } = resolveThemeTokens({
      backgroundType: "aurora",
      backgroundValue: "#141026,#2a2150",
      primaryColor: "#ff6b9d",
      secondaryColor: "#4ecdc4",
    });
    expect(cssVars["--lb-aurora-base"]).toBe("#141026");
    expect(cssVars["--lb-aurora-blob-1"]).toBe("#ff6b9d");
    expect(cssVars["--lb-aurora-blob-2"]).toBe("#4ecdc4");
  });

  it("aurora vars fall back to NIGHT_BASE when backgroundValue is empty", () => {
    const { cssVars } = resolveThemeTokens({
      backgroundType: "aurora",
      primaryColor: "#ff6b9d",
      secondaryColor: "#4ecdc4",
    });
    expect(cssVars["--lb-aurora-base"]).toBe("#0a0820");
  });

  it("keeps the noise flag as a token", () => {
    const on = resolveThemeTokens({ noise: "true" });
    expect(on.cssVars["--lb-noise"]).toBe("1");
    const off = resolveThemeTokens({ noise: "false" });
    expect(off.cssVars["--lb-noise"]).toBe("0");
  });
});

describe("resolveBackground — media fit + focal point", () => {
  const base = {
    backgroundType: "image" as const,
    backgroundImageUrl: "/img/bg.jpg",
  };

  it("defaults to cover + centered when nothing is stored", () => {
    const out = resolveBackground(base);
    expect(out).toBe("url('/img/bg.jpg') 50% 50%/cover no-repeat #0a0820");
  });

  it("applies a stored focal point and fit", () => {
    const out = resolveBackground({
      ...base,
      backgroundFit: "cover",
      backgroundPosition: "25% 75%",
    });
    expect(out).toBe("url('/img/bg.jpg') 25% 75%/cover no-repeat #0a0820");
  });

  it("contain letterboxes on the first background color", () => {
    const out = resolveBackground({
      ...base,
      backgroundFit: "contain",
      backgroundValue: "#123456,#abcdef",
      backgroundPosition: "10% 20%",
    });
    expect(out).toBe("url('/img/bg.jpg') 10% 20%/contain no-repeat #123456");
  });

  it("tile repeats at natural size with the origin pinned", () => {
    const out = resolveBackground({
      ...base,
      backgroundFit: "tile",
      backgroundPosition: "0% 0%",
    });
    expect(out).toBe("url('/img/bg.jpg') 0% 0%/auto repeat #0a0820");
  });

  it("gif backgrounds use the same media composition", () => {
    const out = resolveBackground({
      backgroundType: "gif",
      backgroundImageUrl: "/img/loop.gif",
      backgroundFit: "tile",
      backgroundPosition: "50% 50%",
    });
    expect(out).toBe("url('/img/loop.gif') 50% 50%/auto repeat #0a0820");
  });

  it("overlay layer composes on top of the media shorthand", () => {
    const out = resolveBackground({
      ...base,
      backgroundFit: "contain",
      backgroundPosition: "30% 70%",
      overlayColor: "#000000",
      overlayOpacity: "50",
    });
    expect(out).toBe(
      "linear-gradient(#00000080, #00000080), url('/img/bg.jpg') 30% 70%/contain no-repeat #0a0820",
    );
  });

  it("unknown fit falls back to cover", () => {
    const out = resolveBackground({
      ...base,
      backgroundFit: "bogus",
      backgroundPosition: "50% 50%",
    });
    expect(out).toBe("url('/img/bg.jpg') 50% 50%/cover no-repeat #0a0820");
  });
});
