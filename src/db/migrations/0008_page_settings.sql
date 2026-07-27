-- Page-specific settings: move fields from global settings table to pages.

-- 1. Add per-page columns.
ALTER TABLE `pages` ADD COLUMN `seo_title` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `pages` ADD COLUMN `seo_description` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `pages` ADD COLUMN `footer_text` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `pages` ADD COLUMN `analytics_script` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `pages` ADD COLUMN `custom_css` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `pages` ADD COLUMN `email_capture` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `pages` ADD COLUMN `favicon_url` text;
--> statement-breakpoint

-- 2. Copy global settings values into the default page.
UPDATE `pages` SET
  `seo_title` = COALESCE((SELECT `value` FROM `settings` WHERE `key` = 'title'), ''),
  `seo_description` = COALESCE((SELECT `value` FROM `settings` WHERE `key` = 'description'), ''),
  `footer_text` = COALESCE((SELECT `value` FROM `settings` WHERE `key` = 'footerText'), ''),
  `analytics_script` = COALESCE((SELECT `value` FROM `settings` WHERE `key` = 'analyticsScript'), ''),
  `custom_css` = COALESCE((SELECT `value` FROM `settings` WHERE `key` = 'customCss'), ''),
  `email_capture` = CASE
    WHEN (SELECT `value` FROM `settings` WHERE `key` = 'emailCapture') = 'true' THEN 1
    ELSE 0
  END,
  `favicon_url` = (SELECT `value` FROM `settings` WHERE `key` = 'faviconUrl')
WHERE `is_default` = 1;
