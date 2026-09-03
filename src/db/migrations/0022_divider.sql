-- 0022: Divider element (#87) — per-theme divider styling.
-- The divider itself is a link row (type 'divider', zero migration cost:
-- reuses ordering, sections, isActive, backup/restore). These columns let
-- every theme style its dividers: line style, color, thickness, width.
-- divider_color "" = inherit the theme's card border color.

ALTER TABLE "themes" ADD "divider_style" text NOT NULL DEFAULT 'solid';
--> statement-breakpoint
ALTER TABLE "themes" ADD "divider_color" text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "themes" ADD "divider_thickness" text NOT NULL DEFAULT '1';
--> statement-breakpoint
ALTER TABLE "themes" ADD "divider_width" text NOT NULL DEFAULT '100';
