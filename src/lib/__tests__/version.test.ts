import { describe, it, expect } from "vitest";
import { version } from "@/lib/version";
import pkg from "@/../package.json";

describe("version", () => {
  it("is a string matching semver format", () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("matches the version in package.json", () => {
    expect(version).toBe(pkg.version);
  });
});
