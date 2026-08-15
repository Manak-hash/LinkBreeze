import { describe, it, expect } from "vitest";
import {
  revealAnimation,
  revealAnimationStyle,
  resolveThemeTokens,
} from "@/lib/theme-tokens";

// ─── Reveal animation variants (1.3) ────────────────────────────────────────

describe("revealAnimationStyle", () => {
  it("returns undefined for 'none'", () => {
    expect(revealAnimationStyle("none", 100)).toBeUndefined();
  });

  it("maps each 1.3 type to its keyframe", () => {
    expect(revealAnimationStyle("lift", 0)?.animation).toContain("aurora-rise");
    expect(revealAnimationStyle("fade-up", 0)?.animation).toContain("lb-fade-up");
    expect(revealAnimationStyle("slide-in", 0)?.animation).toContain("lb-slide-in");
    expect(revealAnimationStyle("zoom-in", 0)?.animation).toContain("lb-zoom-in");
    expect(revealAnimationStyle("blur-in", 0)?.animation).toContain("lb-blur-in");
    expect(revealAnimationStyle("scale", 0)?.animation).toContain("lb-zoom-in");
  });

  it("carries the stagger delay", () => {
    const s = revealAnimationStyle("fade-up", 240);
    expect(s?.animationDelay).toBe("240ms");
  });

  it("falls back to aurora-rise for unknown types", () => {
    expect(revealAnimationStyle("???", 0)?.animation).toContain("aurora-rise");
  });

  it("treats null/undefined as default lift", () => {
    expect(revealAnimationStyle(null, 0)?.animation).toContain("aurora-rise");
    expect(revealAnimationStyle(undefined, 0)?.animation).toContain("aurora-rise");
  });
});

describe("revealAnimation (string form)", () => {
  it("returns '' for 'none' (static element)", () => {
    expect(revealAnimation("none", 0)).toBe("");
  });

  it("emits animation + delay declarations", () => {
    const out = revealAnimation("slide-in", 120);
    expect(out).toContain("animation: lb-slide-in");
    expect(out).toContain("animation-delay:120ms");
  });
});

// ─── Avatar tokens (1.3) ─────────────────────────────────────────────────────

describe("avatar tokens", () => {
  it("defaults to circle radius", () => {
    const { cssVars } = resolveThemeTokens({});
    expect(cssVars["--lb-avatar-radius"]).toBe("9999px");
  });

  it("resolves each shape to a radius", () => {
    const shapes: Array<[string, string]> = [
      ["square", "0px"],
      ["rounded", "12px"],
      ["squircle", "24%"],
      ["circle", "9999px"],
    ];
    for (const [shape, radius] of shapes) {
      const { cssVars } = resolveThemeTokens({ avatarShape: shape });
      expect(cssVars["--lb-avatar-radius"]).toBe(radius);
    }
  });

  it("unknown shape falls back to circle", () => {
    const { cssVars } = resolveThemeTokens({ avatarShape: "hexagon" });
    expect(cssVars["--lb-avatar-radius"]).toBe("9999px");
  });

  it("exposes a gradient built from accent + secondary", () => {
    const { cssVars } = resolveThemeTokens({
      primaryColor: "#123456",
      secondaryColor: "#654321",
    });
    expect(cssVars["--lb-avatar-gradient"]).toContain("#123456");
    expect(cssVars["--lb-avatar-gradient"]).toContain("#654321");
  });
});

// ─── Text animation pass-through (rendered by ProfileHeader) ────────────────

describe("textAnimation values", () => {
  it("is not validated by the token resolver (rendered at component level)", () => {
    // The resolver must not choke on the new field.
    const { cssVars } = resolveThemeTokens({ textAnimation: "typewriter" });
    expect(cssVars["--lb-avatar-radius"]).toBe("9999px");
  });
});

// ─── Background types (1.3): gif + video ────────────────────────────────────

describe("background resolver for gif/video", () => {
  it("gif with image URL resolves like an image background", async () => {
    const { resolveBackground } = await import("@/lib/theme-tokens");
    expect(
      resolveBackground({
        backgroundType: "gif",
        backgroundImageUrl: "/api/uploads/loop.gif",
        backgroundValue: "#0a0820",
      }),
    ).toContain("/api/uploads/loop.gif");
  });

  it("gif without URL falls back to the base color", async () => {
    const { resolveBackground } = await import("@/lib/theme-tokens");
    expect(
      resolveBackground({ backgroundType: "gif", backgroundValue: "#112233" }),
    ).toBe("#112233");
  });

  it("video falls back to base color (the <video> element renders it)", async () => {
    const { resolveBackground } = await import("@/lib/theme-tokens");
    expect(
      resolveBackground({
        backgroundType: "video",
        backgroundImageUrl: "/api/uploads/bg.mp4",
        backgroundValue: "#0a0820",
      }),
    ).toBe("#0a0820");
  });
});
