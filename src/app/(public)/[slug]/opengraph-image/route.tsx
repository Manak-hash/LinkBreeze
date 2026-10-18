import { ImageResponse } from "next/og";
import { headers } from "next/headers";
import { getPageBySlug, getActiveTheme, getThemeById } from "@/server/queries";
import { resolveOgThemeBackground } from "@/lib/og-theme";

export const runtime = "nodejs";

/**
 * Dynamic OG image (AUTO mode). When the page has a custom uploaded OG image
 * (ogImageMode === "custom" && ogImageUrl), generateMetadata points og:image
 * at that file directly and crawlers never hit this route. This route serves
 * the auto card: it follows the page's theme for EVERY background type
 * (see src/lib/og-theme.ts), plus the page avatar/title/bio.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const h = await headers();
  const origin = process.env.BASE_URL
    ? process.env.BASE_URL.replace(/\/$/, "")
    : `${(h.get("x-forwarded-proto") || "http").toString()}://${(
        h.get("x-forwarded-host") ||
        h.get("host") ||
        "localhost"
      ).toString()}`;

  const page = await getPageBySlug(slug);

  // Per-page theme override first, then the globally active one — the same
  // resolution order the public page uses, so the card matches THE page.
  const theme = page?.themeId
    ? ((await getThemeById(page.themeId)) ?? (await getActiveTheme()))
    : await getActiveTheme();

  const name = page?.title || "LinkBreeze";
  const bio = page?.bio || "All my links in one place";
  const textColor = theme?.textColor || "#eceafe";
  const primary = theme?.primaryColor || "#533fd6";

  const og = resolveOgThemeBackground(theme);

  const rawAvatar = page?.avatarUrl || null;
  const avatarSrc = rawAvatar
    ? rawAvatar.startsWith("http")
      ? rawAvatar
      : `${origin}${rawAvatar.startsWith("/") ? "" : "/"}${rawAvatar}`
    : null;

  // Theme background IMAGE (image/gif types): draw as the card backdrop,
  // with the theme's overlay color layered above for text legibility.
  const backdropSrc = og.imageUrl
    ? og.imageUrl.startsWith("http")
      ? og.imageUrl
      : `${origin}${og.imageUrl.startsWith("/") ? "" : "/"}${og.imageUrl}`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          background: og.background,
          padding: 80,
          position: "relative",
        }}
      >
        {backdropSrc ? (
          <img
            src={backdropSrc}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              objectFit: "cover",
            }}
          />
        ) : null}
        {backdropSrc && og.overlay ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              background: overlayRgba(og.overlay.color, og.overlay.opacity),
            }}
          />
        ) : null}
        {avatarSrc ? (
          <img
            src={avatarSrc}
            width={140}
            height={140}
            alt=""
            style={{
              display: "flex",
              borderRadius: 9999,
              marginBottom: 44,
              objectFit: "cover",
              border: `4px solid ${primary}`,
            }}
          />
        ) : null}
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 800,
            color: textColor,
            letterSpacing: -2,
            lineHeight: 1.05,
            marginBottom: 18,
          }}
        >
          {name}
        </div>
        <div
          style={{ display: "flex", fontSize: 32, color: textColor, opacity: 0.7 }}
        >
          {bio}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 52,
            fontSize: 24,
            color: primary,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 56,
              height: 8,
              background: primary,
              borderRadius: 9999,
              marginRight: 16,
            }}
          />
          LinkBreeze
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

/** rgba() string for the overlay layer (satori-safe color form). */
function overlayRgba(color: string, opacity: number): string {
  const m = /^#([0-9a-fA-F]{6})$/.exec(color.trim());
  if (!m) return color;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
