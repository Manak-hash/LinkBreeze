"use client";

import * as React from "react";
import dynamic from "next/dynamic";

const ClicksChartInner = dynamic(
  () => import("./clicks-chart-inner").then((m) => m.ClicksChartInner),
  {
    ssr: false,
    loading: () => <div className="h-[200px]" />,
  },
);

interface ChartProps {
  data: Array<{ date: string; clicks: number }>;
}

/** Clicks-only area chart for the per-link drill-down. */
export function ClicksChart(props: ChartProps) {
  return <ClicksChartInner {...props} />;
}
