"use client";

import * as React from "react";
import { subscribe } from "@/server/actions/subscribers";

/**
 * Progressive-enhancement email capture form.
 *
 * Renders as a plain POST form — works with JS disabled (server action handles
 * the submit). With JS, we intercept to show inline success/error feedback
 * without a page navigation.
 *
 * Colors come from theme tokens (CSS custom properties).
 * Pixel classes (lb-pixel-clip, lb-pixel-shadow) apply 8-bit clip-paths
 * when --lb-pixel is "1".
 */
export function EmailCapture() {
  const [pending, startTransition] = React.useTransition();
  const [status, setStatus] = React.useState<"idle" | "success" | "error">("idle");
  const [error, setError] = React.useState("");

  const handleSubmit = (formData: FormData) => {
    setStatus("idle");
    setError("");
    startTransition(async () => {
      const result = await subscribe(formData);
      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setError(result.error);
      }
    });
  };

  if (status === "success") {
    return (
      <p
        className="mb-2 mt-6 text-center text-sm"
        style={{ color: "var(--lb-accent)" }}
      >
        Thanks! You&apos;re on the list.
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="mb-2 mt-6 flex flex-col gap-2 sm:flex-row">
      <div className="lb-pixel-input-wrap relative flex-1">
        <input
          type="email"
          name="email"
          required
          maxLength={320}
          placeholder="your@email.com"
          aria-label="Email address"
          className="lb-pixel-input lb-pixel-clip w-full border bg-white/5 px-4 py-2.5 text-sm outline-none backdrop-blur-sm transition-colors focus:border-[var(--lb-accent)]"
          style={{
            color: "var(--lb-text)",
            borderRadius: "var(--lb-card-radius)",
            borderColor: "var(--lb-card-border)",
            borderWidth: "var(--lb-border-width)",
          }}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="lb-pixel-clip lb-pixel-shadow px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{
          background: "var(--lb-accent)",
          color: "var(--lb-card-bg)",
          border: "var(--lb-border-width) solid var(--lb-card-border)",
        }}
      >
        {pending ? "..." : "Subscribe"}
      </button>
      {status === "error" && error ? (
        <p className="text-xs text-destructive sm:absolute sm:mt-14">{error}</p>
      ) : null}
    </form>
  );
}
