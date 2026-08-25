import type { LinkRow } from "@/server/queries";
import { mapEmbedSrc } from "@/lib/link-url";
import { renderMarkdownLiteString } from "@/lib/markdown-lite-string";
import type { ThemeInput } from "@/lib/theme-tokens";

/**
 * #93 popup cards — text + location types.
 *
 * The card itself is rendered by buildLinkCardHtml (full parity: featured
 * badges, thumbnails, pixel/gel skins) with the <a> swapped for a <button>.
 * This module owns the <dialog> and its inline handlers.
 *
 * Zero client JS preserved: opening is one inline onclick that calls
 * showModal(), attaches the lazy map iframe src, and fires the open beacon —
 * the same inline-handler pattern as the sendBeacon click tracking on
 * classic cards. The dialog inherits the active theme through --lb-* tokens
 * and the skin rules in globals.css (glass/neon/pixel/gel).
 */

/** Escape attribute/HTML text for safe inline-HTML injection (output encoding). */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Default lucide icon per popup type (operator can override via #91 picker). */
export const DEFAULT_POPUP_ICON: Record<string, string> = {
  text: "align-left",
  location: "map-pin",
};

export function isPopupType(type: string): boolean {
  return type === "text" || type === "location";
}

/**
 * Inline onclick for the popup card button: show the modal, lazily attach
 * the map iframe src, and beacon the open event exactly once per page load
 * (data-opened guard mirrors how /go/:id + rate limits dedupe noise).
 */
export function popupOpenHandler(link: LinkRow): string {
  const embed = link.type === "location" && mapEmbedSrc(link.url);
  const parts = [
    `var d=document.getElementById('lb-popup-${link.id}')`,
    "if(!d)return false",
    // Every open beacons — same semantics as link-card clicks.
    `navigator.sendBeacon('/api/track',JSON.stringify({type:'open',linkId:${link.id}}))`,
  ];
  if (embed) {
    parts.push(
      "var f=d.querySelector('iframe[data-src]')",
      "if(f&&!f.src)f.src=f.getAttribute('data-src')",
    );
  }
  parts.push("d.showModal()");
  return esc(parts.join(";"));
}

/** Backdrop-tap close: only clicks on the dialog element itself, not content. */
export const POPUP_BACKDROP_CLOSE = esc("var t=event.target;if(t===this)this.close('x')");

/** Inline onclick for the × close button. */
export const POPUP_CLOSE = esc("this.closest('dialog').close('x')");

/**
 * Build the <dialog> for a popup card. Rendered once per card inside the
 * page tree (native dialogs are hidden until showModal()). Styling lives in
 * globals.css under .lb-popup-dialog / .lb-popup-panel. data-lb-skin carries
 * the theme's linkStyle so skin rules reach the dialog even where the
 * page-level mode classes (lb-gel-mode / lb-pixel-mode) don't apply.
 */
export function buildPopupDialogHtml(link: LinkRow, theme?: ThemeInput): string {
  const isLocation = link.type === "location";
  const mapSrc = isLocation ? mapEmbedSrc(link.url) : null;

  const body = (link.popupText ?? "").trim();
  const bodyHtml = body
    ? `<div class="lb-popup-body">${renderMarkdownLiteString(body)}</div>`
    : "";

  // CTA — visually the email-capture subscribe button, verbatim recipe:
  // the same class stack (lb-gel-btn + lb-pixel-clip lb-pixel-shadow carry
  // the gel/pixel skins) and the same inline token styles the React form
  // uses, so the two buttons can't drift apart across the 4 skins. Rides
  // /go/:id so the click counts like any outbound link.
  const ctaLabel = (link.ctaLabel ?? "").trim();
  const hasUrl = !!link.url.trim();
  const ctaHtml =
    ctaLabel && hasUrl
      ? `<a class="lb-popup-cta lb-gel-btn lb-pixel-clip lb-pixel-shadow" href="/go/${link.id}" target="_blank" rel="noopener noreferrer nofollow" style="background:var(--lb-accent);color:var(--lb-btn-text, #ffffff);border:var(--lb-border-width) solid var(--lb-card-border);border-radius:var(--lb-card-radius)">${esc(ctaLabel)}</a>`
      : "";

  // Location map: full-bleed at the top, src attached lazily on open so no
  // third-party contact happens until the visitor asks for it.
  const mapHtml = mapSrc
    ? `<div class="lb-popup-map-wrap"><iframe class="lb-popup-map" data-src="${esc(mapSrc)}" title="${esc(link.title)}" loading="lazy" allowfullscreen></iframe></div>`
    : "";

  const skin = theme?.linkStyle ? ` data-lb-skin="${esc(theme.linkStyle)}"` : "";

  return `<dialog id="lb-popup-${link.id}" class="lb-popup-dialog"${skin} onclick="${POPUP_BACKDROP_CLOSE}">
  <div class="lb-popup-panel">
    ${mapHtml}
    <div class="lb-popup-content">
      <button type="button" class="lb-popup-close" onclick="${POPUP_CLOSE}" aria-label="Close">&#215;</button>
      <p class="lb-popup-title">${esc(link.title)}</p>
      ${bodyHtml}
    </div>
    ${ctaHtml}
  </div>
</dialog>`;
}
