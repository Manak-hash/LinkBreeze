import { ImageResponse } from "next/og";
import { headers } from "next/headers";
import { getActiveProfile, getActiveTheme } from "@/server/queries";

export const runtime = "nodejs";

/**
 * Branded social preview image for the public page.
 *
 * Originally an `opengraph-image.tsx` metadata file convention, but Next.js
 * standalone Docker output doesn't resolve metadata routes under dynamic
 * segments ([slug]) — it returns 404. Converting to a regular route handler
 * fixes that. The page's `generateMetadata` references this route explicitly.
 */
export async function GET() {
  const h = await headers();
  // Prefer BASE_URL env var (prevents host-header injection behind proxies).
  // Falls back to forwarded/host headers when unset.
  const origin = process.env.BASE_URL
    ? process.env.BASE_URL.replace(/\/$/, "")
    : `${(h.get("x-forwarded-proto") || "http").toString()}://${(
        h.get("x-forwarded-host") ||
        h.get("host") ||
        "localhost"
      ).toString()}`;

  const profile = await getActiveProfile();
  const theme = await getActiveTheme();

  const name = profile?.displayName || "LinkBreeze";
  const bio = profile?.bio || "All my links in one place";
  const textColor = theme?.textColor || "#eceafe";
  const primary = theme?.primaryColor || "#533fd6";
  const parts = (theme?.backgroundValue || "#0f0c29,#14112e").split(",");
  const bgA = parts[0] || "#0f0c29";
  const bgB = parts[1] || "#14112e";

  const rawAvatar = profile?.avatarUrl || null;
  const avatarSrc = rawAvatar
    ? rawAvatar.startsWith("http")
      ? rawAvatar
      : `${origin}${rawAvatar.startsWith("/") ? "" : "/"}${rawAvatar}`
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
          background: `linear-gradient(135deg, ${bgA} 0%, ${bgB} 100%)`,
          padding: 80,
        }}
      >
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
