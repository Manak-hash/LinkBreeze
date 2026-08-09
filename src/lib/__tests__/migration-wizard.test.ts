import { describe, it, expect } from "vitest";
import { extractFromHtml } from "@/lib/migration-wizard";

describe("extractFromHtml (DOM tier)", () => {
  it("extracts non-social external links into result.links", () => {
    const html = `
      <html><body>
        <a href="https://blog.example.com/post1">My Blog Post</a>
        <a href="https://shop.example.com">Shop</a>
      </body></html>
    `;
    const result = extractFromHtml(html, new URL("https://linktr.ee/user"));
    expect(result.links.length).toBeGreaterThanOrEqual(2);
    const titles = result.links.map((l) => l.title);
    expect(titles).toContain("My Blog Post");
    expect(titles).toContain("Shop");
  });

  it("extracts social links into result.socialLinks", () => {
    const html = `
      <html><body>
        <a href="https://github.com/me">GitHub</a>
        <a href="https://twitter.com/me">Twitter</a>
      </body></html>
    `;
    const result = extractFromHtml(html, new URL("https://linktr.ee/user"));
    expect(result.socialLinks.length).toBeGreaterThanOrEqual(2);
    const urls = result.socialLinks.map((l) => l.url);
    expect(urls).toContain("https://github.com/me");
    expect(urls).toContain("https://twitter.com/me");
  });

  it("ignores javascript: and data: URLs", () => {
    const html = `
      <html><body>
        <a href="javascript:alert(1)">XSS</a>
        <a href="data:text/html,<script>alert(1)</script>">Data</a>
        <a href="https://shop.example.com">Shop</a>
      </body></html>
    `;
    const result = extractFromHtml(html, new URL("https://linktr.ee/user"));
    const allUrls = [...result.links, ...result.socialLinks].map((l) => l.url);
    expect(allUrls.some((u) => u.startsWith("javascript"))).toBe(false);
    expect(allUrls.some((u) => u.startsWith("data:"))).toBe(false);
    expect(allUrls).toContain("https://shop.example.com/");
  });

  it("skips same-origin links (internal navigation)", () => {
    const html = `
      <html><body>
        <a href="https://mysite.example.com/login">Login</a>
        <a href="https://shop.example.com">Shop</a>
      </body></html>
    `;
    const result = extractFromHtml(html, new URL("https://mysite.example.com/user"));
    const allUrls = [...result.links, ...result.socialLinks].map((l) => l.url);
    expect(allUrls).toContain("https://shop.example.com/");
    // Same-origin internal link is excluded.
    expect(allUrls).not.toContain("https://mysite.example.com/login");
  });

  it("returns empty for HTML with no external links", () => {
    const result = extractFromHtml(
      "<html><body><p>No links here</p></body></html>",
      new URL("https://linktr.ee/user"),
    );
    expect(result.links).toHaveLength(0);
    expect(result.socialLinks).toHaveLength(0);
  });

  it("deduplicates links by URL", () => {
    const html = `
      <html><body>
        <a href="https://shop.example.com">First</a>
        <a href="https://shop.example.com">Duplicate</a>
      </body></html>
    `;
    const result = extractFromHtml(html, new URL("https://linktr.ee/user"));
    const allLinks = [...result.links, ...result.socialLinks];
    const urls = allLinks.map((l) => l.url);
    expect(urls).toHaveLength(1);
  });

  it("skips links with empty titles", () => {
    const html = `<html><body><a href="https://shop.example.com"></a></body></html>`;
    const result = extractFromHtml(html, new URL("https://linktr.ee/user"));
    expect(result.links).toHaveLength(0);
  });

  it("extracts images from link thumbnails", () => {
    const html = `
      <html><body>
        <a href="https://shop.example.com"><img src="https://cdn.example.com/icon.png" />Shop</a>
      </body></html>
    `;
    const result = extractFromHtml(html, new URL("https://linktr.ee/user"));
    expect(result.links.length).toBeGreaterThanOrEqual(1);
    if (result.links[0]) {
      expect(result.links[0].imageUrl).toBe("https://cdn.example.com/icon.png");
    }
  });
});

describe("extractFromHtml (Next.js data tier)", () => {
  it("extracts from __NEXT_DATA__ script tag", () => {
    const links = [
      { title: "Blog Post", url: "https://blog.example.com/post1" },
      { title: "Store", url: "https://shop.example.com" },
    ];
    const html = `
      <html><body>
        <script id="__NEXT_DATA__" type="application/json">
          ${JSON.stringify({ props: { pageProps: { links } } })}
        </script>
      </body></html>
    `;
    const result = extractFromHtml(html, new URL("https://linktr.ee/user"));
    const allLinks = [...result.links, ...result.socialLinks];
    expect(allLinks.length).toBeGreaterThanOrEqual(2);
    const titles = allLinks.map((l) => l.title);
    expect(titles).toContain("Blog Post");
    expect(titles).toContain("Store");
  });

  it("handles empty __NEXT_DATA__ gracefully", () => {
    const html = `<html><body><script id="__NEXT_DATA__" type="application/json">{}</script></body></html>`;
    const result = extractFromHtml(html, new URL("https://linktr.ee/user"));
    expect(result.links).toHaveLength(0);
  });
});

describe("extractFromHtml (edge cases)", () => {
  it("handles empty HTML", () => {
    const result = extractFromHtml("", new URL("https://example.com"));
    expect(result.links).toHaveLength(0);
  });

  it("handles malformed HTML", () => {
    const result = extractFromHtml(
      "<div><a href='https://shop.example.com'>Link</a>",
      new URL("https://linktr.ee/user"),
    );
    expect(result.links.length).toBeGreaterThanOrEqual(0);
  });
});
