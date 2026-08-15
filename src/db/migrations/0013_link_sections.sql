-- 0013_link_sections.sql
-- Link sections (v1.3 headline feature): group links under titled headers
-- on the public page. Links with a NULL section_id stay uncategorized and
-- render at the top of the link stack, preserving the pre-1.3 layout for
-- existing installs.

CREATE TABLE link_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  icon TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
--> statement-breakpoint
ALTER TABLE links ADD COLUMN section_id INTEGER REFERENCES link_sections(id) ON DELETE SET NULL;
