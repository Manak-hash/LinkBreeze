"use client";

import * as React from "react";
import dynamic from "next/dynamic";

const ViewsChartInner = dynamic(
  () => import("./views-chart-inner").then((m) => m.ViewsChartInner),
  {
    ssr: false,
    loading: () => <div className="h-[200px]" />,
  },
);

interface ChartProps {
  data: Array<{ date: string; views: number; clicks: number }>;
}

export function ViewsChart(props: ChartProps) {
  return <ViewsChartInner {...props} />;
}
