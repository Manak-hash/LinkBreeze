"use client";

import * as React from "react";

/**
 * Client-side link search box.
 *
 * Rendered only when `linkSearch` is enabled in page settings.
 * Styled to match the link cards (same CSS variables: --lb-card-bg,
 * --lb-card-border, --lb-card-radius, --lb-blur, --lb-text, --lb-border-width).
 * Filters visible `.lb-link-item` elements by their data-title and
 * data-description attributes without any server round-trips.
 */
export function LinkSearch({ groupId }: { groupId?: number }) {
  const [query, setQuery] = React.useState("");

  const filterLinks = (q: string) => {
    const normalized = q.trim().toLowerCase();
    const selector = groupId !== undefined ? `.lb-link-item[data-group-id="${groupId}"]` : ".lb-link-item";
    const items = document.querySelectorAll<HTMLElement>(selector);
    items.forEach((item) => {
      const title = (item.dataset.title ?? "").toLowerCase();
      const desc = (item.dataset.description ?? "").toLowerCase();
      const match = !normalized || title.includes(normalized) || desc.includes(normalized);
      item.style.display = match ? "" : "none";
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    filterLinks(q);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
        marginBottom: "var(--lb-spacing, 12px)",
      }}
    >
      {/* Search icon — uses lb-text with explicit opacity so it's always visible */}
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          position: "absolute",
          left: "var(--lb-btn-padding-x, 14px)",
          top: "50%",
          transform: "translateY(-50%)",
          opacity: 0.55,
          pointerEvents: "none",
          flexShrink: 0,
          zIndex: 1,
          color: "var(--lb-text, #eaeaea)",
        }}
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>

      <input
        id="lb-link-search"
        type="search"
        value={query}
        onChange={handleChange}
        placeholder="Search links…"
        autoComplete="off"
        spellCheck={false}
        aria-label="Search links"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "var(--lb-btn-padding-y, 14px) var(--lb-btn-padding-x, 14px) var(--lb-btn-padding-y, 14px) calc(var(--lb-btn-padding-x, 14px) + 24px)",
          /* Pill shape makes it distinct from cards */
          borderRadius: "9999px",
          /* Subtle border/bg based on text color, distinct from card background */
          border: "1px solid color-mix(in oklch, var(--lb-text, #eaeaea) 12%, transparent)",
          background: "color-mix(in oklch, var(--lb-text, #eaeaea) 4%, transparent)",
          backdropFilter: "blur(var(--lb-blur, 8px))",
          WebkitBackdropFilter: "blur(var(--lb-blur, 8px))",
          color: "var(--lb-text, #eaeaea)",
          fontSize: "var(--lb-font-size, 0.95rem)",
          fontFamily: "var(--lb-font, inherit)",
          fontWeight: "var(--lb-font-weight, 600)" as React.CSSProperties["fontWeight"],
          letterSpacing: "var(--lb-letter-spacing, 0)",
          outline: "none",
          transition: "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
          /* Remove browser default search-cancel button */
          appearance: "none" as React.CSSProperties["appearance"],
          WebkitAppearance: "none" as React.CSSProperties["WebkitAppearance"],
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--lb-accent, var(--lb-card-border))";
          e.target.style.background = "color-mix(in oklch, var(--lb-text, #eaeaea) 6%, transparent)";
          e.target.style.boxShadow =
            "0 0 0 3px color-mix(in oklch, var(--lb-accent, currentColor) 20%, transparent)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "color-mix(in oklch, var(--lb-text, #eaeaea) 12%, transparent)";
          e.target.style.background = "color-mix(in oklch, var(--lb-text, #eaeaea) 4%, transparent)";
          e.target.style.boxShadow = "";
        }}
      />

      {/* Clear button */}
      {query ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery("");
            filterLinks("");
          }}
          style={{
            position: "absolute",
            right: "var(--lb-btn-padding-x, 14px)",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--lb-text, #eaeaea)",
            opacity: 0.55,
            padding: "2px",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
