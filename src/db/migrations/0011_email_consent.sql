-- 0011_email_consent.sql
-- Issue #75: Email capture needs consent checkbox and privacy notice.
-- Adds consent tracking columns to the subscribers table.

ALTER TABLE subscribers ADD COLUMN consent_at TEXT;
ALTER TABLE subscribers ADD COLUMN consent_text TEXT;
