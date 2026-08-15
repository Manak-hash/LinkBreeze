"use server";

import path from "node:path";
import crypto from "node:crypto";
import { writeFile } from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { demoGuard } from "@/lib/demo-guard";
import {
  validationError,
  unauthorizedError,
} from "@/lib/errors";
import { UPLOADS_DIR, ensureUploadsDir } from "@/lib/uploads";

export type UploadResult =
  | { success: true; url: string }
  | { success: false; error: string; errorCode: string };

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
]);

// Favicon allows additional formats not in the avatar set.
const FAVICON_ALLOWED_EXT = new Set([
  ".png",
  ".gif",
  ".webp",
  ".ico",
  ".svg",
]);
const FAVICON_MAX_BYTES = 1 * 1024 * 1024; // 1 MB — favicons are tiny

// Background media: images up to 2 MB (shared with avatar), video up to 5 MB.
const MEDIA_ALLOWED_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
]);
const VIDEO_ALLOWED_EXT = new Set([".mp4", ".webm"]);
const VIDEO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB — background loops must stay light

/** Accepts an image upload, stores it on disk, returns its public URL. */
export async function uploadAvatar(formData: FormData): Promise<UploadResult> {
  const blocked = demoGuard();
  if (blocked) return { success: false, error: blocked.error, errorCode: blocked.errorCode };
  if (!(await getSession())) return unauthorizedError();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return validationError("No file provided");
  }
  if (file.size === 0) return validationError("File is empty");
  if (file.size > MAX_BYTES) {
    return validationError("File too large (max 2 MB)");
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return validationError("Unsupported file type");
  }
  if (file.type && !file.type.startsWith("image/")) {
    return validationError("File must be an image");
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

/** Accepts a background media upload (image or short loop video), returns URL. */
export async function uploadBackgroundMedia(formData: FormData): Promise<UploadResult> {
  const blocked = demoGuard();
  if (blocked) return { success: false, error: blocked.error, errorCode: blocked.errorCode };
  if (!(await getSession())) return unauthorizedError();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return validationError("No file provided");
  }
  if (file.size === 0) return validationError("File is empty");

  const ext = path.extname(file.name).toLowerCase();
  const isVideo = VIDEO_ALLOWED_EXT.has(ext);
  const isImage = MEDIA_ALLOWED_EXT.has(ext);
  if (!isVideo && !isImage) {
    return validationError("Unsupported file type. Use an image or .mp4/.webm video");
  }

  const cap = isVideo ? VIDEO_MAX_BYTES : MAX_BYTES;
  if (file.size > cap) {
    return validationError(`File too large (max ${Math.round(cap / 1024 / 1024)} MB)`);
  }
  if (isImage && file.type && !file.type.startsWith("image/")) {
    return validationError("File must be an image");
  }
  if (isVideo && file.type && !file.type.startsWith("video/")) {
    return validationError("File must be a video");
  }

  await ensureUploadsDir();
  const id = crypto.randomBytes(12).toString("hex");
  const filename = `${id}${ext}`;
  const dest = path.join(UPLOADS_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buffer);

  revalidatePath("/theme");
  return { success: true, url: `/api/uploads/${filename}` };
}

/** Accepts a favicon upload (.ico/.png/.svg/.gif/.webp), stores it, returns URL. */
export async function uploadFavicon(formData: FormData): Promise<UploadResult> {
  const blocked = demoGuard();
  if (blocked) return { success: false, error: blocked.error, errorCode: blocked.errorCode };
  if (!(await getSession())) return unauthorizedError();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return validationError("No file provided");
  }
  if (file.size === 0) return validationError("File is empty");
  if (file.size > FAVICON_MAX_BYTES) {
    return validationError("File too large (max 1 MB)");
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!FAVICON_ALLOWED_EXT.has(ext)) {
    return validationError("Unsupported file type. Use .ico, .png, .svg, .gif, or .webp");
  }

  // SVG is text-based, so it won't start with "image/". Validate by extension.
  if (ext !== ".svg" && file.type && !file.type.startsWith("image/")) {
    return validationError("File must be an image");
  }

  await ensureUploadsDir();
  const id = crypto.randomBytes(12).toString("hex");
  const filename = `${id}${ext}`;
  const dest = path.join(UPLOADS_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buffer);

  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true, url: `/api/uploads/${filename}` };
}
