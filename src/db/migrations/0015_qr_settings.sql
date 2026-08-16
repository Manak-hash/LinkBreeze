-- 0015: QR customization (1.3) — per-page QR style (colors, center logo
-- choice, size) stored as JSON on the page row. Absent/NULL = defaults.

ALTER TABLE "pages" ADD "qr_settings" text;
