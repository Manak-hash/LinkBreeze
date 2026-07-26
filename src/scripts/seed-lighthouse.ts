/**
 * Minimal seed script for Lighthouse CI.
 * Creates a user, profile, and slug so the app serves a real public page
 * instead of redirecting to /setup.
 *
 * Run with: DATABASE_PATH=/tmp/lh.db SECRET_KEY=x npx tsx src/scripts/seed-lighthouse.ts
 */
import { db } from "@/db";
import * as schema from "@/db/schema";
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

console.log("[lighthouse-seed] Database seeded successfully");
