/**
 * LinkBreeze Demo Seed Script (v1.2.2)
 * Run with: DEMO_MODE=true npx tsx src/scripts/seed-demo.ts
 * Populates a fresh database with demo data for the read-only demo instance.
 *
 * Showcases ALL v1.2.2 features:
 *   - Multi-page support (2 pages with different themes)
 *   - Auto-favicon (real URLs → favicons load automatically)
 *   - 54 social platforms (10 on page 1, 4 on page 2)
 *   - Scheduled links (active + upcoming)
 *   - Per-page themes (Aurora + Neon Cyberpunk)
 *   - Per-page SEO settings
 *   - Embed widgets (YouTube, Spotify)
 *   - Link thumbnails + highlighted links
 *   - Email capture
 *   - Full analytics (7 days, 2 pages)
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
  console.log("Seeding demo data (v1.2.2)...\n");

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

  // ─── Themes — seed all 9 presets FIRST ──────────
  // Base shape shared by all presets — sensible token-system defaults.
  const base = {
    isPreset: true as const,
    isActive: false as const,
    mode: "dark" as const,
    backgroundAngle: "160deg",
    overlayColor: "#000000",
    overlayOpacity: "40",
    fontScale: "100",
    fontWeight: "400",
    letterSpacing: "0",
    radius: "12px",
    buttonSize: "md",
    borderWidth: "1px",
    shadowStrength: "soft",
    hoverEffect: "lift",
    animationType: "lift" as const,
    containerWidth: "480px",
    alignment: "center",
    density: "normal",
    glow: "false",
    glowColor: "#533fd6",
    blur: "12px",
    noise: "false",
  };

  const presets = [
    // 1. Aurora — the animated flagship, ACTIVE for demo
    {
      ...base,
      name: "Aurora",
      backgroundType: "aurora",
      backgroundValue: "#0a0820",
      fontFamily: "inter",
      primaryColor: "#533fd6",
      secondaryColor: "#a78bfa",
      textColor: "#eceafe",
      mutedTextColor: "#a39ec9",
      cardBackground: "rgba(20,17,46,0.55)",
      cardBorderColor: "rgba(167,139,250,0.18)",
      linkStyle: "glass",
      animationType: "lift",
      glow: "false",
      blur: "16px",
      isActive: true,
    },
    // 2. Glassmorphism
    {
      ...base,
      name: "Glassmorphism",
      backgroundType: "gradient",
      backgroundValue: "#1e3a8a,#6d28d9,#db2777",
      backgroundAngle: "135deg",
      fontFamily: "sora",
      primaryColor: "#60a5fa",
      secondaryColor: "#c084fc",
      textColor: "#f0f4ff",
      mutedTextColor: "#94a3b8",
      cardBackground: "rgba(255,255,255,0.08)",
      cardBorderColor: "rgba(255,255,255,0.12)",
      linkStyle: "glass",
      blur: "20px",
      shadowStrength: "medium",
    },
    // 3. Neon Cyberpunk
    {
      ...base,
      name: "Neon Cyberpunk",
      backgroundType: "solid",
      backgroundValue: "#0a0a0f",
      fontFamily: "jetbrains",
      primaryColor: "#00f0ff",
      secondaryColor: "#ff0080",
      textColor: "#e0e0ff",
      mutedTextColor: "#6a6a8a",
      cardBackground: "rgba(10,10,20,0.8)",
      cardBorderColor: "rgba(0,240,255,0.3)",
      linkStyle: "neon",
      radius: "4px",
      glow: "true",
      glowColor: "#00f0ff",
      hoverEffect: "glow",
      shadowStrength: "none",
    },
    // 4. Editorial Paper
    {
      ...base,
      name: "Editorial Paper",
      backgroundType: "solid",
      backgroundValue: "#faf8f3",
      mode: "light",
      fontFamily: "playfair",
      primaryColor: "#c2410c",
      secondaryColor: "#92400e",
      textColor: "#1c1917",
      mutedTextColor: "#78716c",
      cardBackground: "#ffffff",
      cardBorderColor: "#e7e5e4",
      linkStyle: "outline",
      radius: "0px",
      borderWidth: "2px",
      shadowStrength: "subtle",
      hoverEffect: "none",
    },
    // 5. Terminal Mono
    {
      ...base,
      name: "Terminal Mono",
      backgroundType: "solid",
      backgroundValue: "#0c0c0c",
      fontFamily: "jetbrains",
      primaryColor: "#00ff41",
      secondaryColor: "#008f11",
      textColor: "#00ff41",
      mutedTextColor: "#008f11",
      cardBackground: "#111111",
      cardBorderColor: "#00ff4133",
      linkStyle: "sharp",
      radius: "0px",
      borderWidth: "1px",
      shadowStrength: "none",
      hoverEffect: "none",
    },
    // 6. Pastel Soft
    {
      ...base,
      name: "Pastel Soft",
      backgroundType: "gradient",
      backgroundValue: "#fce7f3,#ddd6fe,#bfdbfe",
      backgroundAngle: "180deg",
      mode: "light",
      fontFamily: "dm-sans",
      primaryColor: "#c026d3",
      secondaryColor: "#7c3aed",
      textColor: "#3b0764",
      mutedTextColor: "#9333ea",
      cardBackground: "rgba(255,255,255,0.7)",
      cardBorderColor: "rgba(192,38,211,0.15)",
      linkStyle: "pill",
      radius: "9999px",
      shadowStrength: "soft",
    },
    // 7. Brutalist
    {
      ...base,
      name: "Brutalist",
      backgroundType: "solid",
      backgroundValue: "#ffff00",
      mode: "light",
      fontFamily: "space-grotesk",
      primaryColor: "#000000",
      secondaryColor: "#ff0000",
      textColor: "#000000",
      mutedTextColor: "#333333",
      cardBackground: "#ffffff",
      cardBorderColor: "#000000",
      linkStyle: "sharp",
      radius: "0px",
      borderWidth: "3px",
      shadowStrength: "none",
      hoverEffect: "lift",
      letterSpacing: "1",
      fontWeight: "700",
    },
    // 8. Retro Sunset
    {
      ...base,
      name: "Retro Sunset",
      backgroundType: "gradient",
      backgroundValue: "#2d1b69,#ff006e,#ffbe0b",
      backgroundAngle: "160deg",
      fontFamily: "bebas",
      primaryColor: "#ffbe0b",
      secondaryColor: "#fb5607",
      textColor: "#fff8e1",
      mutedTextColor: "#ffd54f",
      cardBackground: "rgba(0,0,0,0.4)",
      cardBorderColor: "rgba(255,190,11,0.3)",
      linkStyle: "rounded",
      radius: "8px",
      glow: "true",
      glowColor: "#ffbe0b",
      letterSpacing: "2",
    },
    // 9. Minimal Light
    {
      ...base,
      name: "Minimal Light",
      backgroundType: "solid",
      backgroundValue: "#ffffff",
      mode: "light",
      fontFamily: "outfit",
      primaryColor: "#6366f1",
      secondaryColor: "#818cf8",
      textColor: "#1e293b",
      mutedTextColor: "#64748b",
      cardBackground: "#ffffff",
      cardBorderColor: "#e2e8f0",
      linkStyle: "rounded",
      radius: "12px",
      borderWidth: "1px",
      shadowStrength: "subtle",
      hoverEffect: "lift",
    },
  ];

  for (const preset of presets) {
    db.insert(schema.themes).values(preset).run();
  }
  console.log(`✓ ${presets.length} theme presets created`);

  // Get theme IDs for page assignment
  const auroraTheme = db.select().from(schema.themes).where(sql`name = 'Aurora'`).get() as { id: number };
  const neonTheme = db.select().from(schema.themes).where(sql`name = 'Neon Cyberpunk'`).get() as { id: number };

  // ─── Clean up the auto-created default page from migration 0007 ──
  // Migration creates a page with slug "u" from old profile/settings data.
  // We delete it so our seeded pages get IDs 1 and 2.
  db.delete(schema.pages).where(sql`slug = 'u'`).run();

  // ─── PAGE 1: Alex Rivera (Creator) ──────────────
  const alexSocialLinks = JSON.stringify([
    { platform: "bluesky", url: "https://bsky.app/profile/alexrivera" },
    { platform: "youtube", url: "https://www.youtube.com/@OmniRise00?app=desktop" },
    { platform: "instagram", url: "https://instagram.com/alexrivera" },
    { platform: "tiktok", url: "https://tiktok.com/@alexrivera" },
    { platform: "threads", url: "https://threads.net/@alexrivera" },
    { platform: "github", url: "https://github.com/Manak-hash" },
    { platform: "x", url: "https://x.com/OmniRise00" },
    { platform: "twitch", url: "https://twitch.tv/alexrivera" },
    { platform: "facebook", url: "https://facebook.com/alexrivera" },
    { platform: "discord", url: "https://discord.com/users/332326479155298316" },
  ]);

  const alexPage = db.insert(schema.pages).values({
    slug: "alex",
    title: "Alex Rivera",
    bio: "Content creator · Photographer · Always creating",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces",
    badgeText: "Creator",
    socialLinks: alexSocialLinks,
    themeId: auroraTheme?.id,
    orderIndex: 0,
    isDefault: true,
    isPublished: true,
    seoTitle: "Alex Rivera — Photographer & Content Creator",
    seoDescription: "All my links, projects, and content in one place. Photography, videos, and more.",
    footerText: "© 2026 Alex Rivera · Powered by LinkBreeze",
    emailCapture: true,
  }).returning({ id: schema.pages.id }).get();
  const alexPageId = alexPage.id;
  console.log(`✓ Page 1 created: Alex Rivera (id=${alexPageId}, Aurora theme, 10 social links)`);

  // ─── PAGE 2: Manak (Developer/Founder) ──────────
  const manakSocialLinks = JSON.stringify([
    { platform: "github", url: "https://github.com/Manak-hash" },
    { platform: "x", url: "https://x.com/OmniRise00" },
    { platform: "youtube", url: "https://www.youtube.com/@OmniRise00?app=desktop" },
    { platform: "discord", url: "https://discord.com/users/332326479155298316" },
  ]);

  const manakPage = db.insert(schema.pages).values({
    slug: "manak",
    title: "Manak",
    bio: "Building LinkBreeze — open-source Linktree alternative. Full-stack dev. Freelance.",
    avatarUrl: "https://avatars.githubusercontent.com/u/189721984?v=4",
    badgeText: "Developer",
    socialLinks: manakSocialLinks,
    themeId: neonTheme?.id,
    orderIndex: 1,
    isDefault: false,
    isPublished: true,
    seoTitle: "Manak — Developer & LinkBreeze Founder",
    seoDescription: "Full-stack developer building open-source tools. Founder of LinkBreeze.",
    footerText: "© 2026 Manak · Powered by LinkBreeze",
    emailCapture: false,
  }).returning({ id: schema.pages.id }).get();
  const manakPageId = manakPage.id;
  console.log(`✓ Page 2 created: Manak (id=${manakPageId}, Neon Cyberpunk theme, 4 social links)`);

  // ─── Links for PAGE 1: Alex Rivera ──────────────
  const now = new Date();
  const inOneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const inThreeWeeks = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

  const alexLinks = [
    // Embed — YouTube (LinkBreeze showcase video)
    {
      title: "LinkBreeze — Open-Source Linktree Alternative",
      url: "https://www.youtube.com/embed/_Ipf-_1B4BY",
      description: "See what LinkBreeze can do — embed widget demo",
      type: "embed",
      isHighlighted: false,
      orderIndex: 0,
      imageUrl: null,
    },
    // Highlighted link with thumbnail
    {
      title: "Watch my latest video",
      url: "https://www.youtube.com/watch?v=_Ipf-_1B4BY",
      description: "I traveled to Iceland and this happened...",
      type: "url",
      isHighlighted: true,
      orderIndex: 1,
      imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=400&fit=crop",
    },
    // Link with thumbnail
    {
      title: "My photography portfolio",
      url: "https://alexrivera.photos",
      description: "Landscape & street photography",
      type: "url",
      isHighlighted: false,
      orderIndex: 2,
      imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=400&fit=crop",
    },
    // Spotify embed
    {
      title: "My editing playlist",
      url: "https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn",
      description: "Lo-fi beats for editing sessions",
      type: "embed",
      isHighlighted: false,
      orderIndex: 3,
      imageUrl: null,
    },
    // Cross-page link: Manak's page
    {
      title: "Meet Manak — the developer behind this",
      url: "/manak",
      description: "The guy who built this platform",
      type: "url",
      isHighlighted: false,
      orderIndex: 4,
      imageUrl: null,
    },
    // GitHub repo — real URL so favicon loads
    {
      title: "Star LinkBreeze on GitHub",
      url: "https://github.com/Manak-hash/LinkBreeze",
      description: "Open-source · MIT licensed · Self-hosted",
      type: "url",
      isHighlighted: false,
      orderIndex: 5,
      imageUrl: null,
    },
    // Scheduled link — ACTIVE right now (shows scheduling feature)
    {
      title: "Summer Sale — 20% off prints",
      url: "https://alexrivera.photos/shop",
      description: "Limited time! Ends soon",
      type: "url",
      isHighlighted: true,
      orderIndex: 6,
      imageUrl: null,
      scheduleStart: now.toISOString(),
      scheduleEnd: inOneWeek.toISOString(),
    },
    // Scheduled link — UPCOMING (shows future scheduling)
    {
      title: "New course drops next week",
      url: "https://alexrivera.photos/course",
      description: "Photography masterclass — early bird pricing",
      type: "url",
      isHighlighted: false,
      orderIndex: 7,
      imageUrl: null,
      scheduleStart: inOneWeek.toISOString(),
      scheduleEnd: inThreeWeeks.toISOString(),
    },
    // Regular links
    {
      title: "Shop my camera gear",
      url: "https://amazon.com/shop/alexrivera",
      description: "Everything I use to shoot",
      type: "url",
      isHighlighted: false,
      orderIndex: 8,
      imageUrl: null,
    },
    {
      title: "Contact me",
      url: "mailto:hello@alexrivera.com",
      description: "Business inquiries welcome",
      type: "email",
      isHighlighted: false,
      orderIndex: 9,
      imageUrl: null,
    },
  ];

  for (const link of alexLinks) {
    db.insert(schema.links).values({
      ...link,
      pageId: alexPageId,
      isActive: true,
      clicksCount: Math.floor(Math.random() * 500) + 50,
    }).run();
  }
  console.log(`✓ ${alexLinks.length} links created for Alex (2 embeds, 2 thumbnails, 2 highlighted, 2 scheduled)`);

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
      url: "https://linkbreeze-demo.omnirise.dev/alex",
      description: "Full demo with 9 themes, embeds, and analytics",
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
      url: "mailto:hello@omnirise.dev",
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

  // ─── Fake email subscribers (page 1 only) ───────
  const subscriberEmails = [
    "fan1@example.com", "subscriber2@example.com", "creative@example.com",
    "photographer@example.com", "follower@example.com", "newsletter@example.com",
    "artlover@example.com", "wanderlust@example.com",
  ];
  for (const email of subscriberEmails) {
    db.insert(schema.subscribers).values({ email }).run();
  }
  console.log(`✓ ${subscriberEmails.length} email subscribers created`);

  // ─── Fake analytics (last 7 days, 2 pages) ──────
  const referrers = [
    null, "https://instagram.com", "https://tiktok.com",
    "https://youtube.com", null, "https://google.com", null,
    "https://bsky.app", "https://x.com", "https://reddit.com",
  ];
  const devices = ["mobile", "mobile", "desktop", "mobile", "tablet"];

  // Pageviews for both pages
  for (const [pageId, baseViews] of [[alexPageId, 80], [manakPageId, 30]] as [number, number][]) {
    for (let day = 6; day >= 0; day--) {
      const viewsCount = Math.floor(Math.random() * baseViews) + 20;
      for (let v = 0; v < viewsCount; v++) {
        const hash = Math.random().toString(36).substring(2, 18);
        db.insert(schema.analyticsPageviews).values({
          visitorHash: hash,
          referrer: referrers[Math.floor(Math.random() * referrers.length)],
          deviceType: devices[Math.floor(Math.random() * devices.length)],
          country: null,
          pageId,
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
      db.insert(schema.analyticsClicks).values({
        linkId: link.id,
        visitorHash: hash,
        referrer: referrers[Math.floor(Math.random() * referrers.length)],
      }).run();
    }
  }
  console.log("✓ Click analytics generated");

  console.log("\n✅ Demo seed complete (v1.2.2)!");
  console.log("   Admin: demo / demo1234");
  console.log("   Page 1: /alex (Alex Rivera — Aurora theme)");
  console.log("   Page 2: /manak (Manak — Neon Cyberpunk theme)");
  console.log("   Features showcased:");
  console.log("     - Multi-page support (2 pages, different themes)");
  console.log("     - Auto-favicon (real URLs → favicons load)");
  console.log("     - 10 social platforms on Alex, 4 on Manak");
  console.log("     - Scheduled links (1 active, 1 upcoming)");
  console.log("     - Per-page SEO + email capture settings");
  console.log("     - 2 embed widgets (YouTube, Spotify)");
  console.log("     - Cross-page linking (/manak from Alex page)");
  console.log("     - 9 theme presets available");
  console.log("     - Full 7-day analytics for both pages");
}

seed().catch(console.error);
