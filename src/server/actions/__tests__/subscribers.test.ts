import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  addSubscriber: vi.fn(async () => undefined),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/server/queries", () => ({ addSubscriber: mocks.addSubscriber }));

// Mock next/headers for rate-limiting
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "127.0.0.1" }),
}));

// Mock rate-limit to always allow
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: () => ({ ok: true, remaining: 9, resetAt: Date.now() + 60000 }),
}));

import { subscribe } from "@/server/actions/subscribers";

function fd(data: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(data)) f.set(k, v);
  return f;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("subscribe", () => {
  it("accepts a valid email", async () => {
    const res = await subscribe(fd({ email: "user@example.com" }));
    expect(res.success).toBe(true);
    expect(mocks.addSubscriber).toHaveBeenCalledWith("user@example.com");
  });

  it("lowercases uppercase email (valid without whitespace)", async () => {
    await subscribe(fd({ email: "User@Example.COM" }));
    expect(mocks.addSubscriber).toHaveBeenCalledWith("user@example.com");
  });

  it("rejects an invalid email", async () => {
    const res = await subscribe(fd({ email: "not-an-email" }));
    expect(res.success).toBe(false);
    expect(mocks.addSubscriber).not.toHaveBeenCalled();
  });

  it("rejects an empty email", async () => {
    const res = await subscribe(fd({ email: "" }));
    expect(res.success).toBe(false);
  });

  it("returns success even on duplicate (no leak)", async () => {
    mocks.addSubscriber.mockRejectedValueOnce(new Error("UNIQUE constraint"));
    const res = await subscribe(fd({ email: "dup@example.com" }));
    expect(res.success).toBe(true);
  });
});
