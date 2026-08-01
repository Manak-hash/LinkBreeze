-- 0010: Link search flag for public page (#link-search)
-- Adds a link_search boolean column to the pages table.
-- When enabled, shows a search box on the public page that filters
-- links by title and description client-side.

ALTER TABLE `pages` ADD COLUMN `link_search` integer NOT NULL DEFAULT 0;
