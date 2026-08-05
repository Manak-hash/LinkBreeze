import {
  getSocialIconSvg,
  normalizeSocialUrl,
  getPlatformLabel,
  type SocialPlatform,
} from "@/lib/social-icons";
import type { ThemeInput } from "@/lib/theme-tokens";
import type { SocialLink } from "@/server/queries";

interface SocialIconsProps {
  socialLinks: SocialLink[];
  theme?: ThemeInput;
}

/**
 * Pure Server Component — zero client JavaScript.
 * Renders a horizontal row of social platform icon links.
 * All styling via theme tokens (CSS custom properties).
 *
 * In pixel mode, each icon is wrapped in a two-layer structure:
 * outer div = orange border, inner div = card-bg, both with clip-path.
 */
export function SocialIcons({ socialLinks, theme }: SocialIconsProps) {
  if (!socialLinks || socialLinks.length === 0) return null;

  const isPixel = theme?.linkStyle === "pixel";

  return (
    <nav
      aria-label="Social links"
      className="flex flex-wrap items-center justify-center gap-3"
    >
      {socialLinks.map((item) => {
        const platform = (item.platform as SocialPlatform) || "email";
        const href = normalizeSocialUrl(platform, item.url || "");
        if (!href) return null;
        const svg = getSocialIconSvg(platform);
        const label = getPlatformLabel(platform);

        if (isPixel) {
          // Pixel mode: two-layer wrapper for stepped orange border
          return (
            <div
              key={`${platform}-${href}`}
              className="lb-pixel-social"
              style={{ position: "relative", width: "42px", height: "42px" }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "var(--lb-accent)",
                  clipPath:
                    "polygon(6px 0,calc(100% - 6px) 0,calc(100% - 6px) 3px,calc(100% - 3px) 3px,calc(100% - 3px) 6px,100% 6px,100% calc(100% - 6px),calc(100% - 3px) calc(100% - 6px),calc(100% - 3px) calc(100% - 3px),calc(100% - 6px) calc(100% - 3px),calc(100% - 6px) 100%,6px 100%,6px calc(100% - 3px),3px calc(100% - 3px),3px calc(100% - 6px),0 calc(100% - 6px),0 6px,3px 6px,3px 3px)",
                }}
              />
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="lb-social-icon"
                style={{
                  position: "absolute",
                  inset: "3px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--lb-card-bg)",
                  color: "var(--lb-text)",
                  clipPath:
                    "polygon(4px 0,calc(100% - 4px) 0,calc(100% - 4px) 2px,calc(100% - 2px) 2px,calc(100% - 2px) 4px,100% 4px,100% calc(100% - 4px),calc(100% - 2px) calc(100% - 4px),calc(100% - 2px) calc(100% - 2px),calc(100% - 4px) calc(100% - 2px),calc(100% - 4px) 100%,4px 100%,4px calc(100% - 2px),2px calc(100% - 2px),2px calc(100% - 4px),0 calc(100% - 4px),0 4px,2px 4px,2px 2px)",
                }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>
          );
        }

        const anchorHtml = `<a\n          href="${href.replace(/"/g, "&quot;")}"\n          target="_blank"\n          rel="noopener noreferrer"\n          aria-label="${label}"\n          class="lb-social-icon"\n          style="display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:var(--lb-card-radius);background:var(--lb-card-bg);color:var(--lb-text);border:var(--lb-border-width) solid var(--lb-card-border);transition:transform .15s ease,border-color .15s ease;backdrop-filter:blur(var(--lb-blur));-webkit-backdrop-filter:blur(var(--lb-blur))"\n        >${svg}</a>`;

        return (
          <span
            key={`${platform}-${href}`}
            dangerouslySetInnerHTML={{ __html: anchorHtml }}
          />
        );
      })}
    </nav>
  );
}
