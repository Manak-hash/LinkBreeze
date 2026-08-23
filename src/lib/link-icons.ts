import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { UPLOADS_DIR, ensureUploadsDir } from "@/lib/uploads";
import { isLucideIconName } from "@/lib/icon-registry";

/**
 * Per-link icon system (#91).
 *
 * Three modes stored on each link row:
 *   auto   — favicon fetched at save time, letter fallback (pre-#91 behavior)
 *   lucide — operator picked a lucide icon; dashed name lives in links.icon
 *   custom — operator uploaded an image; URL lives in links.custom_icon_url
 *
 * Uploaded icons are validated by magic bytes (extension and declared MIME
 * are client-side cosmetics), capped at 512 KB, and stored in the uploads
 * dir under a content-hash filename — same conventions as cached favicons
 * and custom fonts. SVG uploads are sanitized: scripts, event handlers,
 * foreignObject, and external references are stripped before storage.
 */

export type IconMode = "auto" | "lucide" | "custom";

export const ICON_UPLOAD_MAX_BYTES = 512 * 1024;

/** Magic-byte sniffing for allowed icon formats. */
export function sniffIconFormat(buf: Buffer): "png" | "jpg" | "gif" | "webp" | "ico" | "svg" | null {
  if (buf.length < 12) return null;
  // PNG: 89 50 4E 47 0D 0A 1B 0A
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  // GIF: GIF87a / GIF89a
  if (buf.slice(0, 4).toString("latin1") === "GIF8") return "gif";
  // WebP: RIFF....WEBP
  if (
    buf.slice(0, 4).toString("latin1") === "RIFF" &&
    buf.slice(8, 12).toString("latin1") === "WEBP"
  ) {
    return "webp";
  }
  // ICO: 00 00 01 00
  if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00) return "ico";
  // SVG: text format sniffed below the binary set ("<?xml", "<svg", "<!--")
  if (buf[0] === 0x3c) {
    const head = buf.slice(0, 512).toString("utf8").trimStart().toLowerCase();
    if (head.startsWith("<?xml") || head.startsWith("<svg") || head.startsWith("<!--")) return "svg";
  }
  return null;
}

// ─── SVG sanitizer ─────────────────────────────────────────────────────
//
// Hand-rolled allow-list sanitizer for a constrained input: operator-
// uploaded icon SVGs, max 512 KB, served same-origin with
// `Content-Security-Policy: default-src 'none'` and loaded via <img>
// (where browsers never execute scripts regardless). Layers:
//   1. reject doctype / CDATA / processing-instruction tricks outright
//   2. allow-list elements; disallowed elements AND their content vanish
//   3. rebuild allowed tags attribute-by-attribute (deny on*, href/src
//      outside "#fragment", style with url()/expression())
// Byte scanning (no DOM parser) keeps it dependency-free and linear.

/** Elements permitted inside an uploaded icon SVG. */
const SVG_ALLOWED_TAGS = new Set([
  "svg", "g", "defs", "title", "desc", "symbol", "use", "clippath", "mask",
  "lineargradient", "radialgradient", "stop", "pattern", "filter", "path",
  "rect", "circle", "ellipse", "line", "polyline", "polygon", "text", "tspan",
  "textpath", "image", "animate", "animatetransform", "animatemotion", "set",
  "mpath",
]);

/** Attribute names denied by prefix (event handlers, embedded scripts). */
const DENIED_ATTR_PREFIXES = ["on"];

function isSafeAttr(name: string, value: string): boolean {
  if (DENIED_ATTR_PREFIXES.some((p) => name.startsWith(p))) return false;

  if (name === "href" || name === "xlink:href" || name === "src") {
    // Same-document fragment references only (e.g. <use href="#shape">).
    return value.startsWith("#") && !value.toLowerCase().includes("javascript:");
  }

  if (name === "style") {
    return !/(url\(|@import|expression\(|javascript:)/i.test(value);
  }

  // Overlong values have no place in a 20px icon.
  return value.length <= 512;
}

interface OpenElement {
  name: string;
  allowed: boolean;
}

/**
 * Sanitize an SVG icon. Returns the cleaned markup, or null when nothing
 * safe remains (no <svg> root, doctype/CDATA tricks, unterminated tags).
 */
export function sanitizeSvgIcon(svgText: string): string | null {
  const text = svgText.trim();
  if (!text || text.length > ICON_UPLOAD_MAX_BYTES) return null;

  // Parser-differential defense: reject structural noise outright.
  if (/<!doctype/i.test(text)) return null;
  if (/<\?\s*xml-stylesheet/i.test(text)) return null;

  let out = "";
  let i = 0;
  let sawSvgRoot = false;
  let suppressed = 0; // open disallowed elements at current position
  const stack: OpenElement[] = [];

  while (i < text.length) {
    const open = text.indexOf("<", i);
    if (open === -1) {
      if (suppressed === 0) out += text.slice(i);
      break;
    }
    if (suppressed === 0 && open > i) out += text.slice(i, open);

    // Find the tag's ">" honoring quotes (attrs may contain ">").
    let j = open + 1;
    let quote: string | null = null;
    while (j < text.length) {
      const ch = text[j];
      if (quote) {
        if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'") {
        quote = ch;
      } else if (ch === ">") {
        break;
      }
      j += 1;
    }
    if (j >= text.length) return null; // unterminated tag
    const rawTag = text.slice(open, j + 1);

    if (rawTag.startsWith("<!--")) {
      i = j + 1;
      continue; // drop comments
    }
    if (rawTag.startsWith("<![") || rawTag.startsWith("<!")) return null; // CDATA / declarations
    if (rawTag.startsWith("<?")) {
      i = j + 1;
      continue; // drop processing instructions (incl. XML prolog)
    }

    const nameMatch = rawTag.match(/^<\s*\/?\s*([a-zA-Z][\w.:-]*)/);
    if (!nameMatch) return null; // unidentifiable construct — reject
    const name = nameMatch[1].toLowerCase();
    const isClose = rawTag.startsWith("</") || /^<\s*\//.test(rawTag);
    const isSelfClose = rawTag.endsWith("/>");
    const allowed = SVG_ALLOWED_TAGS.has(name);

    if (isClose) {
      // Pop until the matching open element; stray closers are ignored.
      let k = stack.length - 1;
      while (k >= 0 && stack[k].name !== name) k -= 1;
      if (k >= 0) {
        const closingAllowed = stack[k].allowed;
        for (let n = stack.length - 1; n >= k; n--) {
          if (!stack[n].allowed) suppressed = Math.max(0, suppressed - 1);
        }
        stack.length = k;
        // Only allowed elements ever had an open tag emitted — never emit
        // a close tag for a suppressed element (e.g. </script>).
        if (closingAllowed && suppressed === 0) out += `</${name}>`;
      }
      i = j + 1;
      continue;
    }

    if (!allowed) {
      // Disallowed element: drop it. Track its content so we can suppress
      // that too (e.g. <script>payload</script> leaves nothing behind).
      if (!isSelfClose) {
        stack.push({ name, allowed: false });
        suppressed += 1;
      }
      i = j + 1;
      continue;
    }

    // Rebuild the open tag from allow-listed attributes only.
    const attrText = rawTag.slice(nameMatch[0].length, isSelfClose ? -2 : -1);
    const kept: string[] = [];
    const attrRegex = /([a-zA-Z][\w.:-]*)\s*=\s*("([^"]*)"|'([^']*)')|([a-zA-Z][\w.:-]+)/g;
    let m: RegExpExecArray | null;
    while ((m = attrRegex.exec(attrText)) !== null) {
      if (m[1]) {
        // key="value" pair — keep the original attribute-name casing (SVG
        // is case-sensitive: viewBox), but run safety checks lowercased.
        const rawName = m[1];
        if (isSafeAttr(rawName.toLowerCase(), m[3] ?? m[4] ?? "")) {
          kept.push(`${rawName}="${(m[3] ?? m[4] ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`);
        }
      } else if (m[5]) {
        if (isSafeAttr(m[5].toLowerCase(), "")) kept.push(m[5]);
      }
    }

    if (suppressed === 0) {
      out += `<${name}${kept.length ? " " + kept.join(" ") : ""}${isSelfClose ? " /" : ""}>`;
      if (name === "svg") sawSvgRoot = true;
    }
    if (!isSelfClose) stack.push({ name, allowed: true });
    i = j + 1;
  }

  return sawSvgRoot ? out : null;
}

// ─── Upload storage ─────────────────────────────────────────────────────

/**
 * Validate + persist an uploaded icon file. Returns the serving URL
 * (/api/uploads/<hash>.<ext>) or an error code:
 *   too-large | bad-format | bad-svg
 */
export async function saveIconUpload(
  file: File,
): Promise<{ ok: true; url: string } | { ok: false; error: "too-large" | "bad-format" | "bad-svg" }> {
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length === 0) return { ok: false, error: "bad-format" };
  if (buf.length > ICON_UPLOAD_MAX_BYTES) return { ok: false, error: "too-large" };

  const format = sniffIconFormat(buf);
  if (!format) return { ok: false, error: "bad-format" };

  let finalBuf = buf;
  if (format === "svg") {
    const cleaned = sanitizeSvgIcon(buf.toString("utf8"));
    if (!cleaned) return { ok: false, error: "bad-svg" };
    finalBuf = Buffer.from(cleaned, "utf8");
  }

  const hash = crypto.createHash("sha256").update(finalBuf).digest("hex").slice(0, 16);
  const filename = `icon-${hash}.${format}`;
  await ensureUploadsDir();
  await fs.writeFile(path.join(UPLOADS_DIR, filename), finalBuf);
  return { ok: true, url: `/api/uploads/${filename}` };
}

/** True when a string resolves to a known lucide icon name (dashed). */
export function isLucideName(name: string | null | undefined): boolean {
  return isLucideIconName(name);
}
