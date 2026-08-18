-- 0017: Custom theme fonts (#82). Uploaded woff2/woff files stored in the
-- uploads directory; this table tracks name, served URL, size, and format.
-- Themes reference a custom font via themes.font_family = 'custom:<id>'.
-- No themes changes needed — font_family already stores arbitrary ids.

CREATE TABLE "custom_fonts" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"name" text NOT NULL,
	"family" text NOT NULL,
	"filename" text NOT NULL,
	"url" text NOT NULL,
	"size_bytes" integer DEFAULT 0 NOT NULL,
	"format" text DEFAULT 'woff2' NOT NULL,
	"created_at" text DEFAULT (datetime('now')) NOT NULL
);
