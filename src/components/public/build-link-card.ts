import type { LinkRow, ProfileRow } from "@/server/queries";

export interface LinkCardTheme {
  textColor: string;
  primaryColor: string;
  linkStyle: string;
  animationType: string;
}

/** Escape attribute/HTML text for safe inline-HTML injection (output encoding). */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Pure builder for a public link card's HTML (zero client JS).
 * All user-controlled fields (title, description, url) pass through esc()
 * before injection; the click beacon is fired from an inline onclick.
 */
export function buildLinkCardHtml(
  link: LinkRow,
  _profile: Pick<ProfileRow, "displayName">,
  theme: LinkCardTheme,
  index: number,
  staggerMs = 60,
): string {
  const radius =
    theme.linkStyle === "sharp" ? "4px"
    : theme.linkStyle === "glass" ? "16px"
    : "12px";

  const cardBg =
    theme.linkStyle === "glass" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)";

  const border = link.isHighlighted
    ? `2px solid ${theme.primaryColor}`
    : "1px solid rgba(167,139,250,0.16)";

  const hoverTransform =
    theme.animationType === "scale" ? "scale(1.02)"
    : theme.animationType === "lift" ? "translateY(-3px)"
    : "none";

  const reveal =
    theme.animationType === "none"
      ? ""
      : `animation: aurora-rise 0.5s cubic-bezier(0.16,1,0.3,1) both; animation-delay:${index * staggerMs}ms;`;

  const highlightDot = link.isHighlighted
    ? `<span aria-hidden="true" style="display:inline-block;width:6px;height:6px;border-radius:9999px;background:${theme.primaryColor};margin-right:8px;flex-shrink:0"></span>`
    : "";

  const description = link.description
    ? `<p style="font-size:12px;opacity:.7;margin:2px 0 0">${esc(link.description)}</p>`
    : "";

  const title = esc(link.title);
  const href = esc(link.url);
  const isExternal = href.startsWith("http://") || href.startsWith("https://");
  const targetAttr = isExternal ? ` target="_blank" rel="noopener noreferrer nofollow"` : "";

  const clickHandler = `navigator.sendBeacon('/api/track', JSON.stringify({type:'click',linkId:${link.id}}))`;

  // Thumbnail rendered at the top of the card (inside the <a>) when set.
  // flex-wrap so the title row stays on its own line beneath the image.
  const image = link.imageUrl
    ? `<img src="${esc(link.imageUrl)}" alt="${title}" loading="lazy" style="display:block;width:100%;height:auto;max-height:200px;object-fit:cover;border-radius:${radius};margin:0 0 10px;flex-basis:100%" />`
    : "";

  return `<a
  href="${href}"${targetAttr}
  onclick="${clickHandler}"
  style="
    display:flex;flex-wrap:wrap;align-items:center;text-decoration:none;width:100%;box-sizing:border-box;
    padding:14px 18px;margin:0 0 12px;background:${cardBg};border:${border};border-radius:${radius};
    color:${theme.textColor};transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;
    backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);${reveal}
  "
  onmouseover="this.style.transform='${hoverTransform}';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.35)';this.style.borderColor='${theme.primaryColor}'"
  onmouseout="this.style.transform='none';this.style.boxShadow='none';this.style.borderColor='rgba(167,139,250,0.16)'"
>
  ${image}
  <span style="display:flex;flex-direction:column;flex:1;min-width:0">
    <span style="display:flex;align-items:center;font-weight:600;font-size:15px">${highlightDot}${title}</span>
    ${description}
  </span>
  <span aria-hidden="true" style="margin-left:10px;opacity:.6;font-size:18px;color:${theme.primaryColor}">&#8599;</span>
</a>`;
}
