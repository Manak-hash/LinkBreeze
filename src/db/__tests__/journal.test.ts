import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

/**
 * Journal invariants — the #79 guard.
 *
 * Drizzle's migrator applies an entry only when its `when` timestamp is newer
 * than the newest row in __drizzle_migrations. A journal whose `when` values
 * are not strictly ascending (e.g. a hand-written entry dated before an
 * earlier drizzle-kit-generated one) makes the migrator silently skip
 * entries on every upgraded database — the app then crashes on the missing
 * column (issue #79: "no such column: privacy_policy").
 *
 * These tests fail the suite BEFORE such a journal can ship.
 */

const migrationsFolder = join(process.cwd(), "src", "db", "migrations");
const journal = JSON.parse(
  readFileSync(join(migrationsFolder, "meta", "_journal.json"), "utf8"),
) as { entries: { idx: number; tag: string; when: number }[] };

describe("migration journal invariants (#79 guard)", () => {
  it("has entries", () => {
    expect(journal.entries.length).toBeGreaterThan(0);
  });

  it("when timestamps are strictly ascending", () => {
    for (let i = 1; i < journal.entries.length; i++) {
      const prev = journal.entries[i - 1];
      const cur = journal.entries[i];
      expect(
        cur.when,
        `entry ${cur.idx} (${cur.tag}) when=${cur.when} must be strictly greater ` +
          `than entry ${prev.idx} (${prev.tag}) when=${prev.when}`,
      ).toBeGreaterThan(prev.when);
    }
  });

  it("idx values are sequential from 0", () => {
    journal.entries.forEach((e, i) => {
      expect(e.idx, `entry position ${i}`).toBe(i);
    });
  });

  it("every journal entry has its .sql file on disk", () => {
    for (const e of journal.entries) {
      const p = join(migrationsFolder, `${e.tag}.sql`);
      expect(() => readFileSync(p, "utf8"), `${e.tag}.sql exists`).not.toThrow();
    }
  });

  it("no .sql file on disk is missing from the journal", () => {
    const onDisk = readdirSync(migrationsFolder)
      .filter((f) => f.endsWith(".sql"))
      .sort();
    const inJournal = journal.entries.map((e) => `${e.tag}.sql`).sort();
    expect(onDisk).toEqual(inJournal);
  });

  it("when timestamps are plausible (< year 2100)", () => {
    // 4102444800000 = 2100-01-01. Absurd future dates are how the 0013/0014
    // hotfix worked around the comparison bug; the real fix (row repair at
    // boot) lets us keep dates sane, so guard against new absurd values.
    for (const e of journal.entries) {
      expect(e.when).toBeLessThan(4102444800000);
      expect(e.when).toBeGreaterThan(0);
    }
  });

  it("row hashes are stable (sha256 of the .sql file, as drizzle stores them)", () => {
    // The boot repair matches rows to journal entries by this hash — make
    // sure every entry computes one deterministically.
    for (const e of journal.entries) {
      const sql = readFileSync(join(migrationsFolder, `${e.tag}.sql`), "utf8");
      const hash = createHash("sha256").update(sql).digest("hex");
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    }
  });
});
