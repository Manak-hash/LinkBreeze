-- Deduplicate existing subscriber emails (keep the earliest signup)
DELETE FROM `subscribers` WHERE `id` NOT IN (
    SELECT MIN(`id`) FROM `subscribers` GROUP BY `email`
);
--> statement-breakpoint
-- Enforce uniqueness at the DB level so the duplicate-catch in subscribe() works
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);
