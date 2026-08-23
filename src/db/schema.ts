import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─── Users ─────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ─── Settings (key-value, runtime config) ─────────────
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// ─── Profile (legacy singleton — kept for migration compat) ──
export const profile = sqliteTable("profile", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  avatarUrl: text("avatar_url"),
  displayName: text("display_name").notNull().default(""),
  bio: text("bio").notNull().default(""),
  badgeText: text("badge_text"),
  socialLinks: text("social_links").notNull().default("[]"), // JSON array
});

// ─── Pages (multi-page support) ───────────────────────
// Each page is a full mini-profile: own avatar, name, bio, social links,
// theme, slug, SEO, favicon, analytics script, etc.
// Replaces the singleton `profile` table for v1.2.0+.
export const pages = sqliteTable("pages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull().default(""),        // display name
  bio: text("bio").notNull().default(""),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"), // hero/banner profile layouts (1.3)
  badgeText: text("badge_text"),
  socialLinks: text("social_links").notNull().default("[]"), // JSON array
  themeId: integer("theme_id"),
  orderIndex: integer("order_index").notNull().default(0),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),

  // Page-specific settings (moved from global settings table in 0008)
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  footerText: text("footer_text").notNull().default("Powered by LinkBreeze"),
  analyticsScript: text("analytics_script").notNull().default(""),
  customCss: text("custom_css").notNull().default(""),
  emailCapture: integer("email_capture", { mode: "boolean" }).notNull().default(false),
  faviconUrl: text("favicon_url"),
  privacyPolicy: text("privacy_policy").notNull().default(""),
  // Per-page QR style (colors, center logo choice, size) as JSON.
  // NULL = defaults; see src/lib/qr.ts for the shape + resolver.
  qrSettings: text("qr_settings"),
});

// ─── Link sections (1.3) ──────────────────────────────
// Groups links under headers on the public page. Links with a null
// section_id render in the uncategorized group at the top.
export const linkSections = sqliteTable("link_sections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pageId: integer("page_id").notNull().references(() => pages.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  icon: text("icon"), // optional emoji shown before the title
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ─── Links ────────────────────────────────────────────
export const links = sqliteTable("links", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pageId: integer("page_id").notNull().default(1),
  sectionId: integer("section_id"), // FK to link_sections.id (enforced in 0013 migration SQL)
  orderIndex: integer("order_index").notNull().default(0),
  type: text("type").notNull().default("url"), // url, email, phone, whatsapp, sms, vcard, file
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  icon: text("icon"), // dashed lucide name when icon_mode='lucide' (#91)
  iconUrl: text("icon_url"), // cached favicon (auto mode)
  customIconUrl: text("custom_icon_url"), // uploaded icon (custom mode)
  iconMode: text("icon_mode").notNull().default("auto"), // auto | lucide | custom
  autoIcon: integer("auto_icon", { mode: "boolean" }).notNull().default(true),
  imageUrl: text("image_url"),
  isHighlighted: integer("is_highlighted", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  scheduleStart: text("schedule_start"),
  scheduleEnd: text("schedule_end"),
  clicksCount: integer("clicks_count").notNull().default(0),
  cardStyle: text("card_style").notNull().default("compact"), // compact | rich
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ─── Themes ───────────────────────────────────────────
export const themes = sqliteTable("themes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),

  // Background
  backgroundType: text("background_type").notNull().default("gradient"), // solid, gradient, radial, mesh, image, pattern, aurora, animatedGradient
  backgroundValue: text("background_value").notNull().default("#1a1a2e,#16213e"),
  backgroundAngle: text("background_angle").notNull().default("160deg"),
  backgroundImageUrl: text("background_image_url").notNull().default(""),
  backgroundFit: text("background_fit").notNull().default("cover"), // cover, contain, tile
  backgroundPosition: text("background_position").notNull().default("50% 50%"),
  overlayColor: text("overlay_color").notNull().default("#000000"),
  overlayOpacity: text("overlay_opacity").notNull().default("0"),

  // Colors
  primaryColor: text("primary_color").notNull().default("#0f3460"),
  secondaryColor: text("secondary_color").notNull().default("#a78bfa"),
  cardBackground: text("card_background").notNull().default("rgba(255,255,255,0.06)"),
  cardBorderColor: text("card_border_color").notNull().default("rgba(167,139,250,0.16)"),
  textColor: text("text_color").notNull().default("#eaeaea"),
  mutedTextColor: text("muted_text_color").notNull().default("rgba(234,234,234,0.7)"),
  mode: text("mode").notNull().default("dark"), // dark, light (UI + Zod only accept these two)

  // Typography
  fontFamily: text("font_family").notNull().default("inter"),
  fontScale: text("font_scale").notNull().default("md"), // sm, md, lg
  fontWeight: text("font_weight").notNull().default("600"),
  letterSpacing: text("letter_spacing").notNull().default("0"),

  // Card
  linkStyle: text("link_style").notNull().default("glass"), // rounded, sharp, glass, pill, outline, neon
  animationType: text("animation_type").notNull().default("lift"), // lift, scale, none
  radius: text("radius").notNull().default("auto"),
  buttonSize: text("button_size").notNull().default("md"), // sm, md, lg
  borderWidth: text("border_width").notNull().default("1px"),
  shadowStrength: text("shadow_strength").notNull().default("medium"), // none, subtle, medium, strong
  hoverEffect: text("hover_effect").notNull().default("lift"), // lift, scale, glow, none

  // Layout
  containerWidth: text("container_width").notNull().default("standard"), // narrow, standard, wide
  alignment: text("alignment").notNull().default("center"), // left, center, right
  density: text("density").notNull().default("normal"), // compact, normal, relaxed

  // Effects
  glow: text("glow").notNull().default("false"),
  glowColor: text("glow_color").notNull().default("#a78bfa"),
  blur: text("blur").notNull().default("8px"),
  noise: text("noise").notNull().default("false"),

  // Profile styling (1.3)
  avatarShape: text("avatar_shape").notNull().default("circle"), // circle, squircle, rounded, square
  avatarBorder: text("avatar_border").notNull().default("solid"), // solid, gradient, glow, ring, none
  avatarFloat: text("avatar_float").notNull().default("false"),
  profileLayout: text("profile_layout").notNull().default("classic"), // classic, hero, banner
  textAnimation: text("text_animation").notNull().default("none"), // none, typewriter, gradient-flow

  // Meta
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
  isPreset: integer("is_preset", { mode: "boolean" }).notNull().default(false),
});

// ─── Custom fonts (uploaded woff2/woff, #82) ──────────
export const customFonts = sqliteTable("custom_fonts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** User-supplied display name ("Brand Sans"). */
  name: text("name").notNull(),
  /** CSS font-family name: "LB Custom <id>". Numeric, never user-typed. */
  family: text("family").notNull(),
  /** Original filename for the UI ("acme-corp.woff2"). */
  filename: text("filename").notNull(),
  /** Public URL of the stored file: /api/uploads/<hex>.woff2 */
  url: text("url").notNull(),
  /** File size in bytes (for the "heavy font" hint in the UI). */
  sizeBytes: integer("size_bytes").notNull().default(0),
  /** woff2 or woff — controls the @font-face format() hint. */
  format: text("format").notNull().default("woff2"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ─── Analytics ────────────────────────────────────────
export const analyticsPageviews = sqliteTable("analytics_pageviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pageId: integer("page_id"),
  date: text("date").notNull().default(sql`(date('now'))`),
  visitorHash: text("visitor_hash").notNull(),
  referrer: text("referrer"),
  country: text("country"),
  deviceType: text("device_type"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const analyticsClicks = sqliteTable("analytics_clicks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  linkId: integer("link_id").notNull().references(() => links.id, { onDelete: "cascade" }),
  visitorHash: text("visitor_hash").notNull(),
  referrer: text("referrer"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ─── Subscribers (email capture) ──────────────────────
export const subscribers = sqliteTable("subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  consentAt: text("consent_at"),
  consentText: text("consent_text"),
});

// ─── Meta (internal) ──────────────────────────────────
export const meta = sqliteTable("_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
