import type { ThemeBackgroundInput } from "@/lib/theme-tokens";

/**
 * Video background — server-rendered, zero framework JS.
 *
 * Renders an absolute-positioned <video autoplay muted loop playsinline> with
 * the poster image (backgroundImageUrl used as poster when set to a static
 * image, else the theme's fallback color). Content sits at a higher z-index.
 *
 * A ~4-line inline script swaps the video for its poster on very slow
 * connections (navigator.connection.effectiveType 2g/slow-2g or
 * saveData) — the one sanctioned inline-script exception, gated behind
 * `type="text/plain"` noscript-safe degradation: browsers without JS simply
 * keep the video.
 */
export function VideoBackground({ theme }: { theme: ThemeBackgroundInput }) {
  const src = theme.backgroundImageUrl;
  if (!src) return null;

  const overlay = buildOverlay(theme);

  return (
    <div
      aria-hidden="true"
      className="lb-video-bg"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -10,
        overflow: "hidden",
        pointerEvents: "none",
        background: "#0a0820",
      }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        src={src}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      {overlay}
      {/* Slow-connection fallback: swap <video> for a static poster frame. */}
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `try{var c=navigator.connection;if(c&&(c.saveData||/2g/.test(c.effectiveType||""))){var v=document.currentScript.parentElement.querySelector("video");if(v){v.pause();v.removeAttribute("src");v.load?v.load():0;}}}}catch(e){}`,
        }}
      />
    </div>
  );
}

/** Semi-transparent overlay when overlayColor + opacity are set (same rules as image bg). */
function buildOverlay(theme: ThemeBackgroundInput): React.ReactNode {
  const opacityNum = theme.overlayOpacity ? parseFloat(theme.overlayOpacity) : NaN;
  const has =
    theme.overlayColor &&
    theme.overlayOpacity?.trim() !== "" &&
    !Number.isNaN(opacityNum) &&
    opacityNum > 0;
  if (!has || !theme.overlayColor) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: theme.overlayColor,
        opacity: opacityNum,
      }}
    />
  );
}
