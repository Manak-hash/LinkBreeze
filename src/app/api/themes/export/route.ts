import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { demoBlock } from "@/lib/demo";
import { exportTheme } from "@/server/actions/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Download a single theme as a portable JSON file. Auth-required. */
export async function GET(request: NextRequest) {
  if (demoBlock()) {
    return NextResponse.json({ error: "read-only" }, { status: 403 });
  }
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idStr = new URL(request.url).searchParams.get("id");
  const id = idStr ? Number(idStr) : NaN;
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
  }

  let payload;
  try {
    payload = await exportTheme(id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Export failed";
    const status = msg === "Unauthorized" ? 401 : msg === "Theme not found" ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }

  const safeName = payload.name.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "theme";
  const today = payload.exportedAt.slice(0, 10);
  return NextResponse.json(payload, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="linkbreeze-theme-${safeName}-${today}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
