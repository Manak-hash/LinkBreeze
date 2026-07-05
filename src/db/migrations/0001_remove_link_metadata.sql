PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_analytics_clicks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`link_id` integer NOT NULL,
	`visitor_hash` text NOT NULL,
	`referrer` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`link_id`) REFERENCES `links`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_analytics_clicks`("id", "link_id", "visitor_hash", "referrer", "created_at") SELECT "id", "link_id", "visitor_hash", "referrer", "created_at" FROM `analytics_clicks`;--> statement-breakpoint
DROP TABLE `analytics_clicks`;--> statement-breakpoint
ALTER TABLE `__new_analytics_clicks` RENAME TO `analytics_clicks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `links` DROP COLUMN `metadata`;