import { describe, it, expect, vi } from "vitest";
import { isNewerVersion } from "@/lib/update-check";

// Mock the DB layer so we don't load better-sqlite3 in unit tests
vi.mock("@/server/queries", () => ({
  getSetting: vi.fn(async () => null),
  setSetting: vi.fn(async () => undefined),
}));

describe("isNewerVersion", () => {
  it("returns true when latest has higher major", () => {
    expect(isNewerVersion("1.0.0", "2.0.0")).toBe(true);
  });

  it("returns true when latest has higher minor", () => {
    expect(isNewerVersion("1.0.0", "1.1.0")).toBe(true);
  });

  it("returns true when latest has higher patch", () => {
    expect(isNewerVersion("1.0.0", "1.0.1")).toBe(true);
  });

  it("returns false when versions are equal", () => {
    expect(isNewerVersion("1.2.3", "1.2.3")).toBe(false);
  });

  it("returns false when latest is older (major)", () => {
    expect(isNewerVersion("2.0.0", "1.0.0")).toBe(false);
  });

  it("returns false when latest is older (minor)", () => {
    expect(isNewerVersion("1.2.0", "1.1.0")).toBe(false);
  });

  it("returns false when latest is older (patch)", () => {
    expect(isNewerVersion("1.0.1", "1.0.0")).toBe(false);
  });

  it("returns false for unparseable current version", () => {
    expect(isNewerVersion("invalid", "2.0.0")).toBe(false);
  });

  it("returns false for unparseable latest version", () => {
    expect(isNewerVersion("1.0.0", "v2.0")).toBe(false);
  });

  it("returns false for both unparseable", () => {
    expect(isNewerVersion("foo", "bar")).toBe(false);
  });

  it("handles pre-release suffixes (ignores them)", () => {
    expect(isNewerVersion("1.0.0-beta", "1.0.1")).toBe(true);
    expect(isNewerVersion("1.0.0", "2.0.0-rc1")).toBe(true);
  });
});
