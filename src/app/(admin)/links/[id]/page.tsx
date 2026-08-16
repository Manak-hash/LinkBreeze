import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MousePointerClick } from "lucide-react";
import {
  getAnalyticsRetentionDays,
  getLinkStats,
  type AnalyticsRange,
} from "@/server/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RangePicker } from "@/app/(admin)/dashboard/range-picker";
import { ClicksChart } from "./clicks-chart";

export const dynamic = "force-dynamic";

const VALID: AnalyticsRange[] = ["7d", "30d", "90d"];
function parseRange(v?: string): AnalyticsRange {
  return (VALID as string[]).includes(v || "") ? (v as AnalyticsRange) : "30d";
}

export default async function LinkDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const [{ id: idParam }, { range: rangeParam }] = await Promise.all([
    params,
    searchParams,
  ]);
  const linkId = Number(idParam);
  if (!Number.isFinite(linkId)) notFound();

  const range = parseRange(rangeParam);
  const [stats, retentionDays] = await Promise.all([
    getLinkStats(linkId, range),
    getAnalyticsRetentionDays(),
  ]);
  if (!stats) notFound();

  const { link, totalClicks, clicksPerDay, topReferrers } = stats;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/links"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to links
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {link.title}
        </h1>
        <p className="truncate text-sm text-muted-foreground">{link.url}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MousePointerClick className="size-4 text-lavender" />
          <span className="font-medium text-foreground">
            {totalClicks.toLocaleString()}
          </span>{" "}
          {`clicks in the last ${range.replace("d", "")} days${retentionDays > 0 ? ` (data kept ${retentionDays} days)` : ""}`}
        </div>
        <RangePicker current={range} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clicks over time</CardTitle>
          <CardDescription>Daily clicks for this link</CardDescription>
        </CardHeader>
        <CardContent>
          <ClicksChart data={clicksPerDay} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top referrers</CardTitle>
          <CardDescription>Where these clicks came from</CardDescription>
        </CardHeader>
        <CardContent>
          {topReferrers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No referrer data yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {topReferrers.map((r) => {
                const max = topReferrers[0].count || 1;
                const pct = Math.round((r.count / max) * 100);
                return (
                  <li key={r.label} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">{r.label}</span>
                      <span className="shrink-0 font-medium tabular-nums">{r.count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-[var(--aurora-grad)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
