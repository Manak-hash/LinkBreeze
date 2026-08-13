import { describe, it, expect } from "vitest";
import { generatePrivacyPolicy } from "@/lib/privacy-template";

describe("generatePrivacyPolicy", () => {
  it("includes the display name in the title", () => {
    const policy = generatePrivacyPolicy({
      displayName: "Jane Doe",
      slug: "jane",
      hasAnalytics: true,
      hasEmailCapture: false,
      hasEmbeds: false,
      hasExternalAnalytics: false,
      analyticsRetentionDays: 90,
    });
    expect(policy).toContain("# Privacy Policy for Jane Doe");
  });

  it("includes analytics section when hasAnalytics is true", () => {
    const policy = generatePrivacyPolicy({
      displayName: "Test",
      slug: "test",
      hasAnalytics: true,
      hasEmailCapture: false,
      hasEmbeds: false,
      hasExternalAnalytics: false,
      analyticsRetentionDays: 90,
    });
    expect(policy).toContain("## Analytics");
    expect(policy).toContain("90 days");
    expect(policy).toContain("never stored");
  });

  it("omits analytics section when hasAnalytics is false", () => {
    const policy = generatePrivacyPolicy({
      displayName: "Test",
      slug: "test",
      hasAnalytics: false,
      hasEmailCapture: false,
      hasEmbeds: false,
      hasExternalAnalytics: false,
      analyticsRetentionDays: 0,
    });
    expect(policy).not.toContain("## Analytics");
  });

  it("includes email capture section when enabled", () => {
    const policy = generatePrivacyPolicy({
      displayName: "Test",
      slug: "test",
      hasAnalytics: true,
      hasEmailCapture: true,
      hasEmbeds: false,
      hasExternalAnalytics: false,
      analyticsRetentionDays: 0,
    });
    expect(policy).toContain("## Email Address");
    expect(policy).toContain("never sold");
  });

  it("includes embed section when page has embeds", () => {
    const policy = generatePrivacyPolicy({
      displayName: "Test",
      slug: "test",
      hasAnalytics: true,
      hasEmailCapture: false,
      hasEmbeds: true,
      hasExternalAnalytics: false,
      analyticsRetentionDays: 0,
    });
    expect(policy).toContain("## Embedded Content");
    expect(policy).toContain("youtube-nocookie.com");
  });

  it("includes third-party analytics warning when configured", () => {
    const policy = generatePrivacyPolicy({
      displayName: "Test",
      slug: "test",
      hasAnalytics: true,
      hasEmailCapture: false,
      hasEmbeds: false,
      hasExternalAnalytics: true,
      analyticsRetentionDays: 0,
    });
    expect(policy).toContain("## Third-Party Analytics");
  });

  it("shows infinite retention wording when retention is 0", () => {
    const policy = generatePrivacyPolicy({
      displayName: "Test",
      slug: "test",
      hasAnalytics: true,
      hasEmailCapture: false,
      hasEmbeds: false,
      hasExternalAnalytics: false,
      analyticsRetentionDays: 0,
    });
    expect(policy).toContain("until manually deleted");
  });

  it("includes contact email when provided", () => {
    const policy = generatePrivacyPolicy({
      displayName: "Test",
      slug: "test",
      hasAnalytics: true,
      hasEmailCapture: true,
      hasEmbeds: false,
      hasExternalAnalytics: false,
      analyticsRetentionDays: 0,
      contactEmail: "privacy@example.com",
    });
    expect(policy).toContain("privacy@example.com");
  });

  it("includes data controller section", () => {
    const policy = generatePrivacyPolicy({
      displayName: "Test",
      slug: "test",
      hasAnalytics: true,
      hasEmailCapture: false,
      hasEmbeds: false,
      hasExternalAnalytics: false,
      analyticsRetentionDays: 0,
    });
    expect(policy).toContain("## Data Controller");
    expect(policy).toContain("LinkBreeze");
  });

  it("includes children's privacy section", () => {
    const policy = generatePrivacyPolicy({
      displayName: "Test",
      slug: "test",
      hasAnalytics: true,
      hasEmailCapture: false,
      hasEmbeds: false,
      hasExternalAnalytics: false,
      analyticsRetentionDays: 0,
    });
    expect(policy).toContain("## Children's Privacy");
  });

  it("always includes cookies section and your rights section", () => {
    const policy = generatePrivacyPolicy({
      displayName: "Test",
      slug: "test",
      hasAnalytics: false,
      hasEmailCapture: false,
      hasEmbeds: false,
      hasExternalAnalytics: false,
      analyticsRetentionDays: 0,
    });
    expect(policy).toContain("## Cookies");
    expect(policy).toContain("## Your Rights");
  });

  it("uses fallback name when displayName is empty", () => {
    const policy = generatePrivacyPolicy({
      displayName: "",
      slug: "test",
      hasAnalytics: true,
      hasEmailCapture: false,
      hasEmbeds: false,
      hasExternalAnalytics: false,
      analyticsRetentionDays: 0,
    });
    expect(policy).toContain("# Privacy Policy for This site");
  });

  it("includes last updated date", () => {
    const policy = generatePrivacyPolicy({
      displayName: "Test",
      slug: "test",
      hasAnalytics: true,
      hasEmailCapture: false,
      hasEmbeds: false,
      hasExternalAnalytics: false,
      analyticsRetentionDays: 0,
    });
    expect(policy).toMatch(/Last updated: .+ 2026/);
  });
});
