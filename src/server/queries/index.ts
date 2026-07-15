import "server-only";
import { db } from "@/db";
import {
  users,
  settings,
  profile,
  links,
  themes,
  analyticsPageviews,
  analyticsClicks,
  subscribers,
} from "@/db/schema";
import {
  eq,
  and,
  or,
  lt,
  gt,
  asc,
  desc,
  isNull,
  sql,
} from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProfileRow = typeof profile.$inferSelect;
export type LinkRow = typeof links.$inferSelect;
export type ThemeRow = typeof themes.$inferSelect;
export type UserRow = typeof users.$inferSelect;

export interface SocialLink {
  platform: string;
  url: string;
}

export interface DashboardStats {
  totalViews: number;
  uniqueVisitors: number;
  totalClicks: number;
  ctr: number;
  topLinks: Array<{ id: number; title: string; clicks: number }>;
  viewsPerDay: Array<{ date: string; views: number; clicks: number }>;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getProfile(): Promise<ProfileRow | null> {
  const rows = await db.select().from(profile).limit(1);
  return rows[0] ?? null;
}

/**
 * Profile for public display. Currently identical to getProfile(), but kept
 * as a separate entry point so future filtering (e.g. per-user profiles,
 * published/unpublished flag) can go here without touching every caller.
 */
export async function getActiveProfile(): Promise<ProfileRow | null> {
  return getProfile();
}

export async function updateProfile(
  data: Partial<Pick<ProfileRow, "avatarUrl" | "displayName" | "bio" | "badgeText" | "socialLinks">>,
): Promise<void> {
  const existing = await getProfile();
  if (existing) {
    await db.update(profile).set(data).where(eq(profile.id, existing.id));
  } else {
    await db.insert(profile).values({
      avatarUrl: data.avatarUrl ?? null,
      displayName: data.displayName ?? "",
      bio: data.bio ?? "",
      badgeText: data.badgeText ?? null,
      socialLinks: data.socialLinks ?? "[]",
    });
  }
}

// ─── Links ────────────────────────────────────────────────────────────────────

const nowExpr = sql`datetime('now')`;

export async function getActiveLinks(): Promise<LinkRow[]> {
  const rows = await db
    .select()
    .from(links)
    .where(
      and(
        eq(links.isActive, true),
        or(
          isNull(links.scheduleStart),
          lt(links.scheduleStart, nowExpr),
        ),
        or(
          isNull(links.scheduleEnd),
          gt(links.scheduleEnd, nowExpr),
        ),
      ),
    )
    .orderBy(asc(links.orderIndex), asc(links.id));
  return rows;
}

export async function getAllLinks(): Promise<LinkRow[]> {
  return db
    .select()
    .from(links)
    .orderBy(asc(links.orderIndex), asc(links.id));
}

export async function createLink(
  data: Pick<LinkRow, "title" | "url"> &
    Partial<
      Pick<
        LinkRow,
        | "type"
        | "description"
        | "icon"
        | "imageUrl"
        | "isHighlighted"
        | "isActive"
        | "scheduleStart"
        | "scheduleEnd"
      >
    >,
): Promise<LinkRow> {
  const maxOrder = await db
    .select({ m: sql<number>`max(${links.orderIndex})` })
    .from(links);
  const nextOrder = (maxOrder[0]?.m ?? -1) + 1;

  const created = await db
    .insert(links)
    .values({
      title: data.title,
      url: data.url,
      type: data.type ?? "url",
      description: data.description ?? null,
      icon: data.icon ?? null,
      imageUrl: data.imageUrl ?? null,
      isHighlighted: data.isHighlighted ?? false,
      isActive: data.isActive ?? true,
      scheduleStart: data.scheduleStart ?? null,
      scheduleEnd: data.scheduleEnd ?? null,
      orderIndex: nextOrder,
    })
    .returning();
  return created[0];
}

export async function updateLink(
  id: number,
  data: Partial<
    Pick<
      LinkRow,
      | "title"
      | "url"
      | "type"
      | "description"
      | "icon"
      | "imageUrl"
      | "isHighlighted"
      | "isActive"
      | "scheduleStart"
      | "scheduleEnd"
    >
  >,
): Promise<void> {
  await db.update(links).set(data).where(eq(links.id, id));
}

export async function deleteLink(id: number): Promise<void> {
  // Delete analytics clicks first so orphaned rows don't linger on
  // databases created before the FK constraint was added to the schema.
  await db.delete(analyticsClicks).where(eq(analyticsClicks.linkId, id));
  await db.delete(links).where(eq(links.id, id));
}

export async function reorderLinks(orderedIds: number[]): Promise<void> {
  if (orderedIds.length === 0) return;
  // Batch all updates in a single transaction so reorder is atomic and fast.
  db.transaction((tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      tx.update(links).set({ orderIndex: i }).where(eq(links.id, orderedIds[i])).run();
    }
  });
}

// ─── Themes ───────────────────────────────────────────────────────────────────

export async function getActiveTheme(): Promise<ThemeRow | null> {
  // Ensure presets exist before querying. This was previously an inline
  // fallback that seeded a SINGLE Aurora theme, which prevented
  // seedThemesIfEmpty() from ever running (it saw count > 0 and bailed).
  // The public page calls getActiveTheme() before the admin theme page is
  // visited, so this must be the single source of truth for seeding.
  await seedThemesIfEmpty();

  const rows = await db.select().from(themes).where(eq(themes.isActive, true)).limit(1);
  if (rows[0]) return rows[0];

  // No active theme — activate the first preset.
  const any = await db.select().from(themes).orderBy(asc(themes.id)).limit(1);
  if (any[0]) {
    await db.update(themes).set({ isActive: true }).where(eq(themes.id, any[0].id));
    return { ...any[0], isActive: true };
  }

  return null;
}

export async function getActiveThemeData(): Promise<ThemeRow | null> {
  return getActiveTheme();
}

export async function getAllThemes(): Promise<ThemeRow[]> {
  return db.select().from(themes).orderBy(asc(themes.id));
}

export async function setActiveTheme(id: number): Promise<void> {
  // Single transaction: deactivate all, then activate the target. If the
  // process crashes between them, the whole operation rolls back.
  db.transaction((tx) => {
    tx.update(themes).set({ isActive: false }).run();
    tx.update(themes).set({ isActive: true }).where(eq(themes.id, id)).run();
  });
}

export async function updateTheme(
  id: number,
  data: Partial<Omit<ThemeRow, "id" | "isActive" | "isPreset">>,
): Promise<void> {
  await db.update(themes).set(data).where(eq(themes.id, id));
}

/**
 * Duplicate a theme (preset or custom) as a new inactive custom theme.
 * Used by "Save as new" / "Duplicate" in the customizer so users can
 * clone a preset and modify the copy without touching the original.
 */
export async function duplicateTheme(id: number, newName: string): Promise<ThemeRow> {
  const rows = await db.select().from(themes).where(eq(themes.id, id)).limit(1);
  const source = rows[0];
  if (!source) throw new Error("Theme not found");

  const { id: _id, isActive: _isActive, ...rest } = source;
  void _id;
  void _isActive;

  const inserted = await db
    .insert(themes)
    .values({
      ...rest,
      name: newName,
      isActive: false,
      isPreset: false,
    })
    .returning();

  return inserted[0];
}

/** Check whether a theme with the given name already exists (exact match, case-sensitive). */
export async function themeNameExists(name: string): Promise<boolean> {
  const rows = await db
    .select({ id: themes.id })
    .from(themes)
    .where(eq(themes.name, name.trim()))
    .limit(1);
  return rows.length > 0;
}

/** Delete a theme by id. Presets cannot be deleted. */
export async function deleteTheme(id: number): Promise<void> {
  await db.delete(themes).where(eq(themes.id, id));
}

/** Seed a set of attractive preset themes if the table is empty. */
export async function seedThemesIfEmpty(): Promise<void> {
  const count = await db.select({ c: sql<number>`count(*)` }).from(themes);
  if ((count[0]?.c ?? 0) > 0) return;

  // Base shape shared by all presets — sensible token-system defaults.
  const base = {
    isPreset: true as const,
    isActive: false as const,
    mode: "dark" as const,
    backgroundAngle: "160deg",
    overlayColor: "#000000",
    overlayOpacity: "0",
    fontScale: "100",
    fontWeight: "500",
    letterSpacing: "0",
    radius: "auto",
    buttonSize: "md",
    borderWidth: "1px",
    shadowStrength: "medium",
    hoverEffect: "lift",
    containerWidth: "540px",
    alignment: "center",
    density: "normal",
    glow: "false",
    glowColor: "#533fd6",
    blur: "12px",
    noise: "false",
  };

  const presets = [
    // ── 1. Aurora (animated, the flagship) ──────────────────────────────
    {
      ...base,
      name: "Aurora",
      backgroundType: "aurora",
      backgroundValue: "#0a0820",
      fontFamily: "inter",
      primaryColor: "#533fd6",
      secondaryColor: "#a78bfa",
      cardBackground: "rgba(20,17,46,0.55)",
      cardBorderColor: "rgba(167,139,250,0.18)",
      textColor: "#eceafe",
      mutedTextColor: "#a39ec9",
      linkStyle: "glass",
      animationType: "lift",
      isActive: true,
    },
    // ── 2. Glassmorphism ────────────────────────────────────────────────
    {
      ...base,
      name: "Glassmorphism",
      backgroundType: "mesh",
      backgroundValue: "#6366f1,#ec4899,#0f172a",
      backgroundAngle: "radial",
      fontFamily: "dm-sans",
      primaryColor: "#818cf8",
      secondaryColor: "#f472b6",
      cardBackground: "rgba(255,255,255,0.08)",
      cardBorderColor: "rgba(255,255,255,0.15)",
      textColor: "#f1f5f9",
      mutedTextColor: "#94a3b8",
      linkStyle: "glass",
      animationType: "lift",
      radius: "16px",
      blur: "20px",
    },
    // ── 3. Neon Cyberpunk ───────────────────────────────────────────────
    {
      ...base,
      name: "Neon Cyberpunk",
      backgroundType: "solid",
      backgroundValue: "#0d0221",
      fontFamily: "jetbrains",
      primaryColor: "#00f0ff",
      secondaryColor: "#ff006e",
      cardBackground: "rgba(13,2,33,0.6)",
      cardBorderColor: "rgba(0,240,255,0.3)",
      textColor: "#e0e0ff",
      mutedTextColor: "#6b6b8d",
      linkStyle: "neon",
      animationType: "scale",
      radius: "4px",
      glow: "true",
      glowColor: "#00f0ff",
      hoverEffect: "glow",
      fontWeight: "600",
    },
    // ── 4. Editorial Paper ──────────────────────────────────────────────
    {
      ...base,
      mode: "light",
      name: "Editorial Paper",
      backgroundType: "solid",
      backgroundValue: "#faf9f6",
      fontFamily: "playfair",
      primaryColor: "#1a1a1a",
      secondaryColor: "#8b7355",
      cardBackground: "#ffffff",
      cardBorderColor: "#e5e0d5",
      textColor: "#1a1a1a",
      mutedTextColor: "#6b6b6b",
      linkStyle: "sharp",
      animationType: "lift",
      radius: "0px",
      borderWidth: "0px",
      shadowStrength: "subtle",
      buttonSize: "lg",
      fontScale: "110",
      fontWeight: "400",
    },
    // ── 5. Terminal Mono ────────────────────────────────────────────────
    {
      ...base,
      name: "Terminal Mono",
      backgroundType: "solid",
      backgroundValue: "#0c0c0c",
      fontFamily: "jetbrains",
      primaryColor: "#00ff41",
      secondaryColor: "#00ff41",
      cardBackground: "rgba(0,255,65,0.04)",
      cardBorderColor: "rgba(0,255,65,0.2)",
      textColor: "#00ff41",
      mutedTextColor: "#4a8a55",
      linkStyle: "sharp",
      animationType: "none",
      radius: "0px",
      borderWidth: "1px",
      buttonSize: "sm",
      fontWeight: "400",
      letterSpacing: "0.5",
      hoverEffect: "none",
    },
    // ── 6. Pastel Soft ──────────────────────────────────────────────────
    {
      ...base,
      mode: "light",
      name: "Pastel Soft",
      backgroundType: "gradient",
      backgroundValue: "#fce7f3,#e0e7ff",
      backgroundAngle: "135deg",
      fontFamily: "poppins",
      primaryColor: "#ec4899",
      secondaryColor: "#a78bfa",
      cardBackground: "rgba(255,255,255,0.7)",
      cardBorderColor: "rgba(236,72,153,0.15)",
      textColor: "#475569",
      mutedTextColor: "#94a3b8",
      linkStyle: "pill",
      animationType: "scale",
      radius: "9999px",
      shadowStrength: "soft",
      fontWeight: "500",
    },
    // ── 7. Brutalist ────────────────────────────────────────────────────
    {
      ...base,
      mode: "light",
      name: "Brutalist",
      backgroundType: "solid",
      backgroundValue: "#fbbf24",
      fontFamily: "space-grotesk",
      primaryColor: "#000000",
      secondaryColor: "#000000",
      cardBackground: "#ffffff",
      cardBorderColor: "#000000",
      textColor: "#000000",
      mutedTextColor: "#451a03",
      linkStyle: "sharp",
      animationType: "none",
      radius: "0px",
      borderWidth: "3px",
      shadowStrength: "none",
      buttonSize: "lg",
      fontWeight: "700",
      letterSpacing: "-0.5",
      hoverEffect: "lift",
    },
    // ── 8. Retro Sunset ─────────────────────────────────────────────────
    {
      ...base,
      name: "Retro Sunset",
      backgroundType: "gradient",
      backgroundValue: "#2d1b69,#c2185b,#f9a825",
      backgroundAngle: "180deg",
      fontFamily: "bebas",
      primaryColor: "#ffd54f",
      secondaryColor: "#ff6f00",
      cardBackground: "rgba(0,0,0,0.3)",
      cardBorderColor: "rgba(255,213,79,0.3)",
      textColor: "#fff8e1",
      mutedTextColor: "#ffe082",
      linkStyle: "pill",
      animationType: "lift",
      radius: "8px",
      glow: "true",
      glowColor: "#ffd54f",
      fontWeight: "400",
      fontScale: "120",
    },
    // ── 9. Minimal Light ────────────────────────────────────────────────
    {
      ...base,
      mode: "light",
      name: "Minimal Light",
      backgroundType: "solid",
      backgroundValue: "#ffffff",
      fontFamily: "outfit",
      primaryColor: "#3b82f6",
      secondaryColor: "#3b82f6",
      cardBackground: "#ffffff",
      cardBorderColor: "#e5e7eb",
      textColor: "#111827",
      mutedTextColor: "#6b7280",
      linkStyle: "outline",
      animationType: "lift",
      radius: "12px",
      borderWidth: "1px",
      shadowStrength: "subtle",
      hoverEffect: "lift",
      fontWeight: "500",
    },
  ];

  await db.insert(themes).values(presets);
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(settings);
  const out: Record<string, string> = {};
  for (const row of rows) out[row.key] = row.value;
  return out;
}

export async function getSetting(key: string): Promise<string | null> {
  const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return rows[0]?.value ?? null;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  if (existing[0]) {
    await db.update(settings).set({ value }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUserCount(): Promise<number> {
  const rows = await db.select({ c: sql<number>`count(*)` }).from(users);
  return rows[0]?.c ?? 0;
}

export async function getUserByUsername(username: string): Promise<UserRow | null> {
  const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return rows[0] ?? null;
}

export async function createUser(
  username: string,
  passwordHash: string,
): Promise<UserRow> {
  const created = await db.insert(users).values({ username, passwordHash }).returning();
  return created[0];
}

export async function updateUserPassword(
  userId: number,
  passwordHash: string,
): Promise<void> {
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

// ─── Analytics ────────────────────────────────────────────────────────────────

// Cached retention window so we don't read settings on every pageview.
let retentionCache: { days: number; at: number } = { days: -1, at: 0 };

/** Opportunistically prune analytics older than the configured retention
 *  window (settings key `analyticsRetentionDays`). Reads the setting at most
 *  once per minute; a no-op when no retention is configured. */
async function pruneAnalyticsIfDue(): Promise<void> {
  const now = Date.now();
  if (now - retentionCache.at > 60_000) {
    const raw = await getSetting("analyticsRetentionDays");
    const days = raw && /^\d+$/.test(raw) ? Number(raw) : 0;
    retentionCache = { days, at: now };
  }
  const { days } = retentionCache;
  if (days <= 0) return;
  const cutoff = sql`datetime('now', ${`-${days} days`})`;
  db.delete(analyticsPageviews).where(lt(analyticsPageviews.createdAt, cutoff)).run();
  db.delete(analyticsClicks).where(lt(analyticsClicks.createdAt, cutoff)).run();
}

export async function recordPageview(
  visitorHash: string,
  referrer: string | null,
  deviceType: string | null,
  country: string | null,
): Promise<void> {
  await db.insert(analyticsPageviews).values({
    visitorHash,
    referrer: referrer ?? null,
    deviceType: deviceType ?? null,
    country: country ?? null,
  });
  await pruneAnalyticsIfDue();
}

export async function recordClick(
  linkId: number,
  visitorHash: string,
  referrer: string | null,
): Promise<void> {
  // Wrap in a transaction so the analytics insert and the denormalized
  // clicksCount increment can't drift apart if one fails.
  db.transaction((tx) => {
    tx.insert(analyticsClicks).values({
      linkId,
      visitorHash,
      referrer: referrer ?? null,
    }).run();
    tx.update(links)
      .set({ clicksCount: sql`${links.clicksCount} + 1` })
      .where(eq(links.id, linkId))
      .run();
  });
}

// AnalyticsRange is re-exported from the shared analytics-range module so there
// is a single source of truth for the type + sinceExpr logic.
export type { AnalyticsRange } from "@/lib/analytics-range";
import { sinceExpr, type AnalyticsRange } from "@/lib/analytics-range";

export interface BreakdownEntry {
  label: string;
  count: number;
}

export interface AnalyticsBreakdown {
  referrers: BreakdownEntry[];
  devices: BreakdownEntry[];
  countries: BreakdownEntry[];
}

export interface LinkStats {
  link: LinkRow;
  totalClicks: number;
  clicksPerDay: Array<{ date: string; clicks: number }>;
  topReferrers: BreakdownEntry[];
}

/** Number of day-buckets to render for a range. */
async function rangeDayCount(range: AnalyticsRange): Promise<number> {
  if (range !== "all") {
    return range === "7d" ? 7 : range === "30d" ? 30 : 90;
  }
  // "all": span from the earliest analytics record to today (capped at 365).
  const [pv] = await db
    .select({ m: sql<string>`min(${analyticsPageviews.createdAt})` })
    .from(analyticsPageviews);
  const [cl] = await db
    .select({ m: sql<string>`min(${analyticsClicks.createdAt})` })
    .from(analyticsClicks);
  const earliest = [pv?.m, cl?.m].filter(Boolean).sort()[0];
  if (!earliest) return 30;
  const start = new Date(earliest.replace(" ", "T") + "Z").getTime();
  const days = Math.ceil((Date.now() - start) / 86_400_000);
  return Math.min(365, Math.max(1, days));
}

/** `days` UTC date keys ending today, for zero-filling a chart series. */
function buildDaySeries(days: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export async function getDashboardStats(range: AnalyticsRange = "7d"): Promise<DashboardStats> {
  const since = sinceExpr(range);
  const seriesDates = buildDaySeries(await rangeDayCount(range));

  const viewRows = await db
    .select({ c: sql<number>`count(*)` })
    .from(analyticsPageviews)
    .where(gt(analyticsPageviews.createdAt, since));
  const totalViews = viewRows[0]?.c ?? 0;

  const uniqueRows = await db
    .select({ c: sql<number>`count(distinct ${analyticsPageviews.visitorHash})` })
    .from(analyticsPageviews)
    .where(gt(analyticsPageviews.createdAt, since));
  const uniqueVisitors = uniqueRows[0]?.c ?? 0;

  const clickRows = await db
    .select({ c: sql<number>`count(*)` })
    .from(analyticsClicks)
    .where(gt(analyticsClicks.createdAt, since));
  const totalClicks = clickRows[0]?.c ?? 0;

  const topLinkRows = await db
    .select({
      id: analyticsClicks.linkId,
      title: links.title,
      clicks: sql<number>`count(*)`,
    })
    .from(analyticsClicks)
    .innerJoin(links, eq(links.id, analyticsClicks.linkId))
    .where(gt(analyticsClicks.createdAt, since))
    .groupBy(analyticsClicks.linkId)
    .orderBy(desc(sql`count(*)`))
    .limit(5);
  const topLinks = topLinkRows.map((r) => ({
    id: r.id,
    title: r.title,
    clicks: Number(r.clicks),
  }));

  const viewsPerDayRows = await db
    .select({
      date: sql<string>`date(${analyticsPageviews.createdAt})`,
      views: sql<number>`count(*)`,
    })
    .from(analyticsPageviews)
    .where(gt(analyticsPageviews.createdAt, since))
    .groupBy(sql`date(${analyticsPageviews.createdAt})`)
    .orderBy(asc(sql`date(${analyticsPageviews.createdAt})`));

  const clicksPerDayRows = await db
    .select({
      date: sql<string>`date(${analyticsClicks.createdAt})`,
      clicks: sql<number>`count(*)`,
    })
    .from(analyticsClicks)
    .where(gt(analyticsClicks.createdAt, since))
    .groupBy(sql`date(${analyticsClicks.createdAt})`)
    .orderBy(asc(sql`date(${analyticsClicks.createdAt})`));

  const viewsMap = new Map<string, number>();
  for (const r of viewsPerDayRows) viewsMap.set(r.date, Number(r.views));
  const clicksMap = new Map<string, number>();
  for (const r of clicksPerDayRows) clicksMap.set(r.date, Number(r.clicks));

  const viewsPerDay = seriesDates.map((date) => ({
    date,
    views: viewsMap.get(date) ?? 0,
    clicks: clicksMap.get(date) ?? 0,
  }));

  const ctr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  return { totalViews, uniqueVisitors, totalClicks, ctr, topLinks, viewsPerDay };
}

/** Top referrers / devices / countries among views in the window. */
export async function getAnalyticsBreakdown(range: AnalyticsRange = "7d"): Promise<AnalyticsBreakdown> {
  const clean = (rows: Array<{ label: string | null; count: number }>) =>
    rows
      .filter((r) => r.label && r.label.trim() !== "")
      .map((r) => ({ label: r.label as string, count: Number(r.count) }));

  const [referrerRows, deviceRows, countryRows] = await Promise.all([
    db.select({ label: analyticsPageviews.referrer, count: sql<number>`count(*)` })
      .from(analyticsPageviews).where(gt(analyticsPageviews.createdAt, sinceExpr(range)))
      .groupBy(analyticsPageviews.referrer).orderBy(desc(sql`count(*)`)).limit(8),
    db.select({ label: analyticsPageviews.deviceType, count: sql<number>`count(*)` })
      .from(analyticsPageviews).where(gt(analyticsPageviews.createdAt, sinceExpr(range)))
      .groupBy(analyticsPageviews.deviceType).orderBy(desc(sql`count(*)`)).limit(8),
    db.select({ label: analyticsPageviews.country, count: sql<number>`count(*)` })
      .from(analyticsPageviews).where(gt(analyticsPageviews.createdAt, sinceExpr(range)))
      .groupBy(analyticsPageviews.country).orderBy(desc(sql`count(*)`)).limit(8),
  ]);

  return {
    referrers: clean(referrerRows),
    devices: clean(deviceRows),
    countries: clean(countryRows),
  };
}

/** Per-link drill-down: clicks over time + total + top referrers. */
export async function getLinkStats(linkId: number, range: AnalyticsRange = "30d"): Promise<LinkStats | null> {
  const linkRows = await db.select().from(links).where(eq(links.id, linkId)).limit(1);
  const link = linkRows[0];
  if (!link) return null;

  const since = sinceExpr(range);
  const seriesDates = buildDaySeries(await rangeDayCount(range));

  const totalRows = await db
    .select({ c: sql<number>`count(*)` })
    .from(analyticsClicks)
    .where(and(eq(analyticsClicks.linkId, linkId), gt(analyticsClicks.createdAt, since)));
  const totalClicks = totalRows[0]?.c ?? 0;

  const perDayRows = await db
    .select({
      date: sql<string>`date(${analyticsClicks.createdAt})`,
      clicks: sql<number>`count(*)`,
    })
    .from(analyticsClicks)
    .where(and(eq(analyticsClicks.linkId, linkId), gt(analyticsClicks.createdAt, since)))
    .groupBy(sql`date(${analyticsClicks.createdAt})`)
    .orderBy(asc(sql`date(${analyticsClicks.createdAt})`));
  const clicksMap = new Map<string, number>();
  for (const r of perDayRows) clicksMap.set(r.date, Number(r.clicks));
  const clicksPerDay = seriesDates.map((date) => ({ date, clicks: clicksMap.get(date) ?? 0 }));

  const refRows = await db
    .select({ label: analyticsClicks.referrer, count: sql<number>`count(*)` })
    .from(analyticsClicks)
    .where(and(eq(analyticsClicks.linkId, linkId), gt(analyticsClicks.createdAt, since)))
    .groupBy(analyticsClicks.referrer)
    .orderBy(desc(sql`count(*)`))
    .limit(8);
  const topReferrers = refRows
    .filter((r) => r.label && r.label.trim() !== "")
    .map((r) => ({ label: r.label as string, count: Number(r.count) }));

  return { link, totalClicks, clicksPerDay, topReferrers };
}

export async function getLink(id: number): Promise<LinkRow | null> {
  const rows = await db.select().from(links).where(eq(links.id, id)).limit(1);
  return rows[0] ?? null;
}

// ─── Subscribers (email capture) ──────────────────────────────────────────────

export type SubscriberRow = typeof subscribers.$inferSelect;

export async function addSubscriber(email: string): Promise<void> {
  await db.insert(subscribers).values({ email });
}

export async function getSubscriberCount(): Promise<number> {
  const rows = await db.select({ c: sql<number>`count(*)` }).from(subscribers);
  return rows[0]?.c ?? 0;
}

export async function getAllSubscribers(): Promise<SubscriberRow[]> {
  return db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
}

export async function clearSubscribers(): Promise<void> {
  db.delete(subscribers).run();
}
