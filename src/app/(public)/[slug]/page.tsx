import * as React from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  getPageBySlug,
  getActiveLinks,
  getActiveTheme,
  getThemeById,
  recordPageview,
  type SocialLink,
} from "@/server/queries";
import { getVisitorHash, getDeviceType } from "@/lib/visitor";
import { rateLimit } from "@/lib/rate-limit";
import { getCountry } from "@/lib/geo";
import { isBot } from "@/lib/bot-detect";
import { getSession } from "@/lib/auth";
import { ProfileHeader } from "@/components/public/ProfileHeader";
import { LinkCard } from "@/components/public/LinkCard";
import { EmbedWidget } from "@/components/public/EmbedWidget";
import { EmailCapture } from "@/components/public/EmailCapture";
import { SocialIcons } from "@/components/public/SocialIcons";
import { AuroraBackground } from "@/components/aurora/AuroraBackground";
import {
  resolveBackground,
  isAnimatedAurora,
  buildThemeStyleBlock,
  type ThemeInput,
} from "@/lib/theme-tokens";

export const revalidate = 60;

// Force dynamic rendering so cookies() and headers() are read at request
// time. Without this, ISR caches the page and getSession() can't see the
// owner's session cookie — so owner views get counted in analytics.
export const dynamic = "force-dynamic";

/** Build the public origin for absolute URLs in metadata. */
async function getOrigin(): Promise<string> {
  // If BASE_URL is set, always use it — prevents host-header injection.
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, "");
  const h = await headers();
  const host =
    (h.get("x-forwarded-host") || h.get("host") || "localhost").toString();
  const proto = (h.get("x-forwarded-proto") || "http").toString();
  return `${proto}://${host}`;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: "Page not found" };

  const title =
    page.seoTitle || page.title || "LinkBreeze";
  const description = page.seoDescription || page.bio || "My links";
  const origin = await getOrigin();
  const url = `${origin}/${slug}`;

  const ogImage = `${origin}/${slug}/opengraph-image`;

  // Build icons: use page-specific favicon if set, else default LinkBreeze icons.
  let icons: Metadata["icons"] = {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  };

  if (page.faviconUrl) {
    const ext = page.faviconUrl.split(".").pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
      ico: "image/x-icon",
      png: "image/png",
      svg: "image/svg+xml",
      gif: "image/gif",
      webp: "image/webp",
    };
    const favType = typeMap[ext || ""] || "image/x-icon";
    const isSvg = ext === "svg";
    const sizes = isSvg ? "any" : "16x16 32x32 48x48 96x96 150x150 192x192";
    icons = {
      icon: [{ url: page.faviconUrl, sizes, type: favType }],
      apple: { url: page.faviconUrl, sizes: "180x180", type: favType },
    };
  }

  return {
    title,
    description,
    alternates: { canonical: url },
    icons,
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      siteName: title,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  // ── Server-side pageview recording (best-effort) ───────────────────────
  try {
    const h = await headers();
    const ip =
      (h.get("x-forwarded-for")?.split(",")[0] || "").trim() ||
      (h.get("x-real-ip") || "").toString() ||
      "0.0.0.0";
    const userAgent = (h.get("user-agent") || "").toString();
    const referrer = (h.get("referer") || h.get("referrer") || "").toString();

    // Skip analytics outside production — dev/preview traffic is the owner.
    // Issue #41: Skip known bots/crawlers.
    // Issue #40: Skip the owner (authenticated admin).
    const isCrawler = isBot(userAgent);
    const hasSessionCookie = !!h.get("cookie")?.includes("lb_session");
    const isOwner = hasSessionCookie ? await getSession() : null;
    if (process.env.NODE_ENV === "production" && !isCrawler && !isOwner) {
      const visitorHash = getVisitorHash(ip, userAgent);
      const deviceType = getDeviceType(userAgent);
      const country = getCountry(h);
      const viewRl = rateLimit(`view:${ip}`, 1, 30_000);
      if (viewRl.ok) {
        await recordPageview(visitorHash, referrer || null, deviceType, country, page.id);
      }
    }
  } catch {
    // Never let analytics break the page render.
  }

  // Resolve theme: page-specific themeId → fallback to global active theme.
  const pageTheme = page.themeId ? await getThemeById(page.themeId) : null;
  const fallbackTheme = await getActiveTheme();
  const theme = pageTheme ?? fallbackTheme;

  const activeLinks = await getActiveLinks(page.id);

  // Parse social links from page JSON.
  let socialLinks: SocialLink[] = [];
  try {
    socialLinks = JSON.parse(page.socialLinks || "[]");
  } catch {
    socialLinks = [];
  }

  const themeInput: ThemeInput = theme ?? {};

  const useAurora = isAnimatedAurora(themeInput);
  const background = resolveBackground(themeInput);

  const themeStyleBlock = buildThemeStyleBlock(themeInput);

  // Map page row → ProfileRow-compatible object for ProfileHeader.
  const profileCompat = {
    displayName: page.title,
    bio: page.bio,
    avatarUrl: page.avatarUrl,
    badgeText: page.badgeText,
    socialLinks: page.socialLinks,
  };

  // JSON-LD structured data.
  const origin = await getOrigin();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: page.title || undefined,
    description: page.bio || undefined,
    url: `${origin}/${slug}`,
    image: page.avatarUrl || undefined,
    mainEntity: {
      "@type": "Person",
      name: page.title || undefined,
      description: page.bio || undefined,
      image: page.avatarUrl || undefined,
      sameAs: socialLinks.flatMap((s) => (s.url ? [s.url] : [])),
    },
  };

  return (
    <>
      {useAurora ? <AuroraBackground /> : null}
      {page.analyticsScript ? (
        <div dangerouslySetInnerHTML={{ __html: page.analyticsScript }} />
      ) : null}
      {page.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: page.customCss }} />
      ) : null}
      <style dangerouslySetInnerHTML={{ __html: themeStyleBlock }} />
      <a
        href="#lb-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to content
      </a>
      <main
        id="lb-main"
        style={{
          background: useAurora ? undefined : background,
          color: "var(--lb-text)",
          fontFamily: "var(--lb-font)",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
        className={`relative flex w-full flex-col${themeInput.linkStyle === "pixel" ? " lb-pixel-mode" : ""}`}
        data-alignment={themeInput.alignment || "center"}
      >
      <div
        className="lb-container w-full px-5 py-12 sm:py-16"
        style={{
          maxWidth: "var(--lb-container-width)",
          margin: "0 auto",
          textAlign: "var(--lb-alignment)" as React.CSSProperties["textAlign"],
        }}
      >
        <ProfileHeader profile={profileCompat as never} />

        {socialLinks.length > 0 ? (
          <div className="mb-8 mt-6">
            <SocialIcons socialLinks={socialLinks} theme={themeInput} />
          </div>
        ) : null}

        <div style={{ marginTop: "var(--lb-spacing)" }}>
          {activeLinks.length > 0 ? (
            activeLinks.map((link, i) =>
              link.type === "embed" ? (
                <EmbedWidget
                  key={link.id}
                  url={link.url}
                  title={link.title}
                  index={i}
                  animationType={theme?.animationType || "lift"}
                  theme={themeInput}
                />
              ) : (
                <LinkCard
                  key={link.id}
                  link={link}
                  index={i}
                  theme={themeInput}
                />
              ),
            )
          ) : (
            <p
              className="text-center text-sm"
              style={{ color: "var(--lb-text-muted)" }}
            >
              No links yet.
            </p>
          )}
        </div>

        {page.emailCapture ? (
          <EmailCapture />
        ) : null}

        {page.footerText ? (
          <footer
            className="mt-10 text-center text-xs"
            style={{ color: "var(--lb-text-muted)" }}
          >
            {page.footerText}
          </footer>
        ) : null}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </main>
    </>
  );
}
