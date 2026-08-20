/**
 * Locale helpers shared by server components, actions, and the proxy.
 */
import { cookies, headers } from "next/headers";
import {
  AVAILABLE_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  LOCALE_NAMES,
  isAvailableLocale,
  type Locale,
} from "./config";

/** Read the effective locale for the current admin request. */
export async function getLocale(): Promise<Locale> {
  const h = await headers();
  const fromHeader = h.get(LOCALE_HEADER);
  if (isAvailableLocale(fromHeader)) return fromHeader;

  // Fallback for render paths the proxy matcher skips.
  const jar = await cookies();
  const fromCookie = jar.get(LOCALE_COOKIE)?.value;
  if (isAvailableLocale(fromCookie)) return fromCookie;

  return DEFAULT_LOCALE;
}

/** Options for the language picker: value + native endonym. */
export function localeOptions() {
  return AVAILABLE_LOCALES.map((value) => ({
    value,
    label: LOCALE_NAMES[value],
  }));
}
