/**
 * i18n locale registry.
 *
 * Tiers (do not offer a locale in the picker before its tier ships):
 *   T1: en, fr          T2: es          T3: zh, hi, ar, pt-BR
 *
 * `Locale` is the single source of truth — the website repo mirrors this
 * union (same names, same order) per the i18n plan.
 */

export const LOCALES = ["en", "fr", "es", "zh", "hi", "ar", "pt-BR"] as const;
export type Locale = (typeof LOCALES)[number];

/** Locales whose dictionary + review are done → shown in the picker. */
export const AVAILABLE_LOCALES = ["en", "fr", "es"] as const;
export type AvailableLocale = (typeof AVAILABLE_LOCALES)[number];

export const DEFAULT_LOCALE = "en" as const satisfies AvailableLocale;

/** Cookie that carries the admin UI language. Set by the settings action. */
export const LOCALE_COOKIE = "lb_locale";

/** Request header the proxy stamps on admin paths (from the cookie). */
export const LOCALE_HEADER = "x-lb-locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function isAvailableLocale(
  value: unknown,
): value is AvailableLocale {
  return isLocale(value) && (AVAILABLE_LOCALES as readonly string[]).includes(value);
}

/** Native endonyms for the picker — never translate these. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  zh: "中文",
  hi: "हिन्दी",
  ar: "العربية",
  "pt-BR": "Português (Brasil)",
};

/** Text direction per locale. Everything except ar is LTR (for now). */
export function localeDir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** HTML lang tag per locale (pt-BR keeps its region; others are bare). */
export const LOCALE_HTML_LANG: Record<Locale, string> = {
  en: "en",
  fr: "fr",
  es: "es",
  zh: "zh-Hans",
  hi: "hi",
  ar: "ar",
  "pt-BR": "pt-BR",
};
