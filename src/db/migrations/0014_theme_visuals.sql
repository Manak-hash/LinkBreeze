-- 0014: Theme visual rework (1.3 Phase 3) — avatar styling, profile layouts,
-- text animations, and page banner images for hero/banner layouts.

ALTER TABLE "themes" ADD "avatar_shape" text NOT NULL DEFAULT 'circle';
--> statement-breakpoint
ALTER TABLE "themes" ADD "avatar_border" text NOT NULL DEFAULT 'solid';
--> statement-breakpoint
ALTER TABLE "themes" ADD "avatar_float" text NOT NULL DEFAULT 'false';
--> statement-breakpoint
ALTER TABLE "themes" ADD "profile_layout" text NOT NULL DEFAULT 'classic';
--> statement-breakpoint
ALTER TABLE "themes" ADD "text_animation" text NOT NULL DEFAULT 'none';
--> statement-breakpoint
ALTER TABLE "pages" ADD "banner_url" text;
