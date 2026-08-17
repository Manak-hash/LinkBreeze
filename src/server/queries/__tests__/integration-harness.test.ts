/**
 * Pins the integration harness contract: the test database enforces foreign
 * keys exactly like production (src/db/index.ts). Without this, a buggy
 * write like sectionId=0 (#86) would slip through every integration test
 * silently — SQLite ignores FK constraints unless PRAGMA foreign_keys=ON.
 */
import { describe, it, expect } from "vitest";
import "./integration-setup";
import { seedPage, db } from "./integration-setup";
import { sql } from "drizzle-orm";

describe("[integration] harness contract", () => {
  it("enforces foreign keys (orphan section_id insert must throw)", () => {
    const page = seedPage();
    let threw = false;
    try {
      // sql-js drizzle throws synchronously on constraint violations.
      db.run(
        sql`INSERT INTO links (page_id, title, url, type, order_index, is_active, section_id)
            VALUES (${page.id}, 'orphan probe', 'https://example.com', 'url', 0, 1, 999999)`
      );
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });
});
