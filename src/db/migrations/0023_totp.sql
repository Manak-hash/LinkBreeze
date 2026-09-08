-- 0023: TOTP two-factor authentication (#5).
-- All columns nullable/defaulted: purely additive, existing users (and the
-- single-user table) are untouched. The TOTP secret is stored ENCRYPTED
-- (AES-256-GCM, key derived from SECRET_KEY via HKDF — see
-- src/lib/two-factor.ts). recovery_codes holds a JSON array of bcrypt
-- hashes, one per generated code, removed as they are consumed.

ALTER TABLE "users" ADD "totp_secret" text;
--> statement-breakpoint
ALTER TABLE "users" ADD "totp_enabled" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "users" ADD "recovery_codes" text;
