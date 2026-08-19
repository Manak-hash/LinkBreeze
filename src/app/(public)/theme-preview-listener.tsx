"use client";

/**
 * ThemePreviewListener — listens for postMessage from the parent window
 * and applies ephemeral theme changes to the document.
 *
 * Demo mode only (NEXT_PUBLIC_DEMO_MODE). Reload = back to normal.
 *
 * Protocol v2 (website ≥ 1.3):
 *   { type: "lb-theme-preview", theme: ThemePreset }
 *   The full preset object is sent; this listener re-renders it with the
 *   app's own theme engine (theme-tokens + globals.css mode classes), so
 *   the preview is pixel-identical to the product — including structural
 *   styles the server-rendered page doesn't have (pixel frames, gel bubble,
 *   video backgrounds).
 *
 * Protocol v1 (legacy, kept for older embeds):
 *   { type: "lb-theme-preview", css: string, linkStyle?: string }
 *   Pre-built CSS string injected verbatim.
 *
 * Reset: { type: "lb-theme-reset" }
 */
import * as React from "react";
import {
  buildThemeStyleBlock,
  isAnimatedAurora,
  normalizeOpacity,
  resolveBackground,
  type ThemeInput,
} from "@/lib/theme-tokens";

const STYLE_ID = "lb-theme-preview-overrides";
const VIDEO_ID = "lb-theme-preview-video";

/** Stepped "pixel" clip-path (outer, 8px steps) — same geometry as globals. */
const PIXEL_CLIP_CARD =
  "polygon(8px 0,calc(100% - 8px) 0,calc(100% - 8px) 4px,calc(100% - 4px) 4px,calc(100% - 4px) 8px,100% 8px,100% calc(100% - 8px),calc(100% - 4px) calc(100% - 8px),calc(100% - 4px) calc(100% - 4px),calc(100% - 8px) calc(100% - 4px),calc(100% - 8px) 100%,8px 100%,8px calc(100% - 4px),4px calc(100% - 4px),4px calc(100% - 8px),0 calc(100% - 8px),0 8px,4px 8px,4px 4px)";

/** Smaller step for 42px social icons (6px steps). */
const PIXEL_CLIP_SOCIAL =
  "polygon(6px 0,calc(100% - 6px) 0,calc(100% - 6px) 3px,calc(100% - 3px) 3px,calc(100% - 3px) 6px,100% 6px,100% calc(100% - 6px),calc(100% - 3px) calc(100% - 6px),calc(100% - 3px) calc(100% - 3px),calc(100% - 6px) calc(100% - 3px),calc(100% - 6px) 100%,6px 100%,6px calc(100% - 3px),3px calc(100% - 3px),3px calc(100% - 6px),0 calc(100% - 6px),0 6px,3px 6px,3px 3px)";

/**
 * Structural emulation for link styles whose DOM the server didn't render
 * (the page is server-rendered by its ACTIVE theme; the preview swaps in
 * any preset). Token-driven looks need nothing — inline styles on the page
 * read the --lb-* vars, so buildThemeStyleBlock re-themes them directly.
 * Only structure that physically differs needs help:
 *
 * - pixel: stepped accent frame + hard shadow on plain .lb-link-card /
 *   .lb-social-icon anchors (emulates the server's .lb-pixel-card-wrap
 *   two-layer wrapper with a border-box background trick).
 * - neon: the hover glow (product marks cards with data-neon at render
 *   time; emulated via a marker class).
 * - gel / pixel avatar & badge: already covered by the lb-gel-mode /
 *   lb-pixel-mode classes in globals.css.
 */
function structuralCSS(linkStyle: string): string {
  if (linkStyle === "pixel") {
    return `
main.lb-pixel-mode .lb-link-card {
  border: 3px solid transparent !important;
  background:
    linear-gradient(var(--lb-card-bg), var(--lb-card-bg)) padding-box,
    var(--lb-accent) border-box !important;
  clip-path: ${PIXEL_CLIP_CARD} !important;
  -webkit-clip-path: ${PIXEL_CLIP_CARD} !important;
  box-shadow: 4px 4px 0 var(--lb-accent) !important;
  border-radius: 0 !important;
}
main.lb-pixel-mode .lb-link-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--lb-accent) !important;
}
main.lb-pixel-mode .lb-social-icon {
  border: 3px solid transparent !important;
  background:
    linear-gradient(var(--lb-card-bg), var(--lb-card-bg)) padding-box,
    var(--lb-accent) border-box !important;
  clip-path: ${PIXEL_CLIP_SOCIAL} !important;
  -webkit-clip-path: ${PIXEL_CLIP_SOCIAL} !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}`;
  }
  if (linkStyle === "neon") {
    return `
main.lb-preview-neon .lb-link-card {
  border-color: var(--lb-accent) !important;
  box-shadow: 0 0 12px color-mix(in srgb, var(--lb-accent) 45%, transparent);
}
main.lb-preview-neon .lb-link-card:hover {
  box-shadow: 0 0 24px var(--lb-accent) !important;
}`;
  }
  return "";
}

/**
 * Video background layer for video themes (e.g. Frutiger Aero's bubbles).
 * Mirrors the server-rendered <VideoBackground /> element 1:1 — fixed
 * layer at z-index -10, gradient fallback while loading, overlay when set.
 * CSP media-src allows https: sources.
 */
function mountVideoLayer(theme: ThemeInput) {
  unmountVideoLayer();
  const src = theme.backgroundImageUrl;
  if (!src) return;

  const wrap = document.createElement("div");
  wrap.id = VIDEO_ID;
  wrap.setAttribute("aria-hidden", "true");
  wrap.style.cssText = `position:fixed;inset:0;z-index:-10;overflow:hidden;pointer-events:none;background:${resolveBackground(theme)}`;

  const video = document.createElement("video");
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.src = src;
  video.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 50%";

  wrap.appendChild(video);

  const fraction = normalizeOpacity(theme.overlayOpacity);
  if (theme.overlayColor && fraction > 0) {
    const overlay = document.createElement("div");
    overlay.style.cssText = `position:absolute;inset:0;background:${theme.overlayColor};opacity:${fraction}`;
    wrap.appendChild(overlay);
  }

  document.body.appendChild(wrap);
}

function unmountVideoLayer() {
  document.getElementById(VIDEO_ID)?.remove();
}

/**
 * Apply a full preset (protocol v2). Everything token-driven comes from the
 * app's own resolver; background needs !important because #lb-main carries
 * an inline literal from the server render.
 */
function applyPreset(theme: ThemeInput) {
  const isAurora = isAnimatedAurora(theme);
  const video = theme.backgroundType === "video" && !!theme.backgroundImageUrl;
  const linkStyle = theme.linkStyle || "glass";

  let backgroundCSS: string;
  if (video) {
    // Video layer (mounted separately) provides the backdrop; retire the
    // always-mounted aurora so the two fixed layers don't fight.
    backgroundCSS = `#lb-main { background: none !important; }\n.aurora-root { display: none !important; }`;
  } else if (isAurora) {
    // Re-theme the mounted AuroraBackground via the --lb-aurora-* vars.
    backgroundCSS = `#lb-main { background: none !important; }`;
  } else {
    // Opaque paint over the mounted aurora (same trick as v1 protocol).
    backgroundCSS = `#lb-main { background: ${resolveBackground(theme)} !important; }`;
  }

  const css = [
    buildThemeStyleBlock(theme),
    backgroundCSS,
    structuralCSS(linkStyle),
  ]
    .filter(Boolean)
    .join("\n");

  injectStyle(css);

  const main = document.getElementById("lb-main");
  if (main) {
    main.classList.toggle("lb-pixel-mode", linkStyle === "pixel");
    main.classList.toggle("lb-gel-mode", linkStyle === "gel");
    main.classList.toggle("lb-preview-neon", linkStyle === "neon");
  }

  if (video) mountVideoLayer(theme);
  else unmountVideoLayer();
}

/** Inject (or replace) the override style at the END of <body> so it wins
 *  cascade ties against the page's own <style> block (which lives in body). */
function injectStyle(css: string) {
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.body.appendChild(el);
  }
  el.textContent = css;
}

function reset() {
  document.getElementById(STYLE_ID)?.remove();
  unmountVideoLayer();
  const main = document.getElementById("lb-main");
  if (main) {
    main.classList.remove("lb-pixel-mode", "lb-gel-mode", "lb-preview-neon");
  }
}

export function ThemePreviewListener() {
  React.useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return;

    function handleMessage(event: MessageEvent) {
      if (event.source !== window.parent) return;

      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "lb-theme-preview") {
        if (data.theme && typeof data.theme === "object") {
          applyPreset(data.theme as ThemeInput);
          return;
        }
        // Legacy v1 protocol: pre-built CSS string.
        if (data.css) {
          injectStyle(String(data.css));
          const main = document.getElementById("lb-main");
          if (main) {
            main.classList.toggle("lb-pixel-mode", data.linkStyle === "pixel");
            main.classList.toggle("lb-gel-mode", data.linkStyle === "gel");
            main.classList.toggle("lb-preview-neon", data.linkStyle === "neon");
          }
          unmountVideoLayer();
        }
      } else if (data.type === "lb-theme-reset") {
        reset();
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}
