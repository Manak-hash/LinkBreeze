"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  getSession,
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import {
  getUserByUsername,
  getUserCount,
  createUser,
  getSetting,
} from "@/server/queries";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required").max(64),
  password: z.string().min(1, "Password is required").max(256),
});

const setupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(64)
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username may only contain letters, numbers, dots, hyphens and underscores"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(256),
});

export type ActionResult = { success: true } | { success: false; error: string };

export async function login(formData: FormData): Promise<ActionResult> {
  // Rate limit: 5 login attempts per minute per IP to prevent brute-force.
  const { headers } = await import("next/headers");
  const h = await headers();
  const ip =
    (h.get("x-forwarded-for")?.split(",")[0] || "").trim() ||
    (h.get("x-real-ip") || "").toString() ||
    "0.0.0.0";
  const { rateLimit } = await import("@/lib/rate-limit");
  const rl = rateLimit(`login:${ip}`, 5, 60_000);
  if (!rl.ok) {
    const retryAfter = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return { success: false, error: `Too many login attempts. Try again in ${retryAfter}s.` };
  }

  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { username, password } = parsed.data;
  const user = await getUserByUsername(username.trim());
  if (!user) {
    return { success: false, error: "Invalid username or password" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Invalid username or password" };
  }

  await createSession(user.id, user.username);
  return { success: true };
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function setup(formData: FormData): Promise<ActionResult> {
  // Only allow setup when no users exist yet.
  const count = await getUserCount();
  if (count > 0) {
    return { success: false, error: "Setup has already been completed" };
  }

  const parsed = setupSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { username, password } = parsed.data;
  const existing = await getUserByUsername(username.trim());
  if (existing) {
    return { success: false, error: "Username already taken" };
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(username.trim(), passwordHash);
  await createSession(user.id, user.username);

  return { success: true };
}

/**
 * Change the password of the currently authenticated user.
 */
export async function changePassword(formData: FormData): Promise<ActionResult> {
  const { demoBlock } = await import("@/lib/demo");
  const demo = demoBlock();
  if (demo) return { success: false, error: demo };
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  const schema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(256),
  });

  const parsed = schema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await getUserByUsername(session.username);
  if (!user) {
    return { success: false, error: "User not found" };
  }

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Current password is incorrect" };
  }

  const newHash = await hashPassword(parsed.data.newPassword);

  // Bump session version to invalidate any other sessions (e.g. stolen cookies)
  const { updateSetting, updateUserPassword } = await import("@/server/queries");
  await updateUserPassword(user.id, newHash);
  const currentVersion = Number(await getSetting("sessionVersion")) || 0;
  await updateSetting("sessionVersion", String(currentVersion + 1));

  // Re-issue the current session with the new version
  await createSession(user.id, user.username);
  return { success: true };
}
