import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import * as path from "path";
import * as fs from "fs";

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "linkbreeze.db");
const dbDir = path.dirname(dbPath);

// Ensure the data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// busy_timeout: wait up to 5s instead of immediately throwing "database is locked"
// when another connection holds the WAL lock (common during `next build` page
// data collection with multiple workers, or during migration).
const sqlite = new Database(dbPath, { timeout: 5000 });
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("busy_timeout = 5000");

export const db = drizzle(sqlite, { schema });
export { schema };
