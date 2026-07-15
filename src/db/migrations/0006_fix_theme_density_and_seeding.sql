-- Fix 1: Repair themes with invalid density value 'comfortable' (not in Zod enum).
-- The schema column default was 'comfortable' but the validator only accepts
-- 'compact', 'normal', 'relaxed'. Themes seeded by the getActiveTheme()
-- fallback inherited this bad default, causing ALL theme saves to fail
-- silently (Zod safeParse rejected the entire payload).
UPDATE `themes` SET `density` = 'normal' WHERE `density` = 'comfortable';
--> statement-breakpoint
-- Fix 2: Remove orphan single-theme fallback so seedThemesIfEmpty can run.
-- On fresh deploys, getActiveTheme() seeded a single Aurora before the admin
-- theme page was visited, preventing the full preset set from loading.
-- We can't safely INSERT presets from SQL (too many columns), but deleting
-- the fallback-seeded orphan (if it's the only row and is not a preset)
-- lets seedThemesIfEmpty() re-run on next page load.
DELETE FROM `themes` WHERE `is_preset` = 0 AND `id` = (
  SELECT `id` FROM (
    SELECT `id` FROM `themes` ORDER BY `id` LIMIT 1
  ) AS t
) AND (SELECT COUNT(*) FROM `themes`) = 1;
