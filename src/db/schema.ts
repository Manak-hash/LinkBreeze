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

// ─── Profile ──────────────────────────────────────────
export const profile = sqliteTable("profile", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  avatarUrl: text("avatar_url"),
  displayName: text("display_name").notNull().default(""),
  bio: text("bio").notNull().default(""),
  badgeText: text("badge_text"),
  socialLinks: text("social_links").notNull().default("[]"), // JSON array
});

// ─── Links ────────────────────────────────────────────
export const links = sqliteTable("links", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderIndex: integer("order_index").notNull().default(0),
  type: text("type").notNull().default("url"), // url, email, phone, whatsapp, sms, vcard, file
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  icon: text("icon"),
  imageUrl: text("image_url"),
  isHighlighted: integer("is_highlighted", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  scheduleStart: text("schedule_start"),
  scheduleEnd: text("schedule_end"),
  clicksCount: integer("clicks_count").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ─── Themes ───────────────────────────────────────────
export const themes = sqliteTable("themes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  backgroundType: text("background_type").notNull().default("gradient"), // solid, gradient, pattern
  backgroundValue: text("background_value").notNull().default("#1a1a2e,#16213e"),
  fontFamily: text("font_family").notNull().default("Inter"),
  primaryColor: text("primary_color").notNull().default("#0f3460"),
  textColor: text("text_color").notNull().default("#eaeaea"),
  linkStyle: text("link_style").notNull().default("rounded"), // rounded, sharp, glass
  animationType: text("animation_type").notNull().default("lift"), // lift, scale, none
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
});

// ─── Analytics ────────────────────────────────────────
export const analyticsPageviews = sqliteTable("analytics_pageviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  email: text("email").notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ─── Meta (internal) ──────────────────────────────────
export const meta = sqliteTable("_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
