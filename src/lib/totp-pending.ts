import * as crypto from "crypto";

/**
 * #5: signed token binding the TOTP login step to a (username, timestamp).
 * Pure crypto module — no "use server" (so it can export sync functions and
 * be unit-tested), no next/headers.
 *
 * The token proves "this browser authenticated with the correct password for
 * USERNAME at TS" without carrying any secret material. The TOTP step rejects
 * anything older than 5 minutes, so an abandoned halfway login can't be
 * completed later by someone else.
 */

function getHmacKey(): string {
  return (
    process.env.SECRET_KEY ||
    "linkbreeze-dev-secret-key-change-me-in-production-please"
  );
}

export function pendingToken(username: string, ts: number): string {
  const sig = crypto
    .createHmac("sha256", getHmacKey())
    .update(`pending:${username}:${ts}`)
    .digest("hex");
  return `${ts}.${sig}`;
}

export function verifyPendingToken(token: string, username: string): boolean {
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const ts = Number(token.slice(0, dot));
  const sig = token.slice(dot + 1);
  if (!Number.isFinite(ts) || Date.now() - ts > 5 * 60_000) return false;
  const expected = crypto
    .createHmac("sha256", getHmacKey())
    .update(`pending:${username}:${ts}`)
    .digest("hex");
  if (sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
