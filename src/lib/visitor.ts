import "server-only";
import * as crypto from "crypto";

const DEFAULT_SECRET = "linkbreeze-dev-secret-key-change-me-in-production-please";

function getSecret(): string {
  const key = process.env.SECRET_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "\x1b[33m%s\x1b[0m",
        "[LinkBreeze] WARNING: SECRET_KEY is not set. " +
          "Visitor hashes are predictable. " +
          "Set SECRET_KEY to a random string (e.g. `openssl rand -hex 32`).",
      );
    }
    return DEFAULT_SECRET;
  }
  return key;
}

/**
 * Daily salt — a deterministic per-day secret derived from the current UTC
 * date and the app secret. Combined with IP + user-agent it produces a
 * privacy-preserving visitor hash that is stable within a single day but
 * rotates daily.
 */
export function getDailySalt(date = new Date()): string {
  const dayKey = date.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  return crypto
    .createHash("sha256")
    .update(dayKey + ":" + getSecret())
    .digest("hex");
}

/**
 * Compute a stable, privacy-preserving visitor hash from the client IP and
 * user-agent. Returns the first 16 hex characters of the SHA-256 digest.
 */
export function getVisitorHash(ip: string, userAgent: string): string {
  const salt = getDailySalt();
  const raw = `${ip}|${userAgent}|${salt}`;
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

/**
 * Best-effort device type detection from a user-agent string.
 */
export function getDeviceType(
  userAgent: string,
): "mobile" | "desktop" | "tablet" {
  const ua = (userAgent || "").toLowerCase();
  if (/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    return "tablet";
  }
  if (
    /(iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|mobile)/i.test(
      ua,
    )
  ) {
    return "mobile";
  }
  return "desktop";
}
