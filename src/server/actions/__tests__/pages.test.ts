import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  demoBlock: vi.fn((): string | null => null),
  getSession: vi.fn(async (): Promise<{ userId: number; username: string; exp: number; pv: number } | null> => ({ userId: 1, username: "admin", exp: Date.now() + 60000, pv: 1 })),
  revalidatePath: vi.fn(),
  createPage: vi.fn(async () => ({ id: 5 })),
  updatePage: vi.fn(async () => undefined),
  getAllPages: vi.fn(async (): Promise<{ id: number; slug: string }[]> => []),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth", () => ({ getSession: mocks.getSession }));
vi.mock("@/lib/demo", () => ({ demoBlock: mocks.demoBlock }));
vi.mock("@/server/queries", () => ({
  createPage: mocks.createPage,
  updatePage: mocks.updatePage,
  getAllPages: mocks.getAllPages,
}));

import { createPageAction, updatePageAction, setPageThemeAction } from "@/server/actions/pages";

function fd(data: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(data)) f.set(k, v);
  return f;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.demoBlock.mockReturnValue(null);
  mocks.getSession.mockResolvedValue({ userId: 1, username: "admin", exp: Date.now() + 60000, pv: 1 });
});

describe("createPageAction", () => {
  it("creates a valid page", async () => {
    const res = await createPageAction(fd({ slug: "my-page", title: "My Page", bio: "" }));
    expect(res.success).toBe(true);
    if (res.success) expect(res.pageId).toBe(5);
  });

  it("rejects when unauthenticated", async () => {
    mocks.getSession.mockResolvedValue(null);
    const res = await createPageAction(fd({ slug: "test" }));
    expect(res.success).toBe(false);
  });

  it("rejects invalid slug (spaces)", async () => {
    const res = await createPageAction(fd({ slug: "has spaces" }));
    expect(res.success).toBe(false);
  });

  it("rejects invalid slug (special chars)", async () => {
    const res = await createPageAction(fd({ slug: "test@#$" }));
    expect(res.success).toBe(false);
  });

  it("rejects duplicate slug", async () => {
    mocks.getAllPages.mockResolvedValue([{ id: 1, slug: "exists" }]);
    const res = await createPageAction(fd({ slug: "exists" }));
    expect(res.success).toBe(false);
  });
});

describe("updatePageAction", () => {
  it("updates a page", async () => {
    const res = await updatePageAction(fd({ pageId: "1", title: "Updated" }));
    expect(res.success).toBe(true);
  });

  it("rejects when unauthenticated", async () => {
    mocks.getSession.mockResolvedValue(null);
    const res = await updatePageAction(fd({ pageId: "1" }));
    expect(res.success).toBe(false);
  });
});

describe("setPageThemeAction", () => {
  it("sets theme for a page", async () => {
    const res = await setPageThemeAction(1, 3);
    expect(res.success).toBe(true);
  });

  it("rejects when unauthenticated", async () => {
    mocks.getSession.mockResolvedValue(null);
    const res = await setPageThemeAction(1, 3);
    expect(res.success).toBe(false);
  });
});
