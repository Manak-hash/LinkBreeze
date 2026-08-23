/**
 * Integration tests: Pages CRUD through the real DB layer.
 */
import { describe, it, expect } from "vitest";
import "./integration-setup";

import {
  createPage,
  getAllPages,
  getPageBySlug,
  updatePage,
} from "@/server/queries";

describe("[integration] createPage + getPageBySlug", () => {
  it("creates a page and reads it back by slug", async () => {
    const page = await createPage({
      slug: "integration-test",
      title: "Integration Page",
      bio: "Bio here",
    });

    expect(page.id).toBeDefined();
    expect(page.slug).toBe("integration-test");

    const retrieved = await getPageBySlug("integration-test");
    expect(retrieved).toBeDefined();
    expect(retrieved!.title).toBe("Integration Page");
  });

  it("getAllPages returns created pages", async () => {
    await createPage({ slug: "page-a", title: "Page A", bio: "" });
    await createPage({ slug: "page-b", title: "Page B", bio: "" });

    const all = await getAllPages();
    const slugs = all.map((p) => p.slug);
    expect(slugs).toContain("page-a");
    expect(slugs).toContain("page-b");
  });
});

describe("[integration] updatePage: default page transfer", () => {
  it("moves the default flag to another page exactly once", async () => {
    const first = await createPage({ slug: "original-default", title: "Original", bio: "" });
    const second = await createPage({ slug: "new-default", title: "New", bio: "" });

    // Only the seeded default is default so far.
    let all = await getAllPages();
    expect(all.filter((p) => p.isDefault)).toHaveLength(1);

    await updatePage(second.id, { isDefault: true });

    all = await getAllPages();
    const defaults = all.filter((p) => p.isDefault);
    expect(defaults).toHaveLength(1);
    expect(defaults[0]!.id).toBe(second.id);

    // The new default sorts first regardless of creation order.
    expect(all[0]!.slug).toBe("new-default");

    // The previously default page is now deletable; the new one is not.
    const old = all.find((p) => p.id === first.id || p.slug === "original-default");
    expect(old?.isDefault).toBe(false);
  });

  it("keeps ordering stable for non-default pages", async () => {
    const a = await createPage({ slug: "order-a", title: "A", bio: "" });
    const b = await createPage({ slug: "order-b", title: "B", bio: "" });
    await updatePage(b.id, { isDefault: true });

    const slugs = (await getAllPages()).map((p) => p.slug);
    // Default first, then the rest in manual (creation) order.
    expect(slugs[0]).toBe("order-b");
    expect(slugs.indexOf("order-a")).toBeGreaterThan(0);
    expect(a.id).toBeDefined();
  });
});
