/**
 * Tiny in-memory fixed-window rate limiter.
 *
 * Correct for a single-instance self-hosted deploy. State is NOT shared across
 * instances and is lost on restart — acceptable for LinkBreeze's deployment
 * target. Swap for Redis/backing store if you ever scale horizontally.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Guard so a hostile client can't grow the map without bound.
const MAX_KEYS = 10_000;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Epoch ms when the current window resets. */
  resetAt: number;
}

/**
 * Consumes one token from `key`'s window. Returns `ok: false` (→ HTTP 429)
 * once `limit` is exceeded within `windowMs`.
 */
/** Configurable: how often to run a cleanup sweep of expired buckets. */
const CLEANUP_INTERVAL_MS = 30_000;
let lastCleanup = 0;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();

  // Proactive cleanup: sweep expired entries periodically (not just on overflow)
  // so the map doesn't grow unboundedly with unique IPs under the MAX_KEYS threshold.
  if (now - lastCleanup > CLEANUP_INTERVAL_MS && buckets.size > 100) {
    lastCleanup = now;
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }

  let bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;

  if (buckets.size > MAX_KEYS) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }

  return { ok: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}
