import { describe, it, expect } from "vitest";
import {
  UTM_KEYS,
  emptyUTM,
  parseUTM,
  appendUTM,
  stripUTM,
  hasUTM,
} from "@/lib/utm";

describe("utm", () => {
  describe("emptyUTM", () => {
    it("returns all 5 keys as empty strings", () => {
      const u = emptyUTM();
      for (const key of UTM_KEYS) {
        expect(u[key]).toBe("");
      }
      expect(Object.keys(u)).toHaveLength(5);
    });
  });

  describe("parseUTM", () => {
    it("extracts utm params from a URL", () => {
      const url = "https://example.com?utm_source=instagram&utm_medium=social&utm_campaign=spring";
      const parsed = parseUTM(url);
      expect(parsed.source).toBe("instagram");
      expect(parsed.medium).toBe("social");
      expect(parsed.campaign).toBe("spring");
      expect(parsed.term).toBe("");
      expect(parsed.content).toBe("");
    });

    it("returns all-empty for a URL with no utm params", () => {
      const parsed = parseUTM("https://example.com?ref=newsletter");
      for (const key of UTM_KEYS) {
        expect(parsed[key]).toBe("");
      }
    });

    it("returns all-empty for non-http(s) URLs", () => {
      const parsed = parseUTM("mailto:test@example.com?utm_source=x");
      for (const key of UTM_KEYS) {
        expect(parsed[key]).toBe("");
      }
    });

    it("returns all-empty for invalid URLs", () => {
      const parsed = parseUTM("not a url");
      for (const key of UTM_KEYS) {
        expect(parsed[key]).toBe("");
      }
    });
  });

  describe("appendUTM", () => {
    it("appends non-empty params to a clean URL", () => {
      const result = appendUTM("https://example.com", {
        source: "instagram",
        medium: "social",
      });
      expect(result).toContain("utm_source=instagram");
      expect(result).toContain("utm_medium=social");
      // Empty fields should NOT be appended
      expect(result).not.toContain("utm_campaign");
      expect(result).not.toContain("utm_term");
      expect(result).not.toContain("utm_content");
    });

    it("preserves existing query params", () => {
      const result = appendUTM("https://example.com?ref=newsletter", {
        source: "email",
      });
      expect(result).toContain("ref=newsletter");
      expect(result).toContain("utm_source=email");
    });

    it("overwrites existing utm_* params with new values", () => {
      const result = appendUTM(
        "https://example.com?utm_source=old",
        { source: "new" },
      );
      expect(result).toContain("utm_source=new");
      expect(result).not.toContain("utm_source=old");
    });

    it("does not append anything when all values are empty", () => {
      const result = appendUTM("https://example.com", emptyUTM());
      expect(result).toBe("https://example.com/");
    });

    it("returns non-http(s) URLs unchanged", () => {
      const result = appendUTM("mailto:test@example.com", { source: "x" });
      expect(result).toBe("mailto:test@example.com");
    });

    it("returns invalid URLs unchanged", () => {
      const result = appendUTM("not a url", { source: "x" });
      expect(result).toBe("not a url");
    });

    it("returns empty string unchanged", () => {
      expect(appendUTM("", { source: "x" })).toBe("");
    });

    it("URL-encodes special characters in values", () => {
      const result = appendUTM("https://example.com", {
        campaign: "spring sale & summer",
      });
      expect(result).toContain("utm_campaign=spring+sale+%26+summer");
    });
  });

  describe("stripUTM", () => {
    it("removes all utm_* params, preserves others", () => {
      const url = "https://example.com?utm_source=ig&utm_medium=social&ref=newsletter";
      const stripped = stripUTM(url);
      expect(stripped).not.toContain("utm_");
      expect(stripped).toContain("ref=newsletter");
    });

    it("leaves URLs without utm params unchanged", () => {
      const result = stripUTM("https://example.com?ref=newsletter");
      expect(result).toContain("ref=newsletter");
      expect(result).not.toContain("utm_");
    });

    it("returns non-http(s) URLs unchanged", () => {
      expect(stripUTM("mailto:test@example.com")).toBe("mailto:test@example.com");
    });
  });

  describe("hasUTM", () => {
    it("returns true when URL has utm params", () => {
      expect(hasUTM("https://example.com?utm_source=ig")).toBe(true);
    });

    it("returns false when URL has no utm params", () => {
      expect(hasUTM("https://example.com?ref=newsletter")).toBe(false);
    });

    it("returns false for non-http(s) URLs", () => {
      expect(hasUTM("mailto:test@example.com?utm_source=x")).toBe(false);
    });

    it("returns false for invalid URLs", () => {
      expect(hasUTM("not a url")).toBe(false);
    });
  });
});
