import path from "node:path";
import fs from "node:fs/promises";

/**
 * Uploaded assets are stored on the local filesystem under UPLOADS_DIR (env:
 * `UPLOAD_DIR`, default `./data/uploads`) — the same persistent, writable
 * volume as the SQLite DB. Swap for object storage later without touching the
 * action/route contracts.
 */
export const UPLOADS_DIR = path.resolve(process.env.UPLOAD_DIR || "./data/uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export function contentTypeFor(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
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
  const resolved = path.resolve(UPLOADS_DIR, clean);
  if (resolved !== UPLOADS_DIR && !resolved.startsWith(UPLOADS_DIR + path.sep)) {
    return null;
  }
  return resolved;
}
