"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { demoGuard } from "@/lib/demo-guard";
import { isAllowedLinkUrl, buildMapsUrl, isMapsShortLink } from "@/lib/link-url";
import { LOCALE_COOKIE } from "@/i18n/config";
import { truthy } from "@/lib/utils";
import { fetchAndCacheFavicon, extractDomain } from "@/lib/favicon";
import { saveIconUpload, isLucideName, type IconMode } from "@/lib/link-icons";
import { fetchOgData } from "@/lib/og-fetcher";
import {
  createLink as createLinkQuery,
  updateLink as updateLinkQuery,
  deleteLink as deleteLinkQuery,
  getAllLinks,
  reorderLinks as reorderLinksQuery,
} from "@/server/queries";
import {
  type ActionResult,
  validationError,
  unauthorizedError,
  notFoundError,
  ErrorCode,
  logError,
} from "@/lib/errors";

async function requireAuth(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

/**
 * Resolve the icon fields for a link save (#91).
 *
 * auto   → favicon fetch (existing behavior, unchanged)
 * lucide → validate the picked name, store it in links.icon
 * custom → persist the uploaded file, store its URL
 *
 * Returns null on validation failure so callers can return a typed error
 * without duplicating messages.
 */
async function resolveIconFields(
  formData: FormData,
  d: { iconMode: IconMode; icon?: string | null; type: string; url: string; autoIcon: boolean },
): Promise<
  | {
      ok: true;
      icon: string | null;
      iconUrl: string | null;
      customIconUrl: string | null;
      iconMode: IconMode;
    }
  | { ok: false; error: string }
> {
  if (d.iconMode === "lucide") {
    const name = (d.icon ?? "").trim();
    if (!isLucideName(name)) return { ok: false, error: "Unknown icon selected" };
    return { ok: true, icon: name, iconUrl: null, customIconUrl: null, iconMode: "lucide" };
  }

  if (d.iconMode === "custom") {
    const file = formData.get("iconFile");
    if (file instanceof File && file.size > 0) {
      const saved = await saveIconUpload(file);
      if (!saved.ok) {
        return {
          ok: false,
          error:
            saved.error === "too-large"
              ? "Icon exceeds 512 KB"
              : saved.error === "bad-svg"
                ? "Icon SVG could not be sanitized"
                : "Unsupported icon format",
        };
      }
      return { ok: true, icon: null, iconUrl: null, customIconUrl: saved.url, iconMode: "custom" };
    }
    // No new file: keep any existing custom icon (edit dialog sends the
    // current URL back via iconCustomUrl).
    const existing = String(formData.get("iconCustomUrl") || "");
    if (existing.startsWith("/api/uploads/") && !existing.includes("..")) {
      return { ok: true, icon: null, iconUrl: null, customIconUrl: existing, iconMode: "custom" };
    }
    return { ok: false, error: "Upload an icon image or pick another mode" };
  }

  // auto (default): existing favicon behavior, unchanged.
  let iconUrl: string | null = null;
  if (d.autoIcon && d.type === "url" && extractDomain(d.url)) {
    iconUrl = await fetchAndCacheFavicon(d.url);
  }
  return { ok: true, icon: null, iconUrl, customIconUrl: null, iconMode: "auto" };
}

/**
 * #93 popup cards: normalize per-type fields before insert/update.
 * - location: raw place input → canonical Google Maps URL (pasted maps
 *   links pass through unchanged).
 * - text: URL is only the CTA target — empty means "no CTA button".
 * - ctaLabel: blank on location cards bakes the admin-locale default
 *   ("Ouvrir dans Google Maps"…) at save time, so the public page stays
 *   pure data with no locale lookup at render.
 * Returns the values to spread into the row write.
 */

/**
 * Follow a Google Maps short link (maps.app.goo.gl & friends) to its final
 * Maps URL at save time, so the stored URL — and with it the embedded map,
 * which short links can't serve — always points at a real maps page.
 * Bounded: 4s timeout, redirects followed, HTML never read. Failures keep
 * the short link (the /go/:id redirect still works; only the embed degrades).
 */
async function expandMapsShortLink(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "user-agent": "Mozilla/5.0 (compatible; LinkBreeze/1.3)" },
      signal: AbortSignal.timeout(4000),
    });
    // Body is never used; release the connection immediately.
    try {
      await res.body?.cancel();
    } catch {
      /* already released */
    }
    return res.url || url;
  } catch {
    return url;
  }
}

async function resolvePopupFields(
  d: { type: string; url: string; ctaLabel?: string | null },
): Promise<{ url: string; ctaLabel: string | null }> {
  if (d.type === "location") {
    // Bake the admin-locale default label at save time so the public page
    // renders pure data (no locale lookup at request time).
    let locale = "en";
    try {
      const jar = await cookies();
      locale = jar.get(LOCALE_COOKIE)?.value ?? "en";
    } catch {
      // cookie access can throw in some contexts — English fallback is fine
    }
    const raw = isMapsShortLink(d.url) ? await expandMapsShortLink(d.url) : d.url;
    return {
      url: buildMapsUrl(raw),
      ctaLabel: d.ctaLabel?.trim() || DEFAULT_MAPS_CTA_LABELS[locale] || DEFAULT_MAPS_CTA_LABELS.en,
    };
  }
  if (d.type === "text") {
    return { url: d.url, ctaLabel: d.ctaLabel?.trim() || null };
  }
  // Classic link types never carry popup fields.
  return { url: d.url, ctaLabel: null };
}

/** Fallback CTA label for location cards (#93), keyed by admin locale. */
const DEFAULT_MAPS_CTA_LABELS: Record<string, string> = {
  en: "Open in Google Maps",
  fr: "Ouvrir dans Google Maps",
  es: "Abrir en Google Maps",
};

const linkSchema = z
  .object({
    id: z.string().optional(),
    pageId: z.coerce.number().optional(),
    title: z.string().min(1, "Title is required").max(120),
    // Empty allowed for text popups with no CTA (refine below enforces the rest).
    url: z.string().max(2048),
    description: z.string().max(300).optional().nullable(),
    imageUrl: z.string().max(2048).optional().nullable(),
    type: z.enum(["url", "email", "phone", "whatsapp", "sms", "vcard", "file", "embed", "text", "location"]).default("url"),
    // #93 popup cards: long body + optional CTA label (target = url column).
    popupText: z.string().max(5000).optional().nullable(),
    ctaLabel: z.string().max(80).optional().nullable(),
    isHighlighted: z
      .union([z.string(), z.boolean()])
      .transform(truthy)
      .default(false),
    isActive: z
      .union([z.string(), z.boolean()])
      .transform(truthy)
      .default(true),
    scheduleStart: z.string().optional().nullable(),
    scheduleEnd: z.string().optional().nullable(),
    autoIcon: z
      .union([z.string(), z.boolean()])
      .transform(truthy)
      .default(true),
    // Icon system (#91): auto = favicon fetch, lucide = picked icon name,
    // custom = uploaded image (file arrives as "iconFile" in FormData).
    iconMode: z.enum(["auto", "lucide", "custom"]).default("auto"),
    icon: z.string().max(64).optional().nullable(),
    cardStyle: z.enum(["compact", "rich"]).default("compact"),
    // Form data sends an empty string when "No section" is selected; coerce
    // that to null before numeric parsing, otherwise Number("") === 0 and the
    // insert fails on the section_id foreign key (issue #86).
    sectionId: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? null : v),
      z.coerce.number().nullable().optional()
    ),
  })
  // #93 popup cards: every non-text type needs a URL (text may leave it
  // empty when there is no CTA button). Runs before the scheme check so an
  // empty classic URL reports "URL is required", not a scheme error.
  .refine((link) => link.type === "text" || !!link.url.trim(), {
    path: ["url"],
    message: "URL is required",
  })
  .refine((link) => isAllowedLinkUrl(link.type, link.type === "location" ? buildMapsUrl(link.url) : link.url), {
    path: ["url"],
    message: "URL scheme is not allowed for this link type",
  })
  .refine((link) => link.type !== "text" || !!(link.popupText ?? "").trim(), {
    path: ["popupText"],
    message: "Popup text is required",
  })
  // A CTA label without a target URL would render a dead button.
  .refine((link) => !link.ctaLabel?.trim() || link.type !== "text" || !!link.url.trim(), {
    path: ["url"],
    message: "CTA URL is required when a CTA label is set",
  });

export async function createLink(formData: FormData): Promise<ActionResult> {
  const blocked = demoGuard();
  if (blocked) return blocked;
  if (!(await requireAuth())) return unauthorizedError();

  const parsed = linkSchema.safeParse({
    title: formData.get("title"),
    url: formData.get("url"),
    pageId: formData.get("pageId") || undefined,
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    type: formData.get("type") || "url",
    isHighlighted: formData.get("isHighlighted"),
    isActive: formData.get("isActive"),
    scheduleStart: formData.get("scheduleStart") || undefined,
    scheduleEnd: formData.get("scheduleEnd") || undefined,
    autoIcon: formData.get("autoIcon") || undefined,
    cardStyle: formData.get("cardStyle") || undefined,
    iconMode: formData.get("iconMode") || undefined,
    icon: formData.get("icon") || undefined,
    popupText: formData.get("popupText") || undefined,
    ctaLabel: formData.get("ctaLabel") || undefined,
    sectionId: formData.get("sectionId") !== null ? formData.get("sectionId") : undefined,
  });
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const d = parsed.data;

  try {
    // Resolve the icon fields (favicon fetch / lucide pick / upload).
    const icons = await resolveIconFields(formData, d);
    if (!icons.ok) return validationError(icons.error);

    // For rich cards, auto-fetch OG data to pre-fill description and image
    // if the operator hasn't provided them manually.
    let description = d.description || null;
    let imageUrl = d.imageUrl || null;
    if (d.cardStyle === "rich" && d.type === "url" && extractDomain(d.url)) {
      const og = await fetchOgData(d.url);
      if (!description && og.description) description = og.description;
      if (!imageUrl && og.imageUrl) imageUrl = og.imageUrl;
    }

    // #93 popup cards: per-type URL + CTA label normalization.
    const popup = await resolvePopupFields(d);

    await createLinkQuery({
      title: d.title,
      url: popup.url,
      pageId: d.pageId,
      description,
      imageUrl,
      type: d.type,
      isHighlighted: d.isHighlighted,
      isActive: d.isActive,
      autoIcon: d.autoIcon,
      icon: icons.icon,
      iconUrl: icons.iconUrl,
      customIconUrl: icons.customIconUrl,
      iconMode: icons.iconMode,
      cardStyle: d.cardStyle,
      sectionId: d.sectionId ?? null,
      scheduleStart: d.scheduleStart || null,
      scheduleEnd: d.scheduleEnd || null,
      // #93 popup fields (null for classic link types).
      popupText: d.type === "text" || d.type === "location" ? (d.popupText || null) : null,
      ctaLabel: popup.ctaLabel,
    });

    revalidatePath("/links");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    logError("createLink", err, { title: d.title, type: d.type });
    return {
      success: false,
      error: "Something went wrong. Please try again.",
      errorCode: ErrorCode.INTERNAL,
    };
  }
}

export async function updateLink(formData: FormData): Promise<ActionResult> {
  const blocked = demoGuard();
  if (blocked) return blocked;
  if (!(await requireAuth())) return unauthorizedError();

  const parsed = linkSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    url: formData.get("url"),
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    type: formData.get("type") || "url",
    isHighlighted: formData.get("isHighlighted"),
    isActive: formData.get("isActive"),
    scheduleStart: formData.get("scheduleStart") || undefined,
    scheduleEnd: formData.get("scheduleEnd") || undefined,
    autoIcon: formData.get("autoIcon") || undefined,
    cardStyle: formData.get("cardStyle") || undefined,
    iconMode: formData.get("iconMode") || undefined,
    icon: formData.get("icon") || undefined,
    popupText: formData.get("popupText") || undefined,
    ctaLabel: formData.get("ctaLabel") || undefined,
    sectionId: formData.get("sectionId") !== null ? formData.get("sectionId") : undefined,
  });
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  if (!parsed.data.id) {
    return validationError("Missing link id");
  }

  const d = parsed.data;

  try {
    // Resolve the icon fields (favicon fetch / lucide pick / upload).
    const icons = await resolveIconFields(formData, d);
    if (!icons.ok) return validationError(icons.error);

    // For rich cards, auto-fetch OG data to pre-fill description and image
    // if the operator hasn't provided them manually.
    let description = d.description || null;
    let imageUrl = d.imageUrl || null;
    if (d.cardStyle === "rich" && d.type === "url" && extractDomain(d.url)) {
      const og = await fetchOgData(d.url);
      if (!description && og.description) description = og.description;
      if (!imageUrl && og.imageUrl) imageUrl = og.imageUrl;
    }

    // #93 popup cards: per-type URL + CTA label normalization.
    const popup = await resolvePopupFields(d);

    await updateLinkQuery(Number(d.id), {
      title: d.title,
      url: popup.url,
      description,
      imageUrl,
      type: d.type,
      isHighlighted: d.isHighlighted,
      isActive: d.isActive,
      autoIcon: d.autoIcon,
      icon: icons.icon,
      iconUrl: icons.iconUrl,
      customIconUrl: icons.customIconUrl,
      iconMode: icons.iconMode,
      cardStyle: d.cardStyle,
      sectionId: d.sectionId ?? null,
      scheduleStart: d.scheduleStart || null,
      scheduleEnd: d.scheduleEnd || null,
      // #93 popup fields (null for classic link types).
      popupText: d.type === "text" || d.type === "location" ? (d.popupText || null) : null,
      ctaLabel: popup.ctaLabel,
    });

    revalidatePath("/links");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    logError("updateLink", err, { id: d.id, title: d.title });
    return {
      success: false,
      error: "Something went wrong. Please try again.",
      errorCode: ErrorCode.INTERNAL,
    };
  }
}

export async function deleteLink(formData: FormData): Promise<ActionResult> {
  const blocked = demoGuard();
  if (blocked) return blocked;
  if (!(await requireAuth())) return unauthorizedError();

  const idStr = formData.get("id");
  if (!idStr) return validationError("Missing link id");
  const id = Number(idStr);
  if (Number.isNaN(id)) return validationError("Invalid link id");

  try {
    await deleteLinkQuery(id);
    revalidatePath("/links");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    logError("deleteLink", err, { id });
    return {
      success: false,
      error: "Something went wrong. Please try again.",
      errorCode: ErrorCode.INTERNAL,
    };
  }
}

export async function toggleLink(id: number): Promise<ActionResult> {
  const blocked = demoGuard();
  if (blocked) return blocked;
  if (!(await requireAuth())) return unauthorizedError();

  const all = await getAllLinks();
  const link = all.find((l) => l.id === id);
  if (!link) return notFoundError("Link not found");

  try {
    await updateLinkQuery(id, { isActive: !link.isActive });
    revalidatePath("/links");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    logError("toggleLink", err, { id });
    return {
      success: false,
      error: "Something went wrong. Please try again.",
      errorCode: ErrorCode.INTERNAL,
    };
  }
}

export async function reorderLinks(orderedIds: number[]): Promise<ActionResult> {
  const blocked = demoGuard();
  if (blocked) return blocked;
  if (!(await requireAuth())) return unauthorizedError();

  if (!Array.isArray(orderedIds) || orderedIds.some((n) => typeof n !== "number")) {
    return validationError("Invalid order payload");
  }

  try {
    await reorderLinksQuery(orderedIds);
    revalidatePath("/links");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    logError("reorderLinks", err, { count: orderedIds.length });
    return {
      success: false,
      error: "Something went wrong. Please try again.",
      errorCode: ErrorCode.INTERNAL,
    };
  }
}
