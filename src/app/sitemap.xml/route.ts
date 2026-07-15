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
