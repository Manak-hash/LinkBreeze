/**
 * Custom theme fonts (#82) — pure helpers shared by the server (public page
 * style block, export/import) and the admin customizer (live preview).
 *
 * A custom font is a woff2/woff file uploaded from the theme customizer,
 * stored in the uploads dir, tracked in the custom_fonts table. Themes
 * reference it via themes.font_family = "custom:<id>" and the resolver
 * (theme-tokens.ts) maps that to the family "LB Custom <id>".
 *
 * Rendering an uploaded font needs an @font-face rule, which next/font
 * cannot generate at runtime — so the public page injects it alongside the
 * theme token block, and the admin live preview injects the same string
 * client-side. This module is import-pure (no server-only imports) by
 * design, mirroring theme-tokens.ts.
 */

/** Themes store this identifier in fontFamily for an uploaded font. */
export const CUSTOM_FONT_PREFIX = "custom:";

export interface CustomFontMeta {
  id: number;
  name: string;
  family: string;
  filename: string;
  url: string;
  sizeBytes: number;
  format: string;
}

/** True when a theme's fontFamily references an uploaded custom font. */
export function isCustomFontId(fontFamily: string | null | undefined): boolean {
  if (!fontFamily) return false;
  return fontFamily.trim().toLowerCase().startsWith(CUSTOM_FONT_PREFIX);
}

/** Parse "custom:12" → 12 (null when malformed). */
export function parseCustomFontId(fontFamily: string | null | undefined): number | null {
  if (!fontFamily) return null;
  const key = fontFamily.trim().toLowerCase();
  if (!key.startsWith(CUSTOM_FONT_PREFIX)) return null;
  const id = Number(key.slice(CUSTOM_FONT_PREFIX.length));
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** The DB-side family value for a custom-font row ("LB Custom 12"). */
export function customFontFamily(id: number): string {
  return `LB Custom ${id}`;
}

/** How heavy an uploaded font is compared to the bundled latin subsets. */
export function fontWeightHint(sizeBytes: number): string | null {
  // Bundled latin subsets run 8-75 KB; most are under 50 KB.
  if (sizeBytes > 250 * 1024) {
    return "This font is much heavier than the bundled ones — every visitor downloads it before text renders.";
  }
  if (sizeBytes > 120 * 1024) {
    return "This font is heavier than the bundled ones; expect a slightly slower first paint.";
  }
  return null;
}

/**
 * Build the @font-face CSS for a custom font.
 * `url` is the uploads URL (/api/uploads/<hex>.woff2) — same-origin, so the
 * existing CSP (font-src 'self') serves it without any policy change.
 */
export function buildFontFaceCss(font: {
  family: string;
  url: string;
  format: string;
}): string {
  const fmt = font.format === "woff" ? "woff" : "woff2";
  return [
    "@font-face {",
    `  font-family: '${font.family.replace(/'/g, "")}';`,
    "  font-style: normal;",
    // Variable fonts respond to any weight; static files synthesize.
    "  font-weight: 100 900;",
    "  font-display: swap;",
    `  src: url('${font.url}') format('${fmt}');`,
    "}",
  ].join("\n");
}

/** Font-family stack for a custom font, matching FONT_REGISTRY's shape. */
export function customFontStack(family: string): string {
  return `'${family}', sans-serif`;
}
