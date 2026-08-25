/**
 * String port of MarkdownLite (#93 popup cards).
 *
 * Renders the same controlled subset as the React version used for privacy
 * pages — # / ## headings, - lists, paragraphs, **bold**, *italic*, `code` —
 * but to an HTML string, because public link cards are emitted as raw HTML
 * via dangerouslySetInnerHTML (zero client JS architecture).
 *
 * Safety: every line is HTML-escaped FIRST; the only tags in the output are
 * the ones this renderer emits. Headings render as styled <p> (bold text),
 * not real h1/h2 — the public page's heading outline belongs to the profile.
 */

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Inline markers: **bold**, *italic*, `code` — same split as MarkdownLite. */
const INLINE_RE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

function renderInline(text: string): string {
  return text
    .split(INLINE_RE)
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return `<strong>${part.slice(2, -2)}</strong>`;
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return `<em>${part.slice(1, -1)}</em>`;
      }
      if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
        return `<code>${part.slice(1, -1)}</code>`;
      }
      return part;
    })
    .join("");
}

export function renderMarkdownLiteString(content: string): string {
  const lines = esc(content).split(/\r?\n/);
  const out: string[] = [];
  let listOpen = false;

  const closeList = () => {
    if (listOpen) {
      out.push("</ul>");
      listOpen = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      closeList();
      continue;
    }

    if (line.startsWith("## ")) {
      closeList();
      out.push(`<p class="lb-md-h2">${renderInline(line.slice(3))}</p>`);
      continue;
    }
    if (line.startsWith("# ")) {
      closeList();
      out.push(`<p class="lb-md-h1">${renderInline(line.slice(2))}</p>`);
      continue;
    }
    if (line.startsWith("- ")) {
      if (!listOpen) {
        out.push('<ul class="lb-md-list">');
        listOpen = true;
      }
      out.push(`<li>${renderInline(line.slice(2))}</li>`);
      continue;
    }

    closeList();
    out.push(`<p class="lb-md-p">${renderInline(line)}</p>`);
  }

  closeList();
  return out.join("\n");
}
