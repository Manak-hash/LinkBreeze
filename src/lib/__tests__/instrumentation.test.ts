import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

/**
 * Regression tests for the bare `docker run` 500 error.
 *
 * Bug: Without SECRET_KEY in the environment, getSecret() threw FATAL in
 * production mode, causing every login/setup to 500. The fix: ensureSecretKey()
 * in instrumentation.ts auto-generates and persists a key on first boot.
 *
 * If someone removes ensureSecretKey() or breaks the logic, these tests fail.
 */
describe("ensureSecretKey (instrumentation bootstrap)", () => {
  let tmpDir: string;
  let originalSecret: string | undefined;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "lb-secret-test-"));
    originalSecret = process.env.SECRET_KEY;
    delete process.env.SECRET_KEY;
  });

  afterEach(() => {
    if (originalSecret !== undefined) {
      process.env.SECRET_KEY = originalSecret;
    } else {
      delete process.env.SECRET_KEY;
    }
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("generates and persists a new key when SECRET_KEY is absent", async () => {
    process.env.DATABASE_PATH = path.join(tmpDir, "linkbreeze.db");

    const { ensureSecretKey } = await import("@/instrumentation");
    await ensureSecretKey();

    // Key is set in the environment
    expect(process.env.SECRET_KEY).toBeDefined();
    expect(process.env.SECRET_KEY!.length).toBeGreaterThanOrEqual(32);

    // Key file persisted to disk
    const keyFile = path.join(tmpDir, ".secret-key");
    expect(fs.existsSync(keyFile)).toBe(true);
    const fileContent = fs.readFileSync(keyFile, "utf8").trim();
    expect(fileContent).toBe(process.env.SECRET_KEY);
  });

  it("loads an existing key from the persisted file on subsequent boots", async () => {
    process.env.DATABASE_PATH = path.join(tmpDir, "linkbreeze.db");

    // First boot — generates a key
    vi.resetModules();
    const mod1 = await import("@/instrumentation");
    await mod1.ensureSecretKey();
    const firstKey = process.env.SECRET_KEY!;

    // Simulate a container restart: env reset, but file persists
    delete process.env.SECRET_KEY;
    vi.resetModules();
    const mod2 = await import("@/instrumentation");
    await mod2.ensureSecretKey();

    // Same key loaded from file — not a new one
    expect(process.env.SECRET_KEY).toBe(firstKey);
  });

  it("does not override an existing SECRET_KEY from the environment", async () => {
    process.env.SECRET_KEY = "user-provided-secret-key-from-docker-compose";
    process.env.DATABASE_PATH = path.join(tmpDir, "linkbreeze.db");

    const { ensureSecretKey } = await import("@/instrumentation");
    await ensureSecretKey();

    // Env var takes priority — no file should be created
    expect(process.env.SECRET_KEY).toBe(
      "user-provided-secret-key-from-docker-compose",
    );
    expect(fs.existsSync(path.join(tmpDir, ".secret-key"))).toBe(false);
  });

  it("generates a different key each time no file exists", async () => {
    process.env.DATABASE_PATH = path.join(tmpDir, "linkbreeze.db");

    // First boot
    vi.resetModules();
    const mod1 = await import("@/instrumentation");
    await mod1.ensureSecretKey();
    const key1 = process.env.SECRET_KEY!;

    // Delete the file and reset env — second boot on a fresh volume
    fs.unlinkSync(path.join(tmpDir, ".secret-key"));
    delete process.env.SECRET_KEY;
    vi.resetModules();
    const mod2 = await import("@/instrumentation");
    await mod2.ensureSecretKey();
    const key2 = process.env.SECRET_KEY!;

    // Keys are different (random generation)
    expect(key1).not.toBe(key2);
  });
});
