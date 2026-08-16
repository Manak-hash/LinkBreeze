-- 0016: Interactive background display controls (1.3) — how a background
-- image/GIF/video is displayed: fit (cover / contain / tile) and focal point
-- (background-position as "x% y%"). Defaults preserve the existing look:
-- cover + centered.

ALTER TABLE "themes" ADD "background_fit" text NOT NULL DEFAULT 'cover';
--> statement-breakpoint
ALTER TABLE "themes" ADD "background_position" text NOT NULL DEFAULT '50% 50%';
