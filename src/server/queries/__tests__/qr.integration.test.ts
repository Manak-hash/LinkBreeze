/**
 * Integration tests: qr_settings column survives migrations and roundtrips
 * through the real query layer (sql.js temp database, fresh migrations).
 */
import { describe, it, expect, beforeAll } from "vitest";
import "./integration-setup";
import { seedPage } from "./integration-setup";
import {
  updatePage,
  getPageBySlug,
  updateSetting,
  getSetting,
} from "@/server/queries";
import { parseQrStyle, serializeQrStyle } from "@/lib/qr-style";

let pageId: number;
let slug: string;

beforeAll(() => {
  const page = seedPage();
  pageId = page.id;
  slug = page.slug;
});

describe("[integration] pages.qr_settings", () => {
  it("column exists after migrations (NULL default)", async () => {
    const page = await getPageBySlug(slug);
    expect(page).not.toBeNull();
    expect(page!.qrSettings).toBeNull();
    // Absent → defaults via the shared resolver
    expect(parseQrStyle(page!.qrSettings)).toEqual({
      fg: "#0f0f1a",
      bg: "#ffffff",
      logo: "none",
      size: 256,
    });
  });

  it("roundtrips a full style through updatePage", async () => {
    const style = { fg: "#533fd6", bg: "#fefefe", logo: "avatar" as const, size: 512 };
    await updatePage(pageId, { qrSettings: serializeQrStyle(style) });
    const page = await getPageBySlug(slug);
    expect(parseQrStyle(page!.qrSettings)).toEqual(style);
  });

  it("survives garbage writes (resolver falls back)", async () => {
    await updatePage(pageId, { qrSettings: "{oops" });
    const page = await getPageBySlug(slug);
    expect(parseQrStyle(page!.qrSettings).logo).toBe("none");
  });

  it("does not leak into unrelated settings", async () => {
    await updateSetting("slug", slug);
    expect(await getSetting("slug")).toBe(slug);
  });
});
