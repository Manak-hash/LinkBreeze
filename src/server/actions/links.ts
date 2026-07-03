"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { demoBlock } from "@/lib/demo";
import { isAllowedLinkUrl } from "@/lib/link-url";
import {
  createLink as createLinkQuery,
  updateLink as updateLinkQuery,
  deleteLink as deleteLinkQuery,
  getAllLinks,
  reorderLinks as reorderLinksQuery,
} from "@/server/queries";

export type ActionResult = { success: true } | { success: false; error: string };

async function requireAuth(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

const linkSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required").max(120),
    url: z.string().min(1, "URL is required").max(2048),
    description: z.string().max(300).optional().nullable(),
    type: z.enum(["url", "email", "phone", "whatsapp", "sms", "vcard", "file"]).default("url"),
    isHighlighted: z
      .union([z.string(), z.boolean()])
      .transform((v) => v === true || v === "true" || v === "on")
      .default(false),
    isActive: z
      .union([z.string(), z.boolean()])
      .transform((v) => v === true || v === "true" || v === "on")
      .default(true),
    scheduleStart: z.string().optional().nullable(),
    scheduleEnd: z.string().optional().nullable(),
  })
  .refine((link) => isAllowedLinkUrl(link.type, link.url), {
    path: ["url"],
    message: "URL scheme is not allowed for this link type",
  });

export async function createLink(formData: FormData): Promise<ActionResult> {
  const demo = demoBlock();
  if (demo) return { success: false, error: demo };
  if (!(await requireAuth())) return { success: false, error: "Unauthorized" };

  const parsed = linkSchema.safeParse({
    title: formData.get("title"),
    url: formData.get("url"),
    description: formData.get("description") || undefined,
    type: formData.get("type") || "url",
    isHighlighted: formData.get("isHighlighted"),
    isActive: formData.get("isActive"),
    scheduleStart: formData.get("scheduleStart") || undefined,
    scheduleEnd: formData.get("scheduleEnd") || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const d = parsed.data;
  await createLinkQuery({
    title: d.title,
    url: d.url,
    description: d.description || null,
    type: d.type,
    isHighlighted: d.isHighlighted,
    isActive: d.isActive,
    scheduleStart: d.scheduleStart || null,
    scheduleEnd: d.scheduleEnd || null,
  });

  revalidatePath("/links");
  revalidatePath("/");
  return { success: true };
}

export async function updateLink(formData: FormData): Promise<ActionResult> {
  const demo = demoBlock();
  if (demo) return { success: false, error: demo };
  if (!(await requireAuth())) return { success: false, error: "Unauthorized" };

  const parsed = linkSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    url: formData.get("url"),
    description: formData.get("description") || undefined,
    type: formData.get("type") || "url",
    isHighlighted: formData.get("isHighlighted"),
    isActive: formData.get("isActive"),
    scheduleStart: formData.get("scheduleStart") || undefined,
    scheduleEnd: formData.get("scheduleEnd") || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!parsed.data.id) {
    return { success: false, error: "Missing link id" };
  }

  const d = parsed.data;
  await updateLinkQuery(Number(d.id), {
    title: d.title,
    url: d.url,
    description: d.description || null,
    type: d.type,
    isHighlighted: d.isHighlighted,
    isActive: d.isActive,
    scheduleStart: d.scheduleStart || null,
    scheduleEnd: d.scheduleEnd || null,
  });

  revalidatePath("/links");
  revalidatePath("/");
  return { success: true };
}

export async function deleteLink(formData: FormData): Promise<ActionResult> {
  const demo = demoBlock();
  if (demo) return { success: false, error: demo };
  if (!(await requireAuth())) return { success: false, error: "Unauthorized" };

  const idStr = formData.get("id");
  if (!idStr) return { success: false, error: "Missing link id" };
  const id = Number(idStr);
  if (Number.isNaN(id)) return { success: false, error: "Invalid link id" };

  await deleteLinkQuery(id);
  revalidatePath("/links");
  revalidatePath("/");
  return { success: true };
}

export async function toggleLink(id: number): Promise<ActionResult> {
  const demo = demoBlock();
  if (demo) return { success: false, error: demo };
  if (!(await requireAuth())) return { success: false, error: "Unauthorized" };

  const all = await getAllLinks();
  const link = all.find((l) => l.id === id);
  if (!link) return { success: false, error: "Link not found" };

  await updateLinkQuery(id, { isActive: !link.isActive });
  revalidatePath("/links");
  revalidatePath("/");
  return { success: true };
}

export async function reorderLinks(orderedIds: number[]): Promise<ActionResult> {
  const demo = demoBlock();
  if (demo) return { success: false, error: demo };
  if (!(await requireAuth())) return { success: false, error: "Unauthorized" };

  if (!Array.isArray(orderedIds) || orderedIds.some((n) => typeof n !== "number")) {
    return { success: false, error: "Invalid order payload" };
  }

  await reorderLinksQuery(orderedIds);
  revalidatePath("/links");
  revalidatePath("/");
  return { success: true };
}
