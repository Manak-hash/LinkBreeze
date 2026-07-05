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
import { ProfileHeader } from "@/components/public/ProfileHeader";
import { LinkCard } from "@/components/public/LinkCard";
import { SocialIcons } from "@/components/public/SocialIcons";
import { AuroraBackground } from "@/components/aurora/AuroraBackground";
import { resolveBackground, isAnimatedAurora } from "@/lib/theme-background";

export const revalidate = 60;

/** Build the public origin for absolute URLs in metadata. */
async function getOrigin(): Promise<string> {
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
    const visitorHash = getVisitorHash(ip, userAgent);
    const deviceType = getDeviceType(userAgent);
    const country = getCountry(h);
    // Light per-IP cap so refresh/crawler bursts don't inflate view counts.
    const viewRl = rateLimit(`view:${ip}`, 1, 30_000);
    if (viewRl.ok) {
      await recordPageview(visitorHash, referrer || null, deviceType, country);
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

  const textColor = theme?.textColor || "#eceafe";
  const primaryColor = theme?.primaryColor || "#533fd6";
  const useAurora = isAnimatedAurora(theme ?? {});
  const background = resolveBackground(theme ?? {});

  const fontFamily = theme?.fontFamily || "Inter, system-ui, sans-serif";

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
      <main
        style={
          useAurora
            ? { color: textColor, fontFamily, minHeight: "100vh", boxSizing: "border-box" }
            : { background, color: textColor, fontFamily, minHeight: "100vh", boxSizing: "border-box" }
        }
        className="relative flex flex-col items-center w-full"
      >
      <div className="w-full max-w-xl px-5 py-12 sm:py-16">
        <ProfileHeader profile={profile} textColor={textColor} />

        {socialLinks.length > 0 ? (
          <div className="mt-6 mb-8">
            <SocialIcons socialLinks={socialLinks} textColor={textColor} />
          </div>
        ) : null}

        <div className="mt-6">
          {activeLinks.length > 0 ? (
            activeLinks.map((link, i) => (
              <LinkCard
                key={link.id}
                link={link}
                profile={profile}
                index={i}
                theme={{
                  textColor,
                  primaryColor,
                  linkStyle: theme?.linkStyle || "glass",
                  animationType: theme?.animationType || "lift",
                }}
              />
            ))
          ) : (
            <p
              className="text-center text-sm opacity-60"
              style={{ color: textColor }}
            >
              No links yet.
            </p>
          )}
        </div>

        {allSettings.footerText ? (
          <footer
            className="mt-10 text-center text-xs opacity-50"
            style={{ color: textColor }}
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
