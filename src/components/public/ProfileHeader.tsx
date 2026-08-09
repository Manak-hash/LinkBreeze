import Image from "next/image";
import type { ProfileRow } from "@/server/queries";

interface ProfileHeaderProps {
  profile: ProfileRow;
}

/**
 * Pure Server Component — no client JavaScript.
 * Renders avatar, display name, bio, and optional badge.
 * All colors come from theme tokens (CSS custom properties).
 *
 * Pixel mode: adds lb-pixel-* classes so the CSS in globals.css applies
 * pixel-stepped clip-paths and drop-shadow borders when --lb-pixel is "1".
 *
 * The display name uses calc() from --lb-font-size so themes with large
 * fontScale (e.g. Retro Sunset 120%, Brutalist) get proportionally larger
 * headings without overflowing on mobile — no hardcoded Tailwind text-3xl.
 */
export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const displayName = profile.displayName || "";
  const badge = profile.badgeText?.trim();

  return (
    <header
      style={{ color: "var(--lb-text)" }}
      className="flex flex-col items-center text-center"
    >
      {profile.avatarUrl ? (
        <div className="lb-pixel-avatar mb-4 rounded-full p-0.5" style={{ border: "2px solid var(--lb-avatar-border, var(--lb-accent))" }}>
          <Image
            src={profile.avatarUrl}
            alt={displayName}
            width={90}
            height={90}
            unoptimized
            className="block h-[90px] w-[90px] rounded-full object-cover"
            loading="eager"
            priority
          />
        </div>
      ) : (
        <div className="lb-pixel-avatar mb-4 flex h-[90px] w-[90px] items-center justify-center rounded-full" style={{ border: "2px solid var(--lb-avatar-border, var(--lb-accent))" }}>
          <span
            className="flex h-full w-full items-center justify-center rounded-full text-3xl font-semibold"
            style={{ background: "var(--lb-card-bg)", color: "var(--lb-accent)" }}
          >
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {badge ? (
        <span
          className="lb-pixel-border mb-2 inline-block px-3 py-0.5 text-xs font-medium"
          style={{
            color: "var(--lb-text)",
          }}
        >
          {badge}
        </span>
      ) : null}

      {displayName ? (
        <h1
          className="aurora-rise font-bold tracking-tight"
          style={{
            color: "var(--lb-text)",
            fontFamily: "var(--lb-font)",
            fontWeight: "var(--lb-font-weight)",
            letterSpacing: "var(--lb-letter-spacing)",
            // Scale heading from the theme's base font size.
            // 1.6x gives a clear visual hierarchy without overflowing.
            fontSize: "calc(var(--lb-font-size) * 1.6)",
            lineHeight: 1.2,
            maxWidth: "100%",
            wordBreak: "break-word",
          }}
        >
          {displayName}
        </h1>
      ) : null}

      {profile.bio ? (
        <p
          className="mt-2 max-w-md text-sm leading-relaxed"
          style={{ color: "var(--lb-text-muted)" }}
        >
          {profile.bio}
        </p>
      ) : null}
    </header>
  );
}
