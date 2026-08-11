import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserCount, getUserByUsername } from "@/server/queries";
import { hashPassword, createSession } from "@/lib/auth";
import { createUser } from "@/server/queries";

const setupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/, "Letters, numbers, hyphens and underscores only"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(256)
    .refine((v) => /[A-Z]/.test(v), "Must contain an uppercase letter")
    .refine((v) => /[0-9]/.test(v), "Must contain a number"),
});

export async function POST(req: NextRequest) {
  try {
    // Only allow setup when no users exist yet.
    const count = await getUserCount();
    if (count > 0) {
      return NextResponse.json(
        { success: false, error: "Setup has already been completed" },
        { status: 409 },
      );
    }

    const body = await req.json();
    const parsed = setupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const { username, password } = parsed.data;

    const existing = await getUserByUsername(username.trim());
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Username already taken" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(username.trim(), passwordHash);
    await createSession(user.id, user.username);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[setup-api]", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong during setup" },
      { status: 500 },
    );
  }
}
