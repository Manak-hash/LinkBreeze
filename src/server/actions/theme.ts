"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { demoGuard } from "@/lib/demo-guard";
import { customSchema } from "@/lib/theme-schema";
import {
  setActiveTheme,
  updateTheme,
  getActiveTheme,
  duplicateTheme,
  deleteTheme,
} from "@/server/queries";
import {
  type ActionResult,
  validationError,
  unauthorizedError,
  notFoundError,
  conflictError,
  logError,
} from "@/lib/errors";

export async function activateTheme(id: number): Promise<ActionResult> {
  const blocked = demoGuard();
  if (blocked) return blocked;
  if (!(await getSession())) return unauthorizedError();
  if (typeof id !== "number" || Number.isNaN(id)) {
    return validationError("Invalid theme id");
  }
  try {
    await setActiveTheme(id);
    revalidatePath("/theme");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    logError("activateTheme", err, { id });
    return {
      success: false,
      error: "Something went wrong. Please try again.",
      errorCode: "internal",
    };
  }
}

export async function customizeActiveTheme(formData: FormData): Promise<ActionResult> {
  const blocked = demoGuard();
  if (blocked) return blocked;
  if (!(await getSession())) return unauthorizedError();

  const parsed = customSchema.safeParse({
    backgroundType: formData.get("backgroundType") || undefined,
    backgroundValue: formData.get("backgroundValue") || undefined,
    backgroundAngle: formData.get("backgroundAngle") || undefined,
    backgroundImageUrl: formData.get("backgroundImageUrl") || undefined,
    overlayColor: formData.get("overlayColor") || undefined,
    overlayOpacity: formData.get("overlayOpacity") || undefined,
    primaryColor: formData.get("primaryColor") || undefined,
    secondaryColor: formData.get("secondaryColor") || undefined,
    cardBackground: formData.get("cardBackground") || undefined,
    cardBorderColor: formData.get("cardBorderColor") || undefined,
    textColor: formData.get("textColor") || undefined,
    mutedTextColor: formData.get("mutedTextColor") || undefined,
    mode: formData.get("mode") || undefined,
    fontFamily: formData.get("fontFamily") || undefined,
    fontScale: formData.get("fontScale") || undefined,
    fontWeight: formData.get("fontWeight") || undefined,
    letterSpacing: formData.get("letterSpacing") || undefined,
    linkStyle: formData.get("linkStyle") || undefined,
    animationType: formData.get("animationType") || undefined,
    radius: formData.get("radius") || undefined,
    buttonSize: formData.get("buttonSize") || undefined,
    borderWidth: formData.get("borderWidth") || undefined,
    shadowStrength: formData.get("shadowStrength") || undefined,
    hoverEffect: formData.get("hoverEffect") || undefined,
    containerWidth: formData.get("containerWidth") || undefined,
    alignment: formData.get("alignment") || undefined,
    density: formData.get("density") || undefined,
    glow: formData.get("glow") || undefined,
    glowColor: formData.get("glowColor") || undefined,
    blur: formData.get("blur") || undefined,
    noise: formData.get("noise") || undefined,
  });
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const active = await getActiveTheme();
  if (!active) return notFoundError("No active theme");

  const updates: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) updates[key] = value as string;
  }
  if (Object.keys(updates).length > 0) {
    try {
      await updateTheme(active.id, updates);
    } catch (err) {
      logError("customizeActiveTheme", err, { themeId: active.id });
      return {
        success: false,
        error: "Something went wrong. Please try again.",
        errorCode: "internal",
      };
    }
  }

  revalidatePath("/theme");
  revalidatePath("/");
  return { success: true };
}

export async function duplicateActiveTheme(name: string): Promise<ActionResult> {
  const blocked = demoGuard();
  if (blocked) return blocked;
  if (!(await getSession())) return unauthorizedError();

  const active = await getActiveTheme();
  if (!active) return notFoundError("No active theme");

  const trimmed = (name || "").trim().slice(0, 100);
  if (!trimmed) return validationError("Name is required");

  const { themeNameExists } = await import("@/server/queries");
  if (await themeNameExists(trimmed)) {
    return conflictError("A theme with this name already exists");
  }

  try {
    await duplicateTheme(active.id, trimmed);
    revalidatePath("/theme");
    return { success: true };
  } catch (err) {
    logError("duplicateActiveTheme", err, { themeId: active.id, name: trimmed });
    return {
      success: false,
      error: "Something went wrong. Please try again.",
      errorCode: "internal",
    };
  }
}

export async function deleteCustomTheme(id: number): Promise<ActionResult> {
  const blocked = demoGuard();
  if (blocked) return blocked;
  if (!(await getSession())) return unauthorizedError();
  if (typeof id !== "number" || Number.isNaN(id)) {
    return validationError("Invalid theme id");
  }

  // Don't allow deleting presets or the active theme
  const active = await getActiveTheme();
  if (active?.id === id) {
    return validationError("Cannot delete the active theme");
  }

  try {
    await deleteTheme(id);
    revalidatePath("/theme");
    return { success: true };
  } catch (err) {
    logError("deleteCustomTheme", err, { id });
    return {
      success: false,
      error: "Something went wrong. Please try again.",
      errorCode: "internal",
    };
  }
}
