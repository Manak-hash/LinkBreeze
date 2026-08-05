/**
 * Theme preset definitions — the 10 built-in themes.
 *
 * Extracted from src/server/queries/index.ts (seedThemesIfEmpty) so the
 * presets can be imported by tests without dragging in the "server-only"
 * runtime + the live database. seedThemesIfEmpty imports PRESETS from here.
 *
 * NOTE: `base` contains the shared token-system defaults. Presets spread
 * `base` then override. Keep this object in sync with schema.ts defaults —
 * the schema-default-conformance test enforces that.
 */

import type { ThemeInput } from "@/lib/theme-tokens";

/**
 * Concrete preset shape — all theme-token fields as required strings (presets
 * always fully specify them via `base`), plus the DB meta fields.
 *
 * Deliberately does NOT extend ThemeInput (which allows null/undefined) —
 * the drizzle insert target (`db.insert(themes).values(...)`) requires
 * notNull strings, so we keep this type strict to satisfy the type checker.
 */
export interface ThemePreset {
  // Meta
  name: string;
  isPreset: true;
  isActive: boolean;
  mode: "dark" | "light";

  // Theme tokens — all required in a preset (provided via `base`).
  backgroundType: string;
  backgroundValue: string;
  backgroundAngle: string;
  overlayColor: string;
  overlayOpacity: string;
  primaryColor: string;
  secondaryColor: string;
  cardBackground: string;
  cardBorderColor: string;
  textColor: string;
  mutedTextColor: string;
  fontFamily: string;
  fontScale: string;
  fontWeight: string;
  letterSpacing: string;
  linkStyle: string;
  animationType: string;
  radius: string;
  buttonSize: string;
  borderWidth: string;
  shadowStrength: string;
  hoverEffect: string;
  containerWidth: string;
  alignment: string;
  density: string;
  glow: string;
  glowColor: string;
  blur: string;
  noise: string;

  // Optional — not set by presets, relies on the DB column default ("").
  backgroundImageUrl?: string;
}

/** A ThemePreset is assignable to ThemeInput (used by resolver + tests). */
export function presetAsThemeInput(p: ThemePreset): ThemeInput {
  return p;
}

/** Shared defaults across all presets. */
export const base: Omit<ThemePreset, "name" | "backgroundType" | "backgroundValue" | "fontFamily" | "primaryColor" | "secondaryColor" | "cardBackground" | "cardBorderColor" | "textColor" | "mutedTextColor" | "linkStyle" | "animationType" | "backgroundImageUrl"> = {
  isPreset: true as const,
  isActive: false as const,
  mode: "dark" as const,
  backgroundAngle: "160deg",
  overlayColor: "#000000",
  overlayOpacity: "0",
  fontScale: "100",
  fontWeight: "500",
  letterSpacing: "0",
  radius: "auto",
  buttonSize: "md",
  borderWidth: "1px",
  shadowStrength: "medium",
  hoverEffect: "lift",
  containerWidth: "540px",
  alignment: "center",
  density: "normal",
  glow: "false",
  glowColor: "#533fd6",
  blur: "12px",
  noise: "false",
};

export const PRESETS: ThemePreset[] = [
  // ── 1. Aurora (animated, the flagship) ──────────────────────────────
  {
    ...base,
    name: "Aurora",
    backgroundType: "aurora",
    backgroundValue: "#0a0820",
    fontFamily: "inter",
    primaryColor: "#7c5ff0",
    secondaryColor: "#a78bfa",
    cardBackground: "rgba(20,17,46,0.55)",
    cardBorderColor: "rgba(167,139,250,0.18)",
    textColor: "#eceafe",
    mutedTextColor: "#a39ec9",
    linkStyle: "glass",
    animationType: "lift",
    isActive: true,
  },
  // ── 2. Glassmorphism ────────────────────────────────────────────────
  {
    ...base,
    name: "Glassmorphism",
    backgroundType: "mesh",
    backgroundValue: "#6366f1,#ec4899,#0f172a",
    backgroundAngle: "radial",
    fontFamily: "dm-sans",
    primaryColor: "#818cf8",
    secondaryColor: "#f472b6",
    cardBackground: "rgba(255,255,255,0.12)",
    cardBorderColor: "rgba(255,255,255,0.18)",
    textColor: "#f1f5f9",
    mutedTextColor: "#94a3b8",
    linkStyle: "glass",
    animationType: "lift",
    radius: "16px",
    blur: "20px",
  },
  // ── 3. Neon Cyberpunk ───────────────────────────────────────────────
  {
    ...base,
    name: "Neon Cyberpunk",
    backgroundType: "solid",
    backgroundValue: "#0d0221",
    fontFamily: "jetbrains",
    primaryColor: "#00f0ff",
    secondaryColor: "#ff006e",
    cardBackground: "rgba(13,2,33,0.6)",
    cardBorderColor: "rgba(0,240,255,0.3)",
    textColor: "#e0e0ff",
    mutedTextColor: "#8585a3",
    linkStyle: "neon",
    animationType: "scale",
    radius: "4px",
    glow: "true",
    glowColor: "#00f0ff",
    hoverEffect: "glow",
    fontWeight: "600",
  },
  // ── 4. Editorial Paper ──────────────────────────────────────────────
  {
    ...base,
    mode: "light",
    name: "Editorial Paper",
    backgroundType: "solid",
    backgroundValue: "#faf9f6",
    fontFamily: "playfair",
    primaryColor: "#1a1a1a",
    secondaryColor: "#8b7355",
    cardBackground: "#ffffff",
    cardBorderColor: "#e5e0d5",
    textColor: "#1a1a1a",
    mutedTextColor: "#6b6b6b",
    linkStyle: "sharp",
    animationType: "lift",
    radius: "0px",
    borderWidth: "0px",
    shadowStrength: "subtle",
    buttonSize: "lg",
    fontScale: "110",
    fontWeight: "400",
  },
  // ── 5. Terminal Mono ────────────────────────────────────────────────
  {
    ...base,
    name: "Terminal Mono",
    backgroundType: "solid",
    backgroundValue: "#0c0c0c",
    fontFamily: "jetbrains",
    primaryColor: "#00ff41",
    secondaryColor: "#00ff41",
    cardBackground: "rgba(0,255,65,0.04)",
    cardBorderColor: "rgba(0,255,65,0.2)",
    textColor: "#00ff41",
    mutedTextColor: "#5da669",
    linkStyle: "sharp",
    animationType: "none",
    radius: "0px",
    borderWidth: "1px",
    buttonSize: "sm",
    fontWeight: "400",
    letterSpacing: "0.5",
    hoverEffect: "none",
  },
  // ── 6. Pastel Soft ──────────────────────────────────────────────────
  {
    ...base,
    mode: "light",
    name: "Pastel Soft",
    backgroundType: "gradient",
    backgroundValue: "#fce7f3,#e0e7ff",
    backgroundAngle: "135deg",
    fontFamily: "poppins",
    primaryColor: "#db2777",
    secondaryColor: "#a78bfa",
    cardBackground: "rgba(255,255,255,0.7)",
    cardBorderColor: "rgba(236,72,153,0.15)",
    textColor: "#475569",
    mutedTextColor: "#64748b",
    linkStyle: "pill",
    animationType: "scale",
    radius: "9999px",
    shadowStrength: "soft",
    fontWeight: "500",
  },
  // ── 7. Brutalist ────────────────────────────────────────────────────
  {
    ...base,
    mode: "light",
    name: "Brutalist",
    backgroundType: "solid",
    backgroundValue: "#fbbf24",
    fontFamily: "space-grotesk",
    primaryColor: "#000000",
    secondaryColor: "#000000",
    cardBackground: "#ffffff",
    cardBorderColor: "#000000",
    textColor: "#000000",
    mutedTextColor: "#451a03",
    linkStyle: "sharp",
    animationType: "lift",
    radius: "0px",
    borderWidth: "3px",
    shadowStrength: "none",
    buttonSize: "lg",
    fontWeight: "700",
    letterSpacing: "0.5",
    hoverEffect: "glow",
    glow: "true",
    glowColor: "#000000",
  },
  // ── 8. Retro Sunset ─────────────────────────────────────────────────
  {
    ...base,
    name: "Retro Sunset",
    backgroundType: "gradient",
    backgroundValue: "#2d1b69,#c2185b,#f9a825",
    backgroundAngle: "180deg",
    fontFamily: "bebas",
    primaryColor: "#ffd54f",
    secondaryColor: "#ff6f00",
    cardBackground: "rgba(0,0,0,0.3)",
    cardBorderColor: "rgba(255,213,79,0.3)",
    textColor: "#fff8e1",
    mutedTextColor: "#ffe082",
    linkStyle: "pill",
    animationType: "lift",
    radius: "8px",
    glow: "true",
    glowColor: "#ffd54f",
    fontWeight: "400",
    fontScale: "120",
  },
  // ── 9. Minimal Light ────────────────────────────────────────────────
  {
    ...base,
    mode: "light",
    name: "Minimal Light",
    backgroundType: "solid",
    backgroundValue: "#ffffff",
    fontFamily: "outfit",
    primaryColor: "#2563eb",
    secondaryColor: "#2563eb",
    cardBackground: "#ffffff",
    cardBorderColor: "#e5e7eb",
    textColor: "#111827",
    mutedTextColor: "#6b7280",
    linkStyle: "outline",
    animationType: "lift",
    radius: "12px",
    borderWidth: "1px",
    shadowStrength: "subtle",
    hoverEffect: "lift",
    fontWeight: "500",
  },
  // ── 10. 8-Bit Retro ──────────────────────────────────────────────────
  // Pixel-perfect retro gaming aesthetic. Press Start 2P font, stepped
  // clip-path corners, hard 0-blur shadows. Light mode matching the
  // ReactBits 8-bit template: white bg, near-black text, orange accent.
  // Card borders are orange so accent color dominates the visual.
  {
    ...base,
    mode: "light",
    name: "8-Bit Retro",
    backgroundType: "solid",
    backgroundValue: "#ffffff",
    fontFamily: "press-start",
    primaryColor: "#ea580c",
    secondaryColor: "#0a0a0a",
    cardBackground: "#ffffff",
    cardBorderColor: "#ea580c",
    textColor: "#0a0a0a",
    mutedTextColor: "#737373",
    linkStyle: "pixel",
    animationType: "lift",
    radius: "0px",
    borderWidth: "3px",
    shadowStrength: "none",
    hoverEffect: "lift",
    glow: "false",
    glowColor: "#ea580c",
    blur: "0px",
    fontWeight: "400",
    fontScale: "75",
    letterSpacing: "0",
    buttonSize: "md",
    containerWidth: "480px",
  },
];

/** Human-readable list of preset names (for test output + seed log). */
export const PRESET_NAMES = PRESETS.map((p) => p.name);
