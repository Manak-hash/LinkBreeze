/**
 * Integration tests: analytics retention default (#77).
 *
 * Effective retention is resolved by getAnalyticsRetentionDays(): a stored
 * valid value wins (including 0 = keep forever), anything else falls back to
 * the 90-day default. The pruner, the settings UI and the privacy policy all
 * read through that resolver.
 *
 * NOTE on ordering: pruneAnalyticsIfDue() caches the retention window for 60s
 * per module instance, so the prune tests run FIRST (cold cache, no setting
 * stored). The resolver scenarios that write settings run afterwards — the
 * resolver itself is uncached, so it always sees the live value.
 */
import { describe, it, expect } from "vitest";
import "./integration-setup";
import { db, seedPage, seedLink } from "./integration-setup";
import {
  getAnalyticsRetentionDays,
  updateSetting,
  recordPageview,
  recordClick,
  DEFAULT_ANALYTICS_RETENTION_DAYS,
} from "@/server/queries";
import { analyticsPageviews, analyticsClicks } from "@/db/schema";
import { sql } from "drizzle-orm";

const DAYS = 24 * 60 * 60 * 1000;

/** SQLite text timestamp (UTC, "YYYY-MM-DD HH:MM:SS") N days before now. */
function daysAgo(n: number): string {
  return new Date(Date.now() - n * DAYS).toISOString().slice(0, 19).replace("T", " ");
}

function countPageviews(): number {
  return (db.select({ c: sql<number>`count(*)` }).from(analyticsPageviews).all() as { c: number }[])[0].c;
}

function countClicks(): number {
  return (db.select({ c: sql<number>`count(*)` }).from(analyticsClicks).all() as { c: number }[])[0].c;
}

let pageId: number;
let linkId: number;

describe("[integration] pruning honours the 90-day default", () => {
  it("deletes pageviews older than the default window and keeps newer ones", async () => {
    const page = seedPage();
    pageId = page.id;

    // No analyticsRetentionDays setting stored — pre-test invariant.
    db.run(sql`DELETE FROM settings WHERE key = 'analyticsRetentionDays'`);

    db.insert(analyticsPageviews).values([
      { visitorHash: "old", createdAt: daysAgo(DEFAULT_ANALYTICS_RETENTION_DAYS + 10) },
      { visitorHash: "recent", createdAt: daysAgo(1) },
    ]).run();

    // First record* call reads the setting with a cold cache → default 90.
    await recordPageview("now", null, null, null, pageId);

    // The 100-day-old row is gone; the 1-day-old and the new one survive.
    expect(countPageviews()).toBe(2);
    const remaining = db.select().from(analyticsPageviews).all() as { visitorHash: string }[];
    expect(remaining.map((r) => r.visitorHash).sort()).toEqual(["now", "recent"]);
  });

  it("prunes clicks through the same opportunistic path", async () => {
    const link = seedLink({ pageId });
    linkId = link.id;

    db.insert(analyticsClicks).values([
      { linkId, visitorHash: "old-click", createdAt: daysAgo(DEFAULT_ANALYTICS_RETENTION_DAYS + 10) },
    ]).run();

    await recordClick(linkId, "now-click", null);

    // Old click pruned, the new one kept — recordClick prunes like pageviews.
    expect(countClicks()).toBe(1);
    const remaining = db.select().from(analyticsClicks).all() as { visitorHash: string }[];
    expect(remaining[0].visitorHash).toBe("now-click");
  });
});

describe("[integration] retention resolver", () => {
  it("falls back to the 90-day default when no setting is stored", async () => {
    db.run(sql`DELETE FROM settings WHERE key = 'analyticsRetentionDays'`);
    expect(await getAnalyticsRetentionDays()).toBe(DEFAULT_ANALYTICS_RETENTION_DAYS);
  });

  it("respects a stored value", async () => {
    await updateSetting("analyticsRetentionDays", "45");
    expect(await getAnalyticsRetentionDays()).toBe(45);
  });

  it("respects an explicit 0 (keep forever)", async () => {
    await updateSetting("analyticsRetentionDays", "0");
    expect(await getAnalyticsRetentionDays()).toBe(0);
  });

  it("falls back to the default on a non-numeric stored value", async () => {
    await updateSetting("analyticsRetentionDays", "forever");
    expect(await getAnalyticsRetentionDays()).toBe(DEFAULT_ANALYTICS_RETENTION_DAYS);
  });
});
