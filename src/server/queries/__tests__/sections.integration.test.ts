/**
 * Integration tests: link sections CRUD + grouped reordering through the
 * real DB layer (sql.js temp database, fresh migrations).
 */
import { describe, it, expect, beforeAll } from "vitest";
import "./integration-setup";
import { seedPage } from "./integration-setup";
import {
  createSection,
  updateSection,
  deleteSection,
  deletePage,
  getSectionsByPage,
  reorderSections,
  reorderPageContent,
  createLink,
  getActiveLinks,
} from "@/server/queries";

let pageId: number;

beforeAll(() => {
  const page = seedPage();
  pageId = page.id;
});

describe("[integration] sections CRUD", () => {
  it("creates sections with sequential orderIndex", async () => {
    const s1 = await createSection({ pageId, title: "Featured" });
    const s2 = await createSection({ pageId, title: "Resources", icon: "wrench" });

    expect(s1.title).toBe("Featured");
    expect(s1.orderIndex).toBe(0);
    expect(s2.orderIndex).toBe(1);
    expect(s2.icon).toBe("wrench");
  });

  it("lists sections for a page in order", async () => {
    const sections = await getSectionsByPage(pageId);
    expect(sections.map((s) => s.title)).toEqual(["Featured", "Resources"]);
  });

  it("does not leak sections across pages", async () => {
    const other = seedPage({ slug: "other-page", title: "Other", isDefault: false });
    const sections = await getSectionsByPage(other.id);
    expect(sections).toHaveLength(0);
  });

  it("updates a section title and icon", async () => {
    const sections = await getSectionsByPage(pageId);
    await updateSection(sections[0].id, { title: "Top picks", icon: "star" });
    const after = await getSectionsByPage(pageId);
    expect(after[0].title).toBe("Top picks");
    expect(after[0].icon).toBe("star");
  });

  it("reorders sections", async () => {
    const sections = await getSectionsByPage(pageId);
    const ids = sections.map((s) => s.id);
    await reorderSections([ids[1], ids[0]]);
    const after = await getSectionsByPage(pageId);
    expect(after[0].title).toBe("Resources");
    expect(after[1].title).toBe("Top picks");
  });

  it("deleting a section nulls its links (ON DELETE SET NULL)", async () => {
    const sections = await getSectionsByPage(pageId);
    const featured = sections.find((s) => s.title === "Top picks")!;

    const link = await createLink({
      pageId,
      title: "Sectioned link",
      url: "https://example.com",
      sectionId: featured.id,
    });
    expect(link.sectionId).toBe(featured.id);

    await deleteSection(featured.id);

    const after = await getActiveLinks(pageId);
    const found = after.find((l) => l.id === link.id);
    expect(found).toBeDefined();
    expect(found!.sectionId).toBeNull();
  });
});

describe("[integration] reorderPageContent", () => {
  let rid: number;
  beforeAll(() => {
    rid = seedPage({ slug: "reorder-page", title: "Reorder", isDefault: false }).id;
  });

  it("persists link order + section assignment atomically", async () => {
    const s1 = await createSection({ pageId: rid, title: "Alpha" });
    const s2 = await createSection({ pageId: rid, title: "Beta" });

    const l1 = await createLink({ pageId: rid, title: "One", url: "https://one.com" });
    const l2 = await createLink({ pageId: rid, title: "Two", url: "https://two.com" });
    const l3 = await createLink({ pageId: rid, title: "Three", url: "https://three.com" });

    await reorderPageContent(
      [
        { id: l3.id, sectionId: s1.id },
        { id: l1.id, sectionId: s2.id },
        { id: l2.id, sectionId: null },
      ],
      [s2.id, s1.id],
    );

    const links = await getActiveLinks(rid);
    const byId = new Map(links.map((l) => [l.id, l]));

    expect(byId.get(l3.id)!.orderIndex).toBeLessThan(byId.get(l1.id)!.orderIndex);
    expect(byId.get(l1.id)!.orderIndex).toBeLessThan(byId.get(l2.id)!.orderIndex);
    expect(byId.get(l3.id)!.sectionId).toBe(s1.id);
    expect(byId.get(l1.id)!.sectionId).toBe(s2.id);
    expect(byId.get(l2.id)!.sectionId).toBeNull();

    const sections = await getSectionsByPage(rid);
    expect(sections.map((s) => s.title)).toEqual(["Beta", "Alpha"]);
  });
});

describe("[integration] cascade on page delete", () => {
  it("sections are removed when their page is deleted via deletePage", async () => {
    const other = seedPage({ slug: "cascade-page", title: "Cascade", isDefault: false });
    await createSection({ pageId: other.id, title: "Doomed" });

    await deletePage(other.id);

    const sections = await getSectionsByPage(other.id);
    expect(sections).toHaveLength(0);
  });
});
