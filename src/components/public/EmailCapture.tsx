"use client";

import * as React from "react";
import { subscribe } from "@/server/actions/subscribers";

/**
 * Progressive-enhancement email capture form.
 *
 * Renders as a plain POST form — works with JS disabled (server action handles
 * the submit). With JS, we intercept to show inline success/error feedback
 * without a page navigation.
 */
export function EmailCapture({ accentColor, textColor }: { accentColor: string; textColor: string }) {
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
        className="mt-6 mb-2 text-center text-sm"
        style={{ color: accentColor }}
      >
        Thanks! You're on the list.
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="mt-6 mb-2 flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        name="email"
        required
        maxLength={320}
        placeholder="your@email.com"
        aria-label="Email address"
        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none backdrop-blur-sm transition-colors focus:border-[var(--accent)]"
        style={{ color: textColor }}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: accentColor, color: "#fff" }}
      >
        {pending ? "…" : "Subscribe"}
      </button>
      {status === "error" && error ? (
        <p className="text-xs text-red-400 sm:absolute sm:mt-14">{error}</p>
      ) : null}
    </form>
  );
}
