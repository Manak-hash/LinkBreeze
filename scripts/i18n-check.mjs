/**
 * i18n drift guard.
 *
 * tsc proves every locale file has every KEY (shape parity). It cannot
 * prove the VALUES are still in sync with the English source — someone
 * edits en.ts, and fr.ts silently serves stale text.
 *
 * This script hashes en.ts's string values and compares against the
 * `lastSyncedHash:` comment each locale file must carry in its header.
 *
 * Usage:
 *   npm run i18n:check          → fail (exit 1) if any locale is stale
 *   npm run i18n:check -- --update   → rewrite the hash comments (run
 *                                      after syncing translations)
 *   npm run i18n:check -- --hash     → print the current en.ts hash only
 *
 * The hash is stable across formatting: it parses the AST-ish token stream
 * of quoted strings in key order, so reformatting en.ts does NOT bump it,
 * but any value/key change does.
 */
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, "..", "src", "locales");
const EN_FILE = path.join(LOCALES_DIR, "en.ts");
const HASH_RE = /lastSyncedHash:\s*([0-9a-f]+)/;

/** Extract a canonical string fingerprint from a .ts dictionary file. */
function fingerprint(file) {
  const src = fs.readFileSync(file, "utf8");
  // Grab every `key: "value"` pair (handles single/double quotes, template
  // literals without interpolation). ICU braces are kept verbatim.
  const pairs = [];
  const re = /([A-Za-z0-9_]+)\s*:\s*(["'`])((?:\\.|(?!\2).)*)\2/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    // Skip the status marker and non-message keys like path/src comments.
    if (m[1] === "status") continue;
    pairs.push(`${m[1]}\u0000${m[3]}`);
  }
  return crypto
    .createHash("sha256")
    .update(pairs.join("\u0001"))
    .digest("hex")
    .slice(0, 12);
}

const enHash = fingerprint(EN_FILE);

if (process.argv.includes("--hash")) {
  console.log(enHash);
  process.exit(0);
}

const localeFiles = fs
  .readdirSync(LOCALES_DIR)
  .filter((f) => /^([a-z]{2}(-[A-Z]{2})?)\.ts$/.test(f) && f !== "en.ts");

const update = process.argv.includes("--update");
let stale = [];

for (const file of localeFiles) {
  const full = path.join(LOCALES_DIR, file);
  const src = fs.readFileSync(full, "utf8");
  const m = src.match(HASH_RE);

  if (!m) {
    console.error(`✗ ${file}: missing "lastSyncedHash:" header comment`);
    stale.push(file);
    continue;
  }
  if (m[1] !== enHash) {
    if (update) {
      fs.writeFileSync(
        full,
        src.replace(HASH_RE, `lastSyncedHash: ${enHash}`),
      );
      console.log(`↻ ${file}: hash updated to ${enHash}`);
    } else {
      console.error(
        `✗ ${file}: stale (has ${m[1]}, en.ts is ${enHash}) — re-sync translations, then run: npm run i18n:check -- --update`,
      );
      stale.push(file);
    }
  } else {
    console.log(`✓ ${file}: in sync`);
  }
}

if (stale.length && !update) {
  console.error(
    `\n${stale.length} locale file(s) out of sync with src/locales/en.ts.`,
  );
  process.exit(1);
}
if (update) console.log(`\nAll locale hashes now ${enHash}.`);
