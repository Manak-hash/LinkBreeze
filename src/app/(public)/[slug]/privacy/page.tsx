import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug, getActiveLinks, getSetting } from "@/server/queries";
import { getThemeById, getActiveTheme } from "@/server/queries";
import { generatePrivacyPolicy } from "@/lib/privacy-template";
import { MarkdownLite } from "@/components/public/MarkdownLite";
import { AuroraBackground } from "@/components/aurora/AuroraBackground";
import {
  resolveBackground,
  isAnimatedAurora,
  buildThemeStyleBlock,
  type ThemeInput,
} from "@/lib/theme-tokens";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: "Privacy Policy" };
  return {
    title: `Privacy Policy — ${page.title || page.slug}`,
    robots: { index: false, follow: true },
  };
}

// Known embed provider domains — used to detect if the page has embeds.
const EMBED_DOMAINS = [
  "youtube.com",
  "youtu.be",
  "m.youtube.com",
  "youtube-nocookie.com",
  "open.spotify.com",
  "spotify.com",
  "vimeo.com",
  "soundcloud.com",
  "bandcamp.com",
];

function hasEmbedLink(links: { url: string }[]): boolean {
  return links.some((l) => {
    try {
      const host = new URL(l.url).hostname.replace(/^www\./, "");
      return EMBED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
    } catch {
      return false;
    }
  });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  const [links, retentionDays] = await Promise.all([
    getActiveLinks(page.id),
    getSetting("analyticsRetentionDays"),
  ]);

  // Resolve the same theme the public page uses.
  const pageTheme = page.themeId ? await getThemeById(page.themeId) : null;
  const fallbackTheme = await getActiveTheme();
  const theme = pageTheme ?? fallbackTheme;
  const themeInput: ThemeInput = theme ?? {};

  const useAurora = isAnimatedAurora(themeInput);
  const background = resolveBackground(themeInput);
  const themeStyleBlock = buildThemeStyleBlock(themeInput);

  // Determine what content to render.
  let content: string;

  if (page.privacyPolicy && page.privacyPolicy.trim()) {
    content = page.privacyPolicy;
  } else {
    content = generatePrivacyPolicy({
      displayName: page.title,
      slug: page.slug,
      hasAnalytics: true,
      hasEmailCapture: page.emailCapture ?? false,
      hasEmbeds: hasEmbedLink(links),
      hasExternalAnalytics: Boolean(page.analyticsScript?.trim()),
      analyticsRetentionDays: retentionDays ? parseInt(retentionDays, 10) || 0 : 0,
    });
  }

  return (
    <>
      {useAurora ? <AuroraBackground /> : null}
      <style dangerouslySetInnerHTML={{ __html: themeStyleBlock }} />
      <main
        style={{
          background: useAurora ? undefined : background,
          color: "var(--lb-text)",
          fontFamily: "var(--lb-font)",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        <div
          className="w-full px-5 py-12 sm:py-16"
          style={{ maxWidth: "640px", margin: "0 auto" }}
        >
          <div
            style={{
              background: "var(--lb-card-bg)",
              border: `${themeInput.borderWidth ?? "1px"} solid var(--lb-card-border)`,
              borderRadius: "var(--lb-card-radius)",
              backdropFilter: "blur(var(--lb-blur))",
              WebkitBackdropFilter: "blur(var(--lb-blur))",
              padding: "32px 28px",
            }}
          >
            <MarkdownLite content={content} />
          </div>

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <a
              href={`/${slug}`}
              style={{
                display: "inline-block",
                padding: "var(--lb-btn-padding-y) var(--lb-btn-padding-x)",
                background: "var(--lb-card-bg)",
                border: `${themeInput.borderWidth ?? "1px"} solid var(--lb-card-border)`,
                borderRadius: "var(--lb-card-radius)",
                color: "var(--lb-text)",
                textDecoration: "none",
                fontSize: "calc(var(--lb-font-size))",
                fontWeight: "var(--lb-font-weight)",
                backdropFilter: "blur(var(--lb-blur))",
                WebkitBackdropFilter: "blur(var(--lb-blur))",
                transition: "transform .15s ease, border-color .15s ease",
              }}
            >
              ← Back to {page.title || page.slug}
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
