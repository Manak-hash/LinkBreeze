/**
 * Integration tests: Links CRUD through the real DB layer.
 *
 * These tests exercise the actual SQLite + Drizzle queries without mocking.
 * Each test run gets a fresh temp database.
 */
import { describe, it, expect, beforeAll } from "vitest";
import "./integration-setup"; // sets up temp DB, runs migrations, seeds helpers
import { seedPage, db } from "./integration-setup";
import * as schema from "@/db/schema";

// Import queries AFTER integration-setup has set DATABASE_PATH
import {
  createLink,
  updateLink,
  deleteLink,
  getActiveLinks,
  getAllLinks,
  reorderLinks,
  getLink,
} from "@/server/queries";
import { eq } from "drizzle-orm";

let pageId: number;

beforeAll(() => {
  const page = seedPage();
  pageId = page.id;
});

describe("[integration] createLink + getActiveLinks", () => {
  it("creates a link and reads it back from the DB", async () => {
    const link = await createLink({
      pageId,
      title: "My GitHub",
      url: "https://github.com/me",
      type: "url",
    });

    expect(link.id).toBeDefined();
    expect(link.title).toBe("My GitHub");
    expect(link.url).toBe("https://github.com/me");

    // Read it back via getActiveLinks
    const links = await getActiveLinks(pageId);
    const found = links.find((l) => l.id === link.id);
    expect(found).toBeDefined();
    expect(found!.title).toBe("My GitHub");
  });

  it("URL with UTM params is stored verbatim", async () => {
    const link = await createLink({
      pageId,
      title: "Campaign Link",
      url: "https://example.com/?utm_source=newsletter&utm_medium=email&utm_campaign=launch",
      type: "url",
    });

    const retrieved = await getLink(link.id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.url).toContain("utm_source=newsletter");
    expect(retrieved!.url).toContain("utm_medium=email");
    expect(retrieved!.url).toContain("utm_campaign=launch");
  });
});

describe("[integration] updateLink", () => {
  it("updates title and URL", async () => {
    const link = await createLink({
      pageId,
      title: "Before Update",
      url: "https://old.example.com",
      type: "url",
    });

    await updateLink(link.id, {
      title: "After Update",
      url: "https://new.example.com",
    });

    const updated = await getLink(link.id);
    expect(updated!.title).toBe("After Update");
    expect(updated!.url).toBe("https://new.example.com");
  });

  it("preserves UTM params on update when URL includes them", async () => {
    const link = await createLink({
      pageId,
      title: "UTM Link",
      url: "https://example.com",
      type: "url",
    });

    await updateLink(link.id, {
      url: "https://example.com/?utm_source=updated",
    });

    const updated = await getLink(link.id);
    expect(updated!.url).toBe("https://example.com/?utm_source=updated");
  });
});

describe("[integration] deleteLink", () => {
  it("removes the link from the DB", async () => {
    const link = await createLink({
      pageId,
      title: "To Delete",
      url: "https://delete.example.com",
      type: "url",
    });

    await deleteLink(link.id);

    const retrieved = await getLink(link.id);
    expect(retrieved).toBeFalsy();
  });
});

describe("[integration] reorderLinks", () => {
  it("updates orderIndex for multiple links", async () => {
    const link1 = await createLink({ pageId, title: "A", url: "https://a.example.com", type: "url" });
    const link2 = await createLink({ pageId, title: "B", url: "https://b.example.com", type: "url" });
    const link3 = await createLink({ pageId, title: "C", url: "https://c.example.com", type: "url" });

    // Reverse the order
    await reorderLinks([link3.id, link2.id, link1.id]);

    const links = await getActiveLinks(pageId);
    const ordered = links.filter((l) => [link1.id, link2.id, link3.id].includes(l.id));
    expect(ordered[0]!.id).toBe(link3.id);
    expect(ordered[1]!.id).toBe(link2.id);
    expect(ordered[2]!.id).toBe(link1.id);
  });
});

describe("[integration] getAllLinks (admin view)", () => {
  it("returns both active and inactive links", async () => {
    const activeLink = await createLink({
      pageId,
      title: "Active",
      url: "https://active.example.com",
      type: "url",
    });

    const inactiveLink = await createLink({
      pageId,
      title: "Inactive",
      url: "https://inactive.example.com",
      type: "url",
    });
    // Deactivate it
    await db.update(schema.links).set({ isActive: false }).where(eq(schema.links.id, inactiveLink.id)).run();

    const allLinks = await getAllLinks(pageId);
    expect(allLinks.some((l) => l.id === activeLink.id)).toBe(true);
    expect(allLinks.some((l) => l.id === inactiveLink.id)).toBe(true);

    // getActiveLinks should only return active
    const activeLinks = await getActiveLinks(pageId);
    expect(activeLinks.some((l) => l.id === activeLink.id)).toBe(true);
    expect(activeLinks.some((l) => l.id === inactiveLink.id)).toBe(false);
  });
});
