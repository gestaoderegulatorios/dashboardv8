// Copy ETL snapshot.json to public/ so Vite serves it in dev and includes it in build.
// Runs as predev/prebuild hook (package.json scripts).
// Gracefully skips if snapshot.json doesn't exist (mock fallback kicks in).

const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'etl_v8', 'output', 'snapshot.json');
const dst = path.join(__dirname, '..', 'public', 'etl_v8', 'output', 'snapshot.json');

if (!fs.existsSync(src)) {
  console.warn('[copy-snapshot] src missing:', src);
  process.exit(0);
}

fs.mkdirSync(path.dirname(dst), { recursive: true });
fs.copyFileSync(src, dst);
console.log('[copy-snapshot] ok');
