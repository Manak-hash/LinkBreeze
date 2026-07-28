import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { UPLOADS_DIR, ensureUploadsDir } from "@/lib/uploads";

/**
 * Auto-favicon: fetches a site's favicon via Google's S2 favicon service
 * and caches it locally in the uploads directory.
 *
 * Flow: URL → extract domain → fetch s2 favicon → hash → save to disk →
 * return local /api/uploads/<hash>.png path.
 *
 * Google's S2 service (https://www.google.com/s2/favicons?domain=X&sz=64)
 * is a reliable, rate-limit-free proxy that fetches favicons from any
 * domain and returns a PNG. We cache the result locally so we never
 * re-fetch the same domain.
 */

const S2_URL = (domain: string, size: number) =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;

const FAVICON_SIZE = 64;
const FETCH_TIMEOUT_MS = 5_000;

/**
 * Extract the hostname from a URL string.
 * Returns null for non-HTTP(s) links (mailto, tel, etc.).
 */
export function extractDomain(url: string): string | null {
  try {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return null;
    }
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * Fetch a favicon for a domain and cache it locally.
 * Returns the local URL path (/api/uploads/<hash>.png) or null if the
 * fetch failed.
 *
 * The file is stored with a content-hash filename so repeated fetches for
 * the same domain are a no-op (the file already exists).
 */
export async function fetchAndCacheFavicon(url: string): Promise<string | null> {
  const domain = extractDomain(url);
  if (!domain) return null;

  // Content-hash the domain for a stable filename.
  const hash = crypto.createHash("sha256").update(domain).digest("hex").slice(0, 16);
  const ext = ".png";
  const filename = `favicon-${hash}${ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);

  // Cache hit: file already exists, no fetch needed.
  try {
    await fs.access(filepath);
    return `/api/uploads/${filename}`;
  } catch {
    // File doesn't exist — proceed to fetch.
  }

  await ensureUploadsDir();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(S2_URL(domain, FAVICON_SIZE), {
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length === 0) return null;

    await fs.writeFile(filepath, buffer);
    return `/api/uploads/${filename}`;
  } catch {
    // Network error, timeout, write failure — all silently fail.
    // The caller falls back to the first-letter avatar.
    return null;
  }
}
