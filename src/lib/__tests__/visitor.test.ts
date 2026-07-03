import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getDailySalt, getVisitorHash, getDeviceType } from "@/lib/visitor";

describe("getDailySalt", () => {
  it("returns a 64-char hex string", () => {
    const salt = getDailySalt();
    expect(salt).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for the same date", () => {
    const date = new Date("2026-07-03T12:00:00Z");
    expect(getDailySalt(date)).toBe(getDailySalt(date));
  });

  it("differs across dates", () => {
    const d1 = new Date("2026-07-03T12:00:00Z");
    const d2 = new Date("2026-07-04T12:00:00Z");
    expect(getDailySalt(d1)).not.toBe(getDailySalt(d2));
  });
});

describe("getVisitorHash", () => {
  it("returns a 16-char hex string", () => {
    const hash = getVisitorHash("127.0.0.1", "Mozilla/5.0");
    expect(hash).toMatch(/^[0-9a-f]{16}$/);
  });

  it("is deterministic for the same input within the same day", () => {
    const h1 = getVisitorHash("192.168.1.1", "Chrome");
    const h2 = getVisitorHash("192.168.1.1", "Chrome");
    expect(h1).toBe(h2);
  });

  it("differs for different IPs", () => {
    const h1 = getVisitorHash("1.2.3.4", "Chrome");
    const h2 = getVisitorHash("5.6.7.8", "Chrome");
    expect(h1).not.toBe(h2);
  });

  it("differs for different user-agents", () => {
    const h1 = getVisitorHash("1.2.3.4", "Chrome");
    const h2 = getVisitorHash("1.2.3.4", "Firefox");
    expect(h1).not.toBe(h2);
  });
});

describe("getDeviceType", () => {
  it("detects iPhone as mobile", () => {
    expect(getDeviceType("Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)")).toBe("mobile");
  });

  it("detects Android mobile", () => {
    expect(getDeviceType("Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36")).toBe("mobile");
  });

  it("detects iPad as tablet", () => {
    expect(getDeviceType("Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)")).toBe("tablet");
  });

  it("detects Android tablet (no 'mobile' keyword)", () => {
    expect(getDeviceType("Mozilla/5.0 (Linux; Android 13; SM-X906)")).toBe("tablet");
  });

  it("detects desktop for Windows UA", () => {
    expect(getDeviceType("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("desktop");
  });

  it("detects desktop for Mac UA", () => {
    expect(getDeviceType("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe("desktop");
  });

  it("returns desktop for empty input", () => {
    expect(getDeviceType("")).toBe("desktop");
  });

  it("returns desktop for null-like input", () => {
    // @ts-expect-error testing edge case
    expect(getDeviceType(undefined)).toBe("desktop");
  });
});
