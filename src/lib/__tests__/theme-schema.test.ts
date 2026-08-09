import { describe, it, expect } from "vitest";
import { customSchema, cssColor } from "@/lib/theme-schema";

describe("cssColor", () => {
  it("accepts hex colors", () => {
    expect(cssColor.safeParse("#fff").success).toBe(true);
    expect(cssColor.safeParse("#ffffff").success).toBe(true);
    expect(cssColor.safeParse("#ffffffff").success).toBe(true);
    expect(cssColor.safeParse("#aBcDeF").success).toBe(true);
  });

  it("accepts rgb() and rgba()", () => {
    expect(cssColor.safeParse("rgb(255,0,0)").success).toBe(true);
    expect(cssColor.safeParse("rgba(255,0,0,0.5)").success).toBe(true);
  });

  it("accepts transparent and none", () => {
    expect(cssColor.safeParse("transparent").success).toBe(true);
    expect(cssColor.safeParse("none").success).toBe(true);
  });

  it("rejects random strings", () => {
    expect(cssColor.safeParse("red").success).toBe(false);
    expect(cssColor.safeParse("not-a-color").success).toBe(false);
    expect(cssColor.safeParse("<script>").success).toBe(false);
  });

  it("rejects strings over 60 chars", () => {
    expect(cssColor.safeParse("x".repeat(61)).success).toBe(false);
  });
});

describe("customSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(customSchema.safeParse({}).success).toBe(true);
  });

  it("accepts valid backgroundType", () => {
    const types = ["solid", "gradient", "pattern", "aurora", "radial", "mesh", "image", "animatedGradient"];
    for (const t of types) {
      expect(customSchema.safeParse({ backgroundType: t }).success).toBe(true);
    }
  });

  it("rejects invalid backgroundType", () => {
    expect(customSchema.safeParse({ backgroundType: "invalid" }).success).toBe(false);
  });

  it("accepts valid linkStyle", () => {
    const styles = ["pill", "rounded", "sharp", "glass", "outline", "neon", "pixel"];
    for (const s of styles) {
      expect(customSchema.safeParse({ linkStyle: s }).success).toBe(true);
    }
  });

  it("rejects invalid linkStyle", () => {
    expect(customSchema.safeParse({ linkStyle: "invalid" }).success).toBe(false);
  });

  it("accepts valid mode (light/dark)", () => {
    expect(customSchema.safeParse({ mode: "light" }).success).toBe(true);
    expect(customSchema.safeParse({ mode: "dark" }).success).toBe(true);
  });

  it("rejects invalid mode", () => {
    expect(customSchema.safeParse({ mode: "purple" }).success).toBe(false);
  });

  it("accepts hex color for primaryColor", () => {
    expect(customSchema.safeParse({ primaryColor: "#ff0000" }).success).toBe(true);
  });

  it("rejects invalid color for primaryColor", () => {
    expect(customSchema.safeParse({ primaryColor: "not-a-color" }).success).toBe(false);
  });

  it("accepts buttonSize enum", () => {
    expect(customSchema.safeParse({ buttonSize: "sm" }).success).toBe(true);
    expect(customSchema.safeParse({ buttonSize: "md" }).success).toBe(true);
    expect(customSchema.safeParse({ buttonSize: "lg" }).success).toBe(true);
  });

  it("rejects strings over max length for backgroundValue", () => {
    expect(customSchema.safeParse({ backgroundValue: "x".repeat(501) }).success).toBe(false);
  });
});
