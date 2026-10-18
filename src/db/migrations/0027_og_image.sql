-- Per-page OG image (#OG): mode + optional custom upload with the shared
-- image-positioning adjustment columns (Spec: Image-Positioning shape).
-- All nullable/defaulted - existing installs boot unchanged:
--   og_image_mode NULL / 'auto' -> dynamic theme-following renderer
--   og_image_mode 'custom'      -> serve the uploaded og_image_url directly
--   og_image_url NULL in custom mode -> falls back to auto (no upload yet)
ALTER TABLE `pages` ADD `og_image_mode` text;--> statement-breakpoint
ALTER TABLE `pages` ADD `og_image_url` text;--> statement-breakpoint
ALTER TABLE `pages` ADD `og_image_fit` text;--> statement-breakpoint
ALTER TABLE `pages` ADD `og_image_pos_x` real;--> statement-breakpoint
ALTER TABLE `pages` ADD `og_image_pos_y` real;--> statement-breakpoint
ALTER TABLE `pages` ADD `og_image_zoom` real;
