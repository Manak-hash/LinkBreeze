import * as React from "react";

interface EmbedWidgetProps {
  url: string;
  title: string;
  index: number;
  animationType: string;
}

/**
 * Converts a YouTube, Spotify, SoundCloud, Vimeo, or Bandcamp URL into an
 * embeddable iframe. Returns null if the URL doesn't match a known provider
 * (the link will still show as a regular card via the fallback in the page).
 *
 * Server Component — no client JS. The iframe loads lazily.
 */
function buildEmbedUrl(url: string): { src: string; aspect: string } | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    // YouTube — watch?v=, youtu.be/, /embed/, /shorts/
    if (host === "youtube.com" || host === "m.youtube.com") {
      const videoId =
        u.searchParams.get("v") ||
        u.pathname.split("/").filter(Boolean).slice(-1)[0];
      if (videoId) {
        return {
          src: `https://www.youtube.com/embed/${videoId}`,
          aspect: "16 / 9",
        };
      }
    }
    if (host === "youtu.be") {
      const videoId = u.pathname.split("/").filter(Boolean)[0];
      if (videoId) {
        return {
          src: `https://www.youtube.com/embed/${videoId}`,
          aspect: "16 / 9",
        };
      }
    }

    // Spotify — track, episode, playlist, album
    if (host === "spotify.com" || host === "open.spotify.com") {
      return {
        src: `https://open.spotify.com/embed${u.pathname}`,
        aspect: "16 / 9",
      };
    }

    // Vimeo
    if (host === "vimeo.com") {
      const videoId = u.pathname.split("/").filter(Boolean)[0];
      if (videoId) {
        return {
          src: `https://player.vimeo.com/video/${videoId}`,
          aspect: "16 / 9",
        };
      }
    }

    // SoundCloud
    if (host === "soundcloud.com") {
      return {
        src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false`,
        aspect: "auto",
      };
    }

    // Bandcamp
    if (host === "bandcamp.com") {
      return {
        src: `https://bandcamp.com/EmbeddedPlayer/album=${u.searchParams.get("album_id") || ""}/size=large/bgcol=ffffff/linkcol=0687f5/transparent=true/`,
        aspect: "auto",
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function EmbedWidget({ url, title, index, animationType }: EmbedWidgetProps) {
  const embed = buildEmbedUrl(url);
  if (!embed) return null;

  const reveal =
    animationType === "none"
      ? ""
      : `aurora-rise 0.5s cubic-bezier(0.16,1,0.3,1) both`;
  const delay = animationType === "none" ? undefined : `${index * 60}ms`;

  const isFixed = embed.aspect !== "auto";

  return (
    <div
      className="mb-3 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md"
      style={{
        animation: reveal || undefined,
        animationDelay: delay,
      }}
    >
      {isFixed ? (
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
          <iframe
            src={embed.src}
            title={title}
            loading="lazy"
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
          allow="autoplay"
          style={{ width: "100%", height: "166px", border: 0 }}
        />
      )}
      <p className="px-4 py-2 text-xs opacity-60">{title}</p>
    </div>
  );
}
