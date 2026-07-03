"use server";

import { revalidatePath } from "next/cache";
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
    version: 1,
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

  db.delete(analyticsPageviews).run();
  db.delete(analyticsClicks).run();
  db.update(links).set({ clicksCount: 0 }).run();

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
