import { NextResponse } from "next/server";
import { version } from "@/lib/version";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version,
    secretKeySet: !!process.env.SECRET_KEY,
  });
}
