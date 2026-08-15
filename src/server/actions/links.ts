"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { demoGuard } from "@/lib/demo-guard";
import { isAllowedLinkUrl } from "@/lib/link-url";
import { truthy } from "@/lib/utils";
import { fetchAndCacheFavicon, extractDomain } from "@/lib/favicon";
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

const linkSchema = z
  .object({
    id: z.string().optional(),
    pageId: z.coerce.number().optional(),
    title: z.string().min(1, "Title is required").max(120),
    url: z.string().min(1, "URL is required").max(2048),
    description: z.string().max(300).optional().nullable(),
    imageUrl: z.string().max(2048).optional().nullable(),
    type: z.enum(["url", "email", "phone", "whatsapp", "sms", "vcard", "file", "embed"]).default("url"),
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
    cardStyle: z.enum(["compact", "rich"]).default("compact"),
    sectionId: z
      .union([z.coerce.number(), z.literal(""), z.null()])
      .transform((v) => (v === "" || v === null ? null : v))
      .nullable()
      .optional(),
  })
  .refine((link) => isAllowedLinkUrl(link.type, link.url), {
    path: ["url"],
    message: "URL scheme is not allowed for this link type",
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
    sectionId: formData.get("sectionId") !== null ? formData.get("sectionId") : undefined,
  });
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const d = parsed.data;

  try {
    // Auto-fetch favicon for URL-type links when autoIcon is enabled.
    let iconUrl: string | null = null;
    if (d.autoIcon && d.type === "url" && extractDomain(d.url)) {
      iconUrl = await fetchAndCacheFavicon(d.url);
    }

    // For rich cards, auto-fetch OG data to pre-fill description and image
    // if the operator hasn't provided them manually.
    let description = d.description || null;
    let imageUrl = d.imageUrl || null;
    if (d.cardStyle === "rich" && d.type === "url" && extractDomain(d.url)) {
      const og = await fetchOgData(d.url);
      if (!description && og.description) description = og.description;
      if (!imageUrl && og.imageUrl) imageUrl = og.imageUrl;
    }

    await createLinkQuery({
      title: d.title,
      url: d.url,
      pageId: d.pageId,
      description,
      imageUrl,
      type: d.type,
      isHighlighted: d.isHighlighted,
      isActive: d.isActive,
      autoIcon: d.autoIcon,
      iconUrl,
      cardStyle: d.cardStyle,
      sectionId: d.sectionId ?? null,
      scheduleStart: d.scheduleStart || null,
      scheduleEnd: d.scheduleEnd || null,
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
    // Auto-fetch favicon for URL-type links when autoIcon is enabled.
    let iconUrl: string | null = null;
    if (d.autoIcon && d.type === "url" && extractDomain(d.url)) {
      iconUrl = await fetchAndCacheFavicon(d.url);
    }

    // For rich cards, auto-fetch OG data to pre-fill description and image
    // if the operator hasn't provided them manually.
    let description = d.description || null;
    let imageUrl = d.imageUrl || null;
    if (d.cardStyle === "rich" && d.type === "url" && extractDomain(d.url)) {
      const og = await fetchOgData(d.url);
      if (!description && og.description) description = og.description;
      if (!imageUrl && og.imageUrl) imageUrl = og.imageUrl;
    }

    await updateLinkQuery(Number(d.id), {
      title: d.title,
      url: d.url,
      description,
      imageUrl,
      type: d.type,
      isHighlighted: d.isHighlighted,
      isActive: d.isActive,
      autoIcon: d.autoIcon,
      iconUrl,
      cardStyle: d.cardStyle,
      sectionId: d.sectionId ?? null,
      scheduleStart: d.scheduleStart || null,
      scheduleEnd: d.scheduleEnd || null,
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
