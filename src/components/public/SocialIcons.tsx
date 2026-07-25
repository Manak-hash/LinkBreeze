import {
  getSocialIconSvg,
  normalizeSocialUrl,
  getPlatformLabel,
  type SocialPlatform,
} from "@/lib/social-icons";
import type { SocialLink } from "@/server/queries";

interface SocialIconsProps {
  socialLinks: SocialLink[];
}

/**
 * Pure Server Component — zero client JavaScript.
 * Renders a horizontal row of social platform icon links.
 * All styling via theme tokens (CSS custom properties).
 */
export function SocialIcons({ socialLinks }: SocialIconsProps) {
  if (!socialLinks || socialLinks.length === 0) return null;

  return (
    <nav
      aria-label="Social links"
      className="flex flex-wrap items-center justify-center gap-3"
    >
      {socialLinks.map((item, i) => {
        const platform = (item.platform as SocialPlatform) || "email";
        const href = normalizeSocialUrl(platform, item.url || "");
        if (!href) return null;
        const svg = getSocialIconSvg(platform);
        const label = getPlatformLabel(platform);

        const anchorHtml = `<a
          href="${href.replace(/"/g, "&quot;")}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="${label}"
          style="display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:9999px;background:var(--lb-card-bg);color:var(--lb-text);border:var(--lb-border-width) solid var(--lb-card-border);transition:transform .15s ease,background .15s ease,border-color .15s ease;backdrop-filter:blur(var(--lb-blur));-webkit-backdrop-filter:blur(var(--lb-blur))"
          onmouseover="this.style.transform='translateY(-2px)';this.style.background='var(--lb-card-border)';this.style.borderColor='var(--lb-accent)'"
          onmouseout="this.style.transform='none';this.style.background='var(--lb-card-bg)';this.style.borderColor='var(--lb-card-border)'"
        >${svg}</a>`;

        return (
          <span
            key={`${platform}-${i}`}
            dangerouslySetInnerHTML={{ __html: anchorHtml }}
          />
        );
      })}
    </nav>
  );
}
