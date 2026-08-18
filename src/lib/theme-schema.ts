import { z } from "zod";

/**
 * Theme validation schema — the single source of truth for what the
 * customizeActiveTheme server action accepts.
 *
 * Extracted from src/server/actions/theme.ts so the schema can be imported
 * by tests without dragging in the "use server" / next/cache runtime.
 * The server action re-exports this as `customSchema`.
 */

const colorRegex = /^#[0-9a-fA-F]{3,8}$/;

/** Accept CSS color strings: hex, rgba(), rgb(), transparent */
export const cssColor = z
  .string()
  .max(60)
  .refine(
    (v) =>
      colorRegex.test(v) ||
      v.startsWith("rgba(") ||
      v.startsWith("rgb(") ||
      v === "transparent" ||
      v === "none",
    "Invalid color",
  );

export const customSchema = z.object({
  // Background
  backgroundType: z
    .enum([
      "solid",
      "gradient",
      "pattern",
      "aurora",
      "radial",
      "mesh",
      "image",
      "animatedGradient",
      "video",
      "gif",
    ])
    .optional(),
  backgroundValue: z.string().max(500).optional(),
  backgroundAngle: z.string().max(20).optional(),
  backgroundImageUrl: z.string().max(2000).optional(),
  backgroundFit: z.enum(["cover", "contain", "tile"]).optional(),
  backgroundPosition: z
    .string()
    .max(20)
    .regex(/^\s*-?\d+(\.\d+)?%\s+-?\d+(\.\d+)?%\s*$/, "Invalid position")
    .optional(),
  overlayColor: cssColor.optional(),
  overlayOpacity: z.string().max(10).optional(),
  // Colors
  primaryColor: cssColor.optional(),
  secondaryColor: cssColor.optional(),
  cardBackground: z.string().max(60).optional(),
  cardBorderColor: z.string().max(60).optional(),
  textColor: cssColor.optional(),
  mutedTextColor: cssColor.optional(),
  mode: z.enum(["light", "dark"]).optional(),
  // Typography
  // fontFamily accepts a bundled id ("inter"), an uploaded font ref
  // ("custom:<id>", validated in the action), or legacy raw CSS from old rows.
  fontFamily: z.string().max(100).optional(),
  fontScale: z.string().max(10).optional(),
  fontWeight: z.string().max(10).optional(),
  letterSpacing: z.string().max(10).optional(),
  // Card
  linkStyle: z
    .enum(["pill", "rounded", "sharp", "glass", "outline", "neon", "pixel", "gel"])
    .optional(),
  animationType: z.enum(["lift", "scale", "none", "fade-up", "slide-in", "zoom-in", "blur-in"]).optional(),
  radius: z.string().max(20).optional(),
  buttonSize: z.enum(["sm", "md", "lg"]).optional(),
  borderWidth: z.string().max(20).optional(),
  shadowStrength: z
    .enum(["none", "subtle", "soft", "medium", "strong"])
    .optional(),
  hoverEffect: z.enum(["lift", "scale", "glow", "none"]).optional(),
  // Layout
  containerWidth: z.string().max(20).optional(),
  alignment: z.enum(["left", "center", "right"]).optional(),
  density: z.enum(["compact", "normal", "relaxed"]).optional(),
  // Effects
  glow: z.enum(["true", "false"]).optional(),
  glowColor: cssColor.optional(),
  blur: z.string().max(20).optional(),
  noise: z.enum(["true", "false"]).optional(),
  // Profile styling (1.3)
  avatarShape: z.enum(["circle", "squircle", "rounded", "square"]).optional(),
  avatarBorder: z.enum(["solid", "gradient", "glow", "ring", "none"]).optional(),
  avatarFloat: z.enum(["true", "false"]).optional(),
  profileLayout: z.enum(["classic", "hero", "banner"]).optional(),
  textAnimation: z.enum(["none", "typewriter", "gradient-flow"]).optional(),
});
