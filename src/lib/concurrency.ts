/**
 * Bounded-concurrency map (#95).
 *
 * Runs `worker` over `items` with at most `limit` tasks in flight,
 * returning results in input order — like `Promise.all(items.map(...))`
 * minus the thundering herd. Worker rejections propagate as soon as
 * they happen, same semantics as Promise.all.
 *
 * The migration wizard uses this to save imported links in small
 * batches: the unbounded Promise.all it replaced fired every link's
 * favicon chain at once and tripped upstream rate limits and timeouts.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  if (items.length === 0) return results;

  const safeLimit = Number.isFinite(limit) && limit >= 1 ? Math.floor(limit) : 1;
  const maxWorkers = Math.min(safeLimit, items.length);
  let cursor = 0;

  const run = async (): Promise<void> => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  };

  await Promise.all(Array.from({ length: maxWorkers }, () => run()));
  return results;
}
