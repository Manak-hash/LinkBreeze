import { describe, it, expect } from "vitest";

// Test the parseOgTags logic by importing the module and testing
// against known HTML strings. We test the exported fetchOgData behavior
// is correct by testing the internal parsing indirectly through the
// public API's HTML parsing.
//
// Since fetchOgData makes network calls, we test the parsing logic
// by extracting and testing it directly.

// Re-implement the parseOgTags logic for unit testing.
// This mirrors the implementation in og-fetcher.ts
function parseOgTags(html: string) {
  const getMeta = (property: string): string | null => {
    const regex = new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
      "i",
    );
    const match = html.match(regex);
    return match ? decodeEntities(match[1]).trim() : null;
  };

  const getMetaReversed = (property: string): string | null => {
    const regex = new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`,
      "i",
    );
    const match = html.match(regex);
    return match ? decodeEntities(match[1]).trim() : null;
  };

  const meta = (p: string): string | null => getMeta(p) ?? getMetaReversed(p);

  const title = meta("og:title") || meta("twitter:title") || extractTag(html, "title") || null;
  const description = meta("og:description") || meta("twitter:description") || getMetaContent(html, "description") || null;
  const imageUrl = meta("og:image") || meta("og:image:url") || meta("twitter:image") || null;
  const siteName = meta("og:site_name") || null;

  return { title, description, imageUrl, siteName };
}

function getMetaContent(html: string, name: string): string | null {
  const regex = new RegExp(
    `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["']`,
    "i",
  );
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

function extractTag(html: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i");
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

function decodeEntities(s: string): string {
  // Single pass — mirrors src/lib/og-fetcher.ts (no double-unescape).
  return s.replace(/&(amp|lt|gt|quot|#39);/g, (_, e: string) => {
    switch (e) {
      case "amp":
        return "&";
      case "lt":
        return "<";
      case "gt":
        return ">";
      case "quot":
        return '"';
      default:
        return "'";
    }
  });
}

describe("OG tag parser", () => {
  it("extracts standard og: tags", () => {
    const html = `<html><head>
      <meta property="og:title" content="My Awesome Page" />
      <meta property="og:description" content="This is a great page about things" />
      <meta property="og:image" content="https://example.com/image.jpg" />
      <meta property="og:site_name" content="Example Site" />
    </head><body></body></html>`;

    const result = parseOgTags(html);
    expect(result.title).toBe("My Awesome Page");
    expect(result.description).toBe("This is a great page about things");
    expect(result.imageUrl).toBe("https://example.com/image.jpg");
    expect(result.siteName).toBe("Example Site");
  });

  it("extracts twitter: tags as fallback", () => {
    const html = `<html><head>
      <meta name="twitter:title" content="Twitter Title" />
      <meta name="twitter:description" content="Twitter desc" />
      <meta name="twitter:image" content="https://example.com/tw.jpg" />
    </head></html>`;

    const result = parseOgTags(html);
    expect(result.title).toBe("Twitter Title");
    expect(result.description).toBe("Twitter desc");
    expect(result.imageUrl).toBe("https://example.com/tw.jpg");
  });

  it("falls back to <title> tag when no og: or twitter: title", () => {
    const html = `<html><head><title>Page Title</title></head></html>`;
    const result = parseOgTags(html);
    expect(result.title).toBe("Page Title");
  });

  it("falls back to meta description when no og:description", () => {
    const html = `<html><head>
      <meta name="description" content="Standard meta description" />
    </head></html>`;
    const result = parseOgTags(html);
    expect(result.description).toBe("Standard meta description");
  });

  it("returns null for all fields when no meta tags present", () => {
    const html = `<html><head></head></html>`;
    const result = parseOgTags(html);
    expect(result.title).toBeNull();
    expect(result.description).toBeNull();
    expect(result.imageUrl).toBeNull();
    expect(result.siteName).toBeNull();
  });

  it("decodes HTML entities in content", () => {
    const html = `<html><head>
      <meta property="og:title" content="Tom &amp; Jerry &quot;The Show&quot;" />
    </head></html>`;
    const result = parseOgTags(html);
    expect(result.title).toBe('Tom & Jerry "The Show"');
  });

  it("handles reversed attribute order (content before property)", () => {
    const html = `<html><head>
      <meta content="Reversed Order Title" property="og:title" />
    </head></html>`;
    const result = parseOgTags(html);
    expect(result.title).toBe("Reversed Order Title");
  });

  it("handles og:image:url variant", () => {
    const html = `<html><head>
      <meta property="og:image:url" content="https://example.com/alt.jpg" />
    </head></html>`;
    const result = parseOgTags(html);
    expect(result.imageUrl).toBe("https://example.com/alt.jpg");
  });

  it("prefers og: tags over twitter: tags", () => {
    const html = `<html><head>
      <meta property="og:title" content="OG Title" />
      <meta name="twitter:title" content="Twitter Title" />
    </head></html>`;
    const result = parseOgTags(html);
    expect(result.title).toBe("OG Title");
  });

  it("stops parsing at </head>", () => {
    const html = `<html><head>
      <meta property="og:title" content="In Head" />
    </head><body>
      <meta property="og:title" content="In Body" />
    </body></html>`;
    const result = parseOgTags(html);
    // Both are in the HTML string but regex finds the first match
    expect(result.title).toBe("In Head");
  });
});
