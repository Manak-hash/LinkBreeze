"use client";

import * as React from "react";

interface ChartProps {
  data: Array<{ date: string; clicks: number }>;
  locale?: string;
}

/** BCP-47 tag for chart/date rendering, mapped from the active locale. */
function chartLocaleTag(locale: string | undefined): string {
  switch (locale) {
    case "fr": return "fr-FR";
    case "es": return "es-ES";
    case "zh": return "zh-CN";
    case "hi": return "hi-IN";
    case "ar": return "ar-MA"; // Latin digits forced below
    case "pt-BR": return "pt-BR";
    default: return "en";
  }
}

function formatDate(iso: string, locale: string | undefined): string {
  const d = new Date(iso + "T00:00:00Z");
  const tag = chartLocaleTag(locale);
  // All supported locales use Latin digits in LinkBreeze (per i18n policy).
  const nf = new Intl.DateTimeFormat(tag + "-u-nu-latn", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  return nf.format(d);
}

/** Inner chart. Loads recharts on demand via dynamic import. */
export function ClicksChartInner({ data, locale }: ChartProps) {
  const mod = React.use(
    React.useMemo(() => import("recharts"), []),
  );

  const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } = mod;

  const chartData = data.map((d) => ({ ...d, label: formatDate(d.date, locale) }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="clicksGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-4)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(27, 23, 56, 0.85)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 12,
              color: "var(--popover-foreground)",
              backdropFilter: "blur(12px)",
            }}
            labelStyle={{ color: "var(--muted-foreground)" }}
          />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="var(--chart-4)"
            strokeWidth={2}
            fill="url(#clicksGrad2)"
            name="Clicks"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
