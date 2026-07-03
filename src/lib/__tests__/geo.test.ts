import { describe, it, expect } from "vitest";
import { getCountry } from "@/lib/geo";

function makeHeaders(map: Record<string, string>) {
  return {
    get(name: string) {
      return map[name] ?? null;
    },
  };
}

describe("getCountry", () => {
  it("reads x-vercel-ip-country header", () => {
    expect(getCountry(makeHeaders({ "x-vercel-ip-country": "MA" }))).toBe("MA");
  });

  it("reads cf-ipcountry header", () => {
    expect(getCountry(makeHeaders({ "cf-ipcountry": "US" }))).toBe("US");
  });

  it("reads x-aws-ip-country header", () => {
    expect(getCountry(makeHeaders({ "x-aws-ip-country": "FR" }))).toBe("FR");
  });

  it("reads x-cloudfront-country header", () => {
    expect(getCountry(makeHeaders({ "x-cloudfront-country": "DE" }))).toBe("DE");
  });

  it("reads x-appengine-country header", () => {
    expect(getCountry(makeHeaders({ "x-appengine-country": "JP" }))).toBe("JP");
  });

  it("reads x-geo-country header", () => {
    expect(getCountry(makeHeaders({ "x-geo-country": "GB" }))).toBe("GB");
  });

  it("reads geoip-country-code header", () => {
    expect(getCountry(makeHeaders({ "geoip-country-code": "CA" }))).toBe("CA");
  });

  it("returns null when no headers present", () => {
    expect(getCountry(makeHeaders({}))).toBeNull();
  });

  it("ignores ZZ (unknown sentinel)", () => {
    expect(getCountry(makeHeaders({ "cf-ipcountry": "ZZ" }))).toBeNull();
  });

  it("returns null for empty header values", () => {
    expect(getCountry(makeHeaders({ "cf-ipcountry": "  " }))).toBeNull();
  });

  it("prioritizes in order (vercel > cf)", () => {
    const h = makeHeaders({ "x-vercel-ip-country": "MA", "cf-ipcountry": "US" });
    expect(getCountry(h)).toBe("MA");
  });

  it("trims whitespace from the value", () => {
    expect(getCountry(makeHeaders({ "cf-ipcountry": "  FR  " }))).toBe("FR");
  });
});
