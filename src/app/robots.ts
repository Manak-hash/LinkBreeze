import type { MetadataRoute } from "next";
import { headers } from "next/headers";

/**
 * Dynamic robots.txt — resolves the origin per-instance so the Sitemap
 * directive is always a valid absolute URL (Google requires this).
 *
 * A static public/robots.txt can't work for a self-hosted product where
 * every instance has a different domain.
 */
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const headerList = await headers();
  const origin = process.env.BASE_URL
    ? process.env.BASE_URL.replace(/\/$/, "")
    : `${headerList.get("x-forwarded-proto") || "https"}://${headerList.get("x-forwarded-host") || headerList.get("host") || "localhost"}`;

  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /login",
    "Disallow: /setup",
    "Disallow: /dashboard",
    "Disallow: /links",
    "Disallow: /profile",
    "Disallow: /theme",
    "Disallow: /settings",
    "Disallow: /api/",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

// Next.js also calls this function for the metadata route system.
// Returning the same shape keeps both code paths consistent.
export function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/setup", "/dashboard", "/links", "/profile", "/theme", "/settings", "/api/"],
    },
  };
}
