/**
 * Icon metadata + name resolution shared by admin picker and public renderer.
 *
 * The public page renders icons via
 * src/components/public/LucideIcon.tsx (server-side inline SVG); the admin
 * picker (src/app/(admin)/links/components/icon-picker.tsx) builds its
 * browsing catalog from the same map. Both resolve stored dashed names
 * ("shopping-bag") back to lucide's PascalCase keys through the map built
 * here — regex-only conversion breaks on acronym icons (ArrowDownAZ).
 */

import { icons } from "lucide-react";

// Category order = display order in the picker ("All" is prepended there).
export const ICON_CATEGORIES = [
  "General",
  "Communication",
  "Media",
  "Commerce",
  "Technology",
  "Nature & Food",
  "Status & Shapes",
] as const;

export type IconCategory = (typeof ICON_CATEGORIES)[number];

/** PascalCase key → canonical dashed name (acronym-aware). */
export function keyToIconName(key: string): string {
  return key
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([a-z])([0-9])/g, "$1-$2")
    .toLowerCase();
}

type IconComponent = React.ComponentType<{
  size?: number;
  className?: string;
  strokeWidth?: number;
  "aria-hidden"?: boolean;
}>;

export type { IconComponent };

/** dashed name → { key, Component }, built once per process. */
const RESOLVER: Map<string, { key: string; Component: IconComponent }> = (() => {
  const map = new Map<string, { key: string; Component: IconComponent }>();
  for (const [key, Component] of Object.entries(icons)) {
    map.set(keyToIconName(key), { key, Component: Component as unknown as IconComponent });
  }
  return map;
})();

/** Resolve a stored icon name to its lucide component. */
export function resolveIcon(name: string | null | undefined): IconComponent | undefined {
  if (!name) return undefined;
  return RESOLVER.get(name.trim())?.Component;
}

/** True when the stored string resolves to a real lucide icon. */
export function isLucideIconName(name: string | null | undefined): boolean {
  if (!name) return false;
  return RESOLVER.has(name.trim());
}

// Type-only import keeps React types available without a runtime dependency.
import type * as React from "react";
