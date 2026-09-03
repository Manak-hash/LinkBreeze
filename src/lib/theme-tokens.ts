/**
 * Theme token system — the single source of truth for public-page styling.
 *
 * Every theme from the DB resolves to a set of CSS custom properties (--lb-*).
 * Public components consume these variables instead of reading raw fields.
 * This keeps the public page 100% server-rendered with zero client JS.
 *
 * Migration-safe: every field is optional with sensible defaults, so old DB
 * rows (before the schema expansion) resolve correctly.
 */

import { truthy } from "@/lib/utils";
import {
  CUSTOM_FONT_PREFIX,
  parseCustomFontId,
  customFontStack,
} from "@/lib/custom-fonts";

// ─── Font Registry ──────────────────────────────────────────────────────────

/**
 * Maps a font identifier (stored in fontFamily) to a CSS font-family stack.
 * The CSS variables (--lb-font-*) are defined by next/font in layout.tsx.
 */
export const FONT_REGISTRY: Record<string, string> = {
  inter: "var(--font-sans), sans-serif",
  poppins: "var(--lb-font-poppins), sans-serif",
  playfair: "var(--lb-font-playfair), Georgia, serif",
  jetbrains: "var(--lb-font-jetbrains), ui-monospace, monospace",
  "space-grotesk": "var(--lb-font-space-grotesk), sans-serif",
  "dm-sans": "var(--lb-font-dm-sans), sans-serif",
  lora: "var(--lb-font-lora), Georgia, serif",
  bebas: "var(--lb-font-bebas), Impact, sans-serif",
  sora: "var(--lb-font-sora), sans-serif",
  outfit: "var(--lb-font-outfit), sans-serif",
  "press-start": "'Press Start 2P', var(--lb-font-press-start), monospace",
  nunito: "var(--lb-font-nunito), sans-serif",
  montserrat: "var(--lb-font-montserrat), sans-serif",
  caveat: "var(--lb-font-caveat), cursive",
  pacifico: "var(--lb-font-pacifico), cursive",
  abril: "var(--lb-font-abril), Georgia, serif",
};

// ─── Types ──────────────────────────────────────────────────────────────────

/** Accepts any partial theme record (old or new schema). */
export interface ThemeInput {
  // Colors
  primaryColor?: string | null;
  secondaryColor?: string | null;
  cardBackground?: string | null;
  cardBorderColor?: string | null;
  /**
   * Optional second font for link cards only. Same identifier
   * space as fontFamily (bundled id, "custom:<id>", legacy raw CSS).
   * Empty/null = cards inherit the site font.
   */
  cardFontFamily?: string | null;
  /** Divider element styling (#87) — see resolveDivider*. */
  dividerStyle?: string | null;
  /** Raw CSS color or ""/null = inherit the card border color. */
  dividerColor?: string | null;
  /** Line thickness in px as a string ("1"–"8"). */
  dividerThickness?: string | null;
  /** Horizontal width as a percentage string ("100"). */
  dividerWidth?: string | null;
  textColor?: string | null;
  mutedTextColor?: string | null;

  // Background
  backgroundType?: string | null;
  backgroundValue?: string | null;
  backgroundAngle?: string | null;
  backgroundImageUrl?: string | null;
  overlayColor?: string | null;
  overlayOpacity?: string | null;

  // Typography
  fontFamily?: string | null;
  fontScale?: string | null;
  fontWeight?: string | null;
  letterSpacing?: string | null;

  // Card
  linkStyle?: string | null;
  animationType?: string | null;
  radius?: string | null;
  buttonSize?: string | null;
  borderWidth?: string | null;
  shadowStrength?: string | null;
  hoverEffect?: string | null;

  // Layout
  containerWidth?: string | null;
  alignment?: string | null;
  density?: string | null;

  // Effects
  glow?: boolean | string | number | null;
  glowColor?: string | null;
  blur?: string | null;
  noise?: boolean | string | number | null;

  // Profile styling (1.3)
  avatarShape?: string | null;
  avatarBorder?: string | null;
  avatarFloat?: boolean | string | number | null;
  /** Avatar diameter ("96") or "auto" — see resolveAvatarSize. */
  avatarSize?: string | null;
  profileLayout?: string | null;
  textAnimation?: string | null;

  // Meta
  mode?: string | null;
}

export interface ThemeTokens {
  /** CSS variable name -> value (without the var() wrapper). */
  cssVars: Record<string, string>;
  /** @keyframes blocks that need to be injected (animated backgrounds, etc). */
  keyframes: string;
}

// ─── Defaults ───────────────────────────────────────────────────────────────

const FALLBACKS = {
  bg: "#0a0820",
  text: "#eceafe",
  accent: "#533fd6",
  secondary: "#a78bfa",
  cardBg: "rgba(255,255,255,0.06)",
  cardBorder: "rgba(167,139,250,0.16)",
  textMuted: "rgba(236,234,254,0.7)",
  font: "var(--font-sans), sans-serif",
  radius: "12px",
  cardRadius: "16px",
  btnPaddingY: "14px",
  btnPaddingX: "18px",
  spacing: "12px",
  shadow: "0 8px 30px rgba(0,0,0,0.35)",
  blur: "8px",
  borderWidth: "1px",
  containerWidth: "36rem",
  fontWeight: "600",
  fontSize: "15px",
  letterSpacing: "0em",
};

// ─── Resolution helpers ─────────────────────────────────────────────────────

function str(v: string | null | undefined, fallback: string): string {
  return v && v.trim() ? v.trim() : fallback;
}

/**
 * Normalize a stored overlay opacity to a 0–1 fraction.
 * The customizer slider stores 0–100; legacy rows stored 0–1 fractions.
 * Values > 1 are treated as percent (50 → 0.5); everything clamps to [0, 1].
 */
export function normalizeOpacity(raw: string | null | undefined): number {
  if (!raw || !raw.trim()) return 0;
  const num = parseFloat(raw);
  if (Number.isNaN(num) || num <= 0) return 0;
  const fraction = num > 1 ? num / 100 : num;
  return Math.min(fraction, 1);
}

/** Minimal metadata resolveFont needs for an uploaded custom font. */
export interface CustomFontLookup {
  family: string;
}

export interface ResolveThemeOptions {
  /** Uploaded fonts keyed by row id — enables "custom:<id>" fontFamily refs. */
  customFonts?: Map<number, CustomFontLookup>;
}

/** Resolve a font identifier or raw CSS to a font-family stack. */
export function resolveFont(
  fontFamily: string | null | undefined,
  customFonts?: Map<number, CustomFontLookup>,
): string {
  if (!fontFamily || !fontFamily.trim()) return FALLBACKS.font;
  const key = fontFamily.trim().toLowerCase();
  if (FONT_REGISTRY[key]) return FONT_REGISTRY[key];
  // Uploaded font reference: "custom:<id>". Any value with the custom:
  // prefix — malformed id, unknown row, deleted font — falls back to the
  // default font. It must NEVER reach the raw-CSS pass-through below, or a
  // bad row would hand "custom:abc" to the browser as a font-family.
  if (key.startsWith(CUSTOM_FONT_PREFIX)) {
    const customId = parseCustomFontId(key);
    const meta = customId ? customFonts?.get(customId) : undefined;
    return meta ? customFontStack(meta.family) : FALLBACKS.font;
  }
  // Backward compat: old rows store raw CSS like "var(--font-sans), sans-serif"
  return fontFamily;
}

/**
 * Compute whether to use white or black text on a given accent color
 * for maximum contrast. Uses WCAG relative luminance.
 */
function pickContrastText(hexColor: string): string {
  const m = hexColor.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  if (!m) return "#ffffff";
  const [, rs, gs, bs] = m;
  const toLin = (h: string) => {
    const v = parseInt(h, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const lum = 0.2126 * toLin(rs) + 0.7152 * toLin(gs) + 0.0722 * toLin(bs);
  return lum > 0.179 ? "#0a0a0a" : "#ffffff";
}

function resolveCardRadius(linkStyle: string, radius: string | null | undefined): string {
  // Explicit override wins
  if (radius && radius !== "auto" && radius.trim()) return radius;
  switch (linkStyle) {
     case "sharp":
      return "4px";
    case "pill":
      return "9999px";
    case "glass":
      return "16px";
    case "outline":
      return "12px";
    case "neon":
      return "12px";
    case "pixel":
      return "0px";
    case "gel":
      return "9999px";
    case "rounded":
    default:
      return "12px";
  }
}

function resolveButtonPadding(buttonSize: string | null | undefined): { y: string; x: string } {
  switch (buttonSize) {
    case "sm":
      return { y: "10px", x: "14px" };
    case "lg":
      return { y: "18px", x: "24px" };
    case "md":
    default:
      return { y: FALLBACKS.btnPaddingY, x: FALLBACKS.btnPaddingX };
  }
}

function resolveSpacing(density: string | null | undefined): string {
  switch (density) {
    case "compact":
      return "8px";
    case "relaxed":
      return "16px";
    // "normal", legacy "comfortable", and unknown values
    default:
      return FALLBACKS.spacing;
  }
}

function resolveShadow(strength: string | null | undefined, linkStyle: string): string {
  switch (strength) {
    case "none":
      return "none";
    case "subtle":
      return "0 4px 12px rgba(0,0,0,0.2)";
    case "soft":
      return "0 6px 20px rgba(0,0,0,0.25)";
    case "strong":
      return "0 12px 40px rgba(0,0,0,0.5)";
    case "medium":
    default:
      // Neon style defaults to glow-like shadow
      if (linkStyle === "neon") return "0 0 20px rgba(167,139,250,0.3)";
      return FALLBACKS.shadow;
  }
}

function resolveFontSize(scale: string | null | undefined): string {
  if (!scale || !scale.trim()) return FALLBACKS.fontSize;
  // Presets store fontScale as a numeric percentage (100, 110, 120, …).
  // 100 = base 15px, 110 = 16.5px, etc.
  const num = parseFloat(scale);
  if (!Number.isNaN(num) && num > 0) {
    return `${(num / 100) * 15}px`;
  }
  switch (scale) {
    case "sm":
      return "14px";
    case "lg":
      return "16px";
    case "md":
    default:
      return FALLBACKS.fontSize;
  }
}

function resolveFontWeight(weight: string | null | undefined): string {
  switch (weight) {
    case "300":
      return "300";
    case "400":
      return "400";
    case "500":
      return "500";
    case "700":
      return "700";
    case "800":
      return "800";
    case "600":
    default:
      return FALLBACKS.fontWeight;
  }
}

function resolveLetterSpacing(ls: string | null | undefined): string {
  if (!ls || !ls.trim()) return FALLBACKS.letterSpacing;
  // Allow numeric (em) or raw CSS values
  const num = parseFloat(ls);
  if (!isNaN(num) && !ls.includes("px") && !ls.includes("em")) {
    return `${num}em`;
  }
  return ls;
}

function resolveContainerWidth(width: string | null | undefined): string {
  if (!width || !width.trim()) return FALLBACKS.containerWidth;
  // Allow "narrow", "standard", "wide" keywords or raw CSS
  switch (width) {
    case "narrow":
      return "28rem";
    case "wide":
      return "42rem";
    case "standard":
    default:
      if (/^\d/.test(width)) return width; // raw CSS value
      return FALLBACKS.containerWidth;
  }
}

function resolveBlur(blur: string | null | undefined): string {
  if (!blur || !blur.trim()) return FALLBACKS.blur;
  return blur;
}

function resolveBorderWidth(bw: string | null | undefined): string {
  if (!bw || !bw.trim()) return FALLBACKS.borderWidth;
  return bw;
}

function resolveAlignment(align: string | null | undefined): "left" | "center" | "right" {
  switch (align) {
    case "left":
      return "left";
    case "right":
      return "right";
    case "center":
    default:
      return "center";
  }
}

/** Avatar shape → border-radius (1.3). */
function resolveAvatarRadius(shape: string): string {
  switch (shape) {
    case "square":
      return "0px";
    case "rounded":
      return "12px";
    case "squircle":
      return "24%";
    default:
      return "9999px";
  }
}

/**
 * Avatar diameter in px. "auto" (the default) keeps the pre-slider look:
 * the 94px box the public header historically rendered (90px image + 2px
 * padding). Numeric strings are clamped to the same 48–180 range the
 * customizer slider and Zod enforce; garbage falls back to auto.
 */
export function resolveAvatarSize(size: string | null | undefined): string {
  const raw = size?.trim();
  if (!raw || raw === "auto") return "94px";
  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0) return "94px";
  return `${Math.round(Math.min(Math.max(num, 48), 180))}px`;
}

// ─── Divider element resolvers (#87) ────────────────────────────────────────

/**
 * Divider line style. Falls back to "solid" for unknown values so old rows
 * and hand-edited backups always render a sane line.
 */
export function resolveDividerStyle(style: string | null | undefined): string {
  switch (style?.trim()) {
    case "dashed":
      return "dashed";
    case "dotted":
      return "dotted";
    case "gradient":
      return "gradient";
    default:
      return "solid";
  }
}

/**
 * Divider line thickness in px, clamped to 1–8 (the customizer slider's
 * range). Garbage falls back to 1px.
 */
export function resolveDividerThickness(thickness: string | null | undefined): string {
  const num = Number(thickness);
  if (!Number.isFinite(num) || num <= 0) return "1px";
  return `${Math.round(Math.min(Math.max(num, 1), 8))}px`;
}

/**
 * Divider width as a percentage, clamped to 20–100. Garbage falls back
 * to 100% (full container width).
 */
export function resolveDividerWidth(width: string | null | undefined): string {
  const num = Number(width);
  if (!Number.isFinite(num) || num <= 0) return "100%";
  return `${Math.round(Math.min(Math.max(num, 20), 100))}%`;
}

// ─── Reveal animation resolver ──────────────────────────────────────────────

/** Keyframe name for each reveal animation type. */
const REVEAL_KEYFRAMES: Record<string, string> = {
  lift: "aurora-rise",
  scale: "lb-zoom-in",
  "zoom-in": "lb-zoom-in",
  "fade-up": "lb-fade-up",
  "slide-in": "lb-slide-in",
  "blur-in": "lb-blur-in",
};

/**
 * Build the reveal animation style for React components.
 * Returns undefined when animations are disabled (animationType "none").
 */
export function revealAnimationStyle(
  animationType: string | null | undefined,
  delayMs: number,
): { animation: string; animationDelay: string } | undefined {
  if (animationType === "none") return undefined;
  const keyframe = REVEAL_KEYFRAMES[str(animationType, "lift")] ?? "aurora-rise";
  return {
    animation: `${keyframe} 0.5s cubic-bezier(0.16,1,0.3,1) both`,
    animationDelay: `${delayMs}ms`,
  };
}

/**
 * Build the inline `animation` declaration string for raw-HTML builders.
 * Returns "" when animations are disabled (animationType "none").
 */
export function revealAnimation(
  animationType: string | null | undefined,
  delayMs: number,
): string {
  const style = revealAnimationStyle(animationType, delayMs);
  if (!style) return "";
  return `animation: ${style.animation}; animation-delay:${delayMs}ms;`;
}

// ─── Main resolver ──────────────────────────────────────────────────────────

/**
 * Resolve a theme record into CSS custom properties + optional keyframes.
 *
 * The returned cssVars are the raw values — the caller should inject them
 * as `:root { --lb-xxx: value; ... }` inside a <style> block.
 */
export function resolveThemeTokens(
  theme: ThemeInput,
  options?: ResolveThemeOptions,
): ThemeTokens {
  const linkStyle = str(theme.linkStyle, "glass");

  const accent = str(theme.primaryColor, FALLBACKS.accent);
  const secondary = str(theme.secondaryColor, FALLBACKS.secondary);
  const text = str(theme.textColor, FALLBACKS.text);
  const textMuted = str(theme.mutedTextColor, FALLBACKS.textMuted);
  const cardBg = str(theme.cardBackground, FALLBACKS.cardBg);
  const cardBorder = str(theme.cardBorderColor, FALLBACKS.cardBorder);

  const cardRadius = resolveCardRadius(linkStyle, theme.radius);
  const btnPad = resolveButtonPadding(theme.buttonSize);
  const spacing = resolveSpacing(theme.density);
  const shadow = resolveShadow(theme.shadowStrength, linkStyle);
  const fontSize = resolveFontSize(theme.fontScale);
  const fontWeight = resolveFontWeight(theme.fontWeight);
  const letterSpacing = resolveLetterSpacing(theme.letterSpacing);
  const containerWidth = resolveContainerWidth(theme.containerWidth);
  const blur = resolveBlur(theme.blur);
  const borderWidth = resolveBorderWidth(theme.borderWidth);
  const alignment = resolveAlignment(theme.alignment);
  const font = resolveFont(theme.fontFamily, options?.customFonts);

  // Card font: empty/absent → "inherit" so the card builder emits nothing
  // and the card rides the site font. Any other value resolves through the
  // same registry + custom-font lookup as the site font.
  const cardFont = theme.cardFontFamily?.trim()
    ? resolveFont(theme.cardFontFamily, options?.customFonts)
    : "inherit";

  // Glow effect
  const glowEnabled = truthy(theme.glow);
  const glowColor = str(theme.glowColor, accent);
  const glowValue = glowEnabled ? `0 0 24px ${glowColor}66` : "none";

  // Noise overlay
  const noiseEnabled = truthy(theme.noise);

  // Button text: pick black or white based on accent luminance.
  // For glass/transparent themes where card-bg is see-through, this ensures
  // the Subscribe button text is always readable on the accent background.
  const btnText = pickContrastText(accent);

  const cssVars: Record<string, string> = {
    "--lb-accent": accent,
    "--lb-secondary": secondary,
    "--lb-text": text,
    "--lb-text-muted": textMuted,
    "--lb-card-bg": cardBg,
    "--lb-card-border": cardBorder,
    "--lb-card-radius": cardRadius,
    // Radius for cards that carry media blocks (thumbnail + rich preview
    // links, embed widgets). A 9999px pill is correct for compact one-line
    // links but turns tall media cards into circles; clamping keeps pill
    // themes (Pastel Soft, gel) sane on those surfaces.
    "--lb-media-radius": `min(${cardRadius}, 24px)`,
    "--lb-btn-text": btnText,
    "--lb-font": font,
    // Link cards consume this; "inherit" (the default) means the card
    // builder emits no font-family and the card rides --lb-font above.
    "--lb-card-font": cardFont,
    "--lb-font-size": fontSize,
    "--lb-font-weight": fontWeight,
    "--lb-letter-spacing": letterSpacing,
    "--lb-btn-padding-y": btnPad.y,
    "--lb-btn-padding-x": btnPad.x,
    "--lb-spacing": spacing,
    "--lb-shadow": shadow,
    "--lb-glow": glowValue,
    "--lb-blur": blur,
    "--lb-border-width": borderWidth,
    "--lb-container-width": containerWidth,
    "--lb-alignment": alignment,
    "--lb-noise": noiseEnabled ? "1" : "0",
    // Avatar styling (1.3): shape → radius, border → ring/glow/gradient
    "--lb-avatar-radius": resolveAvatarRadius(str(theme.avatarShape, "circle")),
    "--lb-avatar-size": resolveAvatarSize(theme.avatarSize),
    // Divider element (#87): per-theme line style. Color "" (the default)
    // inherits the card border so dividers match every theme out of the box;
    // an explicit color overrides it. "gradient" styles the line as an
    // accent→transparent fade via --lb-divider-image (background takes over).
    "--lb-divider-style": resolveDividerStyle(theme.dividerStyle),
    "--lb-divider-color": theme.dividerColor?.trim() || "var(--lb-card-border)",
    "--lb-divider-thickness": resolveDividerThickness(theme.dividerThickness),
    "--lb-divider-width": resolveDividerWidth(theme.dividerWidth),
    "--lb-divider-image": resolveDividerStyle(theme.dividerStyle) === "gradient"
      ? `linear-gradient(90deg, transparent, ${theme.dividerColor?.trim() || accent}, transparent)`
      : "none",
    "--lb-avatar-border": accent,
    "--lb-avatar-glow": glowValue,
    "--lb-avatar-gradient": `linear-gradient(135deg, ${accent}, ${secondary})`,
    // Pixel mode flag: "1" when linkStyle is pixel, used for global clip-paths
    "--lb-pixel": linkStyle === "pixel" ? "1" : "0",
    // Aurora background colors (1.3): drive the animated aurora from the
    // theme's own colors instead of the hardcoded defaults. Base = the first
    // backgroundValue color; blobs = accent + secondary.
    "--lb-aurora-base": str(
      (theme.backgroundValue || "").split(",")[0]?.trim() || null,
      NIGHT_BASE,
    ),
    "--lb-aurora-blob-1": accent,
    "--lb-aurora-blob-2": secondary,
  };

  // Keyframes for animated gradient backgrounds
  let keyframes = "";
  const bgType = str(theme.backgroundType, "gradient");

  if (bgType === "animatedGradient" || bgType === "aurora") {
    keyframes += `
@keyframes lb-gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}`;
  }

  return { cssVars, keyframes };
}

// ─── Style block builder ────────────────────────────────────────────────────

/**
 * Build the complete <style> string to inject into the public page.
 * Produces `:root { --lb-*: ... }` from the theme tokens, prefixed with the
 * @font-face rule for the theme's uploaded font (if any).
 */
export function buildThemeStyleBlock(
  theme: ThemeInput,
  options?: ResolveThemeOptions & {
    /** Pre-built @font-face CSS (from buildFontFaceCss) — optional. */
    fontFaceCss?: string;
  },
): string {
  const { cssVars, keyframes } = resolveThemeTokens(theme, options);
  const declarations = Object.entries(cssVars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");

  const prefix = options?.fontFaceCss ? `${options.fontFaceCss}\n` : "";
  return `${prefix}:root {\n${declarations}\n}${keyframes ? `\n${keyframes}` : ""}`;
}

// ─── Background resolver (expanded) ─────────────────────────────────────────

const NIGHT_BASE = "#0a0820";

/**
 * Media background CSS parts (image/gif): fit + focal point.
 * - cover:   background-size: cover        (zoom to fill, crop overflow)
 * - contain: background-size: contain      (letterboxed, no crop)
 * - tile:    background-size: auto + repeat (pattern across the page)
 * Focal point (background-position, "x% y%") applies to cover/contain; for
 * tile it pins the repeat origin (subtle, but keeps the mental model one).
 */
export function mediaBackgroundCss(theme: ThemeBackgroundInput): string {
  const url = `url('${theme.backgroundImageUrl}')`;
  const fit = theme.backgroundFit || "cover";
  const pos = theme.backgroundPosition || "50% 50%";
  // Fallback color sits behind the media — matters for contain (letterbox
  // bars) and transparent PNGs. Uses the theme's first bg color, else night.
  const fallback =
    (theme.backgroundValue || "").split(",")[0]?.trim() || NIGHT_BASE;
  if (fit === "tile") {
    // repeat with natural size; position pins the pattern origin
    return `${url} ${pos}/auto repeat ${fallback}`;
  }
  const size = fit === "contain" ? "contain" : "cover";
  return `${url} ${pos}/${size} no-repeat ${fallback}`;
}

/**
 * Fit values for <video> (object-fit): tile is meaningless for video —
 * callers should treat it as cover. Exported for VideoBackground and the
 * live preview.
 */
export function mediaObjectFit(theme: ThemeBackgroundInput): string {
  const fit = theme.backgroundFit || "cover";
  return fit === "contain" ? "contain" : "cover";
}

/** object-position for <video> from the stored focal point. */
export function mediaObjectPosition(theme: ThemeBackgroundInput): string {
  return theme.backgroundPosition || "50% 50%";
}

export interface ThemeBackgroundInput {
  backgroundType?: string | null;
  backgroundValue?: string | null;
  backgroundAngle?: string | null;
  backgroundImageUrl?: string | null;
  backgroundFit?: string | null;
  backgroundPosition?: string | null;
  overlayColor?: string | null;
  overlayOpacity?: string | null;
}

/** True when the theme should render the animated <AuroraBackground />. */
export function isAnimatedAurora(theme: ThemeBackgroundInput): boolean {
  return theme.backgroundType === "aurora";
}

/**
 * Resolve a CSS background string for all background types.
 * The "aurora" type is handled separately (renders the AuroraBackground component).
 */
export function resolveBackground(theme: ThemeBackgroundInput): string {
  const bgType = theme.backgroundType || "gradient";
  const parts = (theme.backgroundValue || NIGHT_BASE)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length === 0) return NIGHT_BASE;
  const angle = theme.backgroundAngle?.trim() || "160deg";

  switch (bgType) {
    case "solid":
      return parts[0];

    case "gradient":
      return parts.length > 1
        ? `linear-gradient(${angle}, ${parts.join(", ")})`
        : parts[0];

    case "radial":
      return parts.length > 1
        ? `radial-gradient(circle at 50% 30%, ${parts.join(", ")})`
        : parts[0];

    case "mesh":
      // Multi-layer mesh using radial gradients
      if (parts.length >= 2) {
        const layers = parts
          .map(
            (color, i) =>
              `radial-gradient(at ${20 + i * 25}% ${15 + (i % 3) * 30}%, ${color} 0px, transparent 50%)`,
          )
          .join(", ");
        return `${layers}, ${parts[0]}`;
      }
      return parts[0];

    case "image":
      if (theme.backgroundImageUrl) {
        // Render the overlay as a uniform translucent layer over the image.
        // Stored scale is 0–100 (the customizer slider). Normalize to 0–1:
        // legacy rows stored 0–1 fractions; treat >1 as percent, clamp to 1.
        const overlayFraction = normalizeOpacity(theme.overlayOpacity);
        const hasOverlay =
          theme.overlayColor !== undefined &&
          theme.overlayColor !== null &&
          overlayFraction > 0;

        const media = mediaBackgroundCss(theme);
        if (hasOverlay && theme.overlayColor) {
          // Encode opacity as 2-digit alpha hex appended to the overlay color,
          // then repeat the SAME color at both gradient stops so the layer is
          // uniform (not a gradient from transparent-ish to opaque).
          const alpha = Math.round(overlayFraction * 255)
            .toString(16)
            .padStart(2, "0");
          const overlayLayer = `${theme.overlayColor}${alpha}`;
          return `linear-gradient(${overlayLayer}, ${overlayLayer}), ${media}`;
        }
        return media;
      }
      return parts[0];

    case "animatedGradient":
      return `linear-gradient(${angle}, ${parts.join(", ")}, ${parts[0]})`;

    case "gif":
      // Animated GIF: same treatment as a static image (browser animates it).
      if (theme.backgroundImageUrl) {
        return mediaBackgroundCss(theme);
      }
      return parts[0];

    case "pattern":
      return parts[0];

    case "video":
      // The <video> element covers the page; backgroundValue still resolves to
      // a gradient so it can double as the fallback when the video can't load
      // (offline, dead URL, saveData pause) and as the letterbox color for
      // object-fit: contain. Mirrors the "gif" treatment above.
      return parts.length > 1
        ? `linear-gradient(${angle}, ${parts.join(", ")})`
        : parts[0];

    case "aurora":
    default:
      return NIGHT_BASE;
  }
}
