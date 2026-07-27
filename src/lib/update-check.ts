import "server-only";

import { version as currentVersion } from "@/lib/version";
import { getSetting, updateSetting } from "@/server/queries";

/**
 * Update checker — polls a static JSON file for the latest release version.
 *
 * No GitHub API token needed, no rate limits, no user data sent.
 * The file is fetched from the repo's raw URL, cached for 24h in the DB.
 */

const VERSION_URL =
  "https://raw.githubusercontent.com/Manak-hash/LinkBreeze/main/latest-version.json";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface UpdateCheckResult {
  /** Whether an update is available */
  hasUpdate: boolean;
  /** Latest version from the remote file */
  latestVersion: string | null;
  /** Currently installed version */
  currentVersion: string;
  /** Release notes URL */
  releaseUrl: string | null;
  /** Human-readable release notes summary */
  notes: string | null;
  /** When the check was last performed (ISO string) */
  checkedAt: string;
}

interface RemoteVersionFile {
  version: string;
  releasedAt?: string;
  url?: string;
  notes?: string;
}

/**
 * Parse a semver string (e.g. "1.2.0") into comparable parts.
 * Returns null if unparseable.
 */
function parseSemver(v: string): [number, number, number] | null {
  const m = v.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/**
 * Compare two semver strings. Returns true if `latest` is newer than `current`.
 */
export function isNewerVersion(current: string, latest: string): boolean {
  const c = parseSemver(current);
  const l = parseSemver(latest);
  if (!c || !l) return false; // Can't parse — don't trigger false positives
  return (
    l[0] > c[0] ||
    (l[0] === c[0] && l[1] > c[1]) ||
    (l[0] === c[0] && l[1] === c[1] && l[2] > c[2])
  );
}

/**
 * Check for updates. Uses a 24h DB cache to avoid hammering the remote URL.
 *
 * Pass `forceRefresh: true` to bypass the cache (used for the manual "Check now" button).
 */
export async function checkForUpdates(
  forceRefresh = false,
): Promise<UpdateCheckResult> {
  // Check if update checks are disabled
  const enabled = await getSetting("updateCheckEnabled");
  if (enabled === "false" && !forceRefresh) {
    return {
      hasUpdate: false,
      latestVersion: null,
      currentVersion,
      releaseUrl: null,
      notes: null,
      checkedAt: new Date().toISOString(),
    };
  }

  // Check cache
  if (!forceRefresh) {
    const cached = await getSetting("lastUpdateCheckResult");
    const checkedAt = await getSetting("lastUpdateCheckAt");
    if (cached && checkedAt) {
      const age = Date.now() - new Date(checkedAt).getTime();
      if (age < CACHE_TTL_MS) {
        try {
          const data = JSON.parse(cached) as RemoteVersionFile;
          return {
            hasUpdate: isNewerVersion(currentVersion, data.version),
            latestVersion: data.version,
            currentVersion,
            releaseUrl: data.url ?? null,
            notes: data.notes ?? null,
            checkedAt,
          };
        } catch {
          // Stale/corrupt cache — fall through to live fetch
        }
      }
    }
  }

  // Live fetch
  try {
    const res = await fetch(VERSION_URL, {
      signal: AbortSignal.timeout(5000),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as RemoteVersionFile;

    // Validate the shape
    if (!data.version || !parseSemver(data.version)) {
      throw new Error("Invalid version format in remote file");
    }

    const checkedAt = new Date().toISOString();

    // Cache the result
    await updateSetting("lastUpdateCheckResult", JSON.stringify(data));
    await updateSetting("lastUpdateCheckAt", checkedAt);

    return {
      hasUpdate: isNewerVersion(currentVersion, data.version),
      latestVersion: data.version,
      currentVersion,
      releaseUrl: data.url ?? null,
      notes: data.notes ?? null,
      checkedAt,
    };
  } catch {
    // Network error, timeout, parse error — fail silently.
    // Return cached data if we have it, otherwise "no update".
    const cached = await getSetting("lastUpdateCheckResult");
    if (cached) {
      try {
        const data = JSON.parse(cached) as RemoteVersionFile;
        return {
          hasUpdate: isNewerVersion(currentVersion, data.version),
          latestVersion: data.version,
          currentVersion,
          releaseUrl: data.url ?? null,
          notes: data.notes ?? null,
          checkedAt: (await getSetting("lastUpdateCheckAt")) ?? new Date().toISOString(),
        };
      } catch {
        // fall through
      }
    }

    return {
      hasUpdate: false,
      latestVersion: null,
      currentVersion,
      releaseUrl: null,
      notes: null,
      checkedAt: new Date().toISOString(),
    };
  }
}

/**
 * Enable or disable update checks.
 */
export async function setUpdateCheckEnabled(enabled: boolean): Promise<void> {
  await updateSetting("updateCheckEnabled", enabled ? "true" : "false");
}

/**
 * Get the current update check setting.
 */
export async function isUpdateCheckEnabled(): Promise<boolean> {
  const val = await getSetting("updateCheckEnabled");
  return val !== "false"; // Default: enabled
}
