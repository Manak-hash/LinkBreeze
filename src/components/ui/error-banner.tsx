"use client";

import { useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

/**
 * Inline error banner for form errors.
 *
 * Shows below or above a form when a server action returns an error.
 * Supports dismiss. Different styling per error code so users know
 * what kind of issue they're dealing with.
 */
type ErrorBannerProps = {
  message: string;
  errorCode?: string;
  onDismiss?: () => void;
};

const styles: Record<string, string> = {
  validation: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
  unauthorized: "border-orange-500/30 bg-orange-500/10 text-orange-200",
  forbidden: "border-orange-500/30 bg-orange-500/10 text-orange-200",
  demo: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  rate_limit: "border-purple-500/30 bg-purple-500/10 text-purple-200",
  not_found: "border-gray-500/30 bg-gray-500/10 text-gray-200",
  conflict: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
  internal: "border-red-500/30 bg-red-500/10 text-red-200",
};

export function ErrorBanner({ message, errorCode, onDismiss }: ErrorBannerProps) {
  useEffect(() => {
    // Auto-dismiss after 8 seconds for non-critical errors
    if (errorCode && !["internal", "unauthorized"].includes(errorCode)) {
      const timer = setTimeout(() => onDismiss?.(), 8000);
      return () => clearTimeout(timer);
    }
  }, [errorCode, onDismiss]);

  const styleClass = (errorCode && styles[errorCode]) || styles.internal;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${styleClass}`}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 opacity-60 transition hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
