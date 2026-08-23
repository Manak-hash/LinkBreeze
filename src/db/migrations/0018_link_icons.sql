-- 0018: Per-link icon system (#91).
-- links.icon becomes the storage for a picked lucide icon name (dashed,
-- e.g. "rocket"); previously it held an optional emoji that was never
-- rendered. links.icon_mode records how the icon is chosen:
--   auto   — favicon fetch at save time, letter fallback (existing behavior)
--   lucide — manual lucide pick stored in links.icon
--   custom — operator-uploaded image at links.custom_icon_url
-- links.custom_icon_url holds the uploaded icon's /api/uploads/<hash>.<ext>
-- URL. Existing rows keep auto behavior (icon_mode defaults to 'auto').

ALTER TABLE "links" ADD "icon_mode" text DEFAULT 'auto' NOT NULL;
--> statement-breakpoint
ALTER TABLE "links" ADD "custom_icon_url" text;
