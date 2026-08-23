import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  demoBlock: vi.fn((): string | null => null),
  getSession: vi.fn(async (): Promise<{ userId: number; username: string; exp: number; pv: number } | null> => ({ userId: 1, username: "admin", exp: Date.now() + 60000, pv: 1 })),
  revalidatePath: vi.fn(),
  createPage: vi.fn(async () => ({ id: 5 })),
  updatePage: vi.fn(async () => undefined),
  deletePage: vi.fn(async () => undefined),
  getDefaultPage: vi.fn(async () => ({ id: 1, slug: "home" })),
  getAllPages: vi.fn(async (): Promise<{ id: number; slug: string }[]> => []),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth", () => ({ getSession: mocks.getSession }));
vi.mock("@/lib/demo", () => ({ demoBlock: mocks.demoBlock }));
vi.mock("@/server/queries", () => ({
  createPage: mocks.createPage,
  updatePage: mocks.updatePage,
  deletePage: mocks.deletePage,
  getDefaultPage: mocks.getDefaultPage,
  getAllPages: mocks.getAllPages,
}));

import { createPageAction, updatePageAction, setPageThemeAction, deletePageAction } from "@/server/actions/pages";

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

  it("passes isDefault=true through to the query layer", async () => {
    const res = await updatePageAction(fd({ pageId: "3", isDefault: "true" }));
    expect(res.success).toBe(true);
    expect(mocks.updatePage).toHaveBeenCalledWith(3, expect.objectContaining({ isDefault: true }));
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

describe("deletePageAction", () => {
  it("deletes a non-default page (keep mode)", async () => {
    const res = await deletePageAction(fd({ pageId: "7", mode: "keep" }));
    expect(res.success).toBe(true);
    expect(mocks.deletePage).toHaveBeenCalledWith(7, false);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/links");
  });

  it("deletes a non-default page (wipe mode)", async () => {
    const res = await deletePageAction(fd({ pageId: "7", mode: "wipe" }));
    expect(res.success).toBe(true);
    expect(mocks.deletePage).toHaveBeenCalledWith(7, true);
  });

  it("rejects when unauthenticated", async () => {
    mocks.getSession.mockResolvedValue(null);
    const res = await deletePageAction(fd({ pageId: "7", mode: "keep" }));
    expect(res.success).toBe(false);
    expect(mocks.deletePage).not.toHaveBeenCalled();
  });

  it("refuses to delete the default page", async () => {
    // Default page id is 1 per the getDefaultPage mock.
    const res = await deletePageAction(fd({ pageId: "1", mode: "keep" }));
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toBe("The default page cannot be deleted");
    expect(mocks.deletePage).not.toHaveBeenCalled();
  });

  it("rejects a non-numeric page id", async () => {
    const res = await deletePageAction(fd({ pageId: "abc", mode: "keep" }));
    expect(res.success).toBe(false);
    expect(mocks.deletePage).not.toHaveBeenCalled();
  });

  it("rejects an invalid delete mode", async () => {
    const res = await deletePageAction(fd({ pageId: "7", mode: "teleport" }));
    expect(res.success).toBe(false);
    expect(mocks.deletePage).not.toHaveBeenCalled();
  });

  it("returns an error when the query layer throws", async () => {
    mocks.deletePage.mockRejectedValueOnce(new Error("boom"));
    const res = await deletePageAction(fd({ pageId: "7", mode: "keep" }));
    expect(res.success).toBe(false);
  });
});
