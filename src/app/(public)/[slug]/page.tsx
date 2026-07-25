import * as React from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  getActiveProfile,
  getActiveLinks,
  getActiveTheme,
  getSettings,
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
  const profile = await getActiveProfile();
  if (!profile) return { title: "Page not found" };

  const allSettings = await getSettings();
  const title =
    allSettings.title || profile.displayName || "LinkBreeze";
  const description =
    allSettings.description || profile.bio || "My links";
  const origin = await getOrigin();
  const url = `${origin}/${slug}`;

  const ogImage = `${origin}/${slug}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: url },
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
  const profile = await getActiveProfile();

  if (!profile) {
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

    // Issue #41: Skip analytics for known bots/crawlers.
    // Issue #40: Skip analytics for the owner (authenticated admin).
    // Cookie-first check: avoids a DB query on every anonymous pageview.
    const isCrawler = isBot(userAgent);
    const hasSessionCookie = !!h.get("cookie")?.includes("lb_session");
    const isOwner = hasSessionCookie ? await getSession() : null;
    if (isCrawler || isOwner) {
      // Still render the page, just don't count the view.
    } else {
      const visitorHash = getVisitorHash(ip, userAgent);
      const deviceType = getDeviceType(userAgent);
      const country = getCountry(h);
      // Light per-IP cap so refresh/crawler bursts don't inflate view counts.
      const viewRl = rateLimit(`view:${ip}`, 1, 30_000);
      if (viewRl.ok) {
        await recordPageview(visitorHash, referrer || null, deviceType, country);
      }
    }
  } catch {
    // Never let analytics break the page render.
  }

  const [activeLinks, theme] = await Promise.all([getActiveLinks(), getActiveTheme()]);

  // Parse social links from profile JSON.
  let socialLinks: SocialLink[] = [];
  try {
    socialLinks = JSON.parse(profile.socialLinks || "[]");
  } catch {
    socialLinks = [];
  }

  const themeInput: ThemeInput = theme ?? {};

  const useAurora = isAnimatedAurora(themeInput);
  const background = resolveBackground(themeInput);

  // Build the token-based style block (CSS custom properties).
  const themeStyleBlock = buildThemeStyleBlock(themeInput);

  // JSON-LD structured data.
  const allSettings = await getSettings();
  const origin = await getOrigin();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: profile.displayName || undefined,
    description: profile.bio || undefined,
    url: `${origin}/${slug}`,
    image: profile.avatarUrl || undefined,
    mainEntity: {
      "@type": "Person",
      name: profile.displayName || undefined,
      description: profile.bio || undefined,
      image: profile.avatarUrl || undefined,
      sameAs: socialLinks.map((s) => s.url).filter(Boolean),
    },
  };

  return (
    <>
      {useAurora ? <AuroraBackground /> : null}
      {allSettings.analyticsScript ? (
        <div dangerouslySetInnerHTML={{ __html: allSettings.analyticsScript }} />
      ) : null}
      {allSettings.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: allSettings.customCss }} />
      ) : null}
      {/* Inject theme tokens as CSS custom properties on :root */}
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
        className="relative flex w-full flex-col"
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
        <ProfileHeader profile={profile} />

        {socialLinks.length > 0 ? (
          <div className="mb-8 mt-6">
            <SocialIcons socialLinks={socialLinks} />
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
                />
              ) : (
                <LinkCard
                  key={link.id}
                  link={link}
                  profile={profile}
                  index={i}
                  theme={themeInput}
                />
              ),
            )
          ) : (
            <p
              className="text-center text-sm opacity-60"
              style={{ color: "var(--lb-text-muted)" }}
            >
              No links yet.
            </p>
          )}
        </div>

        {allSettings.emailCapture === "true" ? (
          <EmailCapture />
        ) : null}

        {allSettings.footerText ? (
          <footer
            className="mt-10 text-center text-xs opacity-50"
            style={{ color: "var(--lb-text-muted)" }}
          >
            {allSettings.footerText}
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
