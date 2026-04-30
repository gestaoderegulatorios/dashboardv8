// F0 — Baseline Visual Capture via Chrome DevTools Protocol
// Usage: node scripts/capture-baseline.cjs
// Requires: Chrome running with --remote-debugging-port=9222
//           Vite dev server running at http://localhost:5173

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'test', 'baseline');
const BASE_URL = 'http://localhost:5173';
const CDP_PORT = 9222;

const VIEWS = ['overview','works','finance','operational','land','upload','reports','settings'];
const THEMES = ['light', 'dark'];

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

let msgId = 0;
const pending = new Map();

function send(ws, method, params = {}) {
  const id = ++msgId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function main() {
  // Get CDP target
  const resp = await fetch(`http://localhost:${CDP_PORT}/json/list`);
  const targets = await resp.json();
  const page = targets.find(t => t.type === 'page');
  if (!page) { console.error('No page target found'); process.exit(1); }

  const wsUrl = page.webSocketDebuggerUrl;
  console.log(`Connecting to: ${wsUrl}`);

  const ws = new WebSocket(wsUrl);
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(new Error(data.error.message));
      else resolve(data);
    }
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  console.log('Connected to Chrome CDP\n');

  // Enable domains
  await send(ws, 'Page.enable');
  await send(ws, 'Runtime.enable');
  
  // Set viewport
  await send(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1280, height: 900, deviceScaleFactor: 1, mobile: false
  });

  let captured = 0;
  let errors = 0;

  // FIX: o app SPA não escuta hashchange. Navegar para `#works` recarrega mas
  // sempre inicia em activeView='overview'. Usar window.__V8.setView() é a única
  // forma correta de trocar de view sem reload.
  await send(ws, 'Page.navigate', { url: BASE_URL });
  await new Promise(r => setTimeout(r, 3500)); // espera boot completo + ETL

  // Sanity check: window.__V8 precisa existir (exposto por main.js)
  const sanity = await send(ws, 'Runtime.evaluate', {
    expression: 'typeof window.__V8 === "object" && typeof window.__V8.setView === "function"',
    returnByValue: true
  });
  if (!sanity.result || !sanity.result.result || sanity.result.result.value !== true) {
    console.error('❌ window.__V8.setView não disponível — boot do app falhou?');
    ws.close();
    process.exit(1);
  }
  console.log('✅ window.__V8 detectado, iniciando capturas\n');

  for (const theme of THEMES) {
    // Aplica tema UMA VEZ por bloco (não por view)
    await send(ws, 'Runtime.evaluate', {
      expression: theme === 'dark'
        ? `document.documentElement.classList.add('dark'); document.dispatchEvent(new Event('v8:theme-change'));`
        : `document.documentElement.classList.remove('dark'); document.dispatchEvent(new Event('v8:theme-change'));`
    });
    await new Promise(r => setTimeout(r, 800));

    for (const view of VIEWS) {
      try {
        // Troca a view via API real do app (sem reload)
        await send(ws, 'Runtime.evaluate', {
          expression: `window.__V8.setView('${view}'); window.scrollTo(0, 0);`
        });
        // Espera render + ApexCharts re-mount + animações reveal
        await new Promise(r => setTimeout(r, 1800));

        // Capture screenshot
        const result = await send(ws, 'Page.captureScreenshot', { format: 'png' });

        if (result.result && result.result.data) {
          const buf = Buffer.from(result.result.data, 'base64');
          const fp = path.join(OUT_DIR, `${view}-${theme}.png`);
          fs.writeFileSync(fp, buf);
          console.log(`✅ ${view}-${theme}.png (${(buf.length/1024).toFixed(1)}KB)`);
          captured++;
        } else {
          console.log(`❌ ${view}-${theme}.png — no data`);
          errors++;
        }
      } catch (e) {
        console.log(`❌ ${view}-${theme}.png — ${e.message}`);
        errors++;
      }
    }
  }

  ws.close();
  console.log(`\n═══ F0 Baseline Capture ═══`);
  console.log(`Captured: ${captured}/16`);
  console.log(`Errors: ${errors}`);
  console.log(`Output: ${OUT_DIR}`);
}

main().catch(e => { console.error(e); process.exit(1); });
