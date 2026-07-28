/**
 * Migration Wizard — extraction engine.
 *
 * Fetches a profile page from a competitor platform, extracts links and
 * social profiles, and returns a normalized preview list that the user can
 * confirm before importing.
 *
 * Two extraction tiers:
 * 1. Structured data: parse __NEXT_DATA__ JSON (Linktree, Bento, and other
 *    Next.js-based platforms).
 * 2. DOM scrape fallback: find all <a> tags, filter navigation/junk, detect
 *    social platforms via detectPlatform().
 */

import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { detectPlatform, type SocialPlatform } from "@/lib/social-icons";

// ─── Types ─────────────────────────────────────────────────────────────

export interface ImportedLink {
  title: string;
  url: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  type?: string;
  isSocial: boolean;
  platform?: SocialPlatform;
  selected: boolean;
}

export interface ExtractionResult {
  links: ImportedLink[];
  socialLinks: ImportedLink[];
  profileName?: string;
  profileBio?: string;
  profileAvatar?: string;
  platform: string;
}

// ─── SSRF Protection ──────────────────────────────────────────────────

const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^::1$/,
  /^fc00:/i,
  /^fd/i,
  /^fe80:/i,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // Tailscale/CGNAT range
];

function isPrivateIP(hostname: string): boolean {
  return PRIVATE_IP_PATTERNS.some((p) => p.test(hostname));
}

function validateUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid URL format");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https URLs are allowed");
  }

  const hostname = url.hostname.toLowerCase();

  if (hostname === "localhost" || isPrivateIP(hostname)) {
    throw new Error("Private/local URLs are not allowed");
  }

  return url;
}

// ─── URL Fetcher ───────────────────────────────────────────────────────

const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 8000;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

async function fetchPage(
  url: URL,
  redirectCount = 0,
): Promise<{ html: string; finalUrl: URL }> {
  if (redirectCount > MAX_REDIRECTS) {
    throw new Error("Too many redirects");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LinkBreeze-Importer/1.0; +https://github.com/Manak-hash/LinkBreeze)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
      redirect: "manual", // Handle redirects ourselves to enforce limits
    });

    // Handle redirects manually.
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get("location");
      if (!location) throw new Error("Redirect without Location header");
      const nextUrl = new URL(location, url);
      return fetchPage(nextUrl, redirectCount + 1);
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching the page`);
    }

    // Read body with size limit.
    const reader = res.body?.getReader();
    if (!reader) {
      const text = await res.text();
      if (text.length > MAX_BYTES) throw new Error("Response too large");
      return { html: text, finalUrl: url };
    }

    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        reader.cancel();
        throw new Error("Response too large");
      }
      chunks.push(value);
    }

    const html = new TextDecoder().decode(
      Buffer.concat(chunks.map((c) => Buffer.from(c))),
    );
    return { html, finalUrl: url };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Next.js __NEXT_DATA__ extraction ───────────────────────────────────

function tryNextData($: cheerio.CheerioAPI): Record<string, unknown> | null {
  const scriptContent = $("#__NEXT_DATA__").html();
  if (!scriptContent) return null;

  try {
    return JSON.parse(scriptContent);
  } catch {
    return null;
  }
}

/**
 * Walk the __NEXT_DATA__ JSON looking for arrays of link-like objects.
 * This is flexible — Linktree, Bento, and other Next.js apps all nest
 * data differently. We search recursively for arrays containing objects
 * with url + title fields.
 */
function extractLinksFromNextData(
  data: unknown,
  found: ImportedLink[] = [],
): ImportedLink[] {
  if (!data || typeof data !== "object") return found;

  if (Array.isArray(data)) {
    // Check if this array looks like a list of links.
    const linkCandidates = data.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        ("url" in item || "link" in item) &&
        ("title" in item || "name" in item),
    );

    if (linkCandidates.length > 0) {
      for (const item of linkCandidates) {
        const obj = item as Record<string, unknown>;
        const url = String(obj.url || obj.link || "");
        const title = String(obj.title || obj.name || "");
        const description = obj.description
          ? String(obj.description)
          : undefined;
        const imageUrl = obj.thumbnail || obj.image || obj.imageUrl
          ? String(obj.thumbnail || obj.image || obj.imageUrl)
          : undefined;

        if (url && title) {
          const platform = detectPlatform(url);
          found.push({
            title,
            url,
            description,
            imageUrl,
            type: "url",
            isSocial: !!platform,
            platform: platform ?? undefined,
            selected: true,
          });
        }
      }
    }

    // Recurse into array elements.
    for (const item of data) {
      extractLinksFromNextData(item, found);
    }
  } else {
    // It's an object — recurse into values.
    for (const value of Object.values(data)) {
      extractLinksFromNextData(value, found);
    }
  }

  return found;
}

// ─── Inline script JSON extraction (Wix/Hopp, etc.) ────────────────────

/**
 * Many SPA platforms (Hopp/Wix, Beacons, etc.) render links client-side
 * and embed all data inside <script> tags as JS object literals — not as
 * __NEXT_DATA__ and not as rendered <a> tags.
 *
 * This function scans all inline scripts for JSON-like objects containing
 * URL fields and extracts them.
 */
function extractFromInlineScripts(
  $: cheerio.CheerioAPI,
  baseUrl: URL,
): ImportedLink[] {
  const links: ImportedLink[] = [];
  const seen = new Set<string>();

  // URL field names that different platforms use.
  const URL_KEYS = new Set([
    "url", "link", "eventLink", "href", "destination",
    "actionUrl", "redirectUrl", "buttonLink",
  ]);

  // Title/name field names.
  const TITLE_KEYS = new Set([
    "title", "name", "eventTitle", "label", "text",
    "buttonText", "heading",
  ]);

  $("script").each((_, el) => {
    // Skip external scripts (with src attribute).
    if ($(el).attr("src")) return;
    const content = $(el).html();
    if (!content || content.length < 50) return;

    // Try to parse the whole script as JSON (some platforms do this).
    let data: unknown = null;
    try {
      data = JSON.parse(content);
    } catch {
      // Not pure JSON — extract JSON objects via regex.
      // Find sequences like: "url":"https://..."
      const urlMatches = content.matchAll(
        /"(?:url|link|eventLink|href|destination|actionUrl|buttonLink)"\s*:\s*"(https?:\/\/[^"]+)"/gi,
      );

      for (const match of urlMatches) {
        const url = match[1];
        if (!url || seen.has(url.toLowerCase())) continue;

        // Skip platform-internal URLs.
        if (isInternalUrl(url, baseUrl)) continue;

        // Look for a nearby title in the surrounding text.
        const context = content.slice(
          Math.max(0, match.index! - 300),
          match.index! + 300,
        );

        const titleMatch = context.match(
          /"(?:eventTitle|title|name|label|buttonText)"\s*:\s*"([^"]+)"/,
        );
        const title = titleMatch ? titleMatch[1] : "";

        // Skip if no title and it's not a social link.
        const platform = detectPlatform(url);
        if (!title && !platform) continue;

        seen.add(url.toLowerCase());
        links.push({
          title: title || (platform ? platform : "Imported Link"),
          url,
          type: "url",
          isSocial: !!platform,
          platform: platform ?? undefined,
          selected: true,
        });
      }
      return;
    }

    // If it parsed as JSON, walk it for link-like objects.
    if (data) {
      extractStructuredObjects(data, URL_KEYS, TITLE_KEYS, baseUrl, seen, links);
    }
  });

  return links;
}

function isInternalUrl(url: string, baseUrl: URL): boolean {
  try {
    const parsed = new URL(url);
    // Allow social links even if same-origin.
    if (detectPlatform(url)) return false;
    return parsed.hostname === baseUrl.hostname;
  } catch {
    return true;
  }
}

function extractStructuredObjects(
  data: unknown,
  urlKeys: Set<string>,
  titleKeys: Set<string>,
  baseUrl: URL,
  seen: Set<string>,
  found: ImportedLink[],
): void {
  if (!data || typeof data !== "object") return;

  if (Array.isArray(data)) {
    for (const item of data) {
      extractStructuredObjects(item, urlKeys, titleKeys, baseUrl, seen, found);
    }
    return;
  }

  const obj = data as Record<string, unknown>;

  // Check if this object has a URL field.
  let urlValue: string | undefined;
  let titleValue: string | undefined;
  let imageUrl: string | undefined;

  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") {
      if (urlKeys.has(k) && v.startsWith("http")) {
        urlValue = v;
      } else if (titleKeys.has(k) && v.length > 1 && v.length < 200) {
        // Use the first title-like field found.
        if (!titleValue) titleValue = v;
      } else if (
        (k === "image" || k === "imageUrl" || k === "thumbnail" || k === "picture") &&
        v.startsWith("http")
      ) {
        imageUrl = v;
      }
    }
  }

  if (urlValue && !seen.has(urlValue.toLowerCase())) {
    if (!isInternalUrl(urlValue, baseUrl)) {
      const platform = detectPlatform(urlValue);
      // Only add if we have a title or it's a social link.
      if (titleValue || platform) {
        seen.add(urlValue.toLowerCase());
        found.push({
          title: titleValue || (platform ? platform : "Imported Link"),
          url: urlValue,
          imageUrl,
          type: "url",
          isSocial: !!platform,
          platform: platform ?? undefined,
          selected: true,
        });
      }
    }
  }

  // Recurse into object values.
  for (const v of Object.values(obj)) {
    extractStructuredObjects(v, urlKeys, titleKeys, baseUrl, seen, found);
  }
}

// ─── DOM scraping fallback ─────────────────────────────────────────────

const NAV_SELECTORS = [
  "nav",
  "header",
  "footer",
  "[role=navigation]",
  ".nav",
  ".navbar",
  ".header",
  ".footer",
  "[aria-label*=navigation i]",
];

function isNavLink(el: cheerio.Cheerio<AnyNode>): boolean {
  for (const sel of NAV_SELECTORS) {
    if (el.closest(sel).length > 0) return true;
  }
  return false;
}

function extractFromDom(
  $: cheerio.CheerioAPI,
  baseUrl: URL,
): ImportedLink[] {
  const links: ImportedLink[] = [];
  const seen = new Set<string>();

  $("a[href]").each((_, el) => {
    const $el = $(el);

    // Skip nav/header/footer links.
    if (isNavLink($el)) return;

    let href = $el.attr("href")?.trim();
    if (!href) return;

    // Skip anchors and dangerous schemes (case-insensitive).
    if (href.startsWith("#") || /^\s*(?:javascript|data|vbscript):/i.test(href)) return;

    // Resolve relative URLs.
    try {
      href = new URL(href, baseUrl).toString();
    } catch {
      return;
    }

    // Skip internal links (same origin unless it's a social platform).
    const parsed = new URL(href);
    const platform = detectPlatform(href);

    // Allow social links even if same-origin (some platforms proxy them).
    if (!platform && parsed.hostname === baseUrl.hostname) return;

    // Deduplicate by URL.
    const key = href.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    // Extract title from link text or aria-label or title attr.
    const title =
      $el.text().trim() ||
      $el.attr("aria-label")?.trim() ||
      $el.attr("title")?.trim() ||
      "";

    // Skip empty titles.
    if (!title || title.length < 2) return;
    if (title.length > 200) return; // Skip absurdly long text

    // Extract thumbnail/icon image.
    const imgSrc =
      $el.find("img").attr("src") ||
      $el.find("img").attr("data-src") ||
      $el.attr("data-thumbnail") ||
      undefined;

    let imageUrl: string | undefined;
    if (imgSrc) {
      try {
        imageUrl = new URL(imgSrc, baseUrl).toString();
      } catch {
        imageUrl = undefined;
      }
    }

    links.push({
      title,
      url: href,
      imageUrl,
      type: "url",
      isSocial: !!platform,
      platform: platform ?? undefined,
      selected: true,
    });
  });

  return links;
}

// ─── Profile metadata extraction ───────────────────────────────────────

function extractProfileMeta(
  $: cheerio.CheerioAPI,
  nextData: Record<string, unknown> | null,
): { name?: string; bio?: string; avatar?: string } {
  // Try __NEXT_DATA__ first (most reliable for Linktree/Bento).
  if (nextData) {
    const props = findNestedKey(nextData, ["title", "name", "displayName", "pageTitle"]);
    const bio = findNestedKey(nextData, ["description", "bio", "about"]);
    const avatar = findNestedKey(nextData, ["avatarUrl", "avatar", "profilePictureUrl", "imageUrl"]);

    if (props || bio || avatar) {
      return {
        name: props ? String(props) : undefined,
        bio: bio ? String(bio) : undefined,
        avatar: avatar ? String(avatar) : undefined,
      };
    }
  }

  // Fall back to meta tags.
  const name =
    $("meta[property='og:title']").attr("content") ||
    $("meta[name='twitter:title']").attr("content") ||
    $("title").text().split("|")[0]?.trim() ||
    undefined;

  const bio =
    $("meta[property='og:description']").attr("content") ||
    $("meta[name='description']").attr("content") ||
    undefined;

  const avatar =
    $("meta[property='og:image']").attr("content") ||
    $("meta[name='twitter:image']").attr("content") ||
    undefined;

  return { name, bio, avatar };
}

function findNestedKey(obj: unknown, keys: string[]): unknown {
  if (!obj || typeof obj !== "object") return null;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findNestedKey(item, keys);
      if (found) return found;
    }
    return null;
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (keys.includes(k) && v && typeof v === "string" && v.length > 0) return v;
    const nested = findNestedKey(v, keys);
    if (nested) return nested;
  }
  return null;
}

// ─── Platform detection ────────────────────────────────────────────────

function detectPlatformFromUrl(url: URL): string {
  const host = url.hostname.toLowerCase();
  if (host.includes("linktr.ee")) return "linktree";
  if (host.includes("bento.me")) return "bento";
  if (host.includes("lnk.bio")) return "lnkbio";
  if (host.includes("tap.link")) return "taplink";
  if (host.includes("hopp.bio") || host.includes("hopp.to") || host.includes("hop.page")) return "hopp";
  if (host.includes("littlelink")) return "littlelink";
  if (host.includes("stackbit")) return "stackbit";
  if (host.includes("beacons.ai")) return "beacons";
  if (host.includes("solo.to")) return "soloto";
  if (host.includes("linkfly")) return "linkfly";
  if (host.includes("mssg.me")) return "mssgme";
  return "unknown";
}

// ─── Main extraction entry points ──────────────────────────────────────

export async function extractFromUrl(rawUrl: string): Promise<ExtractionResult> {
  const url = validateUrl(rawUrl);
  const { html, finalUrl } = await fetchPage(url);
  return extractFromHtml(html, finalUrl);
}

export function extractFromHtml(
  html: string,
  baseUrl: URL,
): ExtractionResult {
  const $ = cheerio.load(html);
  const platform = detectPlatformFromUrl(baseUrl);

  // Tier 1: Try __NEXT_DATA__ structured data (Linktree, Bento, etc.).
  const nextData = tryNextData($);
  let links: ImportedLink[] = [];

  if (nextData) {
    links = extractLinksFromNextData(nextData);
  }

  // Tier 2: Inline script extraction (Hopp/Wix, Beacons, etc.).
  // These platforms embed link data in <script> tags as JS objects.
  if (links.length < 3) {
    const scriptLinks = extractFromInlineScripts($, baseUrl);
    if (scriptLinks.length > 0) {
      links = [...links, ...scriptLinks];
    }
  }

  // Tier 3: DOM scraping fallback (LittleLink, static HTML, etc.).
  if (links.length === 0) {
    links = extractFromDom($, baseUrl);
  }

  // Deduplicate by URL (merge structured + DOM if both ran).
  const seen = new Set<string>();
  links = links.filter((link) => {
    const key = link.url.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Split into page links and social links.
  const socialLinks = links.filter((l) => l.isSocial);
  const pageLinks = links.filter((l) => !l.isSocial);

  // Extract profile metadata.
  const meta = extractProfileMeta($, nextData);

  return {
    links: pageLinks,
    socialLinks,
    profileName: meta.name,
    profileBio: meta.bio,
    profileAvatar: meta.avatar,
    platform,
  };
}

export function extractFromFileContent(
  content: string,
  fileName: string,
): ExtractionResult {
  // Detect file type.
  const trimmed = content.trim();

  // JSON file — try structured parse.
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const data = JSON.parse(trimmed);
      const links = extractLinksFromNextData(data);
      const socialLinks = links.filter((l) => l.isSocial);
      const pageLinks = links.filter((l) => !l.isSocial);

      return {
        links: pageLinks,
        socialLinks,
        platform: "json-import",
      };
    } catch {
      // Fall through to HTML parsing.
    }
  }

  // HTML file — parse as DOM.
  const baseUrl = new URL("https://import.local/");
  const result = extractFromHtml(content, baseUrl);
  result.platform = `file:${fileName.split(".").pop()}`;
  return result;
}
