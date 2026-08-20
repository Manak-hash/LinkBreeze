/**
 * Client instrumentation — runs once in the browser before hydration.
 * Replacement for the inline <script> polyfill in app/layout.tsx (React 19
 * logs a console warning for script tags rendered inside components; the
 * same warning appeared in the Next.js dev overlay issue reports).
 *
 * Next.js 16.3.1 dev overlay bug (still present): when a tab is backgrounded
 * during load, browser timer throttling makes the hydration performance marks
 * land out of order, and the dev overlay's
 * `performance.measure(name, navigationStart, beforeRender)` call throws
 *   "TypeError: Failed to execute 'measure' on 'Performance':
 *    '<Page>' cannot have a negative time stamp"
 * on routes that redirect (e.g. /login -> /dashboard). The error is cosmetic
 * (it only kills metric logging) but surfaces as a red overlay that looks
 * like a real crash. This hardens `performance.measure` so a negative
 * duration is clamped to 0 instead of throwing. Framework PR merged
 * upstream; remove when a stable release carries it.
 */
const pm = performance.measure.bind(performance);
performance.measure = ((name: unknown, start?: unknown, end?: unknown) => {
  try {
    return pm(name as string, start as string, end as string);
  } catch {
    // Negative-duration measure (dev overlay timing bug) — return an empty
    // PerformanceMeasure so callers expecting an object don't crash on
    // property access.
    const label =
      typeof name === "string" ? name : String((name as { name?: string })?.name ?? name);
    return {
      name: label,
      entryType: "measure",
      startTime: 0,
      duration: 0,
      detail: null,
    } as PerformanceMeasure;
  }
}) as typeof performance.measure;
