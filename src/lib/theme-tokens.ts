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
};

/** Display names for the UI font picker. */
export const FONT_LABELS: Record<string, string> = {
  inter: "Inter (Sans)",
  poppins: "Poppins (Sans)",
  playfair: "Playfair Display (Serif)",
  jetbrains: "JetBrains Mono (Mono)",
  "space-grotesk": "Space Grotesk (Sans)",
  "dm-sans": "DM Sans (Sans)",
  lora: "Lora (Serif)",
  bebas: "Bebas Neue (Display)",
  sora: "Sora (Sans)",
  outfit: "Outfit (Sans)",
};

export const FONT_OPTIONS = Object.keys(FONT_REGISTRY);

// ─── Types ──────────────────────────────────────────────────────────────────

/** Accepts any partial theme record (old or new schema). */
export interface ThemeInput {
  // Colors
  primaryColor?: string | null;
  secondaryColor?: string | null;
  cardBackground?: string | null;
  cardBorderColor?: string | null;
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

/** Resolve a font identifier or raw CSS to a font-family stack. */
export function resolveFont(fontFamily: string | null | undefined): string {
  if (!fontFamily || !fontFamily.trim()) return FALLBACKS.font;
  const key = fontFamily.trim().toLowerCase();
  if (FONT_REGISTRY[key]) return FONT_REGISTRY[key];
  // Backward compat: old rows store raw CSS like "var(--font-sans), sans-serif"
  return fontFamily;
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

// ─── Main resolver ──────────────────────────────────────────────────────────

/**
 * Resolve a theme record into CSS custom properties + optional keyframes.
 *
 * The returned cssVars are the raw values — the caller should inject them
 * as `:root { --lb-xxx: value; ... }` inside a <style> block.
 */
export function resolveThemeTokens(theme: ThemeInput): ThemeTokens {
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
  const font = resolveFont(theme.fontFamily);

  // Glow effect
  const glowEnabled = theme.glow === true || theme.glow === "true" || theme.glow === 1 || theme.glow === "1";
  const glowColor = str(theme.glowColor, accent);
  const glowValue = glowEnabled ? `0 0 24px ${glowColor}40` : "none";

  // Noise overlay
  const noiseEnabled =
    theme.noise === true || theme.noise === "true" || theme.noise === 1 || theme.noise === "1";

  const cssVars: Record<string, string> = {
    "--lb-accent": accent,
    "--lb-secondary": secondary,
    "--lb-text": text,
    "--lb-text-muted": textMuted,
    "--lb-card-bg": cardBg,
    "--lb-card-border": cardBorder,
    "--lb-card-radius": cardRadius,
    "--lb-font": font,
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
 * Produces `:root { --lb-*: ... }` from the theme tokens.
 */
export function buildThemeStyleBlock(theme: ThemeInput): string {
  const { cssVars, keyframes } = resolveThemeTokens(theme);
  const declarations = Object.entries(cssVars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");

  return `:root {\n${declarations}\n}${keyframes ? `\n${keyframes}` : ""}`;
}

// ─── Background resolver (expanded) ─────────────────────────────────────────

const NIGHT_BASE = "#0a0820";

interface ThemeBackgroundInput {
  backgroundType?: string | null;
  backgroundValue?: string | null;
  backgroundAngle?: string | null;
  backgroundImageUrl?: string | null;
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
        const overlay =
          theme.overlayColor && theme.overlayOpacity
            ? `${theme.overlayColor}${Math.round(parseFloat(theme.overlayOpacity) * 255)
                .toString(16)
                .padStart(2, "0")},`
            : "";
        return overlay
          ? `linear-gradient(${overlay} ${theme.overlayColor}), url('${theme.backgroundImageUrl}')`
          : `url('${theme.backgroundImageUrl}')`;
      }
      return parts[0];

    case "animatedGradient":
      return `linear-gradient(${angle}, ${parts.join(", ")}, ${parts[0]})`;

    case "pattern":
      return parts[0];

    case "aurora":
    default:
      return NIGHT_BASE;
  }
}

/** Whether this theme's background is animated (needs extra CSS). */
export function isAnimatedBackground(theme: ThemeBackgroundInput): boolean {
  const t = theme.backgroundType;
  return t === "aurora" || t === "animatedGradient";
}
