"use client";

import { RotateCcw } from "lucide-react";

/**
 * Public route error boundary.
 *
 * If the public link page crashes (bad theme render, corrupted data), show
 * a minimal fallback so visitors never see a raw error page. No admin
 * styling — this is the public face.
 */
export default function PublicError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
        textAlign: "center",
        padding: "2rem",
        backgroundColor: "#0a0a0a",
        color: "#eaeaea",
      }}
    >
      <h2 style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>
        This page could not be loaded
      </h2>
      <p
        style={{
          fontSize: "0.875rem",
          color: "#a0a0a0",
          marginBottom: "1.5rem",
          maxWidth: "24rem",
        }}
      >
        Something went wrong while loading this page. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
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
        <RotateCcw size={16} />
        Try again
      </button>
    </div>
  );
}
