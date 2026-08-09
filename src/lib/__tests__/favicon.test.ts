import { describe, it, expect } from "vitest";
import { extractDomain } from "@/lib/favicon";

describe("extractDomain", () => {
  it("extracts hostname from https URL", () => {
    expect(extractDomain("https://example.com")).toBe("example.com");
  });

  it("extracts hostname from http URL", () => {
    expect(extractDomain("http://example.com")).toBe("example.com");
  });

  it("extracts hostname with path and query", () => {
    expect(extractDomain("https://example.com/page?q=1")).toBe("example.com");
  });

  it("extracts hostname with port", () => {
    expect(extractDomain("https://example.com:8080")).toBe("example.com");
  });

  it("extracts subdomain", () => {
    expect(extractDomain("https://blog.example.com")).toBe("blog.example.com");
  });

  it("returns null for mailto:", () => {
    expect(extractDomain("mailto:test@example.com")).toBe(null);
  });

  it("returns null for tel:", () => {
    expect(extractDomain("tel:+1234567890")).toBe(null);
  });

  it("returns null for javascript: URLs", () => {
    expect(extractDomain("javascript:alert(1)")).toBe(null);
  });

  it("returns null for relative URLs", () => {
    expect(extractDomain("/page")).toBe(null);
  });

  it("returns null for empty string", () => {
    expect(extractDomain("")).toBe(null);
  });

  it("returns null for invalid URL", () => {
    expect(extractDomain("not a url")).toBe(null);
  });
});
