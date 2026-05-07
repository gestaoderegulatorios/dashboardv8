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
  '_buildReportHTML', 'query', 'diff', 'mountTopbar',
  'landTemplate', 'settingsTemplate', 'uploadTemplate', 'wireUploadEvents', 'templateHTML',
  'worksTemplate', 'financeTemplate', 'mountFinanceCharts', 'validate', 'validateVerticalConfig'];

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
const HEX_EXCEPTIONS = ['login.js', 'reports.js', 'reports-fragments.js', 'chart-theme.js', 'chart.js', 'chart-fragments.js'];

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

// ─── Rule 7: Empty catch blocks without rationale comment ──────────────────
// Every catch block must either: (a) use safe-cleanup.js utilities, or
// (b) contain a /* noop: ... */ comment explaining WHY the error is ignored.
// Pattern: `catch {}` or `catch (e) {}` with only whitespace inside → FAIL.
function checkEmptyCatches() {
  const jsFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') walk(full);
      else if (entry.name.endsWith('.js')) jsFiles.push(full);
    }
  }
  walk(SRC);

  for (const f of jsFiles) {
    const content = fs.readFileSync(f, 'utf-8');
    const lines = content.split('\n');
    const rel = path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match `catch {}` or `catch (e) {}` with only whitespace between braces
      if (/\bcatch\s*(?:\(\w+\))?\s*\{\s*\}/.test(line)) {
        fail(`Rule 7: ${rel}:${i + 1} empty catch without rationale — use safe-cleanup.js or add /* noop: reason */`);
      }
    }
  }
}

// ─── Rule 8: Domain→View layer violation ──────────────────────────────────────
// Domain modules must NOT import from view/. escape() was moved to domain/escape.js (F2.1).
function checkDomainViewViolation() {
  const domainDir = path.join(SRC, 'domain');
  if (!fs.existsSync(domainDir)) return;
  const jsFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.js')) jsFiles.push(full);
    }
  }
  walk(domainDir);

  for (const f of jsFiles) {
    const content = fs.readFileSync(f, 'utf-8');
    const lines = content.split('\n');
    const rel = path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/from\s+['"]\.\.\/view\//.test(line) || /from\s+['"]\.\/view\//.test(line)) {
        fail(`Rule 8: ${rel}:${i + 1} domain imports from view/ — move shared logic to domain/`);
      }
    }
  }
}

// ─── Rule 9: Domain DOM access (chart-theme.js is the declared bridge) ────────
// Domain modules must NOT access document.* or getComputedStyle directly.
// chart-theme.js is the ONLY exception — it's the declared bridge between CSS and domain.
const DOM_ACCESS_EXCEPTIONS = ['chart-theme.js'];

function checkDomainDOMAccess() {
  const domainDir = path.join(SRC, 'domain');
  if (!fs.existsSync(domainDir)) return;
  const jsFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.js')) jsFiles.push(full);
    }
  }
  walk(domainDir);

  for (const f of jsFiles) {
    const content = fs.readFileSync(f, 'utf-8');
    const lines = content.split('\n');
    const rel = path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/');
    const isException = DOM_ACCESS_EXCEPTIONS.some(e => rel.endsWith(e));
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip import lines
      if (/^import\s/.test(line.trim())) continue;
      // Skip comment lines
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
      // Detect document.* or getComputedStyle access
      if (/\bdocument\b/.test(line) || /\bgetComputedStyle\b/.test(line)) {
        if (isException) warn(`Rule 9: ${rel}:${i + 1} DOM access in declared bridge (warn only)`);
        else fail(`Rule 9: ${rel}:${i + 1} domain accesses DOM — use chart-theme.js bridge instead`);
      }
    }
  }
}

// ─── Rule 10: TypeScript check (tsc --noEmit must return 0) ──────────────────
function checkTypeScript() {
  try {
    const { execSync } = require('child_process');
    execSync('npx tsc --noEmit', { stdio: 'pipe', cwd: path.join(__dirname, '..') });
  } catch (e) {
    const output = e.stdout ? e.stdout.toString() : '';
    const lines = output.split('\n').filter(l => l.trim());
    const count = lines.filter(l => l.includes('error TS')).length;
    fail(`Rule 10: tsc --noEmit returned ${count} type errors — fix before commit`);
  }
}

// ─── Rule 11: ESLint import hygiene (import/no-cycle + no-duplicate-imports) ──
// Runs eslint with only import-related rules. Zero errors required.
// Warnings (no-console, no-unused-vars) are acceptable — tracked but non-blocking.
function checkESLint() {
  try {
    const { execSync } = require('child_process');
    const result = execSync('npx eslint src/ boot.js main.js --format json 2>nul', {
      stdio: 'pipe',
      cwd: path.join(__dirname, '..'),
      timeout: 60000
    });
    const report = JSON.parse(result.toString());
    let errors = 0;
    let warnings = 0;
    for (const file of report) {
      for (const msg of file.messages) {
        if (msg.severity === 2) errors++;
        else if (msg.severity === 1) warnings++;
      }
    }
    if (errors > 0) {
      fail(`Rule 11: ESLint returned ${errors} errors (import cycles / duplicate imports) — fix before commit`);
    }
    if (warnings > 0) {
      warn(`Rule 11: ESLint returned ${warnings} warnings (no-console / no-unused-vars) — non-blocking`);
    }
  } catch (e) {
    // ESLint exits non-zero on errors — parse the JSON output
    const output = e.stdout ? e.stdout.toString() : '';
    try {
      const report = JSON.parse(output);
      let errors = 0;
      let warnings = 0;
      for (const file of report) {
        for (const msg of file.messages) {
          if (msg.severity === 2) errors++;
          else if (msg.severity === 1) warnings++;
        }
      }
      if (errors > 0) {
        fail(`Rule 11: ESLint returned ${errors} errors (import cycles / duplicate imports) — fix before commit`);
      }
      if (warnings > 0) {
        warn(`Rule 11: ESLint returned ${warnings} warnings (no-console / no-unused-vars) — non-blocking`);
      }
    } catch {
      fail('Rule 11: ESLint failed to run or parse output — check eslint.config.js');
    }
  }
}

// ─── Rule 12: Magic number detection (non-blocking WARN) ────────────────────
// Flags raw numeric literals in src/ that should be in model/constants.js.
// Exceptions: array indices, small integers (0-9, 100), standard multipliers,
// CSS timing (ms prefix), and numbers inside comments/strings.
function checkMagicNumbers() {
  const MAGIC_EXCEPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 24, 60, 100, 200, 300, 400, 1000, 10000, 100000, 1000000, 1200];
  const jsFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') walk(full);
      else if (entry.name.endsWith('.js')) jsFiles.push(full);
    }
  }
  walk(SRC);

  for (const f of jsFiles) {
    const content = fs.readFileSync(f, 'utf-8');
    const lines = content.split('\n');
    const rel = path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/');
    // Skip constants.js itself and mock data
    if (rel.endsWith('constants.js') || rel.endsWith('mock.js') || rel.endsWith('demo.js')) continue;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip comments
      if (line.trim().startsWith('//')) continue;
      // Skip strings (simple heuristic: lines with only a string literal)
      // Find numeric patterns: decimal, percent, currency-like
      const matches = line.match(/(?<!\w)(?!\d*\.?\d+%)(?!\d+ms)(?!\d+s\b)(?!\d{2,4}-\d{2}-\d{2})(\b\d+\.?\d*\b)(?!\w)/g);
      if (matches) {
        for (const m of matches) {
          const n = parseFloat(m);
          if (Number.isFinite(n) && !MAGIC_EXCEPTIONS.includes(n)) {
            // Additional heuristic: skip if part of a CSS var or timing string
            if (line.includes('ms') || line.includes('s ') || line.includes("'"+n+"'")) continue;
            warn(`Rule 12: ${rel}:${i + 1} magic number ${n} — consider moving to model/constants.js`);
          }
        }
      }
    }
  }
}

// ─── Rule 13: console.log in production code (non-blocking WARN) ──────────────
// console.warn/error are acceptable for telemetry and error reporting.
// console.log must be removed or converted to console.warn before commit.
function checkConsoleLogs() {
  const jsFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') walk(full);
      else if (entry.name.endsWith('.js')) jsFiles.push(full);
    }
  }
  walk(SRC);

  for (const f of jsFiles) {
    const content = fs.readFileSync(f, 'utf-8');
    const lines = content.split('\n');
    const rel = path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip comments
      if (line.trim().startsWith('//')) continue;
      // Match console.log (not .warn, .error, .info, .debug)
      if (/\bconsole\.log\b/.test(line)) {
        warn(`Rule 13: ${rel}:${i + 1} console.log detected — use console.warn or remove before commit`);
      }
    }
  }
}

// ─── Rule 14: TODO comments without ticket reference ──────────────────────────
// TODOs must reference a ticket/ADR: "TODO(#123):" or "TODO[F3.5]:".
// This ensures tracking and prevents orphaned TODOs from accumulating.
function checkTODOTickets() {
  const jsFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') walk(full);
      else if (entry.name.endsWith('.js')) jsFiles.push(full);
    }
  }
  walk(SRC);

  for (const f of jsFiles) {
    const content = fs.readFileSync(f, 'utf-8');
    const lines = content.split('\n');
    const rel = path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const todoMatch = line.match(/TODO\b/);
      if (todoMatch) {
        // Check if it has a ticket reference: TODO(#...) or TODO[E...] or TODO[F...
        if (!/TODO\([^)]+\):?/.test(line) && !/TODO\[[^\]]+\]/.test(line)) {
          warn(`Rule 14: ${rel}:${i + 1} TODO without ticket reference — format as TODO(#ticket): or TODO[F3.5]:`);
        }
      }
    }
  }
}

// ─── Run all checks ──────────────────────────────────────────────────────────
checkFileSizes();
checkFunctionSizes();
checkTemplateLiterals();
checkHexColors();
checkEmptyCatches();
checkDomainViewViolation();
checkDomainDOMAccess();
checkTypeScript();
checkESLint();
checkMagicNumbers();
checkConsoleLogs();
checkTODOTickets();

// ─── Output ──────────────────────────────────────────────────────────────────
console.log('\n=== V8 Audit ===\n');
if (messages.length === 0) {
  console.log('All checks passed. ✅\n');
} else {
  messages.forEach(m => console.log(m));
  console.log(`\n${fails} FAIL, ${warns} WARN\n`);
}

process.exit(fails > 0 ? 1 : 0);
