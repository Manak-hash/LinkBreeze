"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import path from "node:path";
import crypto from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { db } from "@/db";
import {
  profile,
  links,
  linkSections,
  settings,
  themes,
  customFonts,
  analyticsPageviews,
  analyticsClicks,
} from "@/db/schema";
import { getSession } from "@/lib/auth";
import { demoGuard } from "@/lib/demo-guard";
import {
  type ActionResult,
  validationError,
  conflictError,
  unauthorizedError,
  ErrorCode,
} from "@/lib/errors";
import { isAllowedLinkUrl } from "@/lib/link-url";
import { UPLOADS_DIR, ensureUploadsDir, sniffFontFormat } from "@/lib/uploads";
import { parseCustomFontId, customFontFamily } from "@/lib/custom-fonts";
import {
  updateSetting,
  type ProfileRow,
  type LinkRow,
  type ThemeRow,
} from "@/server/queries";


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
  sectionId: z.number().nullable().optional(),
  createdAt: z.string().optional(),
});

const settingRowSchema = z.object({
  key: z.string(),
  value: z.string(),
});

// v1.3: link sections. Optional so backups from before 1.3 (which have no
// sections) still restore cleanly — links fall back to uncategorized.
const sectionRowSchema = z.object({
  id: z.number().optional(),
  pageId: z.number(),
  title: z.string(),
  icon: z.string().nullable().optional(),
  orderIndex: z.number().optional(),
  createdAt: z.string().optional(),
});

const themeRowSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  // Background
  backgroundType: z.string().optional(),
  backgroundValue: z.string().optional(),
  backgroundAngle: z.string().optional(),
  backgroundImageUrl: z.string().optional(),
  overlayColor: z.string().optional(),
  overlayOpacity: z.string().optional(),
  // Colors
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  cardBackground: z.string().optional(),
  cardBorderColor: z.string().optional(),
  textColor: z.string().optional(),
  mutedTextColor: z.string().optional(),
  mode: z.string().optional(),
  // Typography
  fontFamily: z.string().optional(),
  cardFontFamily: z.string().optional(),
  fontScale: z.string().optional(),
  fontWeight: z.string().optional(),
  letterSpacing: z.string().optional(),
  // Card
  linkStyle: z.string().optional(),
  animationType: z.string().optional(),
  radius: z.string().optional(),
  buttonSize: z.string().optional(),
  borderWidth: z.string().optional(),
  shadowStrength: z.string().optional(),
  hoverEffect: z.string().optional(),
  // Layout
  containerWidth: z.string().optional(),
  alignment: z.string().optional(),
  density: z.string().optional(),
  // Effects
  glow: z.string().optional(),
  glowColor: z.string().optional(),
  blur: z.string().optional(),
  noise: z.string().optional(),
  // Profile styling (1.3)
  avatarShape: z.string().optional(),
  avatarBorder: z.string().optional(),
  avatarFloat: z.string().optional(),
  profileLayout: z.string().optional(),
  textAnimation: z.string().optional(),
  // Meta
  isActive: z.boolean().optional(),
  isPreset: z.boolean().optional(),
});

/** Uploaded theme font row (#82) — rows only in backups. */
const customFontRowSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1).max(60),
  family: z.string().min(1).max(100),
  filename: z.string().min(1).max(120),
  url: z.string().min(1).max(500),
  sizeBytes: z.number().optional(),
  format: z.string().optional(),
  createdAt: z.string().optional(),
});

/** Shape of an exported theme (all cosmetic fields, no id/isActive/isPreset). */
const exportableThemeSchema = z.object({
  version: z.literal(1),
  app: z.literal("linkbreeze"),
  kind: z.literal("theme"),
  name: z.string().min(1).max(120),
  // Background
  backgroundType: z.string().max(60),
  backgroundValue: z.string().max(500),
  backgroundAngle: z.string().max(20).optional().default("160deg"),
  backgroundImageUrl: z.string().max(1000).optional().default(""),
  backgroundFit: z.enum(["cover", "contain", "tile"]).optional().default("cover"),
  backgroundPosition: z.string().max(20).optional().default("50% 50%"),
  overlayColor: z.string().max(60).optional().default("#000000"),
  overlayOpacity: z.string().max(10).optional().default("0"),
  // Colors
  primaryColor: z.string().max(60),
  secondaryColor: z.string().max(60).optional().default("#a78bfa"),
  cardBackground: z.string().max(200).optional().default("rgba(255,255,255,0.06)"),
  cardBorderColor: z.string().max(200).optional().default("rgba(167,139,250,0.16)"),
  textColor: z.string().max(60),
  mutedTextColor: z.string().max(200).optional().default("rgba(234,234,234,0.7)"),
  mode: z.string().max(10).optional().default("dark"),
  // Typography
  fontFamily: z.string().max(300),
  // Separate card font — optional with default "" so pre-card-font exports
  // import cleanly (cards just inherit the site font).
  cardFontFamily: z.string().max(300).optional().default(""),
  fontScale: z.string().max(10).optional().default("md"),
  fontWeight: z.string().max(10).optional().default("600"),
  letterSpacing: z.string().max(20).optional().default("0"),
  // Card
  linkStyle: z.string().max(60),
  animationType: z.string().max(60),
  radius: z.string().max(20).optional().default("auto"),
  buttonSize: z.string().max(10).optional().default("md"),
  borderWidth: z.string().max(20).optional().default("1px"),
  shadowStrength: z.string().max(20).optional().default("medium"),
  hoverEffect: z.string().max(20).optional().default("lift"),
  // Layout
  containerWidth: z.string().max(20).optional().default("standard"),
  alignment: z.string().max(20).optional().default("center"),
  density: z.string().max(20).optional().default("normal"),
  // Effects
  glow: z.string().max(10).optional().default("false"),
  glowColor: z.string().max(60).optional().default("#a78bfa"),
  blur: z.string().max(20).optional().default("8px"),
  noise: z.string().max(10).optional().default("false"),
  // Profile styling (1.3) — optional with defaults so pre-1.3 exports import cleanly
  avatarShape: z.string().max(20).optional().default("circle"),
  avatarBorder: z.string().max(20).optional().default("solid"),
  avatarFloat: z.string().max(10).optional().default("false"),
  // Resizable avatar — optional with default "auto" so pre-slider exports
  // import cleanly (shape-aware default size).
  profileLayout: z.string().max(20).optional().default("classic"),
  textAnimation: z.string().max(20).optional().default("none"),
  // Custom font payload (#82) — present when fontFamily is "custom:<id>".
  // woff2/woff bytes as base64 so the export is a single portable file; the
  // importer writes the file and re-registers the font as a NEW row, so ids
  // never collide with fonts already on the target instance.
  customFont: z
    .object({
      name: z.string().min(1).max(60),
      format: z.enum(["woff2", "woff"]),
      data: z.string().min(1),
    })
    .optional(),
  // Bytes for the card font when it references a DIFFERENT uploaded font
  // than fontFamily (same shape as customFont).
  cardCustomFont: z
    .object({
      name: z.string().min(1).max(60),
      format: z.enum(["woff2", "woff"]),
      data: z.string().min(1),
    })
    .optional(),
  exportedAt: z.string(),
});

type ExportableTheme = z.infer<typeof exportableThemeSchema>;

interface BackupPayload {
  version: number;
  exportedAt: string;
  profile: ProfileRow[];
  links: LinkRow[];
  sections?: Array<{ id?: number; pageId: number; title: string; icon: string | null; orderIndex: number; createdAt?: string }>;
  settings: Array<{ key: string; value: string }>;
  themes: ThemeRow[];
  /** Uploaded theme fonts (#82) — rows only; files live in the uploads
   *  volume, which survives a restore (same as avatars/backgrounds). */
  customFonts?: Array<{
    id?: number;
    name: string;
    family: string;
    filename: string;
    url: string;
    sizeBytes?: number;
    format?: string;
    createdAt?: string;
  }>;
}

/** Snapshot of all regenerable config (not analytics — that's CSV-exportable). */
export async function exportBackupPayload(): Promise<BackupPayload> {
  const [p, l, sec, s, t, cf] = await Promise.all([
    db.select().from(profile),
    db.select().from(links),
    db.select().from(linkSections),
    db.select().from(settings),
    db.select().from(themes),
    db.select().from(customFonts),
  ]);
  return {
    version: SUPPORTED_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    profile: p,
    links: l,
    sections: sec,
    settings: s,
    themes: t,
    customFonts: cf,
  };
}

/** Transactional restore: replace profile/links/settings/themes from a backup
 *  file. Rolls back on any error so a bad file never wipes current data. */
export async function restoreBackup(formData: FormData): Promise<ActionResult> {
  const blocked = demoGuard();
  if (blocked) return blocked;
  if (!(await getSession())) return unauthorizedError();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return validationError("No backup file provided");
  }

  let parsed: BackupPayload;
  try {
    parsed = JSON.parse(await file.text()) as BackupPayload;
  } catch {
    return validationError("Invalid JSON file");
  }

  if (
    !parsed ||
    typeof parsed.version !== "number" ||
    !Array.isArray(parsed.profile) ||
    !Array.isArray(parsed.links) ||
    !Array.isArray(parsed.settings) ||
    !Array.isArray(parsed.themes)
  ) {
    return validationError("Not a valid LinkBreeze backup");
  }

  if (parsed.version !== SUPPORTED_BACKUP_VERSION) {
    return validationError(`Unsupported backup version. This instance expects version 1.`);
  }

  // Validate every row's shape before touching the DB. A malformed backup
  // file is rejected here instead of corrupting tables inside the transaction.
  const validatedProfile = z.array(profileRowSchema).safeParse(parsed.profile);
  const validatedLinks = z.array(linkRowSchema).safeParse(parsed.links);
  const validatedSettings = z.array(settingRowSchema).safeParse(parsed.settings);
  const validatedThemes = z.array(themeRowSchema).safeParse(parsed.themes);
  if (!validatedProfile.success || !validatedLinks.success || !validatedSettings.success || !validatedThemes.success) {
    return validationError("Backup contains malformed data — rows do not match the expected schema");
  }
  parsed.profile = validatedProfile.data as ProfileRow[];
  parsed.links = validatedLinks.data as LinkRow[];
  parsed.settings = validatedSettings.data as Array<{ key: string; value: string }>;
  parsed.themes = validatedThemes.data as ThemeRow[];

  // Sections are optional (v1 backups have none). Validate when present.
  let sections: z.infer<typeof sectionRowSchema>[] = [];
  if (Array.isArray(parsed.sections) && parsed.sections.length > 0) {
    const validatedSections = z.array(sectionRowSchema).safeParse(parsed.sections);
    if (!validatedSections.success) {
      return validationError("Backup contains malformed sections");
    }
    sections = validatedSections.data;
    // Drop link section references to sections that don't exist in the backup
    // (e.g. hand-edited file) so the FK doesn't reject the restore.
    const sectionIds = new Set(sections.map((s) => s.id));
    parsed.links = parsed.links.map((l) =>
      l.sectionId != null && !sectionIds.has(l.sectionId)
        ? { ...l, sectionId: null }
        : l,
    );
  }

  // Re-validate link URLs against the scheme allowlist. A backup file could
  // carry javascript: or data: URLs that bypass the create/update validators
  // — these would be stored XSS on the public page. Drop offending rows.
  parsed.links = parsed.links.filter(
    (link) => link.type && link.url && isAllowedLinkUrl(link.type, link.url),
  );

  // Custom fonts (#82): optional array (older backups have none). Rows only —
  // the files live in the uploads volume. A malformed array rejects the
  // restore like any other table.
  let fonts: z.infer<typeof customFontRowSchema>[] = [];
  if (Array.isArray(parsed.customFonts) && parsed.customFonts.length > 0) {
    const validatedFonts = z.array(customFontRowSchema).safeParse(parsed.customFonts);
    if (!validatedFonts.success) {
      return validationError("Backup contains malformed custom fonts");
    }
    fonts = validatedFonts.data;
  }

  // Themes referencing a custom font that isn't in the backup (or whose file
  // was never uploaded to this instance) would render a dangling "custom:<id>".
  // The resolver falls back safely, but reset the field so the theme UI shows
  // the truth: Inter.
  const fontIds = new Set(fonts.map((f) => f.id).filter((n): n is number => n != null));
  parsed.themes = parsed.themes.map((theme) =>
    theme.fontFamily && parseCustomFontId(theme.fontFamily) && !fontIds.has(parseCustomFontId(theme.fontFamily)!)
      ? { ...theme, fontFamily: "inter" }
      : theme,
  );

  try {
    db.transaction((tx) => {
      tx.delete(profile).run();
      tx.delete(links).run();
      tx.delete(linkSections).run();
      tx.delete(settings).run();
      tx.delete(themes).run();
      tx.delete(customFonts).run();
      if (parsed.profile.length) tx.insert(profile).values(parsed.profile).run();
      if (sections.length) tx.insert(linkSections).values(sections).run();
      if (parsed.links.length) tx.insert(links).values(parsed.links).run();
      if (parsed.settings.length) tx.insert(settings).values(parsed.settings).run();
      if (parsed.themes.length) tx.insert(themes).values(parsed.themes).run();
      if (fonts.length) tx.insert(customFonts).values(fonts).run();
    });
  } catch (err) {
    console.error("[restoreBackup]", err);
    return { success: false, error: "Restore failed — backup may be incompatible", errorCode: ErrorCode.INTERNAL };
  }

  // Everything changed; revalidate the whole tree.
  revalidatePath("/", "layout");
  return { success: true };
}

/** Wipe all analytics + reset per-link click counters. */
export async function clearAnalytics(): Promise<ActionResult> {
  const blocked = demoGuard();
  if (blocked) return blocked;
  if (!(await getSession())) return unauthorizedError();

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
  const blocked = demoGuard();
  if (blocked) return blocked;
  if (!(await getSession())) return unauthorizedError();

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
  if (demoGuard()) throw new Error("read-only");
  if (!(await getSession())) throw new Error("Unauthorized");

  const rows = await db.select().from(themes).where(eq(themes.id, id)).limit(1);
  const theme = rows[0];
  if (!theme) throw new Error("Theme not found");

  // Embed uploaded fonts' bytes so the export file is self-contained.
  // Both the site font (#82) and the card font are embedded when they
  // reference uploaded fonts; a missing file degrades to a reference only.
  const embedFont = async (ref: string | null): Promise<ExportableTheme["customFont"]> => {
    const fid = parseCustomFontId(ref);
    if (!fid) return undefined;
    const fontRows = await db.select().from(customFonts).where(eq(customFonts.id, fid)).limit(1);
    const font = fontRows[0];
    if (font && (font.format === "woff2" || font.format === "woff")) {
      try {
        const filename = font.url.split("/").pop();
        if (filename) {
          const bytes = await readFile(path.join(UPLOADS_DIR, filename));
          return {
            name: font.name,
            format: font.format,
            data: bytes.toString("base64"),
          };
        }
      } catch {
        // File gone from disk — export without the payload.
      }
    }
    return undefined;
  };

  const customFont = await embedFont(theme.fontFamily);
  // Only embed the card font separately when it differs from the site font;
  // sharing one uploaded font embeds it once (customFont).
  const cardCustomFont =
    theme.cardFontFamily && theme.cardFontFamily !== theme.fontFamily
      ? await embedFont(theme.cardFontFamily)
      : undefined;

  return {
    version: 1,
    app: "linkbreeze",
    kind: "theme",
    name: theme.name,
    backgroundType: theme.backgroundType,
    backgroundValue: theme.backgroundValue,
    backgroundAngle: theme.backgroundAngle,
    backgroundImageUrl: theme.backgroundImageUrl,
    backgroundFit: (theme.backgroundFit as "cover" | "contain" | "tile") ?? "cover",
    backgroundPosition: theme.backgroundPosition,
    overlayColor: theme.overlayColor,
    overlayOpacity: theme.overlayOpacity,
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    cardBackground: theme.cardBackground,
    cardBorderColor: theme.cardBorderColor,
    textColor: theme.textColor,
    mutedTextColor: theme.mutedTextColor,
    mode: theme.mode,
    fontFamily: theme.fontFamily,
    cardFontFamily: theme.cardFontFamily,
    fontScale: theme.fontScale,
    fontWeight: theme.fontWeight,
    letterSpacing: theme.letterSpacing,
    linkStyle: theme.linkStyle,
    animationType: theme.animationType,
    radius: theme.radius,
    buttonSize: theme.buttonSize,
    borderWidth: theme.borderWidth,
    shadowStrength: theme.shadowStrength,
    hoverEffect: theme.hoverEffect,
    containerWidth: theme.containerWidth,
    alignment: theme.alignment,
    density: theme.density,
    glow: theme.glow,
    glowColor: theme.glowColor,
    blur: theme.blur,
    noise: theme.noise,
    avatarShape: theme.avatarShape,
    avatarBorder: theme.avatarBorder,
    avatarFloat: theme.avatarFloat,
    profileLayout: theme.profileLayout,
    textAnimation: theme.textAnimation,
    ...(customFont ? { customFont } : {}),
    ...(cardCustomFont ? { cardCustomFont } : {}),
    exportedAt: new Date().toISOString(),
  };
}

/** Import a previously-exported theme, creating a new (inactive) copy. */
export async function importTheme(json: string): Promise<ActionResult> {
  if (!(await getSession())) return unauthorizedError();
  const blocked = demoGuard();
  if (blocked) return blocked;

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return validationError("Invalid JSON");
  }

  const result = exportableThemeSchema.safeParse(parsed);
  if (!result.success) {
    return validationError(result.error.issues[0]?.message ?? "Invalid theme file");
  }
  const t = result.data;

  const { themeNameExists, insertCustomFont, updateCustomFontFamily } = await import("@/server/queries");
  if (await themeNameExists(t.name)) {
    return conflictError("A theme with this name already exists");
  }

  // Custom fonts (#82 + card font): embedded bytes are stored and
  // registered as NEW rows; the theme's refs are rewritten to the new
  // "custom:<id>"s. Exports without a payload keep their reference only
  // if the cache below already holds it (both fields pointed at the same
  // uploaded font on the source instance), else the site font falls back
  // to Inter and the card font to "" (inherit the site font).
  const restoredRefs = new Map<string, string>();
  const restoreFont = async (
    ref: string,
    payload: ExportableTheme["customFont"],
    fallback: string,
  ): Promise<string> => {
    if (!parseCustomFontId(ref)) return ref;
    const cached = restoredRefs.get(ref);
    if (cached) return cached;
    if (!payload) {
      // No embedded payload — the "custom:<id>" refers to an id from the
      // instance that exported the theme, which is meaningless here. Reset
      // rather than keep a dangling reference.
      return fallback;
    }
    const buffer = Buffer.from(payload.data, "base64");
    const sniffed = sniffFontFormat(buffer);
    if (!sniffed || sniffed !== payload.format) {
      throw new Error("Embedded font payload is not a valid " + payload.format + " file");
    }
    if (buffer.length > 2 * 1024 * 1024) {
      throw new Error("Embedded font is too large (max 2 MB)");
    }
    try {
      await ensureUploadsDir();
      const hexId = crypto.randomBytes(12).toString("hex");
      const filename = `${hexId}.${sniffed}`;
      await writeFile(path.join(UPLOADS_DIR, filename), buffer);
      const row = await insertCustomFont({
        name: payload.name,
        family: "",
        filename: `${payload.name}.${sniffed}`.slice(0, 120),
        url: `/api/uploads/${filename}`,
        sizeBytes: buffer.length,
        format: sniffed,
      });
      await updateCustomFontFamily(row.id, customFontFamily(row.id));
      const newRef = `custom:${row.id}`;
      restoredRefs.set(ref, newRef);
      return newRef;
    } catch {
      throw new Error("Could not restore the embedded font file");
    }
  };

  let fontFamily: string;
  let cardFontFamily: string;
  try {
    fontFamily = await restoreFont(t.fontFamily, t.customFont, "inter");
    cardFontFamily = await restoreFont(t.cardFontFamily, t.cardCustomFont, "");
  } catch (err) {
    return validationError(
      err instanceof Error ? err.message : "Invalid theme file",
    );
  }

  await db.insert(themes).values({
    name: t.name,
    backgroundType: t.backgroundType,
    backgroundValue: t.backgroundValue,
    backgroundAngle: t.backgroundAngle,
    backgroundImageUrl: t.backgroundImageUrl,
    backgroundFit: t.backgroundFit,
    backgroundPosition: t.backgroundPosition,
    overlayColor: t.overlayColor,
    overlayOpacity: t.overlayOpacity,
    primaryColor: t.primaryColor,
    secondaryColor: t.secondaryColor,
    cardBackground: t.cardBackground,
    cardBorderColor: t.cardBorderColor,
    textColor: t.textColor,
    mutedTextColor: t.mutedTextColor,
    mode: t.mode,
    fontFamily,
    cardFontFamily,
    fontScale: t.fontScale,
    fontWeight: t.fontWeight,
    letterSpacing: t.letterSpacing,
    linkStyle: t.linkStyle,
    animationType: t.animationType,
    radius: t.radius,
    buttonSize: t.buttonSize,
    borderWidth: t.borderWidth,
    shadowStrength: t.shadowStrength,
    hoverEffect: t.hoverEffect,
    containerWidth: t.containerWidth,
    alignment: t.alignment,
    density: t.density,
    glow: t.glow,
    glowColor: t.glowColor,
    blur: t.blur,
    noise: t.noise,
    avatarShape: t.avatarShape,
    avatarBorder: t.avatarBorder,
    avatarFloat: t.avatarFloat,
    profileLayout: t.profileLayout,
    textAnimation: t.textAnimation,
    isActive: false,
    isPreset: false,
  });

  revalidatePath("/theme");
  return { success: true };
}
