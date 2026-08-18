/**
 * Integration test: theme export → import round-trip with custom fonts (#82).
 *
 * Uses the sql.js in-memory DB (integration-setup) like the backup-restore
 * test, with node:fs/promises + @/lib/uploads mocked so the import writes
 * font files into a virtual uploads dir.
 */
import { describe, it, expect, beforeAll, vi } from "vitest";

const fsMocks = vi.hoisted(() => {
  const files = new Map<string, Buffer>();
  return {
    files,
    writeFile: vi.fn(async (p: string, data: Buffer) => {
      files.set(p, Buffer.from(data));
    }),
    readFile: vi.fn(async (p: string) => {
      const f = files.get(p);
      if (!f) throw new Error("ENOENT: " + p);
      return f;
    }),
  };
});

vi.mock("node:fs/promises", () => ({
  writeFile: fsMocks.writeFile,
  readFile: fsMocks.readFile,
}));

vi.mock("@/lib/uploads", async () => {
  const actual = await vi.importActual<typeof import("@/lib/uploads")>("@/lib/uploads");
  return {
    UPLOADS_DIR: "/tmp/lb-test-fonts-import",
    ensureUploadsDir: vi.fn(async () => undefined),
    sniffFontFormat: actual.sniffFontFormat,
  };
});

import "../../queries/__tests__/integration-setup";
import { db } from "../../queries/__tests__/integration-setup";
import * as schema from "@/db/schema";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/demo", () => ({ demoBlock: vi.fn(() => null) }));

import { exportTheme, importTheme } from "@/server/actions/data";
import { customFontFamily } from "@/lib/custom-fonts";

/** Minimal woff2: wOF2 magic + padding. */
function woff2(): Buffer {
  const b = Buffer.alloc(64);
  b.write("wOF2", 0, "latin1");
  return b;
}

/** Full exportable-theme payload with an embedded custom font. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportableTheme(overrides: Record<string, unknown> = {}): any {
  return {
    version: 1,
    app: "linkbreeze",
    kind: "theme",
    name: "Imported Brand",
    backgroundType: "gradient",
    backgroundValue: "#111,#222",
    primaryColor: "#123456",
    secondaryColor: "#abcdef",
    textColor: "#ffffff",
    mode: "dark",
    fontFamily: "custom:1",
    linkStyle: "glass",
    animationType: "lift",
    exportedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("[integration] theme export/import with custom fonts (#82)", () => {
  let themeId: number;

  beforeAll(() => {
    // Seed an uploaded font + a theme that uses it.
    db.insert(schema.customFonts)
      .values({
        id: 1,
        name: "Brand Sans",
        family: customFontFamily(1),
        filename: "brand-sans.woff2",
        url: "/api/uploads/seedfont.woff2",
        sizeBytes: 64,
        format: "woff2",
      })
      .run();
    fsMocks.files.set("/tmp/lb-test-fonts-import/seedfont.woff2", woff2());

    db.insert(schema.themes)
      .values({
        name: "Export Me",
        isActive: false,
        isPreset: false,
        mode: "dark",
        fontFamily: "custom:1",
        primaryColor: "#654321",
        backgroundType: "gradient",
        backgroundValue: "#111,#222",
        linkStyle: "glass",
        animationType: "lift",
      })
      .run();
    themeId = db.select().from(schema.themes).all().find((t) => t.name === "Export Me")!.id;
  });

  it("exportTheme embeds the referenced font's bytes", async () => {
    const payload = await exportTheme(themeId);
    expect(payload.name).toBe("Export Me");
    expect(payload.fontFamily).toBe("custom:1");
    expect(payload.customFont).toBeDefined();
    expect(payload.customFont?.name).toBe("Brand Sans");
    expect(payload.customFont?.format).toBe("woff2");
    // Base64 of the seeded bytes round-trips.
    expect(Buffer.from(payload.customFont?.data ?? "", "base64").equals(woff2())).toBe(true);
  });

  it("importTheme restores the font as a NEW row and rewrites the reference", async () => {
    const payload = await exportTheme(themeId);
    const res = await importTheme(JSON.stringify({ ...payload, name: "Imported Brand" }));
    expect(res).toEqual({ success: true });

    // New font row with a fresh id; family derived from that id.
    const fonts = db.select().from(schema.customFonts).all();
    expect(fonts).toHaveLength(2);
    const imported = fonts.find((f) => f.id !== 1);
    expect(imported).toBeDefined();
    expect(imported!.family).toBe(customFontFamily(imported!.id));
    expect(imported!.name).toBe("Brand Sans");

    // Theme points at the NEW id, and the file landed in the virtual dir.
    const theme = db.select().from(schema.themes).all().find((t) => t.name === "Imported Brand");
    expect(theme).toBeDefined();
    expect(theme!.fontFamily).toBe(`custom:${imported!.id}`);
    expect(imported!.url).toMatch(/\/api\/uploads\/[0-9a-f]{24}\.woff2$/);
    const written = fsMocks.files.get(`/tmp/lb-test-fonts-import/${imported!.url.split("/").pop()}`);
    expect(written?.equals(woff2())).toBe(true);
  });

  it("importTheme resets to inter when the export has no embedded payload", async () => {
    const res = await importTheme(
      JSON.stringify(exportableTheme({ name: "No Payload Brand" })),
    );
    expect(res).toEqual({ success: true });
    const theme = db.select().from(schema.themes).all().find((t) => t.name === "No Payload Brand");
    expect(theme).toBeDefined();
    expect(theme!.fontFamily).toBe("inter");
  });

  it("importTheme rejects a corrupted embedded payload", async () => {
    const payload = exportableTheme({ name: "Evil Brand" });
    // PNG bytes disguised as woff2 base64.
    const png = Buffer.alloc(32);
    png.write("\u0089PNG", 0, "latin1");
    payload.customFont = { name: "Evil", format: "woff2", data: png.toString("base64") };
    const res = await importTheme(JSON.stringify(payload));
    expect(res.success).toBe(false);
    expect(res.success === false && res.error).toMatch(/not a valid/i);
    // No theme row was created.
    expect(db.select().from(schema.themes).all().find((t) => t.name === "Evil Brand")).toBeUndefined();
  });

  it("importTheme rejects an embedded payload over 2 MB", async () => {
    const payload = exportableTheme({ name: "Huge Brand" });
    const big = Buffer.alloc(2 * 1024 * 1024 + 1);
    big.write("wOF2", 0, "latin1");
    payload.customFont = { name: "Huge", format: "woff2", data: big.toString("base64") };
    const res = await importTheme(JSON.stringify(payload));
    expect(res.success).toBe(false);
    expect(res.success === false && res.error).toMatch(/too large/i);
  });

  it("deleting the theme's font export flow: theme without custom font exports no payload", async () => {
    db.insert(schema.themes)
      .values({
        name: "Plain Theme",
        isActive: false,
        isPreset: false,
        mode: "dark",
        fontFamily: "poppins",
        primaryColor: "#000001",
        backgroundType: "solid",
        backgroundValue: "#000000",
        linkStyle: "glass",
        animationType: "lift",
      })
      .run();
    const plainId = db.select().from(schema.themes).all().find((t) => t.name === "Plain Theme")!.id;
    const payload = await exportTheme(plainId);
    expect(payload.customFont).toBeUndefined();
  });
});
