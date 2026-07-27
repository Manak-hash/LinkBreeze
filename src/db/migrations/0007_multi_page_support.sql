-- Multi-page support: create pages table, add pageId columns, seed default page.

-- 1. Create the pages table.
CREATE TABLE `pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`avatar_url` text,
	`badge_text` text,
	`social_links` text DEFAULT '[]' NOT NULL,
	`theme_id` integer,
	`order_index` integer DEFAULT 0 NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pages_slug_unique` ON `pages` (`slug`);
--> statement-breakpoint

-- 2. Add pageId columns to links and analytics_pageviews.
ALTER TABLE `links` ADD COLUMN `page_id` integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE `analytics_pageviews` ADD COLUMN `page_id` integer;
--> statement-breakpoint

-- 3. Seed a default page from existing profile + settings data.
--    Uses the slug from settings (fallback 'u'), copies profile fields.
INSERT INTO `pages` (`slug`, `title`, `bio`, `avatar_url`, `badge_text`, `social_links`, `theme_id`, `order_index`, `is_default`, `is_published`)
SELECT
	COALESCE(
		(SELECT `value` FROM `settings` WHERE `key` = 'slug'),
		'u'
	),
	COALESCE((SELECT `display_name` FROM `profile` LIMIT 1), ''),
	COALESCE((SELECT `bio` FROM `profile` LIMIT 1), ''),
	(SELECT `avatar_url` FROM `profile` LIMIT 1),
	(SELECT `badge_text` FROM `profile` LIMIT 1),
	COALESCE((SELECT `social_links` FROM `profile` LIMIT 1), '[]'),
	(SELECT `id` FROM `themes` WHERE `is_active` = 1 LIMIT 1),
	0,
	true,
	true;
--> statement-breakpoint

-- 4. Set the active theme's ID on the default page (if the INSERT above
--    didn't catch it because the subquery returned NULL at insert time).
UPDATE `pages` SET `theme_id` = (
	SELECT `id` FROM `themes` WHERE `is_active` = 1 LIMIT 1
) WHERE `theme_id` IS NULL;
