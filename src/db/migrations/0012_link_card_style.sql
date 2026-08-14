-- 0012_link_card_style.sql
-- Link preview cards: adds cardStyle column to links table.
-- "compact" = current icon+title card (default)
-- "rich" = thumbnail + title + description (Open Graph preview)

ALTER TABLE links ADD COLUMN card_style TEXT NOT NULL DEFAULT 'compact';
