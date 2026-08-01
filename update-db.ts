import Database from "better-sqlite3";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const dbPath = process.env.DATABASE_PATH || "./data/linkbreeze.db";
const db = new Database(path.join(process.cwd(), dbPath));

try {
  // Create link_groups table
  db.exec(`
    CREATE TABLE IF NOT EXISTS \`link_groups\` (
      \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      \`page_id\` integer DEFAULT 1 NOT NULL,
      \`title\` text NOT NULL,
      \`link_search\` integer DEFAULT 0 NOT NULL,
      \`order_index\` integer DEFAULT 0 NOT NULL,
      \`created_at\` text DEFAULT (datetime('now')) NOT NULL
    );
  `);
  console.log("link_groups table created/verified.");

  // Add group_id to links table if it doesn't exist
  try {
    db.exec(`ALTER TABLE \`links\` ADD COLUMN \`group_id\` integer REFERENCES \`link_groups\`(\`id\`) ON DELETE SET NULL`);
    console.log("Added group_id to links.");
  } catch (e: any) {
    if (!e.message.includes("duplicate column name")) {
      throw e;
    } else {
      console.log("group_id already exists in links.");
    }
  }

  console.log("Database updated successfully.");
} catch (error) {
  console.error("Error updating database:", error);
} finally {
  db.close();
}
