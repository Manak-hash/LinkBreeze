import type { SectionLike } from "@/lib/link-sections";
import { revealAnimationStyle } from "@/lib/theme-tokens";
import { LucideIcon, isLucideIconName } from "@/components/public/LucideIcon";

interface SectionHeaderProps {
  section: SectionLike;
  /** Entrance-animation delay in ms (continues the page stagger sequence). */
  delayMs: number;
  /** Reveal keyframe variant (theme.animationType). */
  animationType?: string | null;
  /** Theme alignment ("left" | "center" | "right") — centered themes get symmetric rules. */
  alignment?: "left" | "center" | "right" | null;
}

/**
 * Section header rendered above a group of links on the public page.
 *
 * Server Component — zero client JS. Consumes the theme's --lb-* custom
 * properties so it adapts to every theme (font, accent, alignment, radius).
 *
 * Design: label-voice title (small caps, widened tracking) flanked by
 * hairline rules. Centered themes get symmetric rules on both sides; side-
 * aligned themes get one rule stretching away from the text. Rules fade from
 * the theme accent to transparent, so they structure the row without adding
 * a second focal point. Optional lucide icon sits at label size.
 *
 * Spacing: the header carries its own bottom margin equal to the space the
 * preceding section's margin-bottom provides above it, so the vertical
 * rhythm around the header is symmetrical (link cards use bottom-only
 * margins and contribute nothing above).
 */
export function SectionHeader({ section, delayMs, animationType, alignment }: SectionHeaderProps) {
  const raw = section.icon?.trim();
  const iconIsLucide = isLucideIconName(raw);

  const reveal = revealAnimationStyle(animationType, delayMs);

  const ruleStyle: React.CSSProperties = {
    flex: 1,
    height: "1px",
    minWidth: "24px",
    background:
      "linear-gradient(to right, var(--lb-accent) 0%, color-mix(in srgb, var(--lb-accent) 22%, transparent) 45%, transparent 100%)",
    opacity: 0.55,
  };
  const ruleStartStyle: React.CSSProperties = {
    ...ruleStyle,
    // Mirrored fade: transparent → accent, so both rules fade away from the title.
    background:
      "linear-gradient(to left, var(--lb-accent) 0%, color-mix(in srgb, var(--lb-accent) 22%, transparent) 45%, transparent 100%)",
  };

  const centered = alignment === "center";

  return (
    <div
      className="lb-section-header"
      style={{
        ...reveal,
        display: "flex",
        alignItems: "center",
        justifyContent: centered ? "center" : "flex-start",
        gap: "10px",
        width: "100%",
        // Symmetry: matches the calc(var(--lb-spacing) * 1.5) margin-bottom the
        // parent <section> applies, balancing the space above the header.
        marginBottom: "calc(var(--lb-spacing) * 1.5)",
      } as React.CSSProperties}
    >
      {centered ? <div aria-hidden="true" style={ruleStartStyle} /> : null}
      {raw ? (
        iconIsLucide ? (
          <LucideIcon
            name={raw}
            size={15}
            strokeWidth={2.2}
            className="lb-section-icon"
          />
        ) : (
          // Legacy emoji values keep rendering as text (pre-1.3 data).
          <span aria-hidden="true" style={{ fontSize: "15px", lineHeight: 1 }}>
            {raw}
          </span>
        )
      ) : null}
      <h2
        style={{
          margin: 0,
          fontSize: "max(calc(var(--lb-font-size) * 0.72), 11px)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          fontFamily: "var(--lb-font)",
          color: "var(--lb-text)",
          opacity: 0.85,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {section.title}
      </h2>
      <div aria-hidden="true" style={ruleStyle} />
    </div>
  );
}
