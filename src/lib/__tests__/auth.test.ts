import { describe, it, expect, vi } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth";

// Mock next/headers cookies for session functions
const mockCookieStore = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (mockCookieStore.has(name) ? { value: mockCookieStore.get(name) } : undefined),
    set: (name: string, value: string) => mockCookieStore.set(name, value),
  }),
}));

vi.mock("@/server/queries", () => ({
  getSetting: async () => "0",
}));

import { createSession, getSession, destroySession } from "@/lib/auth";

describe("hashPassword / verifyPassword", () => {
  it("hashes a password (not plaintext)", async () => {
    const hash = await hashPassword("mypassword");
    expect(hash).not.toBe("mypassword");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("verifies a correct password", async () => {
    const hash = await hashPassword("mypassword");
    expect(await verifyPassword("mypassword", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("mypassword");
    expect(await verifyPassword("wrongpassword", hash)).toBe(false);
  });

  it("produces different hashes for same password (salt)", async () => {
    const h1 = await hashPassword("same");
    const h2 = await hashPassword("same");
    expect(h1).not.toBe(h2);
  });
});

describe("session lifecycle", () => {
  it("returns null when no session cookie exists", async () => {
    mockCookieStore.clear();
    const session = await getSession();
    expect(session).toBeNull();
  });

  it("creates a session, then getSession reads it", async () => {
    mockCookieStore.clear();
    await createSession(1, "admin");
    const session = await getSession();
    expect(session).not.toBeNull();
    expect(session!.userId).toBe(1);
    expect(session!.username).toBe("admin");
  });

  it("destroys an existing session", async () => {
    await createSession(1, "admin");
    expect(mockCookieStore.has("lb_session")).toBe(true);
    await destroySession();
    // Cookie value is emptied
    expect(mockCookieStore.get("lb_session")).toBe("");
  });
});
