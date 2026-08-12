"use client";

/**
 * ThemePreviewListener — listens for postMessage from the parent window
 * and applies ephemeral theme changes to the document.
 *
 * Receives a complete CSS string from the marketing site that includes:
 * 1. CSS variable overrides (--lb-accent, --lb-card-bg, etc.)
 * 2. Structural overrides per linkStyle (pixel clip-path, neon glow, etc.)
 * 3. Background override
 * 4. Font face overrides
 *
 * The parent computes ALL of this because it has the theme presets.
 * This listener just injects the CSS. Reload = back to normal.
 */
import * as React from "react";

export function ThemePreviewListener() {
  React.useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return;

    const styleId = "lb-theme-preview-overrides";

    function handleMessage(event: MessageEvent) {
      if (event.source !== window.parent) return;

      const data = event.data;
      if (!data || typeof data !== "object") return;

      const el = document.getElementById(styleId);

      if (data.type === "lb-theme-preview" && data.css) {
        if (el) {
          el.textContent = data.css;
        } else {
          const style = document.createElement("style");
          style.id = styleId;
          style.textContent = data.css;
          document.head.appendChild(style);
        }
      } else if (data.type === "lb-theme-reset") {
        if (el) el.remove();
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}
