import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllSubscribers } from "@/server/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV export of all subscriber emails. Auth-required. */
export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await getAllSubscribers();
  const header = ["email", "subscribed_at"];
  const lines = rows.map((r) => [r.email, r.createdAt].map(csvCell).join(","));

  const csv = [header.join(","), ...lines].join("\n");
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="linkbreeze-subscribers-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
