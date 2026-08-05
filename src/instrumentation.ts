/**
 * Next.js Instrumentation — runs ONCE when the server boots, before any
 * request is served. Used to auto-run database migrations so that a fresh
 * deploy (empty SQLite volume) has its tables created before the first query
 * lands.
 *
 * Fixes the "no such table" crash (Next.js error code 1654975601) on fresh
 * `docker compose` deploys where no migration step was wired into the image.
 *
 * Drizzle's migrate() is journaled in __drizzle_migrations, so this is a safe
 * no-op on databases that are already up to date (existing installs, demo).
 */
export async function register() {
  // Only run in the Node.js runtime — skip the edge runtime entirely.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const [{ db }, { migrate }, path] = await Promise.all([
    import("@/db"),
    import("drizzle-orm/better-sqlite3/migrator"),
    import("path"),
  ]);

  // Works in both runtimes:
  //  - standalone (node server.js): cwd is /app → /app/src/db/migrations
  //  - dev (next dev): cwd is the repo root → <repo>/src/db/migrations
  const migrationsFolder = path.join(
    process.cwd(),
    "src",
    "db",
    "migrations",
  );

  try {
    await migrate(db, { migrationsFolder });
    console.log("[migrate] database schema is up to date");
  } catch (err) {
    // Fail fast. A server that boots with an un-migrated DB is worse than one
    // that refuses to start — every request would 500 with a confusing code.
    console.error("[migrate] FAILED to run database migrations:", err);
    throw err;
  }
}
