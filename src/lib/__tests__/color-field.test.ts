/**
 * Unit tests for the rgba-aware ColorField helpers (reported by mail).
 *
 * The card background / card border pickers were disabled outright because
 * their values are rgba() strings the native <input type="color"> can't
 * represent. The helpers below strip/keep alpha so the pickers work like
 * every other color field. Imported from the real module — no mirror.
 */
import { describe, expect, it } from "vitest";
import { hexWithAlpha, parseToHexAlpha } from "@/app/(admin)/theme/components/field-controls";

describe("rgba color parsing (ColorField contract)", () => {
  it("passes 6-digit hex through with alpha 1", () => {
    expect(parseToHexAlpha("#14112e")).toEqual({ hex: "#14112e", alpha: 1 });
  });

  it("parses rgba() into hex + alpha", () => {
    expect(parseToHexAlpha("rgba(20,17,46,0.55)")).toEqual({ hex: "#14112e", alpha: 0.55 });
  });

  it("parses rgb() with implied alpha 1", () => {
    expect(parseToHexAlpha("rgb(255, 0, 0)")).toEqual({ hex: "#ff0000", alpha: 1 });
  });

  it("tolerates whitespace variants", () => {
    expect(parseToHexAlpha("  rgba( 255 , 128 , 0 , 0.8 )  ")).toEqual({
      hex: "#ff8000",
      alpha: 0.8,
    });
  });

  it("clamps out-of-range positive channels and alpha", () => {
    expect(parseToHexAlpha("rgba(300,500,999,2)")).toEqual({ hex: "#ffffff", alpha: 1 });
  });

  it("returns null for negative channels (invalid CSS)", () => {
    expect(parseToHexAlpha("rgba(-5,0,0,1)")).toBeNull();
  });

  it("returns null for named colors, hsl, and garbage", () => {
    expect(parseToHexAlpha("red")).toBeNull();
    expect(parseToHexAlpha("hsl(120,50%,50%)")).toBeNull();
    expect(parseToHexAlpha("not a color")).toBeNull();
    expect(parseToHexAlpha("")).toBeNull();
    expect(parseToHexAlpha(null)).toBeNull();
  });

  it("round-trips hex+alpha into rgba()", () => {
    expect(hexWithAlpha("#ff8000", 0.8)).toBe("rgba(255,128,0,0.8)");
    expect(hexWithAlpha("#000000", 0)).toBe("rgba(0,0,0,0)");
    expect(hexWithAlpha("#14112e", 1)).toBe("rgba(20,17,46,1)");
  });
});
