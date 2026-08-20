"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  LOCALE_COOKIE,
  isAvailableLocale,
} from "@/i18n/config";

/**
 * Persist the admin UI language: cookie (immediate, survives browser
 * restarts on this machine) + settings KV row (survives browser changes /
 * syncs the value server-side for future features). The proxy forwards the
 * cookie to admin renders as x-lb-locale.
 */
export async function setLocaleAction(locale: string): Promise<void> {
  if (!isAvailableLocale(locale)) return; // never persist an unavailable locale

  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year, rolling on every set
    sameSite: "lax",
    httpOnly: false, // readable client-side for instant picker feedback
  });

  // Best-effort persistence for logged-in admins; login/setup are open, so
  // failure is non-fatal (cookie alone still works this session).
  try {
    const { updateSetting } = await import("@/server/queries");
    const { getSession } = await import("@/lib/auth");
    if (await getSession()) {
      await updateSetting("locale", locale);
    }
  } catch {
    // KV write is opportunistic — ignore DB hiccups.
  }

  revalidatePath("/", "layout");
}
