"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

/**
 * Success toast for confirmed actions.
 *
 * Lightweight toast that slides in from the bottom-right and auto-dismisses.
 * Used after successful form submissions (link created, profile saved, etc.).
 */
type SuccessToastProps = {
  message: string;
  onDismiss?: () => void;
  duration?: number;
};

export function SuccessToast({ message, onDismiss, duration = 3000 }: SuccessToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss?.(), duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200 shadow-lg backdrop-blur"
    >
      <CheckCircle2 className="size-4 shrink-0" />
      <p>{message}</p>
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
