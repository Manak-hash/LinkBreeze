/**
 * Integration test: backup → mutate → restore round-trip.
 *
 * Verifies that exportBackupPayload() + restoreBackup() preserve exact data
 * integrity across a full cycle, using the same sql.js (WASM SQLite) in-memory
 * database setup as the other integration tests.
 *
 * Follows the pattern in src/server/queries/__tests__/links.integration.test.ts:
 * imports "./integration-setup" (relative to queries/__tests__) which mocks
 * @/db with a real sql.js + drizzle connection, runs migrations, and mocks
 * @/lib/auth with a valid session.
 */
import { describe, it, expect, beforeAll, vi } from "vitest";
import { eq } from "drizzle-orm";

// Pull in the integration DB setup BEFORE importing any module that touches
// @/db. This mocks @/db with a sql.js connection and @/lib/auth with a valid
// session, exactly like the queries-layer integration tests.
import "../../queries/__tests__/integration-setup";
import { db } from "../../queries/__tests__/integration-setup";
import * as schema from "@/db/schema";

// data.ts imports next/cache (revalidatePath) and @/lib/demo (demoBlock).
// Neither is covered by integration-setup, so mock them here before importing
// the action. demoBlock → null so we're not in read-only demo mode.
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/demo", () => ({
  demoBlock: vi.fn(() => null),
}));

// Import the server actions AFTER the mocks above are registered.
import {
  exportBackupPayload,
  restoreBackup,
} from "@/server/actions/data";

/**
 * Build a FormData carrying a backup payload as the "file" entry, mirroring
 * how the UI submits the restore form.
 */
function backupFormData(payload: unknown): FormData {
  const fd = new FormData();
  fd.set(
    "file",
    new File([JSON.stringify(payload)], "backup.json", {
      type: "application/json",
    }),
  );
  return fd;
}

describe("[integration] backup → restore round-trip", () => {
  // Snapshot captured from exportBackupPayload() against the seed data.
  // Typed loosely (the backup wire format) so field-level assertions stay
  // readable below.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let snapshot: any;

  beforeAll(() => {
    // ── Seed known data into the four backed-up tables ────────────────
    // 1 profile row
    db.insert(schema.profile)
      .values({
        id: 1,
        displayName: "Ada Lovelace",
        bio: "First programmer",
        avatarUrl: "https://example.com/ada.png",
        badgeText: "Founder",
        socialLinks: '[{"platform":"x","url":"https://x.com/ada"}]',
      })
      .run();

    // 3 link rows
    const linkSeed = [
      {
        title: "GitHub",
        url: "https://github.com/ada",
        type: "url",
        orderIndex: 0,
        description: "My code",
        isActive: true,
        isHighlighted: true,
      },
      {
        title: "Blog",
        url: "https://ada.example.com",
        type: "url",
        orderIndex: 1,
        description: null,
        isActive: true,
        isHighlighted: false,
      },
      {
        title: "Contact",
        url: "mailto:ada@example.com",
        type: "email",
        orderIndex: 2,
        description: "Email me",
        isActive: false,
        isHighlighted: false,
      },
    ];
    for (const l of linkSeed) {
      db.insert(schema.links)
        .values({ pageId: 1, ...l })
        .run();
    }

    // 2 settings rows
    db.insert(schema.settings)
      .values([
        { key: "siteTitle", value: "Ada's Links" },
        { key: "analyticsRetentionDays", value: "30" },
      ])
      .run();

    // 2 theme rows
    db.insert(schema.themes)
      .values([
        {
          name: "Midnight",
          isActive: true,
          isPreset: false,
          mode: "dark",
          primaryColor: "#0f3460",
        },
        {
          name: "Daylight",
          isActive: false,
          isPreset: true,
          mode: "light",
          primaryColor: "#ffffff",
        },
      ])
      .run();

    // Also seed an analytics row so we can assert restore leaves analytics
    // untouched.
    db.insert(schema.analyticsPageviews)
      .values({
        pageId: 1,
        visitorHash: "hash-aaa",
        date: "2026-01-01",
        referrer: "https://google.com",
        country: "US",
        deviceType: "desktop",
      })
      .run();
  });

  it("captures a snapshot reflecting the seed data", async () => {
    snapshot = await exportBackupPayload();

    expect(snapshot.version).toBe(1);
    expect(snapshot.exportedAt).toBeTruthy();
    expect(snapshot.profile).toHaveLength(1);
    expect(snapshot.links).toHaveLength(3);
    expect(snapshot.settings).toHaveLength(2);
    expect(snapshot.themes).toHaveLength(2);
  });

  it("restores the exact seed data after the DB is mutated", async () => {
    // Re-capture in case the previous test ran out of order or snapshot is
    // undefined (defensive — beforeAll ordering makes this a no-op normally).
    if (!snapshot) snapshot = await exportBackupPayload();

    // ── Mutate the DB after the snapshot ──────────────────────────────
    // add two extra links
    db.insert(schema.links)
      .values([
        {
          pageId: 1,
          title: "New Link 1",
          url: "https://new1.example.com",
          type: "url",
          orderIndex: 10,
        },
        {
          pageId: 1,
          title: "New Link 2",
          url: "https://new2.example.com",
          type: "url",
          orderIndex: 11,
        },
      ])
      .run();
    // change the profile
    db.update(schema.profile)
      .set({ displayName: "Changed Name", bio: "Changed bio" })
      .where(eqProfileId(1))
      .run();
    // delete one theme
    db.delete(schema.themes).run(); // wipe all themes to prove restore brings them back

    // Sanity: the DB is now in a mutated state.
    const mutatedLinks = db.select().from(schema.links).all();
    expect(mutatedLinks.length).toBe(5);
    const mutatedThemes = db.select().from(schema.themes).all();
    expect(mutatedThemes.length).toBe(0);

    // ── Restore from the snapshot ─────────────────────────────────────
    const result = await restoreBackup(backupFormData(snapshot));
    expect(result).toEqual({ success: true });

    // ── Verify exact restoration of each table ────────────────────────
    // profile: 1 row, original values
    const profileRows = db.select().from(schema.profile).all();
    expect(profileRows).toHaveLength(1);
    expect(profileRows[0]!.displayName).toBe("Ada Lovelace");
    expect(profileRows[0]!.bio).toBe("First programmer");
    expect(profileRows[0]!.avatarUrl).toBe("https://example.com/ada.png");
    expect(profileRows[0]!.badgeText).toBe("Founder");
    expect(profileRows[0]!.socialLinks).toBe(
      '[{"platform":"x","url":"https://x.com/ada"}]',
    );

    // links: 3 rows, original field values
    const linkRows = db.select().from(schema.links).all();
    expect(linkRows).toHaveLength(3);
    const byOrder = [...linkRows].sort((a, b) => a.orderIndex - b.orderIndex);

    expect(byOrder[0]!.title).toBe("GitHub");
    expect(byOrder[0]!.url).toBe("https://github.com/ada");
    expect(byOrder[0]!.type).toBe("url");
    expect(byOrder[0]!.description).toBe("My code");
    expect(byOrder[0]!.isHighlighted).toBe(true);
    expect(byOrder[0]!.isActive).toBe(true);

    expect(byOrder[1]!.title).toBe("Blog");
    expect(byOrder[1]!.url).toBe("https://ada.example.com");
    expect(byOrder[1]!.description).toBeNull();

    expect(byOrder[2]!.title).toBe("Contact");
    expect(byOrder[2]!.url).toBe("mailto:ada@example.com");
    expect(byOrder[2]!.type).toBe("email");
    expect(byOrder[2]!.isActive).toBe(false);

    // settings: 2 rows, original key/value pairs
    const settingRows = db.select().from(schema.settings).all();
    expect(settingRows).toHaveLength(2);
    const settingMap = Object.fromEntries(
      settingRows.map((s) => [s.key, s.value]),
    );
    expect(settingMap["siteTitle"]).toBe("Ada's Links");
    expect(settingMap["analyticsRetentionDays"]).toBe("30");

    // themes: 2 rows, original names + cosmetic values
    const themeRows = db.select().from(schema.themes).all();
    expect(themeRows).toHaveLength(2);
    const themeByName = Object.fromEntries(
      themeRows.map((t) => [t.name, t]),
    );
    expect(themeByName["Midnight"]).toBeDefined();
    expect(themeByName["Midnight"].isActive).toBe(true);
    expect(themeByName["Midnight"].isPreset).toBe(false);
    expect(themeByName["Midnight"].primaryColor).toBe("#0f3460");
    expect(themeByName["Daylight"]).toBeDefined();
    expect(themeByName["Daylight"].mode).toBe("light");

    // ── Analytics must be untouched by restore ────────────────────────
    const pageviewRows = db.select().from(schema.analyticsPageviews).all();
    expect(pageviewRows).toHaveLength(1);
    expect(pageviewRows[0]!.visitorHash).toBe("hash-aaa");
    expect(pageviewRows[0]!.referrer).toBe("https://google.com");
  });

  // ── Edge cases ─────────────────────────────────────────────────────

  it("rejects invalid JSON with an error and does not mutate data", async () => {
    const fd = new FormData();
    fd.set(
      "file",
      new File(["{not valid json"], "bad.json", { type: "application/json" }),
    );
    const result = await restoreBackup(fd);
    expect(result.success).toBe(false);
    expect(result.success === false && result.error).toMatch(/invalid json/i);

    // Data should be unchanged — still 3 links from the successful restore.
    expect(db.select().from(schema.links).all()).toHaveLength(3);
  });

  it("rejects an unsupported backup version with an error", async () => {
    const payload = {
      ...snapshot,
      version: 99,
    };
    const result = await restoreBackup(backupFormData(payload));
    expect(result.success).toBe(false);
    expect(result.success === false && result.error).toMatch(
      /unsupported backup version/i,
    );
    // unchanged
    expect(db.select().from(schema.links).all()).toHaveLength(3);
  });

  it("rejects malformed row data with an error and does not mutate data", async () => {
    // A link row missing the required `title` field should fail Zod validation.
    const payload = {
      version: 1,
      exportedAt: "2026-01-01T00:00:00.000Z",
      profile: [],
      settings: [],
      themes: [],
      links: [
        // Intentionally malformed: missing required `title` field.
        { url: "https://example.com" },
      ],
    };
    const result = await restoreBackup(backupFormData(payload));
    expect(result.success).toBe(false);
    expect(result.success === false && result.error).toMatch(/malformed/i);
    // unchanged
    expect(db.select().from(schema.links).all()).toHaveLength(3);
  });
});

// ── Helpers ────────────────────────────────────────────────────────────

/** Tiny helper so the profile update above reads cleanly. */
function eqProfileId(id: number) {
  return eq(schema.profile.id, id);
}
