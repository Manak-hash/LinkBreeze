import { cookies } from "next/headers";
import { generateQrSvg } from "@/lib/qr";

export const dynamic = "force-dynamic";

/**
 * #5: QR code for TOTP setup. The otpauth:// URI is stashed in a short-lived
 * cookie by startTotpSetup() — the QR endpoint renders whatever URI the
 * pending setup created, without exposing the secret in a URL.
 */
export async function GET() {
  const store = await cookies();
  const uri = store.get("lb_totp_setup_uri")?.value;
  if (!uri) {
    return new Response("No pending TOTP setup", { status: 404 });
  }
  const svg = await generateQrSvg(uri);
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
    },
  });
}
