import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getVisitorHash } from "@/lib/visitor";
import { getLink, recordClick } from "@/server/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * JS-free click tracking redirect.
 *
 * Records a click for the given link ID, then 302-redirects to the link's URL.
 * Works without client-side JS (crawlers, in-app browsers that block
 * sendBeacon, JS-disabled browsers). The public page uses /go/:id as the href
 * for http(s) links so clicks are always counted.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const linkId = Number(rawId);

  if (Number.isNaN(linkId)) {
    return NextResponse.json({ error: "Invalid link ID" }, { status: 400 });
  }

  const link = await getLink(linkId);
  if (!link || !link.isActive) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  // Defense-in-depth: only redirect to http(s) URLs. The create/update
  // validators already block javascript:/data: schemes, but a stale or
  // tampered DB row could bypass that. Never 302 to a non-http protocol.
  try {
    const parsed = new URL(link.url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json({ error: "Invalid link URL" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid link URL" }, { status: 400 });
  }

  // Record the click — same visitor hash logic as /api/track.
  try {
    const h = await headers();
    const ip =
      (h.get("x-forwarded-for")?.split(",")[0] || "").trim() ||
      (h.get("x-real-ip") || "").toString() ||
      "0.0.0.0";
    const userAgent = (h.get("user-agent") || "").toString();
    const visitorHash = getVisitorHash(ip, userAgent);
    const referrer = (h.get("referer") || h.get("referrer") || "").toString();
    await recordClick(linkId, visitorHash, referrer || null);
  } catch (err) {
    // Don't block the redirect if analytics fails — the user should still
    // reach their destination.
    console.error("[/go/:id] failed to record click", err);
  }

  return NextResponse.redirect(link.url, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}
