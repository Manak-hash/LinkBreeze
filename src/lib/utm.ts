/**
 * UTM parameter builder for links.
 *
 * UTM params are standard marketing query strings (utm_source, utm_medium,
 * utm_campaign, utm_term, utm_content) appended to a URL so analytics tools
 * (Google Analytics, Plausible, etc.) can attribute traffic to specific
 * campaigns. They only apply to http(s) URLs — mailto:, tel:, and other
 * schemes are left untouched.
 *
 * Design:
 * - No DB schema change. UTM params are appended to the URL string before
 *   it's saved. The stored url field is the final URL with UTM included.
 * - Empty fields are skipped — only non-empty values are appended.
 * - If the URL already has query params (e.g. ?ref=newsletter), UTM params
 *   are merged in without clobbering existing ones.
 */

/** The 5 standard UTM parameter names. */
export const UTM_KEYS = ["source", "medium", "campaign", "term", "content"] as const;
export type UTMKey = (typeof UTM_KEYS)[number];

/** A plain object map of UTM field name to value (empty string = unset). */
export type UTMParams = Record<UTMKey, string>;

/** Factory for an empty UTM state (all fields empty string). */
export function emptyUTM(): UTMParams {
  return { source: "", medium: "", campaign: "", term: "", content: "" };
}

/**
 * Extract UTM params that are already embedded in a URL string.
 * Returns them as a UTMParams object (empty for each missing key).
 * Non-http(s) URLs return all-empty.
 */
export function parseUTM(url: string): UTMParams {
  const result = emptyUTM();
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return result;
    for (const key of UTM_KEYS) {
      const val = u.searchParams.get(`utm_${key}`);
      if (val) result[key] = val;
    }
  } catch {
    // Not a parseable URL — return all-empty.
  }
  return result;
}

/**
 * Append UTM params to a URL string.
 *
 * - Only non-empty values are appended.
 * - Only applies to http(s) URLs; others are returned unchanged.
 * - Existing query params (including existing utm_* params) are preserved
 *   unless overwritten by a non-empty value in the same key.
 * - If baseUrl is empty or invalid, returns it unchanged.
 *
 * @example
 * appendUTM("https://example.com", { source: "instagram", medium: "social", campaign: "", term: "", content: "" })
 * // => "https://example.com/?utm_source=instagram&utm_medium=social"
 */
export function appendUTM(baseUrl: string, utm: Partial<UTMParams>): string {
  if (!baseUrl) return baseUrl;

  let u: URL;
  try {
    u = new URL(baseUrl);
  } catch {
    return baseUrl; // Not a valid absolute URL (mailto:, tel:, relative paths).
  }

  if (u.protocol !== "http:" && u.protocol !== "https:") return baseUrl;

  for (const key of UTM_KEYS) {
    const val = utm[key]?.trim();
    if (val) {
      u.searchParams.set(`utm_${key}`, val);
    }
  }

  return u.toString();
}

/**
 * Strip all utm_* params from a URL string.
 * Used to show the "clean" URL in the editor when UTM fields are present.
 */
export function stripUTM(baseUrl: string): string {
  if (!baseUrl) return baseUrl;

  let u: URL;
  try {
    u = new URL(baseUrl);
  } catch {
    return baseUrl;
  }

  if (u.protocol !== "http:" && u.protocol !== "https:") return baseUrl;

  for (const key of UTM_KEYS) {
    u.searchParams.delete(`utm_${key}`);
  }

  return u.toString();
}

/**
 * Check whether a URL contains any utm_* params.
 */
export function hasUTM(url: string): boolean {
  const parsed = parseUTM(url);
  return UTM_KEYS.some((key) => parsed[key].length > 0);
}
