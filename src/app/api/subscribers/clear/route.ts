import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { clearSubscribers } from "@/server/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await clearSubscribers();
  return NextResponse.json({ success: true });
}
