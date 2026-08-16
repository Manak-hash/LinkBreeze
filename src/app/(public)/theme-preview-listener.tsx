"use client";

/**
 * ThemePreviewListener — listens for postMessage from the parent window
 * and applies ephemeral theme changes to the document.
 *
 * Receives:
 * - css: complete CSS string (variables + structural overrides + background)
 * - linkStyle: "pixel" to add lb-pixel-mode class, or null to remove it
 *
 * Reload = back to normal.
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
      const main = document.getElementById("lb-main");

      if (data.type === "lb-theme-preview" && data.css) {
        // Inject CSS
        if (el) {
          el.textContent = data.css;
        } else {
          const style = document.createElement("style");
          style.id = styleId;
          style.textContent = data.css;
          document.head.appendChild(style);
        }

        // Toggle mode classes on <main> (pixel: clip-path borders; gel: gel bubble)
        if (main) {
          if (data.linkStyle === "pixel") {
            main.classList.add("lb-pixel-mode");
          } else {
            main.classList.remove("lb-pixel-mode");
          }
          if (data.linkStyle === "gel") {
            main.classList.add("lb-gel-mode");
          } else {
            main.classList.remove("lb-gel-mode");
          }
        }
      } else if (data.type === "lb-theme-reset") {
        if (el) el.remove();
        if (main) {
          main.classList.remove("lb-pixel-mode");
          main.classList.remove("lb-gel-mode");
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}
