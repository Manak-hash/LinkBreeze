/**
 * Integration tests: Pages CRUD through the real DB layer.
 */
import { describe, it, expect } from "vitest";
import "./integration-setup";

import {
  createPage,
  getAllPages,
  getPageBySlug,
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
