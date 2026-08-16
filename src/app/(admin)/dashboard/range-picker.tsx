"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const RANGES = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
] as const;

/** Segmented range control. Preserves the current route via window.location,
 *  so it works on both /dashboard and /links/[id]. */
export function RangePicker({ current }: { current: string }) {
  const router = useRouter();

  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5">
      {RANGES.map((r) => {
        const active = current === r.value;
        return (
          <button
            key={r.value}
            type="button"
            aria-pressed={active}
            onClick={() => router.push(`${window.location.pathname}?range=${r.value}`)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-[var(--aurora-grad)] text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
