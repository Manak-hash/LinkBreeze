import { describe, it, expect } from "vitest";
import { mapWithConcurrency } from "@/lib/concurrency";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("mapWithConcurrency", () => {
  it("returns results in input order regardless of completion order", async () => {
    // Workers finish out of order (earlier items sleep longer).
    const results = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (n) => {
      await delay(30 - n * 5);
      return n * 10;
    });
    expect(results).toEqual([10, 20, 30, 40, 50]);
  });

  it("never exceeds the concurrency limit", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    await mapWithConcurrency(Array.from({ length: 10 }, (_, i) => i), 3, async (n) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await delay(5);
      inFlight--;
      return n;
    });
    expect(maxInFlight).toBe(3);
  });

  it("runs all items and resolves them all", async () => {
    const seen: number[] = [];
    await mapWithConcurrency([1, 2, 3, 4, 5, 6], 2, async (n) => {
      seen.push(n);
      return n;
    });
    expect(seen.length).toBe(6);
  });

  it("actually runs concurrently (limit > 1 is faster than serial)", async () => {
    const start = Date.now();
    await mapWithConcurrency([1, 2, 3, 4], 4, () => delay(30));
    const elapsed = Date.now() - start;
    // Serial would be >= 120ms; 4-wide must finish well under that.
    expect(elapsed).toBeLessThan(100);
  });

  it("handles an empty list without starting workers", async () => {
    let started = 0;
    const results = await mapWithConcurrency([], 3, async (n) => {
      started++;
      return n;
    });
    expect(results).toEqual([]);
    expect(started).toBe(0);
  });

  it("handles limit larger than the item count", async () => {
    const results = await mapWithConcurrency([1, 2], 10, async (n) => n + 1);
    expect(results).toEqual([2, 3]);
  });

  it("clamps invalid limits to one worker (serial)", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    await mapWithConcurrency([1, 2, 3], 0, async (n) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await delay(2);
      inFlight--;
      return n;
    });
    expect(maxInFlight).toBe(1);
  });

  it("propagates worker rejections like Promise.all", async () => {
    await expect(
      mapWithConcurrency([1, 2, 3], 2, async (n) => {
        if (n === 2) throw new Error("boom");
        return n;
      }),
    ).rejects.toThrow("boom");
  });

  it("passes the index to the worker", async () => {
    const results = await mapWithConcurrency(["a", "b", "c"], 2, async (s, i) => `${s}${i}`);
    expect(results).toEqual(["a0", "b1", "c2"]);
  });
});
