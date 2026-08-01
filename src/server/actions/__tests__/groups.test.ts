import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  demoBlock: vi.fn((): string | null => null),
  getSession: vi.fn(async (): Promise<{ userId: number; username: string; exp: number; pv: number } | null> => ({ userId: 1, username: "admin", exp: Date.now() + 60000, pv: 1 })),
  revalidatePath: vi.fn(),
  createLinkGroup: vi.fn(async () => 1),
  updateLinkGroup: vi.fn(async () => undefined),
  deleteLinkGroup: vi.fn(async () => undefined),
  reorderLinkGroups: vi.fn(async () => undefined),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth", () => ({ getSession: mocks.getSession }));
vi.mock("@/lib/demo", () => ({ demoBlock: mocks.demoBlock }));
vi.mock("@/server/queries", () => ({
  createLinkGroup: mocks.createLinkGroup,
  updateLinkGroup: mocks.updateLinkGroup,
  deleteLinkGroup: mocks.deleteLinkGroup,
  reorderLinkGroups: mocks.reorderLinkGroups,
}));

import { createLinkGroupAction, updateLinkGroupAction, deleteLinkGroupAction } from "@/server/actions/groups";

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.demoBlock.mockReturnValue(null);
  mocks.getSession.mockResolvedValue({ userId: 1, username: "admin", exp: Date.now() + 60000, pv: 1 });
});

describe("createLinkGroupAction", () => {
  it("creates a valid link group", async () => {
    await createLinkGroupAction(makeFormData({ title: "My Group", linkSearch: "true" }));
    expect(mocks.createLinkGroup).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("rejects when unauthenticated", async () => {
    mocks.getSession.mockResolvedValue(null);
    await expect(createLinkGroupAction(makeFormData({ title: "My Group" }))).rejects.toThrow("Unauthorized");
  });

  it("rejects a missing title", async () => {
    await expect(createLinkGroupAction(makeFormData({ title: "" }))).rejects.toThrow("Title is required");
  });
});

describe("updateLinkGroupAction", () => {
  it("updates a valid link group", async () => {
    await updateLinkGroupAction(1, makeFormData({ title: "Updated", linkSearch: "false" }));
    expect(mocks.updateLinkGroup).toHaveBeenCalledOnce();
  });

  it("rejects when unauthenticated", async () => {
    mocks.getSession.mockResolvedValue(null);
    await expect(updateLinkGroupAction(1, makeFormData({ title: "Updated" }))).rejects.toThrow("Unauthorized");
  });
});

describe("deleteLinkGroupAction", () => {
  it("deletes a group by id", async () => {
    await deleteLinkGroupAction(5);
    expect(mocks.deleteLinkGroup).toHaveBeenCalledWith(5);
  });

  it("rejects when unauthenticated", async () => {
    mocks.getSession.mockResolvedValue(null);
    await expect(deleteLinkGroupAction(5)).rejects.toThrow("Unauthorized");
  });
});
