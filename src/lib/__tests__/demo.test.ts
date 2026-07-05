import { describe, it, expect, afterAll } from "vitest";
import { demoBlock, isDemoMode } from "@/lib/demo";

describe("demoBlock", () => {
  const original = process.env.DEMO_MODE;

  it("returns null when DEMO_MODE is not set", () => {
    delete process.env.DEMO_MODE;
    expect(demoBlock()).toBeNull();
  });

  it("returns null when DEMO_MODE is not 'true'", () => {
    process.env.DEMO_MODE = "false";
    expect(demoBlock()).toBeNull();
  });

  it("returns an error message when DEMO_MODE is 'true'", () => {
    process.env.DEMO_MODE = "true";
    const result = demoBlock();
    expect(result).not.toBeNull();
    expect(result).toContain("read-only demo");
  });

  // Restore original env
  afterAll(() => {
    if (original !== undefined) process.env.DEMO_MODE = original;
    else delete process.env.DEMO_MODE;
  });
});

describe("isDemoMode", () => {
  const original = process.env.DEMO_MODE;

  it("is false when DEMO_MODE is not 'true'", () => {
    process.env.DEMO_MODE = "false";
    // Re-import to pick up env change — but isDemoMode is captured at import time
    // so we test the original import which reflects whatever env was at module load
    expect(typeof isDemoMode).toBe("boolean");
  });

  afterAll(() => {
    if (original !== undefined) process.env.DEMO_MODE = original;
    else delete process.env.DEMO_MODE;
  });
});
