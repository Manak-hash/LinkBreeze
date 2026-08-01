import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  demoBlock: vi.fn((): string | null => null),
  getSession: vi.fn(async (): Promise<{ userId: number; username: string; exp: number; pv: number } | null> => ({
    userId: 1,
    username: "admin",
    exp: Date.now() + 60000,
    pv: 1,
  })),
  revalidatePath: vi.fn(),
  updatePage: vi.fn(async () => undefined),
  getAllPages: vi.fn(async () => [{ id: 1, slug: "u", isDefault: true }]),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth", () => ({ getSession: mocks.getSession }));
vi.mock("@/lib/demo", () => ({ demoBlock: mocks.demoBlock }));
vi.mock("@/server/queries", () => ({
  updatePage: mocks.updatePage,
  getAllPages: mocks.getAllPages,
}));

import { updatePageAction } from "@/server/actions/pages";

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.demoBlock.mockReturnValue(null);
  mocks.getSession.mockResolvedValue({ userId: 1, username: "admin", exp: Date.now() + 60000, pv: 1 });
  mocks.getAllPages.mockResolvedValue([{ id: 1, slug: "u", isDefault: true }]);
});

describe("updatePageAction — linkSearch flag", () => {
  it("saves linkSearch=true when checkbox is checked (value 'on')", async () => {
    const res = await updatePageAction(
      makeFormData({ pageId: "1", slug: "u", settingsForm: "1", linkSearch: "on" }),
    );
    expect(res.success).toBe(true);
    expect(mocks.updatePage).toHaveBeenCalledOnce();
    const [, payload] = mocks.updatePage.mock.calls[0];
    expect(payload.linkSearch).toBe(true);
  });

  it("saves linkSearch=false when checkbox is absent", async () => {
    // No linkSearch key in form data → checkbox is unchecked
    const res = await updatePageAction(
      makeFormData({ pageId: "1", slug: "u", settingsForm: "1" }),
    );
    expect(res.success).toBe(true);
    expect(mocks.updatePage).toHaveBeenCalledOnce();
    const [, payload] = mocks.updatePage.mock.calls[0];
    expect(payload.linkSearch).toBe(false);
  });

  it("saves linkSearch=false when checkbox value is not 'on'", async () => {
    const res = await updatePageAction(
      makeFormData({ pageId: "1", slug: "u", settingsForm: "1", linkSearch: "off" }),
    );
    expect(res.success).toBe(true);
    const [, payload] = mocks.updatePage.mock.calls[0];
    expect(payload.linkSearch).toBe(false);
  });

  it("rejects when unauthenticated", async () => {
    mocks.getSession.mockResolvedValue(null);
    const res = await updatePageAction(
      makeFormData({ pageId: "1", slug: "u", settingsForm: "1", linkSearch: "on" }),
    );
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toBe("Unauthorized");
  });

  it("rejects in demo mode", async () => {
    mocks.demoBlock.mockReturnValue("read-only demo");
    const res = await updatePageAction(
      makeFormData({ pageId: "1", slug: "u", settingsForm: "1", linkSearch: "on" }),
    );
    expect(res.success).toBe(false);
  });

  it("revalidates paths after successful save", async () => {
    await updatePageAction(makeFormData({ pageId: "1", slug: "u", settingsForm: "1", linkSearch: "on" }));
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/links");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
  });
});
