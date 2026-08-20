// AST-based raw-string detector for JSX/TSX.
// Finds user-visible string literals NOT going through t()/tX(...).
// Usage: node scripts/i18n-sweep.js [dir1 dir2 ...]
import ts from "typescript";
import fs from "node:fs";
import path from "node:path";

const roots = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["src/app/(admin)", "src/components/admin"];

// strings that are code, not UI copy
const CODE_PAT = /^(use client|use server|[a-z0-9-]+([.:/][a-zA-Z0-9_~-]+)*|\/[^\s]*|\{[0-9]+\}|#[0-9a-fA-F]{3,8}|--[\w-]+|[\w-]+=[\w-]+)$/;

const findings = [];

function isTCall(node) {
  // t("x"), t.rich("x"), tCommon("x") — Identifier or PropertyAccess callee whose name starts with t
  let callee = node.expression;
  if (ts.isPropertyAccessExpression(callee)) callee = callee.expression;
  return ts.isIdentifier(callee) && /^t[A-Z]?/.test(callee.text);
}

function checkString(node, ctx) {
  const text = node.text;
  if (!text) return;
  if (CODE_PAT.test(text)) return;
  if (text.length < 2) return;
  if (!/[a-zA-Z]/.test(text)) return;
  // skip purely-template/technical strings
  if (/^[A-Z_$][\w$]*$/.test(text)) return;
  if (/^(https?:|mailto:|tel:)/.test(text)) return;
  if (text.startsWith("/") && !text.includes(" ")) return;
  if (/^@[\w.-]+$/.test(text)) return;
  // raw HTML entities alone (not copy)
  if (/^&[a-z]+;$/i.test(text.trim())) return;
  // whitespace-only JSXText (formatting between expressions)
  if (!text.trim()) return;
  // Tailwind/utility-class-shaped strings (kebab tokens, slashes, colons)
  if (/^[a-z0-9:\/\[\]_.\- ]+([a-z]+-){2,}/.test(text.trim()) && !/\s[A-Z]/.test(text)) return;
  if (/^[a-z]([a-z0-9:\/\[\]_%-]*\s)*[a-z0-9:\/\[\]_%-]*$/.test(text.trim()) && text.includes("-") && !/[A-Z]/.test(text)) return;
  // i18n translation keys (consumed by t() at render sites) — not UI copy
  if (/^(lt|ph|bg|ls|shadow|hover|angle|weight|size|align|density|reveal|av|border|layout|textAnim|tab|focal|mock)[A-Z]/.test(text)) return;
  // font brand names (deliberately untranslated)
  if (/^(Inter|Poppins|Playfair Display|JetBrains Mono|Space Grotesk|DM Sans|Lora|Bebas Neue|Sora|Outfit|Nunito|Press Start 2P|Montserrat|Caveat|Pacifico|Abril Fatface)$/.test(text)) return;
  // parent chain: if inside t(...) call args → translated
  let p = node.parent;
  let translated = false;
  while (p) {
    if (ts.isCallExpression(p) && isTCall(p)) { translated = true; break; }
    p = p.parent;
  }
  if (translated) return;
  findings.push({ file: ctx.file, line: ctx.line, text });
}

function walk(sourceFile, file) {
  function visit(node) {
    const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
    const ctx = { file, line };
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      // Unattached string literal: user-visible ONLY if the ancestor chain up
      // to the nearest function boundary contains a JSX node (render position).
      // Otherwise it's a comparison/id/icon name/etc. — logic, not copy.
      let p = node.parent;
      let inRender = false;
      while (p) {
        if (ts.isJsxChild(node) || ts.isJsxElement(p) || ts.isJsxFragment(p) || ts.isJsxExpression(p)) { inRender = true; break; }
        if (ts.isFunctionDeclaration(p) || ts.isFunctionExpression(p) || ts.isArrowFunction(p) || ts.isSourceFile(p)) break;
        p = p.parent;
      }
      const isJsxAttrValue = ts.isJsxAttribute(node.parent);
      const isJsxChildExpr = ts.isJsxExpression(node.parent);
      if (inRender || isJsxAttrValue || isJsxChildExpr) {
        if (isJsxAttrValue) {
          const name = node.parent.name.text;
          if (/^(title|placeholder|alt|label|hint|description|summary|subtitle|caption)$/.test(name)) {
            checkString(node, ctx);
          }
        } else if (isJsxChildExpr) {
          checkString(node, ctx);
        } else if (ts.isPropertyAssignment(node.parent) && ts.isIdentifier(node.parent.name) && /^(label|title|text|description|hint|placeholder|summary|subtitle|name)$/.test(node.parent.name.text)) {
          checkString(node, ctx);
        } else if (inRender) {
          checkString(node, ctx);
        }
      }
    } else if (ts.isJsxText(node)) {
      // Raw text children like <span>Live Preview</span>
      checkString(node, ctx);
    }
    node.forEachChild(visit);
  }
  visit(sourceFile);
}

function collect(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) collect(full);
    else if (/\.(tsx|ts)$/.test(e.name)) {
      const code = fs.readFileSync(full, "utf8");
      const sf = ts.createSourceFile(full, code, ts.ScriptTarget.Latest, true);
      walk(sf, full);
    }
  }
}
roots.forEach(collect);

const uniq = [];
const dedupe = new Set();
for (const f of findings) {
  const k = `${f.file}:${f.line}:${f.text}`;
  if (dedupe.has(k)) continue;
  dedupe.add(k);
  uniq.push(f);
}
console.log(`TOTAL: ${uniq.length}`);
for (const f of uniq) {
  console.log(`${f.file}:${f.line}: ${JSON.stringify(f.text)}`);
}
if (uniq.length === 0) console.log("CLEAN");
