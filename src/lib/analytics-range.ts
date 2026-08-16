import { sql } from "drizzle-orm";

export type AnalyticsRange = "7d" | "30d" | "90d";

export const VALID_RANGES: AnalyticsRange[] = ["7d", "30d", "90d"];

/** Parse a query-string value into a valid AnalyticsRange (default "7d").
 *  Legacy "all" values (and anything else unknown) fall back to "7d" —
 *  the retention window makes "all" meaningless. */
export function parseRange(v: string | null): AnalyticsRange {
  return v && (VALID_RANGES as string[]).includes(v) ? (v as AnalyticsRange) : "7d";
}

/** SQL expression bounding the start of the analytics window. */
export function sinceExpr(range: AnalyticsRange) {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return sql`datetime('now', ${`-${days} days`})`;
}

