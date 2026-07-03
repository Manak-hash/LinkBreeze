import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  demoBlock: vi.fn(() => null),
  getSession: vi.fn(async () => ({ userId: 1 })),
  transaction: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/db", () => ({
  db: {
    transaction: mocks.transaction,
  },
}));

vi.mock("@/db/schema", () => ({
  analyticsClicks: {},
  analyticsPageviews: {},
  links: {},
  profile: {},
  settings: {},
  themes: {},
}));

vi.mock("@/lib/auth", () => ({
  getSession: mocks.getSession,
}));

vi.mock("@/lib/demo", () => ({
  demoBlock: mocks.demoBlock,
}));

vi.mock("@/server/queries", () => ({
  updateSetting: vi.fn(),
}));

import { restoreBackup } from "@/server/actions/data";

function backupFile(payload: unknown): File {
  return new File([JSON.stringify(payload)], "backup.json", {
    type: "application/json",
  });
}

describe("restoreBackup", () => {
  it("rejects unsupported backup versions before mutating data", async () => {
    const formData = new FormData();
    formData.set(
      "file",
      backupFile({
        version: 2,
        exportedAt: "2026-07-03T00:00:00.000Z",
        profile: [],
        links: [],
        settings: [],
        themes: [],
      }),
    );

    await expect(restoreBackup(formData)).resolves.toEqual({
      success: false,
      error: "Unsupported backup version: 2. This instance expects version 1.",
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
