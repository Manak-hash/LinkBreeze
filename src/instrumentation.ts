/**
 * Next.js Instrumentation — runs ONCE when the server boots, before any
 * request is served.
 *
 * Two responsibilities:
 *
 * 1. SECRET_KEY bootstrap. If the operator didn't set SECRET_KEY (very common
 *    with bare `docker run` — the docker-compose.yml sets it, but the
 *    TROUBLESHOOTING.md `docker run` examples don't), generate a random key,
 *    persist it next to the SQLite database, and inject it into the process
 *    environment so every request that follows sees a stable secret. Without
 *    this, the very first login/setup crashes with a 500 because getSecret()
 *    throws in production mode.
 *
 * 2. Auto-run database migrations so that a fresh deploy (empty SQLite volume)
 *    has its tables created before the first query lands. Fixes the "no such
 *    table" crash on fresh `docker compose` / `docker run` deploys.
 *
 * Drizzle's migrate() is journaled in __drizzle_migrations, so migration is a
 * safe no-op on databases that are already up to date.
 */
export async function register() {
  // Only run in the Node.js runtime — skip the edge runtime entirely.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // ── 1. Ensure SECRET_KEY is set before anything touches auth ─────────
  await ensureSecretKey();

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
    console.error("[migrate] FAILED to run database migrations:", err);
    throw err;
  }
}

/**
 * Guarantee that process.env.SECRET_KEY is set.
 *
 * Priority:
 *   1. Already set in the environment (docker-compose SECRET_KEY=, .env, etc.)
 *      → use as-is.
 *   2. A persisted key file exists at <data-dir>/.secret-key → load it.
 *   3. Neither → generate 32 random bytes (hex), persist to <data-dir>/.secret-key.
 *
 * The key file lives next to the SQLite database so it survives container
 * restarts as long as the volume is mounted. This makes LinkBreeze work
 * out-of-the-box with a bare `docker run` command — no SECRET_KEY needed.
 */
export async function ensureSecretKey(): Promise<void> {
  // If the operator provided a key, respect it and never override.
  if (process.env.SECRET_KEY) return;

  const [path, fs, crypto] = await Promise.all([
    import("path"),
    import("fs"),
    import("crypto"),
  ]);

  // Resolve the data directory from DATABASE_PATH (falls back to ./data).
  const dbPath =
    process.env.DATABASE_PATH || path.join(process.cwd(), "data", "linkbreeze.db");
  const dataDir = path.dirname(dbPath);
  const keyFile = path.join(dataDir, ".secret-key");

  try {
    // Try to read an existing key file (persisted from a previous boot).
    if (fs.existsSync(keyFile)) {
      const existing = fs.readFileSync(keyFile, "utf8").trim();
      if (existing.length >= 32) {
        process.env.SECRET_KEY = existing;
        return;
      }
    }
  } catch {
    // Read failed — fall through to generation.
  }

  // Generate a new key and persist it.
  const generated = crypto.randomBytes(32).toString("hex");
  try {
    // Ensure data dir exists (it should — db/index.ts creates it — but be safe).
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(keyFile, generated, { mode: 0o600 });
    console.log(
      `[auth] No SECRET_KEY found — generated and saved to ${keyFile}.\n` +
        "       For production deployments behind a reverse proxy, set a " +
        "fixed SECRET_KEY env var for reproducibility across rebuilds.",
    );
  } catch {
    // Can't persist (read-only volume?). Still inject into the process so the
    // current boot works; it just won't survive a container recreate.
    console.warn(
      `[auth] Could not persist SECRET_KEY to ${keyFile} (volume read-only?). ` +
        "Using an ephemeral key — sessions will not survive a restart.",
    );
  }
  process.env.SECRET_KEY = generated;
}
