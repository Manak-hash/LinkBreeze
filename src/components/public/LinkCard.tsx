import type { ProfileRow, LinkRow } from "@/server/queries";
import { buildLinkCardHtml, type LinkCardTheme } from "@/components/public/build-link-card";

interface LinkCardProps {
  link: LinkRow;
  profile: Pick<ProfileRow, "displayName">;
  index: number;
  theme: LinkCardTheme;
}

/**
 * Pure Server Component — zero client JavaScript.
 *
 * The anchor is emitted as a raw HTML string via dangerouslySetInnerHTML so
 * that the inline `onclick` (using navigator.sendBeacon) survives into the
 * static HTML untouched. This keeps the public page 100% client-JS-free while
 * still tracking outbound clicks.
 */
export function LinkCard({ link, profile, index, theme }: LinkCardProps) {
  const html = buildLinkCardHtml(link, profile, theme, index);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
