import path from "node:path";
import fs from "node:fs/promises";

/**
 * Uploaded assets are stored on the local filesystem under UPLOADS_DIR (env:
 * `UPLOAD_DIR`, default `./data/uploads`) — the same persistent, writable
 * volume as the SQLite DB. Swap for object storage later without touching the
 * action/route contracts.
 */
export const UPLOADS_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || "./data/uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

export function contentTypeFor(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
}

/**
 * Sniff the true format of an uploaded font file. woff2 starts with "wOF2"
 * and woff (v1) starts with "wOFF" (magic bytes at offset 0). Extension and
 * declared MIME type are cosmetic on the client — the bytes decide.
 */
export function sniffFontFormat(buf: Buffer): "woff2" | "woff" | null {
  if (buf.length >= 4) {
    if (buf[0] === 0x77 && buf[1] === 0x4f && buf[2] === 0x46 && buf[3] === 0x32) {
      return "woff2"; // "wOF2"
    }
    if (buf[0] === 0x77 && buf[1] === 0x4f && buf[2] === 0x46 && buf[3] === 0x46) {
      return "woff"; // "wOFF"
    }
  }
  return null;
}

export async function ensureUploadsDir(): Promise<void> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

/**
 * Resolve a filename to an absolute path inside UPLOADS_DIR, rejecting any
 * traversal attempt. Returns null for unsafe input.
 */
export function safeUploadPath(filename: string): string | null {
  const clean = path.basename(filename);
  if (!clean || clean === "." || clean === "..") return null;
  const resolved = path.resolve(/*turbopackIgnore: true*/ UPLOADS_DIR, clean);
  if (resolved !== UPLOADS_DIR && !resolved.startsWith(UPLOADS_DIR + path.sep)) {
    return null;
  }
  return resolved;
}
