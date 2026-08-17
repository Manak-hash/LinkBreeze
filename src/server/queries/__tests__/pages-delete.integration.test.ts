/**
 * Integration tests: deletePage through the real DB layer (sql.js temp
 * database, fresh migrations, FK enforcement ON like production).
 */
import { describe, it, expect } from "vitest";
import { eq } from "drizzle-orm";
import "./integration-setup";
import { seedPage, seedLink, seedTheme, db } from "./integration-setup";
import { pages } from "@/db/schema";
import {
  deletePage,
  getAllPages,
  getActiveLinks,
  getSectionsByPage,
  getDefaultPage,
  deleteTheme,
  getThemeById,
} from "@/server/queries";

describe("[integration] deletePage cascade (#84)", () => {
  it("deletes a non-default page and moves its links to the default page", async () => {
    // The DB may already hold a default page from migrations — resolve the
    // real one rather than assuming a freshly seeded row wins.
    const target = await getDefaultPage();
    const victim = seedPage({ slug: "victim", title: "Victim", isDefault: false });
    const moved = seedLink({ pageId: victim.id, title: "Kept link", url: "https://keep.example" });

    await deletePage(victim.id, false);

    // Page gone
    const pages = await getAllPages();
    expect(pages.some((p) => p.id === victim.id)).toBe(false);
    expect(pages.some((p) => p.id === target.id)).toBe(true);

    // Links survived on the default page, section cleared
    const links = await getActiveLinks(target.id);
    const found = links.find((l) => l.id === moved.id);
    expect(found).toBeDefined();
    expect(found!.pageId).toBe(target.id);
    expect(found!.sectionId).toBeNull();
  });

  it("wipe mode deletes the page's links with it", async () => {
    const victim = seedPage({ slug: "victim-wipe", title: "Victim Wipe", isDefault: false });
    seedLink({ pageId: victim.id, title: "Doomed link", url: "https://doomed.example" });

    await deletePage(victim.id, true);

    const pages = await getAllPages();
    expect(pages.some((p) => p.id === victim.id)).toBe(false);
    // The link is gone from every page, not moved.
    const all = await Promise.all(
      (await getAllPages()).map((p) => getActiveLinks(p.id)),
    );
    expect(all.every((links) => links.every((l) => l.pageId !== victim.id))).toBe(true);
    expect(all.every((links) => !links.some((l) => l.title === "Doomed link"))).toBe(true);
  });

  it("removes the deleted page's sections", async () => {
    const def = seedPage({ slug: "home2", title: "Home2", isDefault: true });
    const victim = seedPage({ slug: "victim2", title: "Victim2", isDefault: false });
    const { createSection } = await import("@/server/queries");
    const s = await createSection({ pageId: victim.id, title: "Doomed" });
    expect(s.id).toBeTruthy();

    await deletePage(victim.id, false);
    const sections = await getSectionsByPage(victim.id);
    expect(sections).toHaveLength(0);
    expect(def.id).toBeTruthy();
  });

  it("refuses to delete the default page", async () => {
    const def = await getDefaultPage();
    await expect(deletePage(def.id, false)).rejects.toThrow(/default/i);
  });

  it("releases pages pinned to a deleted theme (#84 themes)", async () => {
    const theme = seedTheme({ name: "Doomed Theme", isPreset: false, isActive: false });
    const page = seedPage({ slug: "themed", title: "Themed", isDefault: false });
    const { updatePage } = await import("@/server/queries");
    await updatePage(page.id, { themeId: theme.id });

    await deleteTheme(theme.id);

    // Theme gone; page survived and no longer points at it.
    expect(await getThemeById(theme.id)).toBeNull();
    const rows = db.select().from(pages).where(eq(pages.id, page.id)).all();
    expect(rows[0].themeId).toBeNull();
  });

  it("refuses to delete a preset theme at the query layer", async () => {
    const preset = seedTheme({ name: "Protected Preset", isPreset: true, isActive: false });
    await expect(deleteTheme(preset.id)).rejects.toThrow(/preset/i);
    expect(await getThemeById(preset.id)).not.toBeNull();
  });
});
