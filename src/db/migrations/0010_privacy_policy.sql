-- 0010: Per-page privacy policy
-- Stores optional custom privacy policy text. When empty, LinkBreeze
-- auto-generates one from the page's actual configuration (analytics,
-- email capture, embeds, etc.) at /{slug}/privacy.

ALTER TABLE `pages` ADD COLUMN `privacy_policy` text NOT NULL DEFAULT '';
