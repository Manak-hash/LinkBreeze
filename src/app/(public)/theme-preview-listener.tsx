"use client";

/**
 * ThemePreviewListener — listens for postMessage events from a parent window
 * and applies ephemeral theme changes (CSS variable overrides) to the document.
 *
 * Used when the public page is embedded in an iframe on the marketing site.
 * The parent sends { type: "lb-theme-preview", cssVars } to switch themes
 * instantly without persisting to the database. Reload = back to normal.
 *
 * Gated by DEMO_MODE — only active on demo instances.
 */
import * as React from "react";

export function ThemePreviewListener() {
  React.useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return;

    const styleId = "lb-theme-preview-overrides";

    function handleMessage(event: MessageEvent) {
      // Only accept messages from parent (marketing site)
      if (event.source !== window.parent) return;

      const data = event.data;
      if (!data || typeof data !== "object") return;

      const el = document.getElementById(styleId);

      if (data.type === "lb-theme-preview" && data.cssVars) {
        // Build CSS variable declarations
        const declarations = Object.entries(data.cssVars)
          .map(([k, v]) => `${k}: ${v} !important;`)
          .join("\n");

        // Include keyframes if provided (animated backgrounds)
        const keyframes = data.keyframes || "";

        const css = `:root {\n${declarations}\n}`;

        if (el) {
          el.textContent = css + keyframes;
        } else {
          const style = document.createElement("style");
          style.id = styleId;
          style.textContent = css + keyframes;
          document.head.appendChild(style);
        }
      } else if (data.type === "lb-theme-reset") {
        if (el) {
          el.remove();
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}
