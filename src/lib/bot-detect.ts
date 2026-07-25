/**
 * Conservative bot/crawler detection for analytics filtering.
 *
 * Issue #41: Known bots inflate view/click counts. This module provides a
 * lightweight, dependency-free check against the most common crawler UAs.
 *
 * It is deliberately conservative — it only matches well-known bot signatures
 * to avoid over-filtering legitimate traffic. False negatives (some bots
 * slipping through) are acceptable; false positives (real users excluded)
 * are not.
 */

// A curated list of bot/crawler identifier substrings. These appear in the
// User-Agent strings of search engine crawlers, social media previews,
// monitoring tools, and archive services.
const BOT_PATTERNS: readonly RegExp[] = [
  // Major search engine crawlers
  /Googlebot/i,
  /Bingbot/i,
  /Slurp/i, // Yahoo
  /DuckDuckBot/i,
  /Baiduspider/i,
  /YandexBot/i,
  /Sogou/i,
  /Exabot/i,
  // Social media / link preview crawlers
  /FacebookExternalHit/i,
  /Twitterbot/i,
  /LinkedInBot/i,
  /WhatsApp/i,
  /TelegramBot/i,
  /Slackbot/i,
  /Discordbot/i,
  /SkypeUriPreview/i,
  // Preview / screenshot services
  /Prerender/i,
  /Snap/i,
  /Chrome-Lighthouse/i,
  // SEO / monitoring tools
  /AhrefsBot/i,
  /SemrushBot/i,
  /MJ12bot/i,
  /DotBot/i,
  /PetalBot/i,
  /Applebot/i,
  // Generic bot signatures
  /\bbot\b/i,
  /\bcrawler\b/i,
  /\bspider\b/i,
  // Archive / research
  /archive\.org/i,
  /WaybackMachine/i,
];

/**
 * Returns true if the User-Agent string matches a known bot/crawler pattern.
 * Empty or missing UAs are treated as real visitors (some browsers strip UA
 * for privacy — we don't want to exclude them).
 */
export function isBot(userAgent: string): boolean {
  if (!userAgent || userAgent.trim().length === 0) return false;
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}
