CREATE TABLE `link_groups` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `page_id` integer DEFAULT 1 NOT NULL, `title` text NOT NULL, `link_search` integer DEFAULT false NOT NULL, `order_index` integer DEFAULT 0 NOT NULL, `created_at` text DEFAULT (datetime('now')) NOT NULL);
--> statement-breakpoint
ALTER TABLE `links` ADD `group_id` integer REFERENCES link_groups(id);
