import { describe, expect, it } from "vitest";
import { isAllowedLinkUrl } from "@/lib/link-url";

describe("isAllowedLinkUrl", () => {
  it("allows regular http and https links", () => {
    expect(isAllowedLinkUrl("url", "https://example.com")).toBe(true);
    expect(isAllowedLinkUrl("url", "http://example.com")).toBe(true);
  });

  it("blocks executable schemes for regular links", () => {
    expect(isAllowedLinkUrl("url", "javascript:alert(1)")).toBe(false);
    expect(isAllowedLinkUrl("url", "data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("allows each contact link type only for its expected scheme", () => {
    expect(isAllowedLinkUrl("email", "mailto:hello@example.com")).toBe(true);
    expect(isAllowedLinkUrl("phone", "tel:+15551234567")).toBe(true);
    expect(isAllowedLinkUrl("sms", "sms:+15551234567")).toBe(true);

    expect(isAllowedLinkUrl("email", "https://example.com")).toBe(false);
    expect(isAllowedLinkUrl("phone", "javascript:alert(1)")).toBe(false);
  });

  it("only allows WhatsApp links through wa.me over https", () => {
    expect(isAllowedLinkUrl("whatsapp", "https://wa.me/15551234567")).toBe(true);
    expect(isAllowedLinkUrl("whatsapp", "whatsapp://send?phone=15551234567")).toBe(true);
    expect(isAllowedLinkUrl("whatsapp", "http://wa.me/15551234567")).toBe(false);
    expect(isAllowedLinkUrl("whatsapp", "https://example.com/15551234567")).toBe(false);
  });

  it("allows local file paths without protocol-relative URLs", () => {
    expect(isAllowedLinkUrl("file", "/uploads/demo.pdf")).toBe(true);
    expect(isAllowedLinkUrl("file", "//evil.example/file.pdf")).toBe(false);
  });
});
