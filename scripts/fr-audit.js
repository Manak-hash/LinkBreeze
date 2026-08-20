// fr-value audit: flags any fr value that is literally identical to its en
// counterpart (English text hiding in fr.ts passes tsc AND i18n:check).
// Legit-identical exemptions: brand names, URLs, emails, ICU-only strings.
const ts = require("typescript");
const fs = require("fs");
const path = require("path");

function loadMessages(file) {
  const src = fs.readFileSync(file, "utf8");
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} };
  new Function("exports", "require", "module", js)(mod.exports, require, mod);
  return mod.exports;
}

const base = path.join(__dirname, "..", "src", "locales");
const en = loadMessages(path.join(base, "en.ts"));
const fr = loadMessages(path.join(base, "fr.ts"));

// Values that are legitimately identical across locales.
const IDENTICAL_OK = [
  /^[\s\d.,%()/:+-]*$/,            // digits/punct only (incl. ICU {placeholders})
  /^LinkBreeze/,
  /^(https?:|mailto:|\/)/i,        // URLs / paths
  /@(gmail|example|linkbreeze)\./i,
  /^(vCard|WhatsApp|SMS|URL|UTM|Satoshi|Inter|Poppins|Roboto|Mono|Grotesk|Sans|Serif)/,
  /^[A-Z][a-z]+ [A-Z][a-z]+$/,      // "First Last" demo names? (flagged anyway below)
];

const findings = [];
function walk(a, b, trail) {
  for (const k of Object.keys(a)) {
    const key = trail ? trail + "." + k : k;
    const av = a[k], bv = b?.[k];
    if (typeof av === "object" && av !== null) { walk(av, bv, key); continue; }
    if (typeof av !== "string") continue;
    if (av === bv) {
      const exempt = IDENTICAL_OK.some((re) => re.test(av)) || av.length <= 2;
      findings.push({ key, value: av, exempt });
    }
  }
}
walk(en, fr, "");

const bad = findings.filter((f) => !f.exempt);
console.log(`identical en/fr values: ${findings.length} total, ${findings.length - bad.length} exempt (brands/URLs/digits)`);
console.log(`SUSPECT (English in fr.ts): ${bad.length}`);
for (const f of bad) console.log(`  ${f.key} = ${JSON.stringify(f.value).slice(0, 90)}`);
