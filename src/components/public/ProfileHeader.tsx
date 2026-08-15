import Image from "next/image";
import type { ProfileRow } from "@/server/queries";
import { revealAnimationStyle } from "@/lib/theme-tokens";
import type { ThemeInput } from "@/lib/theme-tokens";

interface ProfileHeaderProps {
  profile: ProfileRow & { bannerUrl?: string | null };
  /** Theme tokens for avatar shape/border/float + text animation. */
  theme?: ThemeInput | null;
}

/**
 * Avatar block shared by all layouts. Consumes the avatar tokens resolved
 * from the theme: --lb-avatar-radius (shape), --lb-avatar-border (accent),
 * --lb-avatar-glow, --lb-avatar-gradient.
 */
function Avatar({
  profile,
  shape,
  borderStyle,
  float,
  reveal,
}: {
  profile: ProfileHeaderProps["profile"];
  shape: string;
  borderStyle: React.CSSProperties;
  float: boolean;
  reveal?: React.CSSProperties;
}) {
  const radius = "var(--lb-avatar-radius, 9999px)";
  const floatClass = float ? "lb-float" : undefined;

  // Reveal lives on the wrapper; float on the inner box. Both are `animation`
  // so they'd clobber each other on the same element.
  return (
    <div style={{ ...reveal }} data-avatar-shape={shape}>
      <div
        className={`lb-pixel-avatar mb-4 ${floatClass ?? ""}`}
        style={{ ...borderStyle, padding: 2, width: 94, height: 94, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={profile.displayName || ""}
            width={90}
            height={90}
            unoptimized
            className="block h-[90px] w-[90px] object-cover"
            style={{ borderRadius: radius }}
            loading="eager"
            priority
          />
        ) : (
          <span
            className="flex h-[90px] w-[90px] items-center justify-center text-3xl font-semibold"
            style={{ background: "var(--lb-card-bg)", color: "var(--lb-accent)", borderRadius: radius }}
          >
            {(profile.displayName || "?").charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}

/** Border styles per avatarBorder token. */
function avatarBorderStyle(border: string): React.CSSProperties {
  switch (border) {
    case "none":
      return {};
    case "glow":
      return { borderRadius: "var(--lb-avatar-radius, 9999px)", boxShadow: "0 0 24px var(--lb-avatar-glow)" };
    case "gradient":
      // Gradient ring via border-image-ish trick: background gradient shows
      // through the 2px padding gap around the image.
      return { borderRadius: "var(--lb-avatar-radius, 9999px)", background: "var(--lb-avatar-gradient)" };
    case "ring":
      // Offset ring: transparent gap between avatar and a thick accent ring.
      return {
        borderRadius: "var(--lb-avatar-radius, 9999px)",
        boxShadow: "0 0 0 3px var(--lb-accent)",
        padding: 6,
      };
    default:
      return { borderRadius: "var(--lb-avatar-radius, 9999px)", border: "2px solid var(--lb-avatar-border, var(--lb-accent))" };
  }
}

/** Display name with optional text animation (typewriter / gradient-flow). */
function DisplayName({ name, textAnimation }: { name: string; textAnimation: string }) {
  const base: React.CSSProperties = {
    color: "var(--lb-text)",
    fontFamily: "var(--lb-font)",
    fontWeight: "var(--lb-font-weight)",
    letterSpacing: "var(--lb-letter-spacing)",
    fontSize: "calc(var(--lb-font-size) * 1.6)",
    lineHeight: 1.2,
    maxWidth: "100%",
    wordBreak: "break-word",
  };

  if (textAnimation === "gradient-flow") {
    return (
      <h1 className="lb-text-anim" style={{ ...base, background: "var(--lb-avatar-gradient)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", animation: "lb-gradient-text-flow 4s linear infinite" }}>
        {name}
      </h1>
    );
  }

  if (textAnimation === "typewriter") {
    // CSS-only typewriter: fixed-ch growth + steps() + blinking caret.
    const ch = name.length;
    return (
      <h1
        className="lb-text-anim"
        style={{
          ...base,
          width: `${ch}ch`,
          maxWidth: "100%",
          overflow: "hidden",
          whiteSpace: "nowrap" as const,
          borderRight: "2px solid var(--lb-accent)",
          animation: `lb-typewriter ${Math.max(ch * 0.08, 0.6)}s steps(${ch}) both, lb-caret-blink 0.8s step-end infinite`,
        }}
      >
        {name}
      </h1>
    );
  }

  return <h1 style={base}>{name}</h1>;
}

/**
 * Profile header — server-rendered, zero client JS.
 *
 * Layouts (theme.profileLayout):
 *  - classic: avatar above name + bio (the original).
 *  - hero:    full-width banner image with name overlaid at the bottom.
 *  - banner:  wide banner image above the classic block (X/Twitter style).
 *
 * Entrance stagger (when theme.animationType !== "none"):
 *   avatar 0ms → name 80ms → bio 160ms → socials 240ms (page.tsx) → links.
 */
export function ProfileHeader({ profile, theme }: ProfileHeaderProps) {
  const displayName = profile.displayName || "";
  const badge = profile.badgeText?.trim();

  const animationType = theme?.animationType;
  const avatarReveal = revealAnimationStyle(animationType, 0);
  const nameReveal = revealAnimationStyle(animationType, 80);
  const bioReveal = revealAnimationStyle(animationType, 160);

  const layout = theme?.profileLayout ?? "classic";
  const textAnimation = theme?.textAnimation ?? "none";
  const shape = theme?.avatarShape ?? "circle";
  const border = avatarBorderStyle(theme?.avatarBorder ?? "solid");
  const float = theme?.avatarFloat === true || theme?.avatarFloat === "true";

  const banner = profile.bannerUrl;

  // ── Hero layout: banner image with overlaid name ──
  if (layout === "hero" && banner) {
    return (
      <header className="flex flex-col" style={{ color: "var(--lb-text)" }}>
        <div className="lb-pixel-border relative -mx-4 mb-4 mt-2 overflow-hidden" style={{ borderRadius: "var(--lb-card-radius)", maxHeight: 240 }}>
          <Image
            src={banner}
            alt=""
            width={1200}
            height={480}
            unoptimized
            className="h-[180px] w-full object-cover sm:h-[240px]"
            style={{ display: "block" }}
            priority
          />
          {/* Readability scrim */}
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent 60%)" }} />
          <div className="absolute bottom-0 left-0 w-full p-4 text-center" style={nameReveal}>
            {badge ? (
              <span className="lb-pixel-border mb-1 inline-block px-3 py-0.5 text-xs font-medium" style={{ color: "var(--lb-text)" }}>
                {badge}
              </span>
            ) : null}
            <DisplayName name={displayName} textAnimation={textAnimation} />
          </div>
        </div>
        {profile.bio ? (
          <p className="mx-auto max-w-md text-sm leading-relaxed" style={{ ...({ color: "var(--lb-text-muted)" } as React.CSSProperties), ...bioReveal }}>
            {profile.bio}
          </p>
        ) : null}
      </header>
    );
  }

  // ── Banner layout: wide image above classic block ──
  const bannerBlock =
    layout === "banner" && banner ? (
      <div className="lb-pixel-border -mx-4 mb-6 w-full overflow-hidden" style={{ borderRadius: "var(--lb-card-radius)" }}>
        <Image
          src={banner}
          alt=""
          width={1200}
          height={300}
          unoptimized
          className="h-[120px] w-full object-cover sm:h-[160px]"
          style={{ display: "block" }}
          priority
        />
      </div>
    ) : null;

  // ── Classic (default) ──
  return (
    <header className="flex flex-col items-center text-center" style={{ color: "var(--lb-text)" }}>
      {bannerBlock}
      <Avatar profile={profile} shape={shape} borderStyle={border} float={float} reveal={avatarReveal as React.CSSProperties} />
      {badge ? (
        <span className="lb-pixel-border mb-2 inline-block px-3 py-0.5 text-xs font-medium" style={{ color: "var(--lb-text)" }}>
          {badge}
        </span>
      ) : null}
      <div style={nameReveal as React.CSSProperties}>
        <DisplayName name={displayName} textAnimation={textAnimation} />
      </div>
      {profile.bio ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed" style={{ ...({ color: "var(--lb-text-muted)" } as React.CSSProperties), ...bioReveal }}>
          {profile.bio}
        </p>
      ) : null}
    </header>
  );
}
