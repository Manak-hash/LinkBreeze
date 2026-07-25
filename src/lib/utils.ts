import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Coerce a loose boolean-ish value (from form submissions, DB, or query strings)
 * into an actual boolean. Handles: true, "true", "on", "1", 1.
 */
export function truthy(v: unknown): boolean {
  return v === true || v === "true" || v === "on" || v === 1 || v === "1";
}
