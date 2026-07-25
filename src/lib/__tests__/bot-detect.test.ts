import { describe, it, expect } from "vitest";
import { isBot } from "@/lib/bot-detect";

describe("isBot", () => {
  // ── Known bots should be detected ──────────────────────────────────────
  const knownBots = [
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)",
    "DuckDuckBot/1.1; DuckDuckGo-Favicons-Bot/1.0",
    "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)",
    "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)",
    "Mozilla/5.0 (compatible; PetalBot;+https://webmaster.petalsearch.com/site/petalbot)",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Twitterbot/1.0",
    "LinkedInBot/1.0 (compatible; Mozilla/5.0; +https://www.linkedin.com/help/linkedin/answer/86003)",
    "WhatsApp/2.23.20.0",
    "TelegramBot (like TwitterBot)",
    "Slackbot 1.0 (+https://api.slack.com/robots)",
    "Discordbot/2.0 (+https://discordapp.com)",
    "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
    "Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)",
    "Mozilla/5.0 (compatible; MJ12bot/v1.4.8; http://mj12bot.com/)",
    "Mozilla/5.0 (compatible; DotBot/1.2; +https://opensiteexplorer.org/dotbot; help@moz.com)",
    "Mozilla/5.0 (compatible; Applebot/0.1; +http://www.apple.com/go/applebot)",
    "Mozilla/5.0 (compatible; archive.org_bot)",
    "Mozilla/5.0 (compatible; Googlebot/2.1; Chrome-Lighthouse)",
  ];

  for (const ua of knownBots) {
    it(`detects known bot: ${ua.slice(0, 50)}...`, () => {
      expect(isBot(ua)).toBe(true);
    });
  }

  // ── Real browsers should NOT be flagged ─────────────────────────────────
  const realBrowsers = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    "Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  ];

  for (const ua of realBrowsers) {
    it(`does NOT flag real browser: ${ua.slice(0, 50)}...`, () => {
      expect(isBot(ua)).toBe(false);
    });
  }

  // ── Edge cases ──────────────────────────────────────────────────────────
  it("returns false for empty string", () => {
    expect(isBot("")).toBe(false);
  });

  it("returns false for whitespace-only string", () => {
    expect(isBot("   ")).toBe(false);
  });

  it("returns false for undefined-like input", () => {
    expect(isBot("undefined")).toBe(false);
  });

  it("returns false for null-like input", () => {
    expect(isBot("null")).toBe(false);
  });

  // ── Generic patterns ────────────────────────────────────────────────────
  it("matches standalone 'bot'/'crawler'/'spider' words", () => {
    // These patterns match the word as a standalone token (surrounded by
    // word boundaries), not when embedded in a longer word.
    expect(isBot("test bot/1.0")).toBe(true);
    expect(isBot("test crawler/2.0")).toBe(true);
    expect(isBot("test spider/0.1")).toBe(true);
  });

  it("does not match 'bot' inside a longer word (no word boundary)", () => {
    // "robotics" contains "bot" but not as a standalone word
    expect(isBot("Mozilla/5.0 Robotics-Browser/1.0")).toBe(false);
  });
});
