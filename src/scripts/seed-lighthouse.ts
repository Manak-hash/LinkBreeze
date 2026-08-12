/**
 * Minimal seed script for Lighthouse CI.
 * Creates a user, profile, and slug so the app serves a real public page
 * instead of redirecting to /setup.
 *
 * Run with: DATABASE_PATH=/tmp/lh.db SECRET_KEY=x npx tsx src/scripts/seed-lighthouse.ts
 */
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as path from "path";

// Run migrations first — the DB file is empty at this point in CI and the
// tables only get created when Next.js boots (instrumentation.ts). Without
// this, the select() below crashes with "no such table: users".
migrate(db, {
  migrationsFolder: path.join(process.cwd(), "src", "db", "migrations"),
});

// Insert a dummy user (password won't be verified — just needs to exist so
// getUserCount() > 0, which prevents the /setup redirect).
const existing = db.select().from(schema.users).all();
if (existing.length === 0) {
  db.insert(schema.users).values({
    username: "admin",
    passwordHash: "$2a$12$placeholderhashforlighthouseseedonly",
  }).run();
}

// Insert a profile so the public page has content.
const profiles = db.select().from(schema.profile).all();
if (profiles.length === 0) {
  db.insert(schema.profile).values({
    displayName: "Lighthouse Test",
    bio: "Test page for Lighthouse CI",
  }).run();
}

// Set a slug so the public page is at /test.
const settings = db.select().from(schema.settings).all();
const slugSetting = settings.find((s) => s.key === "slug");

if (!slugSetting) {
  db.insert(schema.settings).values({ key: "slug", value: "test" }).run();
}

// Ensure a /test page exists in the pages table.
// Migration 0007 seeds a default page from profile/settings, but at migration
// time the profile table is empty so the slug defaults to "u". Update the
// existing page's slug to "test" so the Lighthouse URL /test resolves.
const pages = db.select().from(schema.pages).all();
const activeTheme = db.select().from(schema.themes)
  .where(eq(schema.themes.isActive, true))
  .all();

if (pages.length === 0) {
  db.insert(schema.pages).values({
    slug: "test",
    title: "Lighthouse Test",
    bio: "Test page for Lighthouse CI",
    themeId: activeTheme[0]?.id ?? null,
    orderIndex: 0,
    isDefault: true,
    isPublished: true,
  }).run();
} else {
  // Update the first (default) page to use slug "test".
  db.update(schema.pages)
    .set({
      slug: "test",
      title: "Lighthouse Test",
      bio: "Test page for Lighthouse CI",
      themeId: activeTheme[0]?.id ?? null,
    })
    .where(eq(schema.pages.id, pages[0].id))
    .run();
}

console.log("[lighthouse-seed] Database seeded successfully");

// Force-exit to release the SQLite file handle immediately. Without this,
// the better-sqlite3 connection can hold a WAL lock that causes the
// subsequent `next build` to fail with "SqliteError: database is locked".
process.exit(0);
