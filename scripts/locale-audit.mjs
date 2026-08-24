#!/usr/bin/env node
/**
 * Locale audit: deeper than the hash gate — key parity vs en, placeholder
 * ({x}/ICU) mismatches, untranslated-value suspects, duplicate values.
 * Run alongside the gates when touching locale files: npm run i18n:audit
 */
import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

// ── flatten locale files into dotted key paths + values ─────────────────
// also collect nested-object keys (e.g. errors.errorBoundary.title)
function flattenDeep(file) {
  const src = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true);
  const out = {};
  function visit(node, prefix) {
    if (ts.isObjectLiteralExpression(node)) {
      node.properties.forEach((p) => {
        if (ts.isPropertyAssignment(p)) {
          const name = p.name.getText(sf).replace(/^['"]|['"]$/g, "");
          const key = prefix ? `${prefix}.${name}` : name;
          if (ts.isStringLiteral(p.initializer) || ts.isNoSubstitutionTemplateLiteral(p.initializer)) {
            out[key] = p.initializer.text;
          } else {
            visit(p.initializer, key);
          }
        }
      });
    }
  }
  const decl = sf.statements.find(ts.isVariableStatement)?.declarationList?.declarations?.[0]?.initializer;
  visit(decl, "");
  return out;
}

const en = flattenDeep(path.join(root, "src/locales/en.ts"));
const fr = flattenDeep(path.join(root, "src/locales/fr.ts"));
const es = flattenDeep(path.join(root, "src/locales/es.ts"));

// ── 1. key parity en↔fr/es ───────────────────────────────────────────────
const enKeys = new Set(Object.keys(en));
const frKeys = new Set(Object.keys(fr));
const missingInFr = [...enKeys].filter((k) => !frKeys.has(k));
const extraInFr = [...frKeys].filter((k) => !enKeys.has(k));
const esKeys = new Set(Object.keys(es));
const missingInEs = [...enKeys].filter((k) => !esKeys.has(k));
const extraInEs = [...esKeys].filter((k) => !enKeys.has(k));
console.log("== en→fr parity ==");
console.log("missing in fr:", missingInFr.length ? missingInFr : "none");
console.log("extra in fr:   ", extraInFr.length ? extraInFr : "none");
console.log("== en→es parity ==");
console.log("missing in es:", missingInEs.length ? missingInEs : "none");
console.log("extra in es:  ", extraInEs.length ? extraInEs : "none");

// ── 2. placeholder parity ({x} / {count} / ICU) ──────────────────────────
function ph(v) {
  const s = new Set();
  // strip ICU plural internals, keep outer placeholders
  const stripped = v.replace(/\{(\w+),\s*plural[^}]*\{[^}]*\}[^}]*\}/g, "PLURAL");
  for (const m of stripped.matchAll(/\{(\w+)\}/g)) s.add(m[1]);
  return s;
}
console.log("\n== placeholder mismatches en vs {fr,es} ==");
let phCount = 0;
for (const [name, dict] of [["fr", fr], ["es", es]]) {
  for (const k of Object.keys(en)) {
    if (!(k in dict)) continue;
    const a = ph(en[k]);
    const b = ph(dict[k]);
    if (a.size !== b.size || [...a].some((x) => !b.has(x))) {
      phCount++;
      console.log(`  ${k}: en=${[...a]} ${name}=${[...b]}`);
    }
  }
}
if (!phCount) console.log("  none");

// ── 3. untranslated / suspicious values in fr/es ─────────────────────────
for (const [name, dict] of [["fr", fr], ["es", es]]) {
  console.log(`\n== ${name} values identical to en (possible untranslated) ==`);
  let idCount = 0;
  for (const k of Object.keys(en)) {
    if (!(k in dict)) continue;
    if (en[k] === dict[k] && /[a-z]{3,}/i.test(en[k])) {
      // ignore single-word technical terms that legitimately stay the same
      if (en[k].split(/\s+/).length === 1 && /^(URL|SVG|PNG|KB|SMS|Bio|Star|Auto|Center|Tile|Contain|Cover|Gel|Mesh|Pixel|Néon|Radial|Glass|Regular|Semibold|Profil|Terminal|Design|links|Setup)$/i.test(en[k])) continue;
      idCount++;
      console.log(`  ${k}: "${en[k].slice(0, 60)}"`);
    }
  }
  if (!idCount) console.log("  none");
}

// ── 4. duplicate values within en ────────────────────────────────────────
console.log("\n== duplicate values within en.ts (info only) ==");
const byVal = {};
for (const [k, v] of Object.entries(en)) {
  if (!/[a-z]{3,}/i.test(v)) continue;
  (byVal[v] ??= []).push(k);
}
const dups = Object.entries(byVal).filter(([, ks]) => ks.length > 1);
for (const [v, ks] of dups) {
  console.log(`  "${v.slice(0, 50)}" → ${ks.join(", ")}`);
}
console.log(`  (${dups.length} duplicate groups)`);

// ── 5. unused keys: scan src for t("key") / t.rich usage ─────────────────
console.log("\n== unused-key scan (en.ts keys never referenced in src) ==");
const srcFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next") continue;
      walk(p);
    } else if (/\.(tsx?|mjs)$/.test(e.name)) {
      srcFiles.push(p);
    }
  }
})(path.join(root, "src"));

const referenced = new Set(); // dotted full paths like "common.save"
const dynamicRefs = new Set(); // refs built from constants (label: "bgSolid")

for (const f of srcFiles) {
  if (f.includes("src/locales/")) continue;
  const src = fs.readFileSync(f, "utf8");
  // namespaces bound in this file (per-file set: over-approximates scope,
  // safer for unused-detection than last-wins per-var)
  const nsSet = new Set();
  for (const m of src.matchAll(/(?:useTranslations|getTranslations)\(\s*"([^"]+)"\s*\)/g)) {
    nsSet.add(m[1]);
  }
  for (const m of src.matchAll(/\b(\w+)\s*(?:\.\s*(rich|raw|markup|has)\s*)?\(\s*"((?:[^"\\]|\\.)*)"/g)) {
    const callee = m[1];
    if (!/^t[A-Z]?/.test(callee)) continue;
    const key = m[3];
    for (const ns of nsSet) referenced.add(`${ns}.${key}`);
    referenced.add(`(bare).${key}`);
  }
  // constants arrays (theme-constants label keys, action-error map)
  for (const m of src.matchAll(/label:\s*"([A-Za-z0-9_]+)"/g)) dynamicRefs.add(m[1]);
}

// error map: MESSAGE_KEYS values are errors-namespace keys
for (const m of fs.readFileSync(path.join(root, "src/lib/action-error-i18n.ts"), "utf8").matchAll(/:\s*"([A-Za-z0-9_]+)",/g)) {
  dynamicRefs.add(m[1]);
}

const leaves = Object.keys(en).filter((k) => typeof en[k] === "string");
const unused = leaves.filter((k) => {
  if (referenced.has(k)) return false;
  const leaf = k.split(".").pop();
  if (dynamicRefs.has(leaf)) return false;
  // bare t("key") where the var has no known namespace — can't resolve
  const bareHits = [...referenced].filter((r) => r.startsWith("(bare).") && r.endsWith("." + leaf));
  if (bareHits.length) return false;
  return true;
});
console.log(`  ${unused.length} possibly-unused keys:`);
for (const k of unused) console.log(`    ${k}`);

console.log("\nDone.");
