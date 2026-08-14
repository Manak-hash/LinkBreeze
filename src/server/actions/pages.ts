"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { demoGuard } from "@/lib/demo-guard";
import {
  type ActionResult,
  validationError,
  unauthorizedError,
  conflictError,
} from "@/lib/errors";
import {
  createPage as createPageQuery,
  updatePage as updatePageQuery,
  getAllPages,
} from "@/server/queries";


const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(80, "Slug must be 80 characters or less")
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i, "Slug can only contain letters, numbers, and hyphens");

const createPageSchema = z.object({
  slug: slugSchema,
  title: z.string().max(80).optional().default(""),
  bio: z.string().max(300).optional().default(""),
});

export async function createPageAction(formData: FormData): Promise<ActionResult<{ pageId: number }>> {
  const blocked = demoGuard();
  if (blocked) return blocked;
  if (!(await getSession())) return unauthorizedError();

  const parsed = createPageSchema.safeParse({
    slug: (formData.get("slug") as string)?.trim().toLowerCase(),
    title: formData.get("title") || "",
    bio: formData.get("bio") || "",
  });
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  // Check slug uniqueness.
  const existing = await getAllPages();
  if (existing.some((p) => p.slug.toLowerCase() === parsed.data.slug.toLowerCase())) {
    return conflictError("A page with this slug already exists");
  }

  const page = await createPageQuery({
    slug: parsed.data.slug,
    title: parsed.data.title,
    bio: parsed.data.bio,
  });

  revalidatePath("/links");
  revalidatePath("/dashboard");
  revalidatePath("/");
  return { success: true, pageId: page.id };
}

const updatePageSchema = z.object({
  pageId: z.coerce.number(),
  slug: slugSchema.optional(),
  title: z.string().max(80).optional(),
  bio: z.string().max(300).optional(),
  badgeText: z.string().max(40).optional().nullable(),
  avatarUrl: z.string().max(2048).optional().nullable(),
  socialLinks: z.string().optional().default("[]"),
  themeId: z.coerce.number().optional().nullable(),
  isPublished: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  // Page-specific settings
  seoTitle: z.string().max(120).optional(),
  seoDescription: z.string().max(300).optional(),
  footerText: z.string().max(200).optional(),
  analyticsScript: z.string().max(2000).optional(),
  customCss: z.string().max(10000).optional(),
  emailCapture: z.boolean().optional(),
  faviconUrl: z.string().max(500).optional().nullable(),
  privacyPolicy: z.string().max(20000).optional(),
});

export async function updatePageAction(formData: FormData): Promise<ActionResult> {
  const blocked = demoGuard();
  if (blocked) return blocked;
  if (!(await getSession())) return unauthorizedError();

  const data: Record<string, unknown> = {
    pageId: formData.get("pageId"),
    slug: formData.get("slug") || undefined,
    title: formData.get("title") || undefined,
    bio: formData.get("bio") || undefined,
    badgeText: formData.get("badgeText") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
    socialLinks: formData.get("socialLinks") || "[]",
    themeId: formData.get("themeId") || undefined,
    isPublished: formData.get("isPublished") === "true" ? true : undefined,
    isDefault: formData.get("isDefault") === "true" ? true : undefined,
    // Page-specific settings
    seoTitle: formData.get("seoTitle") || undefined,
    seoDescription: formData.get("seoDescription") || undefined,
    footerText: formData.get("footerText") || undefined,
    analyticsScript: formData.get("analyticsScript") || undefined,
    customCss: formData.get("customCss") || undefined,
    faviconUrl: formData.get("faviconUrl") || undefined,
    privacyPolicy: formData.get("privacyPolicy") || undefined,
  };

  // Handle checkbox: present = on, absent = off
  const emailCapture = formData.get("emailCapture");
  data.emailCapture = emailCapture === "on" ? true : false;

  // Remove undefined keys.
  for (const key of Object.keys(data)) {
    if (data[key] === undefined || data[key] === "") delete data[key];
  }

  const parsed = updatePageSchema.safeParse(data);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { pageId, ...updateData } = parsed.data;

  // Check slug uniqueness if slug is being changed.
  if (updateData.slug) {
    const all = await getAllPages();
    if (all.some((p) => p.id !== pageId && p.slug.toLowerCase() === updateData.slug!.toLowerCase())) {
      return conflictError("A page with this slug already exists");
    }
  }

  await updatePageQuery(pageId, updateData);

  // Save global consent text setting alongside page settings.
  const consentText = formData.get("consentText");
  if (consentText !== null) {
    const { updateSetting } = await import("@/server/queries");
    await updateSetting("consentText", (consentText as string) || "");
  }

  revalidatePath("/links");
  revalidatePath("/profile");
  revalidatePath("/theme");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath("/");
  if (updateData.slug) {
    revalidatePath(`/${updateData.slug}/privacy`, "layout");
  }
  return { success: true };
}

export async function setPageThemeAction(pageId: number, themeId: number): Promise<ActionResult> {
  const blocked = demoGuard();
  if (blocked) return blocked;
  if (!(await getSession())) return unauthorizedError();

  await updatePageQuery(pageId, { themeId });

  revalidatePath("/theme");
  revalidatePath(`/`);
  return { success: true };
}
