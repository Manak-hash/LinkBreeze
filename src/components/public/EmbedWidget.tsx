
import { revealAnimationStyle, type ThemeInput } from "@/lib/theme-tokens";

interface EmbedWidgetProps {
  url: string;
  title: string;
  index: number;
  animationType: string;
  theme?: ThemeInput;
  /** Extra entrance delay (ms) — used to continue the stagger across sections. */
  baseDelayMs?: number;
}

/**
 * Converts a YouTube, Spotify, SoundCloud, Vimeo, or Bandcamp URL into an
 * embeddable iframe. Returns null if the URL doesn't match a known provider.
 *
 * Server Component — no client JS. The iframe loads lazily.
 */
function buildEmbedUrl(url: string): { src: string; aspect: string; provider: string; height: number } | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    // YouTube — watch?v=, youtu.be/, /embed/, /shorts/
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const videoId =
        u.searchParams.get("v") ||
        u.pathname.split("/").filter(Boolean).slice(-1)[0];
      if (videoId) {
        return {
          src: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
          aspect: "16 / 9",
          provider: "youtube",
          height: 0,
        };
      }
    }
    if (host === "youtu.be") {
      const videoId = u.pathname.split("/").filter(Boolean)[0];
      if (videoId) {
        return {
          src: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
          aspect: "16 / 9",
          provider: "youtube",
          height: 0,
        };
      }
    }

    // Spotify — track, episode, playlist, album
    // Handles both regular URLs (/playlist/xxx) and embed URLs (/embed/playlist/xxx)
    // Uses fixed height (not 16:9) — Spotify's player is 152px tall regardless of width.
    if (host === "spotify.com" || host === "open.spotify.com") {
      // Strip /embed/ prefix if the user pasted an embed URL directly
      const cleanPath = u.pathname.replace(/^\/embed/, "");
      return {
        src: `https://open.spotify.com/embed${cleanPath}`,
        aspect: "auto",
        provider: "spotify",
        height: 152,
      };
    }

    // Vimeo
    if (host === "vimeo.com") {
      const videoId = u.pathname.split("/").filter(Boolean)[0];
      if (videoId) {
        return {
          src: `https://player.vimeo.com/video/${videoId}`,
          aspect: "16 / 9",
          provider: "vimeo",
          height: 0,
        };
      }
    }

    // SoundCloud
    if (host === "soundcloud.com") {
      return {
        src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false`,
        aspect: "auto",
        provider: "soundcloud",
        height: 166,
      };
    }

    // Bandcamp
    if (host === "bandcamp.com") {
      return {
        src: `https://bandcamp.com/EmbeddedPlayer/album=${u.searchParams.get("album_id") || ""}/size=large/bgcol=ffffff/linkcol=0687f5/transparent=true/`,
        aspect: "auto",
        provider: "bandcamp",
        height: 350,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function EmbedWidget({ url, title, index, animationType, theme, baseDelayMs = 0 }: EmbedWidgetProps) {
  const embed = buildEmbedUrl(url);
  if (!embed) return null;

  const isPixel = theme?.linkStyle === "pixel";

  const revealStyle = revealAnimationStyle(animationType, baseDelayMs + index * 60);
  const reveal = revealStyle?.animation ?? "";
  const delay = revealStyle ? revealStyle.animationDelay : undefined;

  const isFixed = embed.aspect !== "auto";

  // YouTube and Spotify show their own title in the player UI.
  // Only render a caption for providers that don't (SoundCloud, Bandcamp).
  const showCaption = embed.provider === "soundcloud" || embed.provider === "bandcamp";

  // Pixel clip-paths
  const pixelOuterClip = "polygon(8px 0,calc(100% - 8px) 0,calc(100% - 8px) 4px,calc(100% - 4px) 4px,calc(100% - 4px) 8px,100% 8px,100% calc(100% - 8px),calc(100% - 4px) calc(100% - 8px),calc(100% - 4px) calc(100% - 4px),calc(100% - 8px) calc(100% - 4px),calc(100% - 8px) 100%,8px 100%,8px calc(100% - 4px),4px calc(100% - 4px),4px calc(100% - 8px),0 calc(100% - 8px),0 8px,4px 8px,4px 4px)";
  const pixelInnerClip = "polygon(6px 0,calc(100% - 6px) 0,calc(100% - 6px) 3px,calc(100% - 3px) 3px,calc(100% - 3px) 6px,100% 6px,100% calc(100% - 6px),calc(100% - 3px) calc(100% - 6px),calc(100% - 3px) calc(100% - 3px),calc(100% - 6px) calc(100% - 3px),calc(100% - 6px) 100%,6px 100%,6px calc(100% - 3px),3px calc(100% - 3px),3px calc(100% - 6px),0 calc(100% - 6px),0 6px,3px 6px,3px 3px)";

  const iframeContent = (
    <>
      {isFixed ? (
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
          <iframe
            src={embed.src}
            title={title}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
          />
        </div>
      ) : (
        <iframe
          src={embed.src}
          title={title}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
          allow="autoplay"
          style={{ width: "100%", height: `${embed.height}px`, border: 0, display: "block" }}
        />
      )}
      {showCaption ? (
        <p
          style={{
            padding: "var(--lb-btn-padding-y) var(--lb-btn-padding-x)",
            margin: 0,
            fontSize: "calc(var(--lb-font-size) - 1px)",
            opacity: 0.7,
            color: "var(--lb-text)",
          }}
        >
          {title}
        </p>
      ) : null}
    </>
  );

  // Pixel mode: two-layer wrapper (orange outer + white inner, both clipped)
  if (isPixel) {
    return (
      <div
        className="lb-pixel-embed-wrap"
        style={{
          position: "relative",
          margin: "0 0 var(--lb-spacing)",
          animation: reveal || undefined,
          animationDelay: delay,
          clipPath: pixelOuterClip,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--lb-accent)",
            clipPath: pixelOuterClip,
          }}
        />
        <div
          style={{
            position: "relative",
            margin: "3px",
            background: "var(--lb-card-bg)",
            clipPath: pixelInnerClip,
            overflow: "hidden",
          }}
        >
          {iframeContent}
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden"
      style={{
        animation: reveal || undefined,
        animationDelay: delay,
        background: "var(--lb-card-bg)",
        border: "var(--lb-border-width) solid var(--lb-card-border)",
        borderRadius: "var(--lb-card-radius)",
        backdropFilter: "blur(var(--lb-blur))",
        WebkitBackdropFilter: "blur(var(--lb-blur))",
        margin: "0 0 var(--lb-spacing)",
      }}
    >
      {iframeContent}
    </div>
  );
}
