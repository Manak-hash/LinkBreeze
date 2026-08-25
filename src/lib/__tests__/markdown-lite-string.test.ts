import { describe, it, expect } from "vitest";
import { renderMarkdownLiteString } from "@/lib/markdown-lite-string";

describe("renderMarkdownLiteString (#93 popup bodies)", () => {
  it("escapes HTML before applying markdown", () => {
    const out = renderMarkdownLiteString('<img src=x onerror="alert(1)">');
    expect(out).not.toContain("<img");
    expect(out).toContain("&lt;img");
  });

  it("renders bold, italic, code", () => {
    const out = renderMarkdownLiteString("**b** *i* `c`");
    expect(out).toContain("<strong>b</strong>");
    expect(out).toContain("<em>i</em>");
    expect(out).toContain("<code>c</code>");
  });

  it("renders lists as a single ul", () => {
    const out = renderMarkdownLiteString("- a\n- b\n\npara");
    expect(out).toContain('<ul class="lb-md-list">');
    expect(out).toContain("<li>a</li>");
    expect(out).toContain("<li>b</li>");
    expect(out).toContain('<p class="lb-md-p">para</p>');
  });

  it("renders headings as styled paragraphs, not h1/h2", () => {
    const out = renderMarkdownLiteString("# Title\n## Sub");
    expect(out).toContain('<p class="lb-md-h1">Title</p>');
    expect(out).toContain('<p class="lb-md-h2">Sub</p>');
    expect(out).not.toMatch(/<h[12]/);
  });

  it("keeps inline markdown inside list items", () => {
    const out = renderMarkdownLiteString("- **bold** item");
    expect(out).toContain("<li><strong>bold</strong> item</li>");
  });

  it("closes a list interrupted by a blank line", () => {
    const out = renderMarkdownLiteString("- a\n\ntext");
    expect(out.indexOf("</ul>")).toBeLessThan(out.indexOf("lb-md-p"));
  });

  it("emits nothing for empty input", () => {
    expect(renderMarkdownLiteString("")).toBe("");
  });
});
