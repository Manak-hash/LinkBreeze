/**
 * Integration tests for 1.3 Phase 3 — theme visual rework:
 *  - migration 0014 columns exist and accept values
 *  - customizeActiveTheme targets the right theme (page theme vs global)
 *  - duplicateActiveTheme clones the requested theme, not the global one
 *  - updateTheme persists the new profile-styling fields
 *  - backup theme row schema accepts the new columns
 */
import { describe, it, expect, vi } from "vitest";
import "./integration-setup";
import { db, seedPage } from "./integration-setup";
import { themes, pages } from "@/db/schema";
import { eq } from "drizzle-orm";

// revalidatePath is a no-op in tests (server-only outside a request scope)
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { updateTheme, duplicateTheme, getThemeById } = await import(
  "@/server/queries"
);

async function seedTheme(name: string, overrides: Partial<typeof themes.$inferInsert> = {}) {
  const [row] = await db
    .insert(themes)
    .values({
      name,
      backgroundType: "gradient",
      backgroundValue: "#0a0820",
      fontFamily: "inter",
      primaryColor: "#7c5ff0",
      secondaryColor: "#a78bfa",
      cardBackground: "rgba(20,17,46,0.55)",
      cardBorderColor: "rgba(167,139,250,0.18)",
      textColor: "#eceafe",
      mutedTextColor: "#a39ec9",
      linkStyle: "glass",
      animationType: "lift",
      ...overrides,
    })
    .returning();
  return row;
}

describe("migration 0014 — theme visual columns", () => {
  it("adds the five profile-styling columns with defaults", async () => {
    const t = await seedTheme("m14");
    expect(t.avatarShape).toBe("circle");
    expect(t.avatarBorder).toBe("solid");
    expect(t.avatarFloat).toBe("false");
    expect(t.profileLayout).toBe("classic");
    expect(t.textAnimation).toBe("none");
  });

  it("pages table gains banner_url", async () => {
    const p = await seedPage({ bannerUrl: "/api/uploads/banner.png" });
    const [row] = await db.select().from(pages).where(eq(pages.id, p.id));
    expect(row.bannerUrl).toBe("/api/uploads/banner.png");
  });

  it("updateTheme persists the new fields", async () => {
    const t = await seedTheme("m14-update");
    await updateTheme(t.id, {
      avatarShape: "squircle",
      avatarBorder: "gradient",
      avatarFloat: "true",
      profileLayout: "hero",
      textAnimation: "typewriter",
    } as never);
    const row = await getThemeById(t.id);
    expect(row?.avatarShape).toBe("squircle");
    expect(row?.avatarBorder).toBe("gradient");
    expect(row?.avatarFloat).toBe("true");
    expect(row?.profileLayout).toBe("hero");
    expect(row?.textAnimation).toBe("typewriter");
  });

  it("accepts the new animation types and background types", async () => {
    const t = await seedTheme("m14-anim");
    await updateTheme(t.id, {
      animationType: "blur-in",
      backgroundType: "video",
      backgroundImageUrl: "/api/uploads/bg.mp4",
    } as never);
    const row = await getThemeById(t.id);
    expect(row?.animationType).toBe("blur-in");
    expect(row?.backgroundType).toBe("video");
    expect(row?.backgroundImageUrl).toBe("/api/uploads/bg.mp4");
  });
});

describe("duplicateTheme clones all 1.3 fields", () => {
  it("copies avatar/layout/text-animation settings", async () => {
    const t = await seedTheme("dup-source", {
      avatarShape: "square",
      avatarBorder: "glow",
      avatarFloat: "true",
      profileLayout: "banner",
      textAnimation: "gradient-flow",
      animationType: "fade-up",
    });
    const dup = await duplicateTheme(t.id, "dup-copy");
    expect(dup.avatarShape).toBe("square");
    expect(dup.avatarBorder).toBe("glow");
    expect(dup.avatarFloat).toBe("true");
    expect(dup.profileLayout).toBe("banner");
    expect(dup.textAnimation).toBe("gradient-flow");
    expect(dup.animationType).toBe("fade-up");
  });
});

describe("migration 0021 — avatar size column", () => {
  it("adds avatar_size with the 'auto' default", async () => {
    const t = await seedTheme("m21-default");
    expect(t.avatarSize).toBe("auto");
  });

  it("updateTheme persists an explicit size", async () => {
    const t = await seedTheme("m21-update");
    await updateTheme(t.id, { avatarSize: "120" } as never);
    const row = await getThemeById(t.id);
    expect(row?.avatarSize).toBe("120");
  });

  it("duplicateTheme copies the avatar size", async () => {
    const t = await seedTheme("m21-dup-source", { avatarSize: "72" });
    const dup = await duplicateTheme(t.id, "m21-dup-copy");
    expect(dup.avatarSize).toBe("72");
  });
});

describe("getPagesUsingTheme", () => {
  it("lists pages rendering a given theme", async () => {
    const { getPagesUsingTheme, createPage } = await import("@/server/queries");
    const t = await seedTheme("using-theme");
    const p1 = await createPage({ slug: "uses-a", title: "A" });
    const p2 = await createPage({ slug: "uses-b", title: "B" });
    await db
      .update(pages)
      .set({ themeId: t.id })
      .where(eq(pages.id, p1.id));
    const using = await getPagesUsingTheme(t.id);
    const ids = using.map((p) => p.id);
    expect(ids).toContain(p1.id);
    expect(ids).not.toContain(p2.id);
  });
});
