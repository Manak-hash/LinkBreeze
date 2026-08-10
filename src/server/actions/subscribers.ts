"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addSubscriber } from "@/server/queries";
import {
  type ActionResult,
  validationError,
  rateLimitError,
} from "@/lib/errors";


const subscribeSchema = z.object({
  email: z.email("Please enter a valid email").max(320),
});

export async function subscribe(formData: FormData): Promise<ActionResult> {
  const parsed = subscribeSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message ?? "Invalid email");
  }

  // Rate limit: 10 signups per minute per IP to prevent table-flooding.
  const { headers } = await import("next/headers");
  const h = await headers();
  const ip =
    (h.get("x-forwarded-for")?.split(",")[0] || "").trim() ||
    (h.get("x-real-ip") || "").toString() ||
    "0.0.0.0";
  const { rateLimit } = await import("@/lib/rate-limit");
  const rl = rateLimit(`subscribe:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return rateLimitError(60);
  }

  try {
    await addSubscriber(parsed.data.email.toLowerCase().trim());
  } catch {
    // Most likely a duplicate — still return success so we don't leak
    // whether an email is already subscribed.
  }

  revalidatePath("/");
  return { success: true };
}
