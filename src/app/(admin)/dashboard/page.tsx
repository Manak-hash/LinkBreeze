import {
  Eye,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  Link as LinkIcon,
  Download,
  Trophy,
  Globe,
  MonitorSmartphone,
  Share2,
  Minus,
  Plus,
  DownloadCloud,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  getDashboardStats,
  getPreviousStats,
  getAllLinks,
  getAllPages,
  getAnalyticsBreakdown,
  getActiveTheme,
  getProfile,
  getSetting,
  type AnalyticsRange,
  type BreakdownEntry,
} from "@/server/queries";
import { checkForUpdates } from "@/lib/update-check";
import { UpdateChecker } from "@/components/admin/UpdateChecker";
import { OnboardingChecklist } from "@/components/admin/OnboardingChecklist";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Card, CardContent } from "@/components/ui/card";
import { ViewsChart } from "./views-chart";
import { RangePicker } from "./range-picker";
import { ExpandableSection } from "./expandable-section";

export const dynamic = "force-dynamic";

const VALID_RANGES: AnalyticsRange[] = ["7d", "30d", "90d", "all"];

function parseRange(value?: string): AnalyticsRange {
  return value && (VALID_RANGES as string[]).includes(value)
    ? (value as AnalyticsRange)
    : "7d";
}

// ── Delta badge ──────────────────────────────────────────────────────────

function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="size-3" /> 0%
      </span>
    );
  }
  if (previous === 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-emerald-400">
        <TrendingUp className="size-3" /> New
      </span>
    );
  }
  const delta = Math.round(((current - previous) / previous) * 100);
  if (delta === 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="size-3" /> 0%
      </span>
    );
  }
  const positive = delta > 0;
  return (
    <span
      className={
        positive
          ? "flex items-center gap-0.5 text-xs text-emerald-400"
          : "flex items-center gap-0.5 text-xs text-red-400"
      }
    >
      {positive ? (
        <TrendingUp className="size-3" />
      ) : (
        <TrendingDown className="size-3" />
      )}
      {positive ? "+" : ""}
      {delta}%
    </span>
  );
}

// ── Mini sparkline (pure SVG, no deps) ───────────────────────────────────

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 100;
  const h = 40;
  const step = w / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={`h-10 w-full ${className ?? ""}`}
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(167,139,250,0.3)" />
          <stop offset="100%" stopColor="rgba(167,139,250,0)" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill="url(#spark-fill)"
      />
      <polyline
        points={points}
        fill="none"
        stroke="rgb(167,139,250)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// ── Metric Card ──────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  icon: Icon,
  hint,
  delta,
  spark,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint: string;
  delta?: { current: number; previous: number };
  spark?: number[];
}) {
  return (
    <SpotlightCard className="bg-card backdrop-blur-xl">
      <div className="relative flex h-full min-h-[100px] flex-col gap-2 overflow-hidden p-4">
        {/* Watermark icon — bottom right, flush to edges */}
        <Icon
          className="pointer-events-none absolute -bottom-2 -right-2 size-16 text-violet/8"
          strokeWidth={1}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{label}</span>
          {delta && <Delta current={delta.current} previous={delta.previous} />}
        </div>
        <span className="font-heading text-3xl font-semibold tracking-tight">
          {value}
        </span>
        {spark && spark.length > 1 && (
          <div className="flex-1">
            <Sparkline data={spark} />
          </div>
        )}
        <span className="mt-auto text-xs text-muted-foreground">{hint}</span>
      </div>
    </SpotlightCard>
  );
}

// ── Breakdown helpers ────────────────────────────────────────────────────

function FaviconForLabel({ label }: { label: string }) {
  const domain = label.includes(".") ? label : null;
  if (!domain) return null;
  return (
    <Image
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt=""
      width={16}
      height={16}
      unoptimized
      className="size-4 shrink-0 rounded-sm"
      loading="lazy"
    />
  );
}

function BreakdownList({
  entries,
  total,
  showFavicons,
  max,
}: {
  entries: BreakdownEntry[];
  total: number;
  showFavicons?: boolean;
  max?: number;
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {entries.slice(0, max).map((e) => {
        const pct = Math.round((e.count / total) * 100);
        return (
          <li key={e.label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 truncate">
                {showFavicons && <FaviconForLabel label={e.label} />}
                <span className="truncate capitalize">{e.label}</span>
              </span>
              <span className="shrink-0 font-medium tabular-nums">
                {e.count}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[var(--aurora-grad)] transition-[width]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function TopLinksList({
  links,
  max,
}: {
  links: { id: number; title: string; clicks: number }[];
  max?: number;
}) {
  if (links.length === 0) {
    return <p className="text-sm text-muted-foreground">No clicks yet.</p>;
  }
  const topMax = links[0]?.clicks || 1;
  return (
    <ul className="flex flex-col gap-2">
      {links.slice(0, max).map((link, i) => {
        const pct = Math.round((link.clicks / topMax) * 100);
        return (
          <li key={link.id} className="flex items-center gap-2 text-sm">
            <span className="w-4 shrink-0 text-xs text-muted-foreground">
              {i + 1}
            </span>
            <span className="truncate">{link.title}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[var(--aurora-grad)]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right tabular-nums text-muted-foreground">
              {link.clicks}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; page?: string }>;
}) {
  const { range: rangeParam, page: pageParam } = await searchParams;
  const range = parseRange(rangeParam);

  const allPages = await getAllPages();
  const activePage =
    allPages.find((p) => p.id === Number(pageParam)) ??
    allPages.find((p) => p.isDefault) ??
    allPages[0];
  const pageId = activePage?.id;

  const [stats, prevStats, links, breakdown, updateResult, profile, activeTheme, slug] = await Promise.all([
    getDashboardStats(range, pageId),
    getPreviousStats(range, pageId),
    getAllLinks(pageId),
    getAnalyticsBreakdown(range, pageId),
    checkForUpdates(),
    getProfile(),
    getActiveTheme(),
    getSetting("slug"),
  ]);

  const activeCount = links.filter((l) => l.isActive).length;
  const viewSpark = stats.viewsPerDay.map((d) => d.views);
  const clickSpark = stats.viewsPerDay.map((d) => d.clicks);

  const refTotal = breakdown.referrers.reduce((s, e) => s + e.count, 0) || 1;
  const devTotal = breakdown.devices.reduce((s, e) => s + e.count, 0) || 1;
  const ctryTotal = breakdown.countries.reduce((s, e) => s + e.count, 0) || 1;

  // Fresh install: no links, no views. Show a welcome hero instead of
  // an empty dashboard full of zeroes.
  const isEmptyState = links.length === 0 && stats.totalViews === 0;

  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100dvh-3rem)]">
      <UpdateChecker initialResult={updateResult} />

      {/* Onboarding checklist — auto-hides when all done or dismissed */}
      <OnboardingChecklist
        hasLinks={activeCount > 0}
        hasDisplayName={(profile?.displayName?.length ?? 0) > 0}
        hasTheme={activeTheme !== null}
        pageSlug={slug ?? "u"}
      />

      {isEmptyState ? (
        /* Welcome hero for fresh installs — replaces empty stats grid */
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card/50 p-8 text-center lg:p-12">
          <div className="flex size-16 items-center justify-center rounded-full bg-violet/15">
            <Sparkles className="size-8 text-violet" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">
              Welcome to your dashboard
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your page is live at{" "}
              <a
                href={`/${slug ?? "u"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-violet underline"
              >
                /{slug ?? "u"}
              </a>
              . Add your first link to start collecting analytics.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/links"
              className="inline-flex items-center gap-2 rounded-lg bg-violet px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet/90"
            >
              <Plus className="size-4" /> Add your first link
            </Link>
            <Link
              href="/settings?tab=data"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <DownloadCloud className="size-4" /> Import your existing page
            </Link>
          </div>
        </div>
      ) : (
        <>
      {/* Header: title + range picker */}
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
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

      {/* Metric cards — fixed height, shrink-0 */}
      <div className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Views"
          value={stats.totalViews.toLocaleString()}
          icon={Eye}
          hint={`${stats.uniqueVisitors.toLocaleString()} unique visitors`}
          delta={{ current: stats.totalViews, previous: prevStats.totalViews }}
          spark={viewSpark}
        />
        <MetricCard
          label="Clicks"
          value={stats.totalClicks.toLocaleString()}
          icon={MousePointerClick}
          hint="Link clicks in range"
          delta={{ current: stats.totalClicks, previous: prevStats.totalClicks }}
          spark={clickSpark}
        />
        <MetricCard
          label="Click-through rate"
          value={`${stats.ctr}%`}
          icon={TrendingUp}
          hint="Clicks / views"
        />
        <MetricCard
          label="Active links"
          value={activeCount.toString()}
          icon={LinkIcon}
          hint={`${links.length} total`}
        />
      </div>

      {/* Middle section: chart fills full width */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 lg:overflow-hidden">
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex flex-col">
            <span className="font-heading text-base font-medium">
              Views over time
            </span>
            <span className="text-xs text-muted-foreground">
              Daily views and clicks
            </span>
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <ViewsChart data={stats.viewsPerDay} />
        </div>
      </div>

      {/* Bottom row: top links + referrers + devices + countries */}
      <div className="grid shrink-0 gap-3 lg:grid-cols-4">
        <ExpandableSection
          title="Top links"
          description={`${stats.topLinks.length} links with clicks`}
          compact={
            <Card className="h-full">
              <CardContent className="relative flex h-full flex-col gap-3">
                <Trophy
                  className="pointer-events-none absolute -bottom-6 -right-6 size-16 text-violet/8"
                  strokeWidth={1}
                />
                <div className="flex items-center justify-between">
                  <span className="font-heading text-sm font-medium">
                    Top links
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stats.topLinks.length}
                  </span>
                </div>
                <TopLinksList links={stats.topLinks} max={4} />
              </CardContent>
            </Card>
          }
          expanded={<TopLinksList links={stats.topLinks} />}
        />

        <ExpandableSection
          title="Top referrers"
          description="Where views came from"
          compact={
            <Card className="h-full">
              <CardContent className="relative flex h-full flex-col gap-3">
                <Share2
                  className="pointer-events-none absolute -bottom-6 -right-6 size-16 text-violet/8"
                  strokeWidth={1}
                />
                <div className="flex items-center justify-between">
                  <span className="font-heading text-sm font-medium">
                    Referrers
                  </span>
                </div>
                <BreakdownList
                  entries={breakdown.referrers}
                  total={refTotal}
                  showFavicons
                  max={4}
                />
              </CardContent>
            </Card>
          }
          expanded={
            <BreakdownList
              entries={breakdown.referrers}
              total={refTotal}
              showFavicons
            />
          }
        />

        <ExpandableSection
          title="Devices"
          description="Browser types"
          compact={
            <Card className="h-full">
              <CardContent className="relative flex h-full flex-col gap-3">
                <MonitorSmartphone
                  className="pointer-events-none absolute -bottom-6 -right-6 size-16 text-violet/8"
                  strokeWidth={1}
                />
                <div className="flex items-center justify-between">
                  <span className="font-heading text-sm font-medium">
                    Devices
                  </span>
                </div>
                <BreakdownList entries={breakdown.devices} total={devTotal} max={4} />
              </CardContent>
            </Card>
          }
          expanded={<BreakdownList entries={breakdown.devices} total={devTotal} />}
        />

        <ExpandableSection
          title="Countries"
          description="Visitor locations"
          compact={
            <Card className="h-full">
              <CardContent className="relative flex h-full flex-col gap-3">
                <Globe
                  className="pointer-events-none absolute -bottom-6 -right-6 size-16 text-violet/8"
                  strokeWidth={1}
                />
                <div className="flex items-center justify-between">
                  <span className="font-heading text-sm font-medium">
                    Countries
                  </span>
                </div>
                <BreakdownList entries={breakdown.countries} total={ctryTotal} max={4} />
              </CardContent>
            </Card>
          }
          expanded={<BreakdownList entries={breakdown.countries} total={ctryTotal} />}
        />
      </div>
        </>
      )}
    </div>
  );
}
