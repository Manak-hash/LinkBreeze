/**
 * Demo mode guard wrapper for server actions.
 *
 * Replaces the ad-hoc `demoBlock()` + `if (demo) return ...` pattern that was
 * duplicated at the top of every mutation action. Now actions use:
 *
 *   const blocked = demoGuard();
 *   if (blocked) return blocked;
 *
 * Or more commonly, actions call `demoGuard()` at the top and return its
 * result if non-null — same behavior, centralized in one place.
 */
import { demoBlock } from "@/lib/demo";
import { demoError, type ActionError } from "@/lib/errors";

/**
 * Check if demo mode blocks the current action.
 * Returns an error ActionResult if demo mode is active, null otherwise.
 */
export function demoGuard(): ActionError | null {
  const demo = demoBlock();
  if (demo) return demoError();
  return null;
}
