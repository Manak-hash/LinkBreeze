import { describe, it, expect } from "vitest";
import { version } from "@/lib/version";

describe("version", () => {
  it("is a string matching semver format", () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("matches the version in package.json", () => {
    expect(version).toBe("1.0.1");
  });
});
