"use client";

import * as React from "react";
import { UpdateBanner } from "@/components/admin/UpdateBanner";
import { refreshUpdateCheck } from "@/server/actions/update-check";
import type { UpdateCheckResult } from "@/lib/update-check";

interface UpdateCheckerProps {
  initialResult: UpdateCheckResult;
}

export function UpdateChecker({ initialResult }: UpdateCheckerProps) {
  const [result, setResult] = React.useState(initialResult);
  const [dismissed, setDismissed] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const fresh = await refreshUpdateCheck();
      setResult(fresh);
      setDismissed(false); // Re-show if a new version appeared
    } finally {
      setRefreshing(false);
    }
  };

  if (dismissed) return null;

  return (
    <UpdateBanner
      result={result}
      onDismiss={() => setDismissed(true)}
      onRefresh={handleRefresh}
      refreshing={refreshing}
    />
  );
}
