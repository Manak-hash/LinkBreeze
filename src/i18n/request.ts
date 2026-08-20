import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  isAvailableLocale,
  type AvailableLocale,
} from "./config";

/**
 * next-intl request config for a NO-URL-PREFIX setup.
 *
 * Locale resolution order:
 *   1. x-lb-locale request header (stamped by the proxy from the
 *      lb_locale cookie, admin paths only — public [slug] pages stay
 *      English by decision, so they never send the header).
 *   2. DEFAULT_LOCALE (en).
 *
 * Accept-Language is NOT honored here: first-visit language guess is a
 * nice-to-have; a wrong guess silently switches languages on people.
 * The language picker in Settings is the single control.
 */

const Dictionaries = {
  en: () => import("@/locales/en"),
  fr: () => import("@/locales/fr"),
} satisfies Record<string, () => Promise<{ default: unknown }>>;

export default getRequestConfig(async () => {
  let locale: AvailableLocale = DEFAULT_LOCALE;

  const h = await headers();
  const fromHeader = h.get("x-lb-locale");
  if (isAvailableLocale(fromHeader)) {
    locale = fromHeader;
  }

  const dictionary = (await Dictionaries[locale]()).default;

  return {
    locale,
    messages: dictionary,
    timeZone: "UTC",
    // Latin digits in every locale (incl. future ar/hi) — locked decision.
    numberingSystem: "latn",
  };
});

// Import at the bottom to avoid a circular type reference in the editor.
import type { Messages } from "@/locales/en";
