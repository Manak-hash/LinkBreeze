/**
 * LinkBreeze Demo Seed Script (v1.2.7)
 * Run with: DEMO_MODE=true npx tsx src/scripts/seed-demo.ts
 * Populates a fresh database with demo data for the read-only demo instance.
 *
 * Showcases ALL v1.2.7 features:
 *   - Multi-page support (2 pages with different themes)
 *   - Auto-favicon (real URLs → favicons load automatically)
 *   - Scheduled links (active + upcoming)
 *   - Per-page themes (Aurora + 8-Bit Retro)
 *   - Per-page SEO settings
 *   - Embed widgets (YouTube)
 *   - Link thumbnails + highlighted links
 *   - Email capture
 *   - Full analytics (7 days, 2 pages)
 *   - Auto-generated privacy policy pages
 */
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/db/schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "linkbreeze.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log("Seeding demo data (v1.2.7)...\n");

  // ─── Guard: skip if already seeded ──────────────
  const existingCount = db
    .select({ c: sql<number>`count(*)` })
    .from(schema.users)
    .get();
  if ((existingCount?.c ?? 0) > 0) {
    console.log("Database already has data. Skipping seed.");
    process.exit(0);
  }

  // ─── Admin user ─────────────────────────────────
  const passwordHash = bcrypt.hashSync("demo1234", 12);
  db.insert(schema.users).values({
    username: "demo",
    passwordHash,
  }).run();
  console.log("✓ Admin user created (demo / demo1234)");

  // ─── Themes — seed all 10 presets ───────────────
  const { PRESETS } = await import("../lib/theme-presets");

  for (const preset of PRESETS) {
    const { name, ...rest } = preset;
    db.insert(schema.themes).values({ name, ...rest }).run();
  }
  console.log(`✓ ${PRESETS.length} theme presets created`);

  const auroraTheme = db.select().from(schema.themes).where(sql`name = 'Aurora'`).get() as { id: number };
  const eightBitTheme = db.select().from(schema.themes).where(sql`name = '8-Bit Retro'`).get() as { id: number };

  // ─── Clean up auto-created default page ──────────
  db.delete(schema.pages).where(sql`slug = 'u'`).run();

  // ─── PAGE 1: LinkBreeze (Showcase) ──────────────
  const linkbreezeSocialLinks = JSON.stringify([
    { platform: "github", url: "https://github.com/Manak-hash/LinkBreeze" },
    { platform: "x", url: "https://x.com/OmniRise00" },
    { platform: "youtube", url: "https://www.youtube.com/@OmniRise00" },
  ]);

  const linkbreezePage = db.insert(schema.pages).values({
    slug: "linkbreeze",
    title: "LinkBreeze",
    bio: "Self-hosted link-in-bio. Open source. Privacy-first.",
    avatarUrl: null,
    badgeText: "Open Source",
    socialLinks: linkbreezeSocialLinks,
    themeId: auroraTheme?.id,
    orderIndex: 0,
    isDefault: true,
    isPublished: true,
    seoTitle: "LinkBreeze — Self-Hosted Link-in-Bio Platform",
    seoDescription: "The open-source Linktree alternative you own. Self-host with Docker in one command.",
    footerText: "Powered by LinkBreeze",
    emailCapture: false,
  }).returning({ id: schema.pages.id }).get();
  const linkbreezePageId = linkbreezePage.id;
  console.log(`✓ Page 1 created: LinkBreeze (id=${linkbreezePageId}, Aurora theme, 3 social links)`);

  // ─── Sections for PAGE 1: LinkBreeze ────────────
  // Demonstrates the 1.3 sections feature on the showcase page.
  const lbSectionFeatured = db.insert(schema.linkSections).values({
    pageId: linkbreezePageId,
    title: "Featured",
    icon: "star",
    orderIndex: 0,
  }).returning({ id: schema.linkSections.id }).get();
  const lbSectionResources = db.insert(schema.linkSections).values({
    pageId: linkbreezePageId,
    title: "Resources",
    icon: "wrench",
    orderIndex: 1,
  }).returning({ id: schema.linkSections.id }).get();
  console.log(`✓ 2 sections created for LinkBreeze (Featured, Resources)`);

  // ─── PAGE 2: Manak (Developer/Founder) ──────────
  const manakSocialLinks = JSON.stringify([
    { platform: "github", url: "https://github.com/Manak-hash" },
    { platform: "x", url: "https://x.com/OmniRise00" },
    { platform: "youtube", url: "https://www.youtube.com/@OmniRise00" },
    { platform: "discord", url: "https://discord.com/users/332326479155298316" },
  ]);

  const manakPage = db.insert(schema.pages).values({
    slug: "manak",
    title: "Manak",
    bio: "Building LinkBreeze — open-source Linktree alternative. Full-stack dev. Freelance.",
    avatarUrl: "https://avatars.githubusercontent.com/u/189721984?v=4",
    badgeText: "Developer",
    socialLinks: manakSocialLinks,
    themeId: eightBitTheme?.id,
    orderIndex: 1,
    isDefault: false,
    isPublished: true,
    seoTitle: "Manak — Developer & LinkBreeze Founder",
    seoDescription: "Full-stack developer building open-source tools. Founder of LinkBreeze.",
    footerText: "Powered by LinkBreeze",
    emailCapture: false,
  }).returning({ id: schema.pages.id }).get();
  const manakPageId = manakPage.id;
  console.log(`✓ Page 2 created: Manak (id=${manakPageId}, 8-Bit Retro theme, 4 social links)`);

  // ─── Links for PAGE 1: LinkBreeze ───────────────
  // Matches the live demo at linkbreeze-demo.omnirise.dev/linkbreeze
  const linkbreezeLinks = [
    // YouTube embed — uncategorized (top of page, above sections)
    {
      title: "LinkBreeze Demo — See It In Action",
      url: "https://www.youtube.com/embed/_Ipf-_1B4BY",
      description: "",
      type: "embed",
      isHighlighted: false,
      orderIndex: 0,
      imageUrl: null,
      sectionId: null as number | null,
    },
    // Featured section
    {
      title: "LinkBreeze — Try It Live",
      url: "https://linkbreeze.omnirise.dev",
      description: "",
      type: "url",
      isHighlighted: false,
      orderIndex: 1,
      imageUrl: null,
      sectionId: lbSectionFeatured?.id ?? null,
    },
    {
      title: "Star LinkBreeze on GitHub",
      url: "https://github.com/Manak-hash/LinkBreeze",
      description: "Open-source · MIT licensed · Self-hosted",
      type: "url",
      isHighlighted: true,
      orderIndex: 2,
      imageUrl: null,
      sectionId: lbSectionFeatured?.id ?? null,
    },
    // Resources section
    {
      title: "OmniRise — My Studio",
      url: "https://omnirise.dev",
      description: "Web development, automation, and open-source projects",
      type: "url",
      isHighlighted: false,
      orderIndex: 3,
      imageUrl: null,
      sectionId: lbSectionResources?.id ?? null,
    },
  ];

  for (const link of linkbreezeLinks) {
    db.insert(schema.links).values({
      ...link,
      pageId: linkbreezePageId,
      isActive: true,
      clicksCount: Math.floor(Math.random() * 500) + 50,
    }).run();
  }
  console.log(`✓ ${linkbreezeLinks.length} links created for LinkBreeze (1 embed, 1 highlighted)`);

  // ─── Links for PAGE 2: Manak ────────────────────
  const manakLinks = [
    {
      title: "LinkBreeze — Self-Hosted Linktree Alternative",
      url: "https://github.com/Manak-hash/LinkBreeze",
      description: "Open source · MIT · Docker-ready · Analytics + QR codes",
      type: "url",
      isHighlighted: true,
      orderIndex: 0,
      imageUrl: null,
    },
    {
      title: "OmniRise — My Freelance Studio",
      url: "https://omnirise.dev",
      description: "Web development, automation, and open-source projects",
      type: "url",
      isHighlighted: false,
      orderIndex: 1,
      imageUrl: null,
    },
    {
      title: "LinkBreeze Demo — See It Live",
      url: "https://linkbreeze-demo.omnirise.dev/linkbreeze",
      description: "Full demo with 10 themes, embeds, and analytics",
      type: "url",
      isHighlighted: false,
      orderIndex: 2,
      imageUrl: null,
    },
    {
      title: "My other GitHub projects",
      url: "https://github.com/Manak-hash?tab=repositories",
      description: "All my public repos",
      type: "url",
      isHighlighted: false,
      orderIndex: 3,
      imageUrl: null,
    },
    {
      title: "Get in touch",
      url: "mailto:manak@omnirise.dev",
      description: "Freelance work, collaborations, or just say hi",
      type: "email",
      isHighlighted: false,
      orderIndex: 4,
      imageUrl: null,
    },
  ];

  for (const link of manakLinks) {
    db.insert(schema.links).values({
      ...link,
      pageId: manakPageId,
      isActive: true,
      clicksCount: Math.floor(Math.random() * 200) + 20,
    }).run();
  }
  console.log(`✓ ${manakLinks.length} links created for Manak (1 highlighted)`);

  // ─── Fake analytics (last 7 days, 2 pages) ──────
  const referrers = [
    null, null, "https://github.com", "https://x.com",
    "https://youtube.com", "https://google.com", "https://reddit.com",
    "https://producthunt.com", "https://bsky.app", "https://news.ycombinator.com",
    "https://discord.com", "https://facebook.com", null, "https://t.co",
  ];
  const devices = ["mobile", "mobile", "mobile", "desktop", "desktop", "tablet"];
  const countries = [
    "United States", "United States", "United States", "United Kingdom",
    "Germany", "India", "India", "Japan", "Brazil", "Canada",
    "France", "Australia", "Netherlands", "Singapore",
  ];

  const nowMs = Date.now();
  for (const [pageId, baseViews] of [[linkbreezePageId, 80], [manakPageId, 30]] as [number, number][]) {
    for (let day = 6; day >= 0; day--) {
      const viewsCount = Math.floor(Math.random() * baseViews) + 20;
      const dayOffset = day * 86_400_000;
      for (let v = 0; v < viewsCount; v++) {
        const hash = Math.random().toString(36).substring(2, 18);
        const jitter = Math.random() * 86_400_000;
        const ts = new Date(nowMs - dayOffset + jitter).toISOString();
        db.insert(schema.analyticsPageviews).values({
          visitorHash: hash,
          referrer: referrers[Math.floor(Math.random() * referrers.length)],
          deviceType: devices[Math.floor(Math.random() * devices.length)],
          country: countries[Math.floor(Math.random() * countries.length)],
          pageId,
          createdAt: ts,
        }).run();
      }
    }
  }
  console.log("✓ Analytics data generated (7 days, 2 pages)");

  // Clicks on links
  const allLinks = db.select().from(schema.links).all();
  for (const link of allLinks) {
    const clickCount = Math.floor(Math.random() * 20) + 2;
    for (let c = 0; c < clickCount; c++) {
      const hash = Math.random().toString(36).substring(2, 18);
      const dayOffset = Math.floor(Math.random() * 7) * 86_400_000;
      const jitter = Math.random() * 86_400_000;
      const ts = new Date(nowMs - dayOffset + jitter).toISOString();
      db.insert(schema.analyticsClicks).values({
        linkId: link.id,
        visitorHash: hash,
        referrer: referrers[Math.floor(Math.random() * referrers.length)],
        createdAt: ts,
      }).run();
    }
  }
  console.log("✓ Click analytics generated");

  console.log("\n✅ Demo seed complete (v1.2.7)!");
  console.log("   Admin: demo / demo1234");
  console.log("   Page 1: /linkbreeze (LinkBreeze — Aurora theme)");
  console.log("   Page 2: /manak (Manak — 8-Bit Retro theme)");
}

seed().catch(console.error);
