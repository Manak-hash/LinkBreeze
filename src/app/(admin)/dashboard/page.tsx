import Link from "next/link";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Link as LinkIcon,
  Download,
} from "lucide-react";
import {
  getDashboardStats,
  getAllLinks,
  getAllPages,
  getAnalyticsBreakdown,
  type AnalyticsRange,
  type BreakdownEntry,
} from "@/server/queries";
import { checkForUpdates } from "@/lib/update-check";
import { UpdateChecker } from "@/components/admin/UpdateChecker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ViewsChart } from "./views-chart";
import { RangePicker } from "./range-picker";

export const dynamic = "force-dynamic";

const VALID_RANGES: AnalyticsRange[] = ["7d", "30d", "90d", "all"];

function parseRange(value?: string): AnalyticsRange {
  return value && (VALID_RANGES as string[]).includes(value)
    ? (value as AnalyticsRange)
    : "7d";
}

function BreakdownCard({
  title,
  description,
  entries,
}: {
  title: string;
  description: string;
  entries: BreakdownEntry[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((e) => {
              const max = entries[0].count || 1;
              const pct = Math.round((e.count / max) * 100);
              return (
                <li key={e.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{e.label}</span>
                    <span className="shrink-0 font-medium tabular-nums">{e.count}</span>
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
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; page?: string }>;
}) {
  const { range: rangeParam, page: pageParam } = await searchParams;
  const range = parseRange(rangeParam);

  // Resolve active page for page-scoped analytics.
  const allPages = await getAllPages();
  let pageId: number | undefined;
  if (pageParam) {
    const found = allPages.find((p) => p.id === Number(pageParam));
    if (found) pageId = found.id;
  }
  if (pageId === undefined) {
    const def = allPages.find((p) => p.isDefault) ?? allPages[0];
    pageId = def?.id;
  }

  const [stats, links, breakdown, updateResult] = await Promise.all([
    getDashboardStats(range, pageId),
    getAllLinks(pageId),
    getAnalyticsBreakdown(range, pageId),
    checkForUpdates(),
  ]);

  const activeCount = links.filter((l) => l.isActive).length;

  const cards = [
    { label: "Views", value: stats.totalViews.toLocaleString(), icon: Eye, hint: `${stats.uniqueVisitors.toLocaleString()} unique visitors` },
    { label: "Clicks", value: stats.totalClicks.toLocaleString(), icon: MousePointerClick, hint: `Link clicks in range` },
    { label: "Click-through rate", value: `${stats.ctr}%`, icon: TrendingUp, hint: "Clicks ÷ views" },
    { label: "Active links", value: activeCount.toString(), icon: LinkIcon, hint: `${links.length} total` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <UpdateChecker initialResult={updateResult} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Analytics for the selected range
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/analytics/export?range=${range}&metric=views`}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </a>
          <RangePicker current={range} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription>{c.label}</CardDescription>
                <span className="flex size-8 items-center justify-center rounded-lg bg-violet/15 text-lavender">
                  <c.icon className="size-4" />
                </span>
              </div>
              <CardTitle className="text-3xl">{c.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{c.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Views over time</CardTitle>
            <CardDescription>Daily views and clicks</CardDescription>
          </CardHeader>
          <CardContent>
            <ViewsChart data={stats.viewsPerDay} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top links</CardTitle>
            <CardDescription>Most clicked in range</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No clicks yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {stats.topLinks.map((link, i) => {
                  const max = stats.topLinks[0]?.clicks || 1;
                  const pct = Math.round((link.clicks / max) * 100);
                  return (
                    <li key={link.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <Link
                          href={`/links/${link.id}`}
                          className="flex items-center gap-2 truncate text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Badge variant="secondary" className="font-mono">
                            {i + 1}
                          </Badge>
                          <span className="truncate text-foreground">{link.title}</span>
                        </Link>
                        <span className="shrink-0 font-medium tabular-nums">
                          {link.clicks}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-[var(--aurora-grad)] transition-all"
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BreakdownCard
          title="Top referrers"
          description="Where views came from"
          entries={breakdown.referrers}
        />
        <BreakdownCard
          title="Devices"
          description="Views by device type"
          entries={breakdown.devices}
        />
        <BreakdownCard
          title="Countries"
          description="Views by country"
          entries={breakdown.countries}
        />
      </div>
    </div>
  );
}
