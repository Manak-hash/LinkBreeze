import { sql } from "drizzle-orm";

export type AnalyticsRange = "7d" | "30d" | "90d" | "all";

export const VALID_RANGES: AnalyticsRange[] = ["7d", "30d", "90d", "all"];

/** Parse a query-string value into a valid AnalyticsRange (default "7d"). */
export function parseRange(v: string | null): AnalyticsRange {
  return v && (VALID_RANGES as string[]).includes(v) ? (v as AnalyticsRange) : "7d";
}

/** SQL expression bounding the start of the analytics window. */
export function sinceExpr(range: AnalyticsRange) {
  if (range === "all") return sql`datetime('1970-01-01')`;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return sql`datetime('now', ${`-${days} days`})`;
}

/** Number of day-buckets to render for a range. */
export function rangeDays(range: AnalyticsRange): number {
  return range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
}
