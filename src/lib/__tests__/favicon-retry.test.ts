import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

/**
 * #95: the favicon chain retries once before falling back to the letter.
 * Stubs global fetch (no network) and points UPLOAD_DIR at a throwaway
 * temp dir. UPLOADS_DIR is resolved at module load, so each test
 * re-imports @/lib/favicon after resetModules with the env set.
 */

// Real favicon-shaped PNG buffer (well over the 100-byte size filter).
const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // PNG magic
  Buffer.alloc(200, 0x61),
]);

function pngResponse(): Response {
  return new Response(PNG, {
    status: 200,
    headers: { "content-type": "image/png" },
  });
}

function htmlResponse(): Response {
  return new Response(
    '<html><head><link rel="icon" href="/icon.png"></head></html>',
    { status: 200, headers: { "content-type": "text/html" } },
  );
}

function errResponse(): Response {
  return new Response("err", { status: 500 });
}

function domainHash(domain: string): string {
  return crypto.createHash("sha256").update(domain).digest("hex").slice(0, 16);
}

let tmpDir: string;

async function loadFavicon() {
  const mod = await import("@/lib/favicon");
  return mod.fetchAndCacheFavicon;
}

describe("fetchAndCacheFavicon retry behavior (#95)", () => {
  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "lb-favicon-"));
    process.env.UPLOAD_DIR = tmpDir;
    vi.resetModules();
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    delete process.env.UPLOAD_DIR;
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it("retries once when the first chain attempt fails transiently", async () => {
    // Per-URL call counters: the page HTML fails on the first chain and
    // succeeds on the retry; the icon URL always serves a PNG.
    const calls = new Map<string, number>();
    const pageUrl = "https://retry-example.test";
    const iconUrl = "https://retry-example.test/icon.png";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        const n = (calls.get(url) ?? 0) + 1;
        calls.set(url, n);
        if (url === pageUrl) return n >= 2 ? htmlResponse() : errResponse();
        if (url === iconUrl) return pngResponse();
        return errResponse();
      }),
    );

    const fetchAndCacheFavicon = await loadFavicon();
    const result = await fetchAndCacheFavicon(pageUrl);

    expect(result).toBe(`/api/uploads/favicon-${domainHash("retry-example.test")}.png`);
    // The HTML page was fetched twice: initial chain + retry.
    expect(calls.get(pageUrl)).toBe(2);
  });

  it("gives up after exactly one retry when the site is dead", async () => {
    const fetchMock = vi.fn(async () => errResponse());
    vi.stubGlobal("fetch", fetchMock);

    const fetchAndCacheFavicon = await loadFavicon();
    const result = await fetchAndCacheFavicon("https://dead-example.test");

    expect(result).toBeNull();
    // First chain: HTML head (1) + common paths (5) + DuckDuckGo (1) = 7
    // fetches; the retry chain repeats exactly those 7 — no third attempt.
    expect(fetchMock).toHaveBeenCalledTimes(14);
  });

  it("does not fetch (or retry) on a cache hit", async () => {
    const domain = "cached-example.test";
    await fs.writeFile(path.join(tmpDir, `favicon-${domainHash(domain)}.png`), PNG);

    const fetchMock = vi.fn(async () => errResponse());
    vi.stubGlobal("fetch", fetchMock);

    const fetchAndCacheFavicon = await loadFavicon();
    const result = await fetchAndCacheFavicon(`https://${domain}/some/page`);

    expect(result).toBe(`/api/uploads/favicon-${domainHash(domain)}.png`);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
