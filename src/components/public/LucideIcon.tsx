import * as React from "react";
import { resolveIcon, isLucideIconName, type IconComponent } from "@/lib/icon-registry";

export { isLucideIconName };

/**
 * Public-page icon renderer.
 *
 * Sections (and later links) store an icon as a dashed lucide name
 * ("rocket", "shopping-bag"). Values that don't resolve to a known icon are
 * legacy emoji/text from before 1.3 — callers render those as-is.
 *
 * Server Component only: renders inline SVG with `currentColor`, inheriting
 * the theme's text color. No client JS, no external requests.
 */
export function LucideIcon({
  name,
  size = 20,
  className,
  strokeWidth = 2,
}: {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const Component = resolveIcon(name);

  if (!Component) return null;

  return <IconSvg Component={Component} size={size} className={className} strokeWidth={strokeWidth} />;
}

/** Renders the resolved lucide component (lint-stable wrapper). */
function IconSvg({
  Component,
  size,
  className,
  strokeWidth,
}: {
  Component: IconComponent;
  size: number;
  className?: string;
  strokeWidth: number;
}) {
  return (
    <Component
      aria-hidden={true}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}
