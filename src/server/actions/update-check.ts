"use server";

import { checkForUpdates, setUpdateCheckEnabled } from "@/lib/update-check";

/**
 * Manual refresh — bypasses the 24h cache.
 */
export async function refreshUpdateCheck() {
  return checkForUpdates(true);
}

/**
 * Toggle update checks on/off.
 */
export async function toggleUpdateCheck(enabled: boolean): Promise<void> {
  await setUpdateCheckEnabled(enabled);
}
