-- 0020: Separate card font — themes.card_font_family.
-- Optional per-theme second font applied to link cards only. Empty string
-- (the default) keeps the previous behavior: cards inherit the site font
-- via --lb-font. Values use the same identifier space as font_family
-- (bundled ids like "playfair", uploaded refs "custom:<id>", or legacy
-- raw CSS from old rows).

ALTER TABLE "themes" ADD "card_font_family" text DEFAULT '' NOT NULL;
