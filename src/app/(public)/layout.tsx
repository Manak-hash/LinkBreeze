import * as React from "react";
import { EmbeddedDetector } from "./embedded-detector";

/**
 * Minimal layout for public link pages. The root layout already provides
 * <html>/<body>, so this is intentionally a thin wrapper that resets margins
 * and allows full-bleed theming.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full">
      <EmbeddedDetector />
      {children}
    </div>
  );
}
