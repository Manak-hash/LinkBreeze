import type { LinkRow } from "@/server/queries";
import { revealAnimation, type ThemeInput } from "@/lib/theme-tokens";

/**
 * Pure builder for a public divider element (#87) — zero client JS, no
 * interactions: it is a non-clickable thematic break between links.
 *
 * Rendered as a <div role="separator"> rather than a bare <hr> so the
 * gradient style (a background-image fade) and the per-theme width both
 * apply without UA <hr> styling fighting back.
 *
 * Every visual value is a CSS custom property (--lb-divider-*) resolved
 * from the theme, so each theme styles its own dividers and the same
 * markup stays untouched. Defaults match the historical look (1px solid
 * card-border line) so existing themes render unchanged until customized.
 */
export function buildDividerHtml(options: {
  link: LinkRow;
  theme: ThemeInput;
  index: number;
  staggerMs?: number;
  baseDelayMs?: number;
}): string {
  const { link, theme, index, staggerMs = 60, baseDelayMs = 0 } = options;

  const reveal =
    theme.animationType === "none"
      ? ""
      : revealAnimation(theme.animationType, baseDelayMs + index * staggerMs);

  // Same outer spacing as link cards so a divider reads as a peer of the
  // cards around it, then margin:auto centers a narrower-than-100% line.
  return `<div
  role="separator"
  aria-label="${esc(link.title || "Separator")}"
  style="
    margin:0 0 var(--lb-spacing);
    margin-left:auto;margin-right:auto;
    width:var(--lb-divider-width);
    border:none;
    height:var(--lb-divider-thickness);
    background:var(--lb-divider-image);
    border-top:var(--lb-divider-thickness) var(--lb-divider-style) var(--lb-divider-color);
    ${reveal}
  "
></div>`;
}

/** Escape attribute text for safe inline-HTML injection (output encoding). */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
