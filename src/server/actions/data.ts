"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  profile,
  links,
  settings,
  themes,
  analyticsPageviews,
  analyticsClicks,
} from "@/db/schema";
import { getSession } from "@/lib/auth";
import { demoBlock } from "@/lib/demo";
import {
  updateSetting,
  type ProfileRow,
  type LinkRow,
  type ThemeRow,
} from "@/server/queries";

export type ActionResult = { success: true } | { success: false; error: string };

const SUPPORTED_BACKUP_VERSION = 1;

// Zod schemas validating the shape of each table's rows. Unknown fields are
// stripped so a backup from a newer version with extra columns can't corrupt
// the DB insert.
const profileRowSchema = z.object({
  id: z.number().optional(),
  avatarUrl: z.string().nullable().optional(),
  displayName: z.string().optional(),
  bio: z.string().optional(),
  badgeText: z.string().nullable().optional(),
  socialLinks: z.string().optional(),
});

const linkRowSchema = z.object({
  id: z.number().optional(),
  orderIndex: z.number().optional(),
  type: z.string().optional(),
  title: z.string(),
  description: z.string().nullable().optional(),
  url: z.string(),
  icon: z.string().nullable().optional(),
  isHighlighted: z.boolean().optional(),
  isActive: z.boolean().optional(),
  scheduleStart: z.string().nullable().optional(),
  scheduleEnd: z.string().nullable().optional(),
  clicksCount: z.number().optional(),
  createdAt: z.string().optional(),
});

const settingRowSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const themeRowSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  backgroundType: z.string().optional(),
  backgroundValue: z.string().optional(),
  fontFamily: z.string().optional(),
  primaryColor: z.string().optional(),
  textColor: z.string().optional(),
  linkStyle: z.string().optional(),
  animationType: z.string().optional(),
  isActive: z.boolean().optional(),
});

/** Shape of an exported theme (all cosmetic fields, no id/isActive). */
const exportableThemeSchema = z.object({
  version: z.literal(1),
  app: z.literal("linkbreeze"),
  kind: z.literal("theme"),
  name: z.string().min(1).max(120),
  backgroundType: z.string().max(60),
  backgroundValue: z.string().max(500),
  fontFamily: z.string().max(300),
  primaryColor: z.string().max(60),
  textColor: z.string().max(60),
  linkStyle: z.string().max(60),
  animationType: z.string().max(60),
  exportedAt: z.string(),
});

type ExportableTheme = z.infer<typeof exportableThemeSchema>;

interface BackupPayload {
  version: number;
  exportedAt: string;
  profile: ProfileRow[];
  links: LinkRow[];
  settings: Array<{ key: string; value: string }>;
  themes: ThemeRow[];
}

/** Snapshot of all regenerable config (not analytics — that's CSV-exportable). */
export async function exportBackupPayload(): Promise<BackupPayload> {
  const [p, l, s, t] = await Promise.all([
    db.select().from(profile),
    db.select().from(links),
    db.select().from(settings),
    db.select().from(themes),
  ]);
  return {
    version: SUPPORTED_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    profile: p,
    links: l,
    settings: s,
    themes: t,
  };
}

/** Transactional restore: replace profile/links/settings/themes from a backup
 *  file. Rolls back on any error so a bad file never wipes current data. */
export async function restoreBackup(formData: FormData): Promise<ActionResult> {
  const demo = demoBlock();
  if (demo) return { success: false, error: demo };
  if (!(await getSession())) return { success: false, error: "Unauthorized" };

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "No backup file provided" };
  }

  let parsed: BackupPayload;
  try {
    parsed = JSON.parse(await file.text()) as BackupPayload;
  } catch {
    return { success: false, error: "Invalid JSON file" };
  }

  if (
    !parsed ||
    typeof parsed.version !== "number" ||
    !Array.isArray(parsed.profile) ||
    !Array.isArray(parsed.links) ||
    !Array.isArray(parsed.settings) ||
    !Array.isArray(parsed.themes)
  ) {
    return { success: false, error: "Not a valid LinkBreeze backup" };
  }

  if (parsed.version !== SUPPORTED_BACKUP_VERSION) {
    return {
      success: false,
      error: `Unsupported backup version: ${parsed.version}. This instance expects version ${SUPPORTED_BACKUP_VERSION}.`,
    };
  }

  // Validate every row's shape before touching the DB. A malformed backup
  // file is rejected here instead of corrupting tables inside the transaction.
  const validatedProfile = z.array(profileRowSchema).safeParse(parsed.profile);
  const validatedLinks = z.array(linkRowSchema).safeParse(parsed.links);
  const validatedSettings = z.array(settingRowSchema).safeParse(parsed.settings);
  const validatedThemes = z.array(themeRowSchema).safeParse(parsed.themes);
  if (!validatedProfile.success || !validatedLinks.success || !validatedSettings.success || !validatedThemes.success) {
    return { success: false, error: "Backup contains malformed data — rows don't match the expected schema" };
  }
  parsed.profile = validatedProfile.data as ProfileRow[];
  parsed.links = validatedLinks.data as LinkRow[];
  parsed.settings = validatedSettings.data as Array<{ key: string; value: string }>;
  parsed.themes = validatedThemes.data as ThemeRow[];

  try {
    db.transaction((tx) => {
      tx.delete(profile).run();
      tx.delete(links).run();
      tx.delete(settings).run();
      tx.delete(themes).run();
      if (parsed.profile.length) tx.insert(profile).values(parsed.profile).run();
      if (parsed.links.length) tx.insert(links).values(parsed.links).run();
      if (parsed.settings.length) tx.insert(settings).values(parsed.settings).run();
      if (parsed.themes.length) tx.insert(themes).values(parsed.themes).run();
    });
  } catch (err) {
    console.error("[restoreBackup]", err);
    return { success: false, error: "Restore failed — backup may be incompatible" };
  }

  // Everything changed; revalidate the whole tree.
  revalidatePath("/", "layout");
  return { success: true };
}

/** Wipe all analytics + reset per-link click counters. */
export async function clearAnalytics(): Promise<ActionResult> {
  const demo = demoBlock();
  if (demo) return { success: false, error: demo };
  if (!(await getSession())) return { success: false, error: "Unauthorized" };

  db.transaction((tx) => {
    tx.delete(analyticsPageviews).run();
    tx.delete(analyticsClicks).run();
    tx.update(links).set({ clicksCount: 0 }).run();
  });

  revalidatePath("/dashboard");
  revalidatePath("/links");
  return { success: true };
}

/** Set the analytics retention window in days (0 = keep forever). */
export async function setRetention(formData: FormData): Promise<ActionResult> {
  const demo = demoBlock();
  if (demo) return { success: false, error: demo };
  if (!(await getSession())) return { success: false, error: "Unauthorized" };

  const raw = (formData.get("retention") as string) || "";
  const days = raw && /^\d+$/.test(raw) ? Number(raw) : 0;
  await updateSetting("analyticsRetentionDays", String(days));

  revalidatePath("/settings");
  return { success: true };
}

/**
 * Export a single theme as a portable, JSON-serializable object (all cosmetic
 * fields, minus id and isActive). Auth + demo gated. Throws on auth failure so
 * the API route can map to a 401.
 */
export async function exportTheme(id: number): Promise<ExportableTheme> {
  if (demoBlock()) throw new Error("read-only");
  if (!(await getSession())) throw new Error("Unauthorized");

  const rows = await db.select().from(themes).where(eq(themes.id, id)).limit(1);
  const theme = rows[0];
  if (!theme) throw new Error("Theme not found");

  return {
    version: 1,
    app: "linkbreeze",
    kind: "theme",
    name: theme.name,
    backgroundType: theme.backgroundType,
    backgroundValue: theme.backgroundValue,
    fontFamily: theme.fontFamily,
    primaryColor: theme.primaryColor,
    textColor: theme.textColor,
    linkStyle: theme.linkStyle,
    animationType: theme.animationType,
    exportedAt: new Date().toISOString(),
  };
}

/** Import a previously-exported theme, creating a new (inactive) copy. */
export async function importTheme(json: string): Promise<ActionResult> {
  const demo = demoBlock();
  if (demo) return { success: false, error: demo };
  if (!(await getSession())) return { success: false, error: "Unauthorized" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { success: false, error: "Invalid JSON" };
  }

  const result = exportableThemeSchema.safeParse(parsed);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid theme file",
    };
  }
  const t = result.data;

  await db.insert(themes).values({
    name: t.name,
    backgroundType: t.backgroundType,
    backgroundValue: t.backgroundValue,
    fontFamily: t.fontFamily,
    primaryColor: t.primaryColor,
    textColor: t.textColor,
    linkStyle: t.linkStyle,
    animationType: t.animationType,
    isActive: false,
  });

  revalidatePath("/theme");
  return { success: true };
}
