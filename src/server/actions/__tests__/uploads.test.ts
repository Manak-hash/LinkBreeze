import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  demoBlock: vi.fn((): string | null => null),
  getSession: vi.fn(async (): Promise<{ userId: number; username: string; exp: number; pv: number } | null> => ({ userId: 1, username: "admin", exp: Date.now() + 60000, pv: 1 })),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth", () => ({ getSession: mocks.getSession }));
vi.mock("@/lib/demo", () => ({ demoBlock: mocks.demoBlock }));
vi.mock("@/lib/uploads", () => ({
  UPLOADS_DIR: "/tmp/test-uploads-lb",
  ensureUploadsDir: vi.fn(async () => {
    const { mkdirSync } = await import("node:fs");
    mkdirSync("/tmp/test-uploads-lb", { recursive: true });
  }),
}));

// Mock fs/promises writeFile so we don't actually write files during tests
vi.mock("node:fs/promises", () => ({
  writeFile: vi.fn(async () => undefined),
}));

import { uploadAvatar, uploadFavicon } from "@/server/actions/uploads";

function makeFile(name: string, content: string, type: string): File {
  return new File([content], name, { type });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.demoBlock.mockReturnValue(null);
  mocks.getSession.mockResolvedValue({ userId: 1, username: "admin", exp: Date.now() + 60000, pv: 1 });
});

describe("uploadAvatar", () => {
  it("rejects when unauthenticated", async () => {
    mocks.getSession.mockResolvedValue(null);
    const fd = new FormData();
    fd.set("file", makeFile("test.png", "data", "image/png"));
    const res = await uploadAvatar(fd);
    expect(res.success).toBe(false);
  });

  it("rejects when no file provided", async () => {
    const fd = new FormData();
    const res = await uploadAvatar(fd);
    expect(res.success).toBe(false);
  });

  it("rejects empty file", async () => {
    const fd = new FormData();
    fd.set("file", makeFile("empty.png", "", "image/png"));
    const res = await uploadAvatar(fd);
    expect(res.success).toBe(false);
  });

  it("rejects unsupported extension", async () => {
    const fd = new FormData();
    fd.set("file", makeFile("script.exe", "data", "application/octet-stream"));
    const res = await uploadAvatar(fd);
    expect(res.success).toBe(false);
  });

  it("accepts a valid PNG within size limit", async () => {
    const fd = new FormData();
    fd.set("file", makeFile("avatar.png", "valid-png-data", "image/png"));
    const res = await uploadAvatar(fd);
    expect(res.success).toBe(true);
    if (res.success) expect(res.url).toMatch(/\/api\/uploads\//);
  });

  it("accepts jpg, jpeg, gif, webp, avif", async () => {
    for (const [name, type] of [
      ["test.jpg", "image/jpeg"],
      ["test.jpeg", "image/jpeg"],
      ["test.gif", "image/gif"],
      ["test.webp", "image/webp"],
      ["test.avif", "image/avif"],
    ] as const) {
      const fd = new FormData();
      fd.set("file", makeFile(name, "data", type));
      const res = await uploadAvatar(fd);
      expect(res.success).toBe(true);
    }
  });
});

describe("uploadFavicon", () => {
  it("accepts .ico file", async () => {
    const fd = new FormData();
    fd.set("file", makeFile("favicon.ico", "ico-data", "image/x-icon"));
    const res = await uploadFavicon(fd);
    expect(res.success).toBe(true);
  });

  it("accepts .svg file (text-based, no image/ mime)", async () => {
    const fd = new FormData();
    fd.set("file", makeFile("favicon.svg", "<svg></svg>", "image/svg+xml"));
    const res = await uploadFavicon(fd);
    expect(res.success).toBe(true);
  });

  it("rejects unsupported extension (.txt)", async () => {
    const fd = new FormData();
    fd.set("file", makeFile("file.txt", "data", "text/plain"));
    const res = await uploadFavicon(fd);
    expect(res.success).toBe(false);
  });

  it("rejects when unauthenticated", async () => {
    mocks.getSession.mockResolvedValue(null);
    const fd = new FormData();
    fd.set("file", makeFile("favicon.ico", "data", "image/x-icon"));
    const res = await uploadFavicon(fd);
    expect(res.success).toBe(false);
  });
});
