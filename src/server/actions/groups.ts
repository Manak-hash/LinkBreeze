"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import {
  createLinkGroup,
  updateLinkGroup,
  deleteLinkGroup,
  reorderLinkGroups,
} from "@/server/queries";

async function requireAuth(): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

export async function createLinkGroupAction(formData: FormData) {
  await requireAuth();
  const title = formData.get("title");
  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Title is required");
  }

  await createLinkGroup({
    title: title.trim(),
    linkSearch: formData.get("linkSearch") === "true",
    columns: Number(formData.get("columns")) || 1,
  });

  revalidatePath("/", "layout");
}

export async function updateLinkGroupAction(id: number, formData: FormData) {
  await requireAuth();
  const title = formData.get("title");
  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Title is required");
  }

  await updateLinkGroup(id, {
    title: title.trim(),
    linkSearch: formData.get("linkSearch") === "true",
    columns: Number(formData.get("columns")) || 1,
  });

  revalidatePath("/", "layout");
}

export async function deleteLinkGroupAction(id: number) {
  await requireAuth();
  await deleteLinkGroup(id);
  revalidatePath("/", "layout");
}

export async function reorderLinkGroupsAction(orderedIds: number[]) {
  await requireAuth();
  await reorderLinkGroups(orderedIds);
  revalidatePath("/", "layout");
}
