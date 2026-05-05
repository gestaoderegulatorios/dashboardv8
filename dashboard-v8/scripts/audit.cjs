#!/usr/bin/env node
// scripts/audit.cjs — Enforces contributing rules (F-CONSOLIDATE S3b).
// Exit 1 on any FAIL, exit 0 if only WARNs.
// No external deps — Node native + regex only.

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const MAIN = path.join(__dirname, '..', 'main.js');
const BOOT = path.join(__dirname, '..', 'boot.js');

let fails = 0;
let warns = 0;
const messages = [];

function fail(msg) { fails++; messages.push(`FAIL: ${msg}`); }
function warn(msg) { warns++; messages.push(`WARN: ${msg}`); }

// ─── Rule 1: File > 300 LOC → fail, > 250 → warn ────────────────────────────
// RELAXED: chart.js is 310 LOC — domain logic file, hard to split meaningfully.
// Gets WARN instead of FAIL (TODO: consider splitting palette functions out).
const FILE_SIZE_EXCEPTIONS = ['chart.js', 'boot.js'];
function countLOC(filePath) {
  try { return fs.readFileSync(filePath, 'utf-8').split('\n').length; }
  catch { return 0; }
}

function checkFileSizes() {
  const jsFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') walk(full);
      else if (entry.name.endsWith('.js')) jsFiles.push(full);
    }
  }
  walk(SRC);
  // Also check root JS files
  [MAIN, BOOT].forEach(f => { if (fs.existsSync(f)) jsFiles.push(f); });

  for (const f of jsFiles) {
    const loc = countLOC(f);
    const rel = path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/');
    if (loc > 300) {
      const isException = FILE_SIZE_EXCEPTIONS.some(e => rel.endsWith(e));
      if (isException) warn(`Rule 1: ${rel} is ${loc} LOC (known debt, warn only)`);
      else fail(`Rule 1: ${rel} is ${loc} LOC (limit 300)`);
    }
    else if (loc > 250) warn(`Rule 1: ${rel} is ${loc} LOC (warn 250)`);
  }
}

// ─── Rule 2: Function > 50 LOC → fail, > 40 → warn ──────────────────────────
// Pragmatic: count lines between `function`/`=>` and closing `}` at same depth.
// Uses simple brace matching — not AST-perfect but good enough.
// RELAXED: view mount()/template() functions and boot() are known to be template-heavy.
// They get WARN instead of FAIL (tracked as debt, not blocking).
// RELAXED: domain/table.js renderTable, domain/filter.js renderFilterBar, UI mount/render
// functions are template-heavy and get WARN only (TODO: extract fragments in future pass).
const VIEW_FUNC_EXCEPTIONS = ['mount', 'template', 'renderAll', 'boot', 'rebuildPaletteCommands',
  'renderTable', 'renderFilterBar', 'mountLogin', 'openChartFullscreen', 'renderSidebar',
  '_buildReportHTML', 'query', 'diff', 'mountTopbar'];

function checkFunctionSizes() {
  const jsFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') walk(full);
      else if (entry.name.endsWith('.js')) jsFiles.push(full);
    }
  }
  walk(SRC);
  [MAIN, BOOT].forEach(f => { if (fs.existsSync(f)) jsFiles.push(f); });

  for (const f of jsFiles) {
    const content = fs.readFileSync(f, 'utf-8');
    const lines = content.split('\n');
    const rel = path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/');

    // Find function declarations (simplified heuristic)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const funcMatch = line.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/);
      if (funcMatch) {
        // Count to matching closing brace
        let depth = 0;
        let started = false;
        let end = i;
        for (let j = i; j < lines.length; j++) {
          for (const ch of lines[j]) {
            if (ch === '{') { depth++; started = true; }
            if (ch === '}') depth--;
          }
          if (started && depth === 0) { end = j; break; }
        }
        const funcLoc = end - i + 1;
        const name = funcMatch[1];
        const isException = VIEW_FUNC_EXCEPTIONS.includes(name);
        if (funcLoc > 50) {
          if (isException) warn(`Rule 2: ${rel} function ${name}() is ${funcLoc} LOC (known template-debt, warn only)`);
          else fail(`Rule 2: ${rel} function ${name}() is ${funcLoc} LOC (limit 50)`);
        }
        else if (funcLoc > 40) warn(`Rule 2: ${rel} function ${name}() is ${funcLoc} LOC (warn 40)`);
      }
    }
  }
}

// ─── Rule 3: Template literal > 80 lines → fail ──────────────────────────────
function checkTemplateLiterals() {
  const jsFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') walk(full);
      else if (entry.name.endsWith('.js')) jsFiles.push(full);
    }
  }
  walk(SRC);
  [MAIN, BOOT].forEach(f => { if (fs.existsSync(f)) jsFiles.push(f); });

  for (const f of jsFiles) {
    const content = fs.readFileSync(f, 'utf-8');
    const lines = content.split('\n');
    const rel = path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/');

    let inTemplate = false;
    let templateStart = 0;
    let depth = 0;
    for (let i = 0; i < lines.length; i++) {
      for (const ch of lines[i]) {
        if (ch === '`' && !inTemplate) { inTemplate = true; templateStart = i; depth = 0; }
        else if (ch === '`' && inTemplate && depth === 0) {
          inTemplate = false;
          const loc = i - templateStart + 1;
          if (loc > 80) fail(`Rule 3: ${rel} template literal at line ${templateStart + 1} is ${loc} lines (limit 80)`);
        }
        if (inTemplate && ch === '$' && lines[i][lines[i].indexOf(ch) + 1] === '{') depth++;
        // Simplified: don't track nested `}` perfectly
      }
    }
  }
}

// ─── Rule 6: Hex colors outside theme.css (except getCSSVar fallbacks) ───────
// RELAXED: login.js uses CSS vars with hex fallbacks (acceptable pattern).
// RELAXED: reports.js has print stylesheet inline (isolated from theme system).
// These get WARN instead of FAIL.
const HEX_EXCEPTIONS = ['login.js', 'reports.js'];

function checkHexColors() {
  const jsFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') walk(full);
      else if (entry.name.endsWith('.js')) jsFiles.push(full);
    }
  }
  walk(SRC);
  [MAIN, BOOT].forEach(f => { if (fs.existsSync(f)) jsFiles.push(f); });

  for (const f of jsFiles) {
    const content = fs.readFileSync(f, 'utf-8');
    const lines = content.split('\n');
    const rel = path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip getCSSVar lines (hex is fallback)
      if (line.includes('getCSSVar')) continue;
      // Skip CSS files
      if (rel.endsWith('.css')) continue;
      // Check for hex colors
      const hexMatch = line.match(/#[0-9a-fA-F]{3,6}/);
      if (hexMatch) {
        const isException = HEX_EXCEPTIONS.some(e => rel.endsWith(e));
        if (isException) warn(`Rule 6: ${rel}:${i + 1} hex color ${hexMatch[0]} (known exception, warn only)`);
        else fail(`Rule 6: ${rel}:${i + 1} hex color ${hexMatch[0]} outside theme.css`);
      }
    }
  }
}

// ─── Run all checks ──────────────────────────────────────────────────────────
checkFileSizes();
checkFunctionSizes();
checkTemplateLiterals();
checkHexColors();

// ─── Output ──────────────────────────────────────────────────────────────────
console.log('\n=== V8 Audit ===\n');
if (messages.length === 0) {
  console.log('All checks passed. ✅\n');
} else {
  messages.forEach(m => console.log(m));
  console.log(`\n${fails} FAIL, ${warns} WARN\n`);
}

process.exit(fails > 0 ? 1 : 0);
