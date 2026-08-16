/**
 * Client-safe QR style types + pure helpers. No server-only imports here —
 * both the settings UI and the server generator use this module.
 */
import { z } from "zod";

/** Default QR look — matches the pre-1.3 hard-coded style. */
export const DEFAULT_QR_DARK = "#0f0f1a";
export const DEFAULT_QR_LIGHT = "#ffffff";

export type QrLogoChoice = "none" | "avatar" | "favicon";

export const QR_HEX_RE = /^#[0-9a-fA-F]{6}$/;

export const qrStyleSchema = z.object({
  fg: z.string().regex(QR_HEX_RE).catch(DEFAULT_QR_DARK),
  bg: z.string().regex(QR_HEX_RE).catch(DEFAULT_QR_LIGHT),
  logo: z.enum(["none", "avatar", "favicon"]).catch("none"),
  size: z.coerce.number().int().min(64).max(1024).catch(256),
});

export type QrStyle = z.infer<typeof qrStyleSchema>;

export function defaultQrStyle(): QrStyle {
  return { fg: DEFAULT_QR_DARK, bg: DEFAULT_QR_LIGHT, logo: "none", size: 256 };
}

/**
 * Resolve a stored `pages.qr_settings` JSON blob into a valid QrStyle.
 * Absent, malformed or garbage values all fall back per-field to defaults —
 * the same shared-resolver pattern as the analytics retention setting.
 */
export function parseQrStyle(raw: string | null | undefined): QrStyle {
  if (!raw) return defaultQrStyle();
  try {
    return qrStyleSchema.parse(JSON.parse(raw));
  } catch {
    return defaultQrStyle();
  }
}

/** Serialize a style for storage in `pages.qr_settings`. */
export function serializeQrStyle(style: QrStyle): string {
  return JSON.stringify({
    fg: style.fg.toLowerCase(),
    bg: style.bg.toLowerCase(),
    logo: style.logo,
    size: style.size,
  });
}

/** True when a logo should be embedded (drives ECC level + quiet zone). */
export function hasLogo(style: QrStyle): boolean {
  return style.logo !== "none";
}

/** ECC M without a logo; ECC H with one — the logo occludes modules, H recovers. */
export function eccLevelFor(style: QrStyle): "M" | "H" {
  return hasLogo(style) ? "H" : "M";
}
