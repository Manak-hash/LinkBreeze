import "server-only";
import * as QRCode from "qrcode";
import { readFile } from "node:fs/promises";
import { safeUploadPath, contentTypeFor } from "@/lib/uploads";
import {
  type QrStyle,
  defaultQrStyle,
  hasLogo,
  eccLevelFor,
} from "@/lib/qr-style";

export {
  DEFAULT_QR_DARK,
  DEFAULT_QR_LIGHT,
  type QrLogoChoice,
  type QrStyle,
  qrStyleSchema,
  defaultQrStyle,
  parseQrStyle,
  serializeQrStyle,
  hasLogo,
  eccLevelFor,
} from "@/lib/qr-style";

/** Logo box as a fraction of the full QR width (incl. quiet zone). */
const LOGO_FRACTION = 0.22;

function qrOptions(style: QrStyle) {
  return {
    margin: hasLogo(style) ? 2 : 1,
    errorCorrectionLevel: eccLevelFor(style) as "M" | "H",
    color: { dark: `${style.fg}FF`, light: `${style.bg}FF` },
  };
}

// ── Logo loading ─────────────────────────────────────────────────────────

/**
 * Load a logo referenced by an /api/uploads path (or passthrough data URI)
 * from the local uploads dir. Returns null for anything else — we never
 * fetch remote URLs from a render path (SSRF + latency).
 */
async function readLogo(
  logoUrl: string,
): Promise<{ buf: Buffer; mime: string } | null> {
  if (logoUrl.startsWith("data:")) {
    const m = logoUrl.match(/^data:([^;,]+);base64,([\s\S]+)$/);
    if (!m) return null;
    return { buf: Buffer.from(m[2], "base64"), mime: m[1] };
  }
  if (logoUrl.startsWith("/api/uploads/")) {
    const name = decodeURIComponent(logoUrl.slice("/api/uploads/".length));
    const resolved = safeUploadPath(name);
    if (!resolved) return null;
    try {
      const buf = await readFile(resolved);
      return { buf, mime: contentTypeFor(name) };
    } catch {
      return null;
    }
  }
  return null;
}

async function logoDataUri(logoUrl: string): Promise<string | null> {
  const logo = await readLogo(logoUrl);
  if (!logo) return null;
  return `data:${logo.mime};base64,${logo.buf.toString("base64")}`;
}

// ── SVG ──────────────────────────────────────────────────────────────────

/**
 * Overlay a circular-clipped logo onto the qrcode library's SVG output.
 * Works in viewBox units so the download scales cleanly.
 */
function embedLogoInSvg(svg: string, dataUri: string, bg: string): string {
  const m = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
  if (!m) return svg;
  const n = parseFloat(m[1]);
  const c = n / 2;
  const r = (n * LOGO_FRACTION) / 2;
  const ringR = r + Math.max(n * 0.008, 0.5);
  const clipId = `qr-logo-${Math.random().toString(36).slice(2, 8)}`;
  const overlay =
    `<circle cx="${c}" cy="${c}" r="${ringR.toFixed(2)}" fill="${bg}"/>` +
    `<defs><clipPath id="${clipId}"><circle cx="${c}" cy="${c}" r="${r.toFixed(2)}"/></clipPath></defs>` +
    `<image href="${dataUri}" x="${(c - r).toFixed(2)}" y="${(c - r).toFixed(2)}" ` +
    `width="${(r * 2).toFixed(2)}" height="${(r * 2).toFixed(2)}" ` +
    `preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>`;
  const close = svg.lastIndexOf("</svg>");
  if (close === -1) return svg;
  return svg.slice(0, close) + overlay + svg.slice(close);
}

/**
 * Generate an inline SVG string for the given URL. With a logo choice the
 * logo is embedded as a base64 data URI so the downloaded file is fully
 * self-contained.
 */
export async function generateQrSvg(
  url: string,
  style: QrStyle = defaultQrStyle(),
  logoUrl?: string | null,
): Promise<string> {
  const svg = await QRCode.toString(url, {
    type: "svg",
    ...qrOptions(style),
  });
  if (!hasLogo(style) || !logoUrl) return svg;
  const uri = await logoDataUri(logoUrl);
  if (!uri) return svg;
  return embedLogoInSvg(svg, uri, style.bg);
}

// ── PNG ──────────────────────────────────────────────────────────────────

/**
 * Generate a PNG buffer for the given URL at the requested pixel size.
 * With a logo, the QR is composited with a circular-clipped logo (sharp),
 * falling back to the plain QR if sharp cannot process the input.
 */
export async function generateQrPng(
  url: string,
  style: QrStyle = defaultQrStyle(),
  logoUrl?: string | null,
): Promise<Buffer> {
  const qr = await QRCode.toBuffer(url, {
    type: "png",
    width: style.size,
    ...qrOptions(style),
  });
  if (!hasLogo(style) || !logoUrl) return qr;

  const logo = await readLogo(logoUrl);
  if (!logo) return qr;

  const box = Math.round(style.size * LOGO_FRACTION);
  const pad = Math.max(Math.round(style.size * 0.008), 2);
  const left = Math.round((style.size - box) / 2);

  try {
    const { default: sharp } = await import("sharp");
    const mask = Buffer.from(
      `<svg width="${box}" height="${box}"><circle cx="${box / 2}" cy="${box / 2}" r="${box / 2}" fill="#fff"/></svg>`,
    );
    const disc = Buffer.from(
      `<svg width="${box + pad * 2}" height="${box + pad * 2}"><circle cx="${(box + pad * 2) / 2}" cy="${(box + pad * 2) / 2}" r="${(box + pad * 2) / 2 - 1}" fill="${style.bg}"/></svg>`,
    );
    const circularLogo = await sharp(logo.buf)
      .resize(box, box, { fit: "cover", position: "centre" })
      .composite([{ input: mask, blend: "dest-in" }])
      .png()
      .toBuffer();
    return await sharp(qr)
      .composite([
        { input: disc, left: left - pad, top: left - pad },
        { input: circularLogo, left, top: left },
      ])
      .png()
      .toBuffer();
  } catch (err) {
    console.warn("[qr] logo composite failed, returning plain QR", err);
    return qr;
  }
}
