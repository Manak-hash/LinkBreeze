"use client";

import * as React from "react";
import { ArrowUpCircle, X, RefreshCw } from "lucide-react";
import type { UpdateCheckResult } from "@/lib/update-check";
import { Button } from "@/components/ui/button";

interface UpdateBannerProps {
  result: UpdateCheckResult;
  onDismiss: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export function UpdateBanner({ result, onDismiss, onRefresh, refreshing }: UpdateBannerProps) {
  if (!result.hasUpdate) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <ArrowUpCircle className="size-5 shrink-0 text-warning" />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">
            LinkBreeze v{result.latestVersion} is available
          </span>
          <span className="text-xs text-muted-foreground">
            You&apos;re running v{result.currentVersion}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {result.releaseUrl ? (
          <a
            href={result.releaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            View release notes
          </a>
        ) : null}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Check again"
        >
          <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDismiss}
          aria-label="Dismiss update notification"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
