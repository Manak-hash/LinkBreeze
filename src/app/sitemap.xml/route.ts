import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSetting } from "@/server/queries";

export const dynamic = "force-dynamic";

/** Generate sitemap.xml with the single public page URL. */
export async function GET() {
  const headerList = await headers();
  // Prefer BASE_URL env var (prevents host-header injection behind proxies).
  const origin = process.env.BASE_URL
    ? process.env.BASE_URL.replace(/\/$/, "")
    : `${headerList.get("x-forwarded-proto") || "http"}://${headerList.get("x-forwarded-host") || headerList.get("host") || "localhost"}`;

  const slug = (await getSetting("slug")) || "u";
  // Search-engine visibility (#94): a hidden page is dropped from the
  // sitemap entirely (empty urlset) so crawlers stop being pointed at it.
  // The route keeps responding — an empty sitemap is a valid sitemap —
  // and the URL set returns the moment the operator flips back to visible.
  const hidden = (await getSetting("searchEngineHidden")) === "true";
  if (hidden) {
    const empty = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    // no-store is enforced by the next.config.ts header rule for this path
    // (route-level Cache-Control is overridden by config headers).
    return new NextResponse(empty, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
