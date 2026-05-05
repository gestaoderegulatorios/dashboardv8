// ETL watcher — dev-only file watcher for etl_v8/dados_raw/.
// Watches XLSX source files. On change:
// 1. Debounce 1500ms
// 2. Spawn python etl_v8/main.py
// 3. If exit 0: run node scripts/copy-snapshot.cjs
// 4. Log "[V8 etl-watcher] snapshot updated"
//
// Usage: node scripts/etl-watcher.cjs
// Or: npm run etl:watch

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const WATCH_DIR = path.join(ROOT, 'etl_v8', 'dados_raw');
const ETL_SCRIPT = path.join(ROOT, 'etl_v8', 'main.py');
const COPY_SCRIPT = path.join(ROOT, 'scripts', 'copy-snapshot.cjs');
const DEBOUNCE_MS = 1500;

let timerId = null;
let isRunning = false;

if (!fs.existsSync(WATCH_DIR)) {
  console.error('[V8 etl-watcher] Watch directory not found:', WATCH_DIR);
  process.exit(1);
}

console.log('[V8 etl-watcher] Watching:', WATCH_DIR);

function runETL() {
  if (isRunning) return;
  isRunning = true;

  console.log('[V8 etl-watcher] Running ETL...');
  const py = spawn('python', [ETL_SCRIPT], { cwd: ROOT, stdio: 'inherit' });

  py.on('close', (code) => {
    if (code === 0) {
      console.log('[V8 etl-watcher] ETL success, copying snapshot...');
      const copy = spawn('node', [COPY_SCRIPT], { cwd: ROOT, stdio: 'inherit' });
      copy.on('close', (copyCode) => {
        if (copyCode === 0) {
          console.log('[V8 etl-watcher] snapshot updated');
        } else {
          console.warn('[V8 etl-watcher] copy-snapshot failed with code', copyCode);
        }
        isRunning = false;
      });
    } else {
      console.warn('[V8 etl-watcher] ETL failed with exit code', code);
      isRunning = false;
    }
  });

  py.on('error', (err) => {
    console.error('[V8 etl-watcher] Failed to spawn python:', err.message);
    isRunning = false;
  });
}

function debounce() {
  if (timerId) clearTimeout(timerId);
  timerId = setTimeout(() => {
    timerId = null;
    runETL();
  }, DEBOUNCE_MS);
}

// Watch for changes in dados_raw/ (recursive on platforms that support it)
try {
  fs.watch(WATCH_DIR, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    // Only react to .xlsx files
    if (!filename.endsWith('.xlsx') && !filename.endsWith('.xls')) return;
    console.log(`[V8 etl-watcher] ${eventType}: ${filename}`);
    debounce();
  });
} catch (e) {
  // Fallback: non-recursive watch
  fs.watch(WATCH_DIR, (eventType, filename) => {
    if (!filename) return;
    if (!filename.endsWith('.xlsx') && !filename.endsWith('.xls')) return;
    console.log(`[V8 etl-watcher] ${eventType}: ${filename}`);
    debounce();
  });
}

console.log('[V8 etl-watcher] Ready. Change any .xlsx in dados_raw/ to trigger ETL.');
