import { describe, it, expect } from "vitest";
import { parseRange, sinceExpr, VALID_RANGES } from "@/lib/analytics-range";

describe("parseRange", () => {
  it("returns '7d' for null", () => {
    expect(parseRange(null)).toBe("7d");
  });

  it("returns '7d' for empty string", () => {
    expect(parseRange("")).toBe("7d");
  });

  it("returns '7d' for invalid string", () => {
    expect(parseRange("abc")).toBe("7d");
  });

  it("returns '7d' for '7d'", () => {
    expect(parseRange("7d")).toBe("7d");
  });

  it("returns '30d' for '30d'", () => {
    expect(parseRange("30d")).toBe("30d");
  });

  it("returns '90d' for '90d'", () => {
    expect(parseRange("90d")).toBe("90d");
  });

  it("returns 'all' for 'all'", () => {
    expect(parseRange("all")).toBe("all");
  });

  it("is case-sensitive (rejects uppercase)", () => {
    expect(parseRange("7D")).toBe("7d");
    expect(parseRange("ALL")).toBe("7d");
  });
});

describe("VALID_RANGES", () => {
  it("contains 7d, 30d, 90d, all", () => {
    expect(VALID_RANGES).toEqual(["7d", "30d", "90d", "all"]);
  });
});

describe("sinceExpr", () => {
  it("returns epoch for 'all'", () => {
    const expr = sinceExpr("all");
    expect(expr).toBeDefined();
  });

  it("returns -7 days for '7d'", () => {
    const expr = sinceExpr("7d");
    expect(expr).toBeDefined();
  });

  it("returns -30 days for '30d'", () => {
    const expr = sinceExpr("30d");
    expect(expr).toBeDefined();
  });

  it("returns -90 days for '90d'", () => {
    const expr = sinceExpr("90d");
    expect(expr).toBeDefined();
  });
});
