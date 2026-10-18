import { describe, it, expect } from "vitest";
import {
  resolveOgThemeBackground,
  hexAlpha,
} from "@/lib/og-theme";

/**
 * og-theme: pure resolver tests. Every background type must produce the
 * visual the public page actually renders (verified against globals.css
 * aurora blob positions/opacities and resolveBackground in theme-tokens).
 */
describe("resolveOgThemeBackground", () => {
  it("defaults to the night base when no theme (cold boot, no rows)", () => {
    const og = resolveOgThemeBackground(null);
    // Single resolved color: the theme row is absent, so the "gradient"
    // degenerates to its only stop — the same thing resolveBackground does.
    expect(og.background).toBe("#0a0820");
    expect(og.imageUrl).toBeNull();
    expect(og.overlay).toBeNull();
  });

  it("solid: flat color, no gradients", () => {
    const og = resolveOgThemeBackground({
      backgroundType: "solid",
      backgroundValue: "#ff8800",
    });
    expect(og.background).toBe("#ff8800");
    expect(og.background).not.toContain("gradient");
  });

  it("gradient: respects the stored angle and all stops", () => {
    const og = resolveOgThemeBackground({
      backgroundType: "gradient",
      backgroundValue: "#111111,#222222,#333333",
      backgroundAngle: "90deg",
    });
    expect(og.background).toBe("linear-gradient(90deg, #111111, #222222, #333333)");
  });

  it("radial: mirrors the page's 50% 30% focal point", () => {
    const og = resolveOgThemeBackground({
      backgroundType: "radial",
      backgroundValue: "#111111,#222222",
    });
    expect(og.background).toBe("radial-gradient(circle at 50% 30%, #111111, #222222)");
  });

  it("mesh: layered radial stops at the same positions as the page", () => {
    const og = resolveOgThemeBackground({
      backgroundType: "mesh",
      backgroundValue: "#111111,#222222",
    });
    expect(og.background).toContain("radial-gradient(at 20% 15%, #111111 0px, transparent 50%)");
    expect(og.background).toContain("radial-gradient(at 45% 45%, #222222 0px, transparent 50%)");
    expect(og.background.endsWith(", #111111")).toBe(true);
  });

  it("image: exposes the background image + theme overlay", () => {
    const og = resolveOgThemeBackground({
      backgroundType: "image",
      backgroundValue: "#111111",
      backgroundImageUrl: "/api/uploads/bg.png",
      overlayColor: "#000000",
      overlayOpacity: "40",
    });
    expect(og.imageUrl).toBe("/api/uploads/bg.png");
    expect(og.overlay).toEqual({ color: "#000000", opacity: 0.4 });
  });

  it("image without overlay: image exposed, overlay null", () => {
    const og = resolveOgThemeBackground({
      backgroundType: "image",
      backgroundValue: "#111111",
      backgroundImageUrl: "/api/uploads/bg.png",
      overlayOpacity: "0",
    });
    expect(og.imageUrl).toBe("/api/uploads/bg.png");
    expect(og.overlay).toBeNull();
  });

  it("gif with no URL falls back to the base color (mirror resolveBackground)", () => {
    const og = resolveOgThemeBackground({ backgroundType: "gif", backgroundValue: "#101010" });
    expect(og.imageUrl).toBeNull();
    expect(og.background).toBe("#101010");
  });

  it("animatedGradient: static loop snapshot (first color appended)", () => {
    const og = resolveOgThemeBackground({
      backgroundType: "animatedGradient",
      backgroundValue: "#111111,#222222",
      backgroundAngle: "45deg",
    });
    expect(og.background).toBe("linear-gradient(45deg, #111111, #222222, #111111)");
  });

  it("aurora: base color + accent/secondary glows at the blob corners", () => {
    const og = resolveOgThemeBackground({
      backgroundType: "aurora",
      backgroundValue: "#0a0820",
      primaryColor: "#533fd6",
      secondaryColor: "#a78bfa",
    });
    // Blob 1: accent, top-left, opacity .20 (globals.css aurora-blob--1).
    expect(og.background).toContain("radial-gradient(circle at 22% 20%, #533fd633 0%, transparent 55%)");
    // Blob 2: secondary, bottom-right, opacity .18 (aurora-blob--2).
    expect(og.background).toContain("radial-gradient(circle at 80% 82%, #a78bfa2e 0%, transparent 55%)");
    expect(og.background.endsWith(", #0a0820")).toBe(true);
  });

  it("video: renders the theme's fallback gradient (satori cannot draw frames)", () => {
    const og = resolveOgThemeBackground({
      backgroundType: "video",
      backgroundValue: "#111111,#222222",
      backgroundImageUrl: "/api/uploads/loop.mp4",
    });
    expect(og.imageUrl).toBeNull();
    expect(og.background).toBe("linear-gradient(160deg, #111111, #222222)");
  });

  it("pattern: flat base color (the pattern CSS is not reproducible in satori)", () => {
    const og = resolveOgThemeBackground({ backgroundType: "pattern", backgroundValue: "#202020" });
    expect(og.background).toBe("#202020");
  });
});

describe("hexAlpha", () => {
  it("appends 2-digit alpha to 6-digit hex", () => {
    expect(hexAlpha("#533fd6", 0.2)).toBe("#533fd633");
  });

  it("expands 3-digit hex", () => {
    expect(hexAlpha("#fff", 1)).toBe("#ffffffff");
  });

  it("clamps out-of-range alphas", () => {
    expect(hexAlpha("#000000", 2)).toBe("#000000ff");
    expect(hexAlpha("#000000", -1)).toBe("#00000000");
  });

  it("passes non-hex colors through untouched", () => {
    expect(hexAlpha("rgba(1, 2, 3, 0.5)", 0.2)).toBe("rgba(1, 2, 3, 0.5)");
    expect(hexAlpha("white", 0.5)).toBe("white");
  });
});
