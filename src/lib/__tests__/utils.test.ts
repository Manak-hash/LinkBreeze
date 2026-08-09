import { describe, it, expect } from "vitest";
import { cn, truthy } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("deduplicates conflicting tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles conditional values", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});

describe("truthy", () => {
  it("returns true for boolean true", () => {
    expect(truthy(true)).toBe(true);
  });

  it("returns true for string 'true'", () => {
    expect(truthy("true")).toBe(true);
  });

  it("returns true for string 'on'", () => {
    expect(truthy("on")).toBe(true);
  });

  it("returns true for number 1", () => {
    expect(truthy(1)).toBe(true);
  });

  it("returns true for string '1'", () => {
    expect(truthy("1")).toBe(true);
  });

  it("returns false for false", () => {
    expect(truthy(false)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(truthy("")).toBe(false);
  });

  it("returns false for null", () => {
    expect(truthy(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(truthy(undefined)).toBe(false);
  });

  it("returns false for 0", () => {
    expect(truthy(0)).toBe(false);
  });

  it("returns false for random strings", () => {
    expect(truthy("yes")).toBe(false);
    expect(truthy("off")).toBe(false);
  });
});
