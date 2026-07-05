import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { safeUploadPath, contentTypeFor } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public GET for uploaded assets (avatars, etc.). Path-traversal-safe. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const resolved = safeUploadPath(file);
  if (!resolved) {
    return new NextResponse("Not found", { status: 404 });
  }

  let data: Buffer;
  try {
    data = await readFile(resolved);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": contentTypeFor(file),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'",
    },
  });
}
