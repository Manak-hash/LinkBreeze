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
 * Priority: cached favicon (iconUrl) → first-letter avatar.
 * Only shown for cards WITHOUT a thumbnail (thumbnail cards use the
 * full-bleed image at the top instead).
 *
 * No external fallback — loading favicons from a third-party domain
 * (previously Google S2) leaks the visitor's IP and browser data to that
 * third party. Links without a cached favicon show a letter avatar instead.
 */
function buildIcon(link: LinkRow): string {
  // Cached favicon from fetchAndCacheFavicon — always preferred when present.
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
  const featured = link.isHighlighted;

  // Featured links get a "Featured" badge instead of the small dot
  const featuredBadge = featured
    ? `<span aria-hidden="true" style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--lb-accent);margin-bottom:4px">&#9733; Featured</span>`
    : "";

  const description = link.description
    ? `<p style="font-size:var(--lb-font-size);color:var(--lb-text-muted);margin:2px 0 0">${esc(link.description)}</p>`
    : "";

  const title = esc(link.title);
  // Featured links: bolder title + slightly larger font
  const fontWeight = featured
    ? "calc(var(--lb-font-weight) + 100)"
    : "var(--lb-font-weight)";
  const fontSize = featured
    ? "calc(var(--lb-font-size) + 3px)"
    : "calc(var(--lb-font-size) + 1px)";

  return `<span style="display:flex;flex-direction:column;flex:1;min-width:0">
      ${featuredBadge}
      <span style="display:flex;align-items:center;font-weight:${fontWeight};font-size:${fontSize};letter-spacing:var(--lb-letter-spacing)">${title}</span>
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
  const isPixel = linkStyle === "pixel";

  // Featured links: accent-tinted background + thicker accent border
  const featured = link.isHighlighted;
  const border = featured
    ? `calc(var(--lb-border-width) + 1px) solid var(--lb-accent)`
    : isNeon
      ? `var(--lb-border-width) solid var(--lb-accent)`
      : `var(--lb-border-width) solid var(--lb-card-border)`;

  // Featured links get a subtle accent-tinted background overlay
  const cardBg = featured
    ? `color-mix(in srgb, var(--lb-accent) 12%, var(--lb-card-bg))`
    : `var(--lb-card-bg)`;

  // Featured links: extra vertical padding for a taller card
  const featuredPadding = featured
    ? `padding-top:calc(var(--lb-btn-padding-y) + 6px);padding-bottom:calc(var(--lb-btn-padding-y) + 6px);`
    : ``;

  const reveal =
    theme.animationType === "none"
      ? ""
      : `animation: aurora-rise 0.5s cubic-bezier(0.16,1,0.3,1) both; animation-delay:${index * staggerMs}ms;`;

  const { href, targetAttr, onclickAttr } = resolveLinkUrl(link);

  // CSS-based hover effects (class + data attributes) — replaces inline
  // onmouseover/onmouseout so prefers-reduced-motion can gate them.
  const hoverAttrs = ` class="lb-link-card" data-hover="${hoverEffect}"${isNeon ? ` data-neon="true"` : ""}${isPixel ? ` data-pixel="true"` : ""}`;

  const imageUrl = link.imageUrl ?? "";
  const hasImage = !!imageUrl;

  // Thumbnail rendered as a full-bleed image at the top of the card.
  // alt text uses the link title so screen readers and search engines
  // get meaningful context (not an empty string). The card's
  // overflow:hidden clips it to the card's border-radius.
  const image = hasImage
    ? `<img src="${esc(imageUrl)}" alt="${esc(link.title)}" loading="lazy" style="display:block;width:100%;height:auto;max-height:220px;object-fit:cover" />`
    : "";

  // Thumbnail cards need overflow:hidden so the image clips to the card radius.
  const overflow = hasImage ? `overflow:hidden;` : "";

  // Backdrop blur only for glass / neon styles
  const backdropBlur =
    isGlass || isNeon
      ? `backdrop-filter:blur(var(--lb-blur));-webkit-backdrop-filter:blur(var(--lb-blur));`
      : "";

  // Pixel style: stepped clip-path corners (the ReactBits 8-bit signature look)
  // For pixel cards: wrap in a div that acts as the orange border layer.
  // The inner <a> is inset 3px with its own clip-path, creating a stepped
  // orange border without expensive GPU filters.
  const pixelClip = isPixel
    ? `clip-path:polygon(8px 0,calc(100% - 8px) 0,calc(100% - 8px) 4px,calc(100% - 4px) 4px,calc(100% - 4px) 8px,100% 8px,100% calc(100% - 8px),calc(100% - 4px) calc(100% - 8px),calc(100% - 4px) calc(100% - 4px),calc(100% - 8px) calc(100% - 4px),calc(100% - 8px) 100%,8px 100%,8px calc(100% - 4px),4px calc(100% - 4px),4px calc(100% - 8px),0 calc(100% - 8px),0 8px,4px 8px,4px 4px);`
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

  if (isPixel) {
    // Pixel cards: wrap <a> in a div that serves as the orange border layer.
    // The div has the accent background + outer clip-path.
    // The <a> is positioned inside with inset:3px + inner clip-path.
    return `<div class="lb-pixel-card-wrap" style="position:relative;margin:0 0 var(--lb-spacing);${pixelClip}">
  <div style="position:absolute;inset:0;background:var(--lb-accent);${pixelClip};z-index:0"></div>
  <a
    href="${href}"${targetAttr}${onclickAttr}${hoverAttrs}
    style="
      ${display};text-decoration:none;width:calc(100% - 6px);box-sizing:border-box;
      ${paddingStyle}${featuredPadding}
      position:relative;z-index:1;
      background:${cardBg};border:none;border-radius:0;
      color:var(--lb-text);transition:transform .15s ease,box-shadow .15s ease;
      margin:3px;
      clip-path:polygon(6px 0,calc(100% - 6px) 0,calc(100% - 6px) 3px,calc(100% - 3px) 3px,calc(100% - 3px) 6px,100% 6px,100% calc(100% - 6px),calc(100% - 3px) calc(100% - 6px),calc(100% - 3px) calc(100% - 3px),calc(100% - 6px) calc(100% - 3px),calc(100% - 6px) 100%,6px 100%,6px calc(100% - 3px),3px calc(100% - 3px),3px calc(100% - 6px),0 calc(100% - 6px),0 6px,3px 6px,3px 3px);
      box-shadow:4px 4px 0 var(--lb-accent);
      ${reveal}
    "
  >
    ${innerContent}
  </a>
</div>`;
  }

  return `<a
  href="${href}"${targetAttr}${onclickAttr}${hoverAttrs}
  style="
    ${display};text-decoration:none;width:100%;box-sizing:border-box;
    ${paddingStyle}${featuredPadding}margin:0 0 var(--lb-spacing);
    background:${cardBg};border:${border};border-radius:var(--lb-card-radius);
    color:var(--lb-text);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;
    ${backdropBlur}${overflow}${pixelClip}${reveal}
  "
>
  ${innerContent}
</a>`;
}
