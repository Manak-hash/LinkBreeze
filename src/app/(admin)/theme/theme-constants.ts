import * as React from "react";
import type { ThemeRow } from "@/server/queries";

// ─── Constant option arrays ───────────────────────────────────────────────

export const FONT_OPTIONS = [
  { id: "inter", label: "Inter", sample: "Aa" },
  { id: "poppins", label: "Poppins", sample: "Aa" },
  { id: "playfair", label: "Playfair Display", sample: "Aa" },
  { id: "jetbrains", label: "JetBrains Mono", sample: "Aa" },
  { id: "space-grotesk", label: "Space Grotesk", sample: "Aa" },
  { id: "dm-sans", label: "DM Sans", sample: "Aa" },
  { id: "lora", label: "Lora", sample: "Aa" },
  { id: "bebas", label: "Bebas Neue", sample: "Aa" },
  { id: "sora", label: "Sora", sample: "Aa" },
  { id: "outfit", label: "Outfit", sample: "Aa" },
];

export const BG_TYPES = [
  { value: "solid", label: "Solid" },
  { value: "gradient", label: "Gradient" },
  { value: "radial", label: "Radial" },
  { value: "mesh", label: "Mesh" },
  { value: "aurora", label: "Aurora" },
  { value: "animatedGradient", label: "Animated Gradient" },
  { value: "image", label: "Image" },
  { value: "pattern", label: "Pattern" },
];

export const LINK_STYLES = [
  { value: "pill", label: "Pill" },
  { value: "rounded", label: "Rounded" },
  { value: "sharp", label: "Sharp" },
  { value: "glass", label: "Glass" },
  { value: "outline", label: "Outline" },
  { value: "neon", label: "Neon" },
];

export const SHADOW_STRENGTHS = [
  { value: "none", label: "None" },
  { value: "subtle", label: "Subtle" },
  { value: "soft", label: "Soft" },
  { value: "medium", label: "Medium" },
  { value: "strong", label: "Strong" },
];

export const HOVER_EFFECTS = [
  { value: "lift", label: "Lift" },
  { value: "scale", label: "Scale" },
  { value: "glow", label: "Glow" },
  { value: "none", label: "None" },
];

export const BACKGROUND_ANGLES = [
  { value: "90deg", label: "90° (horizontal)" },
  { value: "135deg", label: "135° (diagonal)" },
  { value: "160deg", label: "160° (steep)" },
  { value: "180deg", label: "180° (vertical)" },
  { value: "radial", label: "Radial" },
];

export const FONT_WEIGHTS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
];

export const BUTTON_SIZES = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

export const ALIGNMENTS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

export const DENSITIES = [
  { value: "compact", label: "Compact" },
  { value: "normal", label: "Normal" },
  { value: "relaxed", label: "Relaxed" },
];

export const REVEAL_ANIMATIONS = [
  { value: "lift", label: "Lift (rise up)" },
  { value: "scale", label: "Scale (grow in)" },
  { value: "none", label: "None" },
];

export const MODE_OPTIONS = [
  { value: "dark", label: "🌙 Dark" },
  { value: "light", label: "☀️ Light" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

export function swatchFor(theme: ThemeRow): React.CSSProperties {
  const parts = theme.backgroundValue?.split(",") ?? [];
  if (theme.backgroundType === "solid") return { background: parts[0] || "#0a0820" };
  if (theme.backgroundType === "aurora") return { background: "#0a0820" };
  if (theme.backgroundType === "mesh" || parts.length >= 3) {
    return { background: `linear-gradient(135deg, ${theme.backgroundValue})` };
  }
  return {
    background: `linear-gradient(135deg, ${theme.backgroundValue})`,
  };
}
