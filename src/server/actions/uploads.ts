"use server";

import path from "node:path";
import crypto from "node:crypto";
import { writeFile } from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { demoBlock } from "@/lib/demo";
import { UPLOADS_DIR, ensureUploadsDir } from "@/lib/uploads";

export type UploadResult =
  | { success: true; url: string }
  | { success: false; error: string };

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
]);

/** Accepts an image upload, stores it on disk, returns its public URL. */
export async function uploadAvatar(formData: FormData): Promise<UploadResult> {
  const demo = demoBlock();
  if (demo) return { success: false, error: demo };
  if (!(await getSession())) return { success: false, error: "Unauthorized" };

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "No file provided" };
  }
  if (file.size === 0) return { success: false, error: "File is empty" };
  if (file.size > MAX_BYTES) {
    return { success: false, error: "File too large (max 2 MB)" };
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return { success: false, error: "Unsupported file type" };
  }
  if (file.type && !file.type.startsWith("image/")) {
    return { success: false, error: "File must be an image" };
  }

  await ensureUploadsDir();
  const id = crypto.randomBytes(12).toString("hex");
  const filename = `${id}${ext}`;
  const dest = path.join(UPLOADS_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buffer);

  revalidatePath("/profile");
  return { success: true, url: `/api/uploads/${filename}` };
}
