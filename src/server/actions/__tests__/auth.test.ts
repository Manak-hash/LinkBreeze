import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(async (): Promise<{ userId: number; username: string; exp: number; pv: number } | null> => ({ userId: 1, username: "admin", exp: Date.now() + 60000, pv: 1 })),
  createSession: vi.fn(async () => undefined),
  destroySession: vi.fn(async () => undefined),
  hashPassword: vi.fn(async () => "hashed:pword"),
  verifyPassword: vi.fn(async () => true),
  getUserByUsername: vi.fn(async (): Promise<{ id: number; username: string; passwordHash: string; passwordVersion: number } | null> => ({ id: 1, username: "admin", passwordHash: "hashed:pword", passwordVersion: 1 })),
  getUserCount: vi.fn(async (): Promise<number> => 1),
  createUser: vi.fn(async () => ({ id: 1, username: "newuser" })),
  getSetting: vi.fn(async () => "1"),
}));

vi.mock("@/lib/auth", () => ({
  getSession: mocks.getSession,
  createSession: mocks.createSession,
  destroySession: mocks.destroySession,
  hashPassword: mocks.hashPassword,
  verifyPassword: mocks.verifyPassword,
}));
vi.mock("@/server/queries", () => ({
  getUserByUsername: mocks.getUserByUsername,
  getUserCount: mocks.getUserCount,
  createUser: mocks.createUser,
  getSetting: mocks.getSetting,
}));
vi.mock("@/db", () => ({ db: {} }));
vi.mock("@/db/schema", () => ({ users: {} }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { login, setup } from "@/server/actions/auth";

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.verifyPassword.mockResolvedValue(true);
});

describe("login", () => {
  it("succeeds with valid credentials", async () => {
    const res = await login(makeFormData({ username: "admin", password: "pass1234" }));
    expect(res.success).toBe(true);
    expect(mocks.createSession).toHaveBeenCalledOnce();
  });

  it("fails with empty username", async () => {
    const res = await login(makeFormData({ username: "", password: "pass1234" }));
    expect(res.success).toBe(false);
  });

  it("fails with empty password", async () => {
    const res = await login(makeFormData({ username: "admin", password: "" }));
    expect(res.success).toBe(false);
  });

  it("fails when user not found", async () => {
    mocks.getUserByUsername.mockResolvedValue(null);
    const res = await login(makeFormData({ username: "ghost", password: "pass1234" }));
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toBe("Invalid username or password");
  });

  it("fails when password is wrong", async () => {
    mocks.verifyPassword.mockResolvedValue(false);
    const res = await login(makeFormData({ username: "admin", password: "wrong" }));
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toBe("Invalid username or password");
  });
});

describe("setup", () => {
  it("rejects when users already exist", async () => {
    mocks.getUserCount.mockResolvedValue(1);
    const res = await setup(makeFormData({ username: "newuser", password: "pass1234" }));
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toContain("already been completed");
  });

  it("creates the first user", async () => {
    mocks.getUserCount.mockResolvedValue(0);
    mocks.getUserByUsername.mockResolvedValue(null);
    const res = await setup(makeFormData({ username: "newuser", password: "pass1234" }));
    expect(res.success).toBe(true);
    expect(mocks.createUser).toHaveBeenCalledOnce();
    expect(mocks.createSession).toHaveBeenCalledOnce();
  });

  it("rejects short username (<3 chars)", async () => {
    mocks.getUserCount.mockResolvedValue(0);
    const res = await setup(makeFormData({ username: "ab", password: "pass1234" }));
    expect(res.success).toBe(false);
  });

  it("rejects short password (<8 chars)", async () => {
    mocks.getUserCount.mockResolvedValue(0);
    const res = await setup(makeFormData({ username: "newuser", password: "short" }));
    expect(res.success).toBe(false);
  });

  it("rejects username with special chars", async () => {
    mocks.getUserCount.mockResolvedValue(0);
    const res = await setup(makeFormData({ username: "user@name!", password: "pass1234" }));
    expect(res.success).toBe(false);
  });
});
