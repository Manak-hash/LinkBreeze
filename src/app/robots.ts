import type { MetadataRoute } from "next";
import { headers } from "next/headers";

/**
 * Dynamic robots.txt metadata route.
 *
 * Next.js calls the default export to generate /robots.txt. We resolve
 * the origin per-instance so the Sitemap directive is always a valid
 * absolute URL (Google requires this). A static public/robots.txt can't
 * work for a self-hosted product where every instance has a different
 * domain.
 */
export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerList = await headers();
  const origin = process.env.BASE_URL
    ? process.env.BASE_URL.replace(/\/$/, "")
    : `${headerList.get("x-forwarded-proto") || "https"}://${headerList.get("x-forwarded-host") || headerList.get("host") || "localhost"}`;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/setup", "/dashboard", "/links", "/profile", "/theme", "/settings", "/api/"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
