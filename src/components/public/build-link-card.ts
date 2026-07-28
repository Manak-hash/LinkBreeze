import type { LinkRow } from "@/server/queries";
import type { ThemeInput } from "@/lib/theme-tokens";

export type LinkCardTheme = ThemeInput;

/** Escape attribute/HTML text for safe inline-HTML injection (output encoding). */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Resolve a link's URL attributes for the <a> tag.
 *
 * For http(s) links: use /go/:id redirect as the href — records the click
 * server-side and works without JS (crawlers, in-app browsers, JS-disabled).
 * For other link types (mailto, tel, etc.): keep the direct href and fire
 * sendBeacon for best-effort tracking.
 */
function resolveLinkUrl(link: LinkRow): {
  href: string;
  targetAttr: string;
  onclickAttr: string;
} {
  const rawUrl = link.url;
  const isExternal =
    rawUrl.startsWith("http://") || rawUrl.startsWith("https://");

  const href = isExternal ? `/go/${link.id}` : esc(rawUrl);
  const targetAttr = isExternal
    ? ` target="_blank" rel="noopener noreferrer nofollow"`
    : "";
  const clickHandler = isExternal
    ? ""
    : `navigator.sendBeacon('/api/track', JSON.stringify({type:'click',linkId:${link.id}}))`;
  const onclickAttr = clickHandler ? `\n  onclick="${clickHandler}"` : "";

  return { href, targetAttr, onclickAttr };
}

/**
 * Build the icon element shown before the title.
 * Priority: auto-fetched favicon (iconUrl) → first-letter avatar fallback.
 * Only shown for cards WITHOUT a thumbnail (thumbnail cards use the
 * full-bleed image at the top instead).
 */
function buildIcon(link: LinkRow): string {
  if (link.iconUrl) {
    return `<img src="${esc(link.iconUrl)}" alt="" loading="lazy" style="width:20px;height:20px;border-radius:4px;flex-shrink:0;object-fit:cover" />`;
  }
  // First-letter fallback using the title's initial.
  const letter = (link.title || "?").trim().charAt(0).toUpperCase();
  return `<span aria-hidden="true" style="width:20px;height:20px;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;background:var(--lb-accent);color:var(--lb-card-bg)">${esc(letter)}</span>`;
}

/**
 * Build the content row: icon, title, description, highlight dot, and arrow.
 * Shared between cards with and without a thumbnail image.
 */
function buildContentRow(link: LinkRow): string {
  const icon = buildIcon(link);
  const highlightDot = link.isHighlighted
    ? `<span aria-hidden="true" style="display:inline-block;width:6px;height:6px;border-radius:9999px;background:var(--lb-accent);margin-right:8px;flex-shrink:0"></span>`
    : "";

  const description = link.description
    ? `<p style="font-size:var(--lb-font-size);opacity:.7;margin:2px 0 0">${esc(link.description)}</p>`
    : "";

  const title = esc(link.title);

  return `<span style="display:flex;flex-direction:column;flex:1;min-width:0">
      <span style="display:flex;align-items:center;font-weight:var(--lb-font-weight);font-size:calc(var(--lb-font-size) + 1px);letter-spacing:var(--lb-letter-spacing)">${highlightDot}${title}</span>
      ${description}
    </span>
    ${icon}
    <span aria-hidden="true" style="margin-left:10px;opacity:.6;font-size:18px;color:var(--lb-accent)">&#8599;</span>`;
}

/**
 * Pure builder for a public link card's HTML (zero client JS).
 * All user-controlled fields (title, description, url) pass through esc()
 * before injection; the click beacon is fired from an inline onclick.
 *
 * Styling now consumes CSS custom properties (--lb-*) set by theme-tokens.
 * No hardcoded colors, radii, or shadows.
 */
export function buildLinkCardHtml(options: {
  link: LinkRow;
  theme: LinkCardTheme;
  index: number;
  staggerMs?: number;
}): string {
  const { link, theme, index, staggerMs = 60 } = options;

  const linkStyle = theme.linkStyle || "glass";
  const hoverEffect = theme.hoverEffect || theme.animationType || "lift";

  // Neon style: glowing border
  const isNeon = linkStyle === "neon";
  const isGlass = linkStyle === "glass";

  const border = link.isHighlighted
    ? `var(--lb-border-width) solid var(--lb-accent)`
    : isNeon
      ? `var(--lb-border-width) solid var(--lb-accent)`
      : `var(--lb-border-width) solid var(--lb-card-border)`;

  const reveal =
    theme.animationType === "none"
      ? ""
      : `animation: aurora-rise 0.5s cubic-bezier(0.16,1,0.3,1) both; animation-delay:${index * staggerMs}ms;`;

  const { href, targetAttr, onclickAttr } = resolveLinkUrl(link);

  // CSS-based hover effects (class + data attributes) — replaces inline
  // onmouseover/onmouseout so prefers-reduced-motion can gate them.
  const hoverAttrs = ` class="lb-link-card" data-hover="${hoverEffect}"${isNeon ? ` data-neon="true"` : ""}`;

  const imageUrl = link.imageUrl ?? "";
  const hasImage = !!imageUrl;

  // Thumbnail rendered as a full-bleed image at the top of the card.
  // The card's overflow:hidden clips it to the card's border-radius.
  const image = hasImage
    ? `<img src="${esc(imageUrl)}" alt="" loading="lazy" style="display:block;width:100%;height:auto;max-height:220px;object-fit:cover" />`
    : "";

  // Thumbnail cards need overflow:hidden so the image clips to the card radius.
  const overflow = hasImage ? `overflow:hidden;` : "";

  // Backdrop blur only for glass / neon styles
  const backdropBlur =
    isGlass || isNeon
      ? `backdrop-filter:blur(var(--lb-blur));-webkit-backdrop-filter:blur(var(--lb-blur));`
      : "";

  // Layout differs: cards with thumbnail use block layout (image on top,
  // content row below). Cards without thumbnail use flex directly on the <a>.
  const display = hasImage
    ? "display:block"
    : "display:flex;align-items:center";
  const paddingStyle = hasImage
    ? ""
    : "padding:var(--lb-btn-padding-y) var(--lb-btn-padding-x);";

  const contentRow = buildContentRow(link);
  const innerContent = hasImage
    ? `${image}\n  <div style="display:flex;align-items:center;padding:var(--lb-btn-padding-y) var(--lb-btn-padding-x)">\n    ${contentRow}\n  </div>`
    : contentRow;

  return `<a
  href="${href}"${targetAttr}${onclickAttr}${hoverAttrs}
  style="
    ${display};text-decoration:none;width:100%;box-sizing:border-box;
    ${paddingStyle}margin:0 0 var(--lb-spacing);
    background:var(--lb-card-bg);border:${border};border-radius:var(--lb-card-radius);
    color:var(--lb-text);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;
    ${backdropBlur}${overflow}${reveal}
  "
>
  ${innerContent}
</a>`;
}
