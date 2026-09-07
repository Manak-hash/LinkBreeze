#!/usr/bin/env node
// Changelog structure validator.
//
// Canon (decided 2026-09, #105 session):
//   - Keep a Changelog 1.1.0 sections ONLY, in this exact order:
//     Added, Changed, Deprecated, Removed, Fixed, Security
//   - Sections omitted when empty; never repeated; never empty when present.
//   - Every entry: `## [X.Y.Z] - YYYY-MM-DD` (ISO date) or `## [Unreleased]`.
//   - Versions strictly decrease down the file; Unreleased comes first.
//   - Dependency bumps go in ONE `**Dependency updates**` bullet at the TOP
//     of Changed (reporter credit inline in entry titles).
//
// The checker verifies STRUCTURE only — prose quality is on the author.
// CI: run before build. Exit 1 with a list of every violation.

import { readFileSync } from "node:fs";

const FILE = "CHANGELOG.md";
const CANON = ["Added", "Changed", "Deprecated", "Removed", "Fixed", "Security"];

const errors = [];
const err = (what) => errors.push(what);

const text = readFileSync(FILE, "utf8");
const lines = text.split("\n");

// ── Parse blocks ─────────────────────────────────────────────────────────
const headerRe = /^## \[(Unreleased|[^\]]+)\](?: - (\d{4}-\d{2}-\d{2}))?\s*$/;
const sectionRe = /^### (.+?)\s*$/;

const blocks = [];
let current = null;
let currentSection = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const h = line.match(headerRe);
  if (h) {
    current = { version: h[1], date: h[2] ?? null, line: i + 1, sections: new Map() };
    blocks.push(current);
    currentSection = null;
    continue;
  }
  const s = line.match(sectionRe);
  if (s && current) {
    currentSection = { line: i + 1, body: [] };
    if (current.sections.has(s[1])) err(`L${i + 1}: duplicate section '### ${s[1]}' in [${current.version}]`);
    current.sections.set(s[1], currentSection);
    continue;
  }
  if (currentSection && line.trim() !== "") currentSection.body.push(line);
  else if (currentSection && line.trim() === "") currentSection.body.push(line);
}

if (blocks.length === 0) err("No release blocks found — is this the right file?");

// ── Header rules ─────────────────────────────────────────────────────────
const first = blocks[0];
if (!first || first.version !== "Unreleased") {
  err(`First block must be [Unreleased] (found: ${first ? `[${first.version}]` : "none"})`);
}

const seenVersions = new Set(["Unreleased"]);
let prev = null;
for (const b of blocks) {
  if (b.version !== "Unreleased") {
    if (seenVersions.has(b.version)) err(`L${b.line}: duplicate version [${b.version}]`);
    if (!b.date) err(`L${b.line}: [${b.version}] missing ' - YYYY-MM-DD' date`);
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date)) err(`L${b.line}: [${b.version}] date '${b.date}' is not ISO YYYY-MM-DD`);
    if (prev && prev.date && b.date && b.date > prev.date) {
      err(`L${b.line}: [${b.version}] (${b.date}) is NEWER than [${prev.version}] (${prev.date}) — versions must get older going down`);
    }
    seenVersions.add(b.version);
  }
  prev = b;
}

// ── Section rules ────────────────────────────────────────────────────────
for (const b of blocks) {
  const names = [...b.sections.keys()];
  if (b.version !== "Unreleased" && names.length === 0) {
    err(`[${b.version}] has no sections at all`);
  }
  const unknown = names.filter((n) => !CANON.includes(n));
  for (const u of unknown) {
    const at = b.sections.get(u);
    err(`L${at.line}: '### ${u}' is not a Keep a Changelog section (allowed: ${CANON.join(", ")})`);
  }
  const ordered = names.filter((n) => CANON.includes(n));
  const canonicalOrder = ordered.map((n) => CANON.indexOf(n));
  for (let i = 1; i < canonicalOrder.length; i++) {
    if (canonicalOrder[i] < canonicalOrder[i - 1]) {
      err(`[${b.version}]: sections out of order (${ordered.join(" → ")}; canon: ${CANON.join(" → ")})`);
      break;
    }
  }
  for (const [name, sec] of b.sections) {
    if (CANON.includes(name) && sec.body.every((l) => l.trim() === "")) {
      err(`L${sec.line}: '### ${name}' in [${b.version}] is empty (omit empty sections)`);
    }
  }
}

// ── Report ───────────────────────────────────────────────────────────────
if (errors.length) {
  console.error(`✗ ${FILE}: ${errors.length} violation(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ ${FILE}: ${blocks.length} release block(s), structure conforms to Keep a Changelog canon`);
