-- 0009: Auto-favicon for links (#10)
-- Adds an auto_icon column to track whether a link should auto-fetch
-- the target site's favicon. Defaults to 1 (enabled) so existing links
-- get favicons too. Also adds an icon_url column to store the cached
-- favicon path once fetched.

ALTER TABLE `links` ADD COLUMN `auto_icon` integer NOT NULL DEFAULT 1;
--> statement-breakpoint
ALTER TABLE `links` ADD COLUMN `icon_url` text;
