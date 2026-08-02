"use client";

import * as React from "react";

/**
 * Detects whether the public page is rendering inside the admin preview
 * iframe. If so, adds `lb-embedded` to <body> so globals.css can hide
 * the scrollbar — the phone frame handles its own scroll affordance.
 */
export function EmbeddedDetector() {
  React.useEffect(() => {
    let added = false;
    try {
      if (window.self !== window.top) {
        document.body.classList.add("lb-embedded");
        added = true;
      }
    } catch {
      // Cross-origin access to window.top throws — treat as embedded
      document.body.classList.add("lb-embedded");
      added = true;
    }
    return () => {
      if (added) document.body.classList.remove("lb-embedded");
    };
  }, []);
  return null;
}
