import "server-only";
import * as crypto from "crypto";
import { TOTP, Secret } from "otpauth";
import * as bcrypt from "bcryptjs";

/**
 * TOTP 2FA core — pure functions, NO next/headers imports (testable in vitest
 * node environment; server actions live in src/server/actions/two-factor.ts).
 *
 * Decisions locked in issue #5 planning (2026-09):
 *  - Library: otpauth (maintained, zero-dep)
 *  - Secret encrypted at rest with a key derived (HKDF-SHA256) from SECRET_KEY
 *    (the same env var that signs sessions — boot auto-generates it).
 *  - Recovery codes: bcrypt hashes (12 rounds) — same family as password
 *    hashes in src/lib/auth.ts, so failure modes and tooling stay uniform.
 *  - Backups never include the users table → totp_secret structurally excluded.
 */

// ─── Encryption of the TOTP secret at rest ───────────────────────────────

function getMasterKey(): Buffer {
  const raw =
    process.env.SECRET_KEY ||
    "linkbreeze-dev-secret-key-change-me-in-production-please";
  // HKDF separates purposes: the session-signing secret never equals the
  // TOTP encryption key, even though both derive from SECRET_KEY.
  const derived = crypto.hkdfSync(
    "sha256",
    raw,
    "linkbreeze-totp-v1", // salt
    "totp-secret-encryption", // info
    32,
  );
  return Buffer.from(derived);
}

/** Format: v1:<iv-hex>:<ciphertext-hex>:<gcm-tag-hex> — versioned for rotation. */
export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getMasterKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("hex")}:${enc.toString("hex")}:${tag.toString("hex")}`;
}

/** Returns null on wrong key / tampered data — treated as "no secret". */
export function decryptSecret(stored: string): string | null {
  const parts = stored.split(":");
  if (parts.length !== 4 || parts[0] !== "v1") return null;
  try {
    const [, ivHex, dataHex, tagHex] = parts;
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getMasterKey(),
      Buffer.from(ivHex, "hex"),
    );
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return Buffer.concat([
      decipher.update(Buffer.from(dataHex, "hex")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}

// ─── TOTP instance helpers ───────────────────────────────────────────────

const TOTP_OPTS = {
  issuer: "LinkBreeze",
  algorithm: "SHA1" as const, // authenticator-app default (Google Authenticator)
  digits: 6,
  period: 30,
};

export function generateSecret(): string {
  return new Secret({ size: 20 }).base32;
}

export function totpFor(secretBase32: string): TOTP {
  return new TOTP({ ...TOTP_OPTS, secret: Secret.fromBase32(secretBase32) });
}

/** Verify with a ±1 period window for clock drift. Strict 6-digit format. */
export function verifyTotp(secretBase32: string, token: string): boolean {
  const cleaned = token.replace(/\s/g, "");
  if (!/^\d{6}$/.test(cleaned)) return false;
  return totpFor(secretBase32).validate({ token: cleaned, window: 1 }) !== null;
}

/** otpauth:// URI for the QR code (label = admin username). */
export function otpauthUri(secretBase32: string, username: string): string {
  return `otpauth://totp/LinkBreeze:${encodeURIComponent(username)}?issuer=LinkBreeze&secret=${secretBase32}&algorithm=SHA1&digits=6&period=30`;
}

// ─── Recovery codes ──────────────────────────────────────────────────────

export function generateRecoveryCodes(count = 8): string[] {
  const codes: string[] = [];
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/o/1/l lookalikes (31 chars)
  for (let i = 0; i < count; i++) {
    // Rejection sampling to avoid modulo bias on the 31-char alphabet
    const bytes = crypto.randomBytes(20);
    let code = "";
    for (let j = 0; j < bytes.length && code.length < 10; j++) {
      if (bytes[j] >= 248) continue; // 31 * 8 = 248: reject biased tail
      code += alphabet[bytes[j] % 31];
    }
    // top up deterministically if rejection left us short (vanishingly rare)
    while (code.length < 10) {
      const b = crypto.randomBytes(1)[0];
      if (b < 248) code += alphabet[b % 31];
    }
    codes.push(code);
  }
  return codes;
}

export function hashRecoveryCode(code: string): Promise<string> {
  return bcrypt.hash(code, 12);
}

export function verifyRecoveryCode(
  code: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

// ─── Trust-this-device token ─────────────────────────────────────────────

/**
 * Trust value derives from (userId, TOTP secret, User-Agent) so:
 *  - disabling 2FA or re-enrolling invalidates every trusted device (secret changes)
 *  - the cookie is unverifiable on a different browser (UA bound)
 * No DB table needed — stateless verification via the stored secret.
 */
export function trustToken(
  userId: number,
  secretBase32: string,
  userAgent: string,
): string {
  return crypto
    .createHash("sha256")
    .update(`${userId}:${secretBase32}:${userAgent}`)
    .digest("hex");
}

export function verifyTrustToken(
  token: string,
  userId: number,
  secretBase32: string,
  userAgent: string,
): boolean {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) return false;
  const expected = trustToken(userId, secretBase32, userAgent);
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
