"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Link2, User, Palette, X } from "lucide-react";

interface OnboardingChecklistProps {
  hasLinks: boolean;
  hasDisplayName: boolean;
  hasTheme: boolean;
}

interface ChecklistItem {
  id: string;
  label: string;
  href: string;
  icon: typeof Link2;
  done: boolean;
}

export function OnboardingChecklist({
  hasLinks,
  hasDisplayName,
  hasTheme,
}: OnboardingChecklistProps) {
  // Lazy initializer — reads localStorage once on first render without
  // triggering a setState-in-effect. Falls back to false during SSR.
  const [dismissed, setDismissed] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("lb-onboarding-dismissed") === "true";
  });

  // Auto-dismiss when all steps are complete. We use a ref to ensure
  // localStorage is written only once (not on every re-render).
  const autoDismissedRef = React.useRef(false);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("lb-onboarding-dismissed", "true");
  };

  const items: ChecklistItem[] = [
    {
      id: "profile",
      label: "Set your name and bio",
      href: "/profile",
      icon: User,
      done: hasDisplayName,
    },
    {
      id: "theme",
      label: "Pick a theme",
      href: "/theme",
      icon: Palette,
      done: hasTheme,
    },
    {
      id: "links",
      label: "Add your first link",
      href: "/links",
      icon: Link2,
      done: hasLinks,
    },
  ];

  const completedCount = items.filter((i) => i.done).length;
  const allDone = completedCount === items.length;

  // Auto-dismiss when all 3 steps are done.
  React.useEffect(() => {
    if (allDone && !dismissed && !autoDismissedRef.current) {
      autoDismissedRef.current = true;
      setDismissed(true);
      localStorage.setItem("lb-onboarding-dismissed", "true");
    }
  }, [allDone, dismissed]);

  // Hide if dismissed.
  if (dismissed) return null;

  const pct = Math.round((completedCount / items.length) * 100);

  return (
    <div className="relative overflow-hidden rounded-xl border border-violet/25 bg-violet/5 p-4">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>

      <div className="mb-3">
        <h2 className="font-heading text-sm font-semibold">
          Getting started
        </h2>
        <p className="text-xs text-muted-foreground">
          {completedCount === 0
            ? "A few steps to get your page ready."
            : `${completedCount} of ${items.length} done — keep going!`}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-violet transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="flex flex-col gap-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/50"
            >
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                  item.done
                    ? "border-violet bg-violet text-white"
                    : "border-border text-muted-foreground"
                }`}
              >
                {item.done ? (
                  <Check className="size-3" strokeWidth={3} />
                ) : (
                  <Icon className="size-3" />
                )}
              </span>
              <span
                className={
                  item.done
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
