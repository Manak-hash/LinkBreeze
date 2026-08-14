import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllSubscribers } from "@/server/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CSV_HEADER = ["email", "subscribed_at", "consent_at", "consent_text"];

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
  const lines = rows.map((r) =>
    [r.email, r.createdAt, r.consentAt ?? "", r.consentText ?? ""]
      .map(csvCell)
      .join(","),
  );

  const csv = [CSV_HEADER.join(","), ...lines].join("\n");
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="linkbreeze-subscribers-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
