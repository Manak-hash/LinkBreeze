"use client";

import { useEffect } from "react";

/**
 * Global error boundary — catches errors that escape route-level boundaries.
 *
 * This replaces the entire <html> and <body>, so it must include its own
 * minimal HTML shell. Keep it dependency-free (no Tailwind classes, no icons)
 * because the global error could be caused by a CSS/JS loading failure.
 *
 * https://nextjs.org/docs/app/api-reference/file-conventions/error#global-error
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error-boundary]", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            fontFamily: "system-ui, -apple-system, sans-serif",
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "#0a0a0a",
            color: "#eaeaea",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
            Something went wrong
          </h2>
          <p
            style={{
              maxWidth: "28rem",
              fontSize: "0.875rem",
              color: "#a0a0a0",
              marginBottom: "1.5rem",
            }}
          >
            A critical error occurred. Try reloading the page. If the problem
            persists, restart the container or check the server logs.
          </p>
          {error.digest && (
            <p
              style={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                color: "#666",
                marginBottom: "1.5rem",
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.5rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: "1px solid #333",
              borderRadius: "0.5rem",
              backgroundColor: "transparent",
              color: "#eaeaea",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
