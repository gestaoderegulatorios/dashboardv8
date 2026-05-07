// V8 entry point. Native ES modules. main.js só ORQUESTRA imports e dispara boot.
// Toda lógica de inicialização está em boot.js (F-CONSOLIDATE S2e).

// CSS (F1 — Theme tokens + Tailwind via PostCSS pipeline)
import './src/styles/theme.css';
import './src/styles/app.css';

// ApexCharts: npm dep empacotada pelo Vite (Fase 5.1 — era CDN).
// Em teste (jsdom), vitest-setup.js stuba window.ApexCharts ANTES dos testes.
// Este import é necessário para Vite empacotar a lib no build de produção.
import ApexCharts from 'apexcharts';

// Views (todas espelho V7)
import { overviewView } from './src/view/overview.js';
import { worksView } from './src/view/works.js';
import { financeView } from './src/view/finance.js';
import { operationalView } from './src/view/operational.js';
import { landView } from './src/view/land.js';
import { uploadView } from './src/view/upload.js';
import { reportsView } from './src/view/reports.js';
import { settingsView } from './src/view/settings.js';

// Boot logic
import { boot } from './boot.js';
import { prepareBoot } from './src/config/boot-adapter.js';

if (typeof window !== 'undefined') window.ApexCharts = ApexCharts;

// ─── Views registradas ────────────────────────────────────────────────────────
const allViews = [overviewView, worksView, financeView, operationalView, landView, uploadView, reportsView, settingsView];

// V1: Filtra views por vertical (detectado via ?vertical= na URL)
const { views } = prepareBoot(allViews);

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => boot(views));
