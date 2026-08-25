-- 0021: Resizable avatar — themes.avatar_size.
-- Avatar diameter as a numeric string ("72"–"160"), or "auto" (the default)
-- which keeps the pre-slider behavior: the resolver computes a shape-aware
-- default from the stored shape token.

ALTER TABLE "themes" ADD "avatar_size" text NOT NULL DEFAULT 'auto';
