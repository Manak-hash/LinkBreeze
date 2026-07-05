"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addSubscriber } from "@/server/queries";

export type SubscribeResult = { success: true } | { success: false; error: string };

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email").max(320),
});

export async function subscribe(formData: FormData): Promise<SubscribeResult> {
  const parsed = subscribeSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid email" };
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

export async function clearAllSubscribers(): Promise<
  { success: true } | { success: false; error: string }
> {
  const { getSession } = await import("@/lib/auth");
  if (!(await getSession())) return { success: false, error: "Unauthorized" };

  const { clearSubscribers } = await import("@/server/queries");
  clearSubscribers();
  revalidatePath("/settings");
  return { success: true };
}
