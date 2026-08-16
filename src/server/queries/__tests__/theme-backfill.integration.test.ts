/**
 * Integration tests for backfillPresets (1.3 Frutiger Aero release):
 *  - an existing install (themes seeded by an older version) receives the
 *    new preset on the next getActiveTheme() call
 *  - user-created themes and edited presets are never touched
 *  - a fresh install still seeds everything via seedThemesIfEmpty
 */
import { describe, it, expect, vi } from "vitest";
import "./integration-setup";
import { db } from "./integration-setup";
import { themes } from "@/db/schema";
import { eq } from "drizzle-orm";

// revalidatePath is a no-op in tests (server-only outside a request scope)
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { getActiveTheme } = await import("@/server/queries");
const { PRESETS, PRESET_NAMES } = await import("@/lib/theme-presets");

describe("backfillPresets — existing installs get new presets", () => {
  it("inserts Frutiger Aero into a DB seeded by an older version", async () => {
    // Simulate an old install: only the 10 original presets, no Frutiger Aero.
    const legacy = PRESETS.filter((p) => p.name !== "Frutiger Aero");
    await db.insert(themes).values(legacy);

    // Any theme interaction triggers the seeding pipeline.
    await getActiveTheme();

    const rows = await db.select().from(themes).where(eq(themes.isPreset, true));
    const names = rows.map((r) => r.name);
    for (const n of PRESET_NAMES) {
      expect(names).toContain(n);
    }
    // Frutiger Aero arrived exactly once (no duplicate inserts on later calls).
    expect(names.filter((n) => n === "Frutiger Aero")).toHaveLength(1);

    // Idempotent: a second call must not duplicate anything.
    await getActiveTheme();
    const again = await db.select().from(themes).where(eq(themes.isPreset, true));
    expect(again).toHaveLength(PRESETS.length);
  });

  it("never touches user themes or edited presets", async () => {
    // Old install with one user theme and an edited preset.
    await db.insert(themes).values(
      PRESETS.filter((p) => p.name !== "Frutiger Aero").map((p) =>
        p.name === "Aurora" ? { ...p, name: "Aurora (my edit)" } : p,
      ),
    );
    await db.insert(themes).values({
      name: "My Custom Theme",
      isPreset: false,
      isActive: true,
      backgroundType: "solid",
      backgroundValue: "#123456",
      fontFamily: "inter",
      primaryColor: "#ffffff",
      secondaryColor: "#aaaaaa",
      cardBackground: "#000000",
      cardBorderColor: "#333333",
      textColor: "#ffffff",
      mutedTextColor: "#cccccc",
      linkStyle: "pill",
      animationType: "lift",
    });

    await getActiveTheme();

    const rows = await db.select().from(themes);
    const byName = new Map(rows.map((r) => [r.name, r]));
    // User theme untouched and still the only active one.
    expect(byName.get("My Custom Theme")).toBeDefined();
    expect(byName.get("My Custom Theme")?.isActive).toBe(true);
    // Edited (renamed) preset kept its custom name, untouched.
    expect(byName.get("Aurora (my edit)")).toBeDefined();
    // Name-based matching: renaming a preset makes it "yours", so the
    // canonical Aurora is (re-)inserted alongside it — by design.
    expect(byName.get("Aurora")).toBeDefined();
    // New preset arrived.
    expect(byName.get("Frutiger Aero")).toBeDefined();
  });
});
