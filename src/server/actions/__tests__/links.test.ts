import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  demoBlock: vi.fn((): string | null => null),
  getSession: vi.fn(async (): Promise<{ userId: number; username: string; exp: number; pv: number } | null> => ({ userId: 1, username: "admin", exp: Date.now() + 60000, pv: 1 })),
  revalidatePath: vi.fn(),
  createLink: vi.fn(async () => 1),
  updateLink: vi.fn(async () => undefined),
  deleteLink: vi.fn(async () => undefined),
  reorderLinks: vi.fn(async () => undefined),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth", () => ({ getSession: mocks.getSession }));
vi.mock("@/lib/demo", () => ({ demoBlock: mocks.demoBlock }));
vi.mock("@/server/queries", () => ({
  createLink: mocks.createLink,
  updateLink: mocks.updateLink,
  deleteLink: mocks.deleteLink,
  reorderLinks: mocks.reorderLinks,
  getAllLinks: vi.fn(async () => []),
}));

import { createLink, updateLink, deleteLink } from "@/server/actions/links";

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

describe("createLink", () => {
  it("rejects when unauthenticated", async () => {
    mocks.getSession.mockResolvedValue(null);
    const res = await createLink(makeFormData({ title: "Test", url: "https://example.com", isActive: "true", isHighlighted: "false" }));
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toBe("Unauthorized");
  });

  it("rejects in demo mode", async () => {
    mocks.demoBlock.mockReturnValue("This is a read-only demo.");
    const res = await createLink(makeFormData({ title: "Test", url: "https://example.com", isActive: "true", isHighlighted: "false" }));
    expect(res.success).toBe(false);
  });

  it("creates a valid link", async () => {
    const res = await createLink(makeFormData({ title: "My Link", url: "https://example.com", type: "url", isActive: "true", isHighlighted: "false" }));
    expect(res.success).toBe(true);
    expect(mocks.createLink).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/links");
  });

  it("rejects a missing title", async () => {
    const res = await createLink(makeFormData({ title: "", url: "https://example.com", isActive: "true", isHighlighted: "false" }));
    expect(res.success).toBe(false);
  });

  it("rejects a javascript: URL", async () => {
    const res = await createLink(makeFormData({ title: "XSS", url: "javascript:alert(1)", type: "url", isActive: "true", isHighlighted: "false" }));
    expect(res.success).toBe(false);
    expect(mocks.createLink).not.toHaveBeenCalled();
  });

  it("accepts mailto: for email type", async () => {
    const res = await createLink(makeFormData({ title: "Email", url: "mailto:test@example.com", type: "email", isActive: "true", isHighlighted: "false" }));
    expect(res.success).toBe(true);
  });

  it("accepts tel: for phone type", async () => {
    const res = await createLink(makeFormData({ title: "Phone", url: "tel:+212600000000", type: "phone", isActive: "true", isHighlighted: "false" }));
    expect(res.success).toBe(true);
  });

  it("accepts wa.me for whatsapp type", async () => {
    const res = await createLink(makeFormData({ title: "WA", url: "https://wa.me/212600000000", type: "whatsapp", isActive: "true", isHighlighted: "false" }));
    expect(res.success).toBe(true);
  });

  it("rejects non-wa.me https for whatsapp type", async () => {
    const res = await createLink(makeFormData({ title: "WA", url: "https://evil.com", type: "whatsapp", isActive: "true", isHighlighted: "false" }));
    expect(res.success).toBe(false);
  });
});

describe("updateLink", () => {
  it("updates a valid link", async () => {
    const res = await updateLink(makeFormData({ id: "1", title: "Updated", url: "https://new.com", type: "url", isActive: "true", isHighlighted: "false" }));
    expect(res.success).toBe(true);
    expect(mocks.updateLink).toHaveBeenCalledOnce();
  });

  it("rejects when unauthenticated", async () => {
    mocks.getSession.mockResolvedValue(null);
    const res = await updateLink(makeFormData({ id: "1", title: "Test", url: "https://example.com", isActive: "true", isHighlighted: "false" }));
    expect(res.success).toBe(false);
  });
});

describe("deleteLink", () => {
  it("deletes a link by id", async () => {
    const res = await deleteLink(makeFormData({ id: "5" }));
    expect(res.success).toBe(true);
    expect(mocks.deleteLink).toHaveBeenCalledWith(5);
  });

  it("rejects when unauthenticated", async () => {
    mocks.getSession.mockResolvedValue(null);
    const res = await deleteLink(makeFormData({ id: "5" }));
    expect(res.success).toBe(false);
  });

  it("rejects non-numeric id", async () => {
    const res = await deleteLink(makeFormData({ id: "abc" }));
    expect(res.success).toBe(false);
  });
});
