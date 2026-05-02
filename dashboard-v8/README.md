# Dashboard V8 — Flagship

Linha experimental do dashboard. V7 arquivado em `archive/v7/`.

## Como rodar

### Modo 1: Duplo-clique (distribuição)

Dê duplo-clique em **`iniciar.bat`**. Na primeira vez ele instala deps + compila automaticamente. Depois abre o browser em `http://localhost:4173`.

> Requer [Node.js](https://nodejs.org/) instalado (versão LTS). É o único pré-requisito.

### Modo 2: Desenvolvimento (com hot reload)

```bash
cd dashboard-v8
npm install
npm run dev # http://localhost:5173 — atualiza ao salvar arquivos
```

## Comandos NPM

| Comando | O que faz |
|---|---|
| `npm install` | Instala deps (Vite, Vitest, jsdom, ApexCharts, Tailwind, axe-core) |
| `npm run dev` | Dev server com HMR (porta 5173) |
| `npm run build` | Build de produção → `dist/` (HTML + CSS + JS app + JS vendor) |
| `npm run preview` | Serve o build de produção (porta 4173) |
| `npm test` | Roda 89 testes headless via Vitest + jsdom (85 unit + 4 a11y) |
| `npm run test:watch` | Vitest em modo watch |
| `npm run audit` | Verifica regras CONTRIBUTING.md (LOC, hex, template size, etc.) |

## Estrutura

```
dashboard-v8/
├── index.html                     # Entry point HTML (~62 linhas, CSS via main.js import)
├── main.js                        # Orquestrador: boot, store, view controller, subscribers
├── tailwind.config.js # Tailwind config (consome CSS vars de theme.css — F1)
├── postcss.config.js              # PostCSS config (Tailwind + autoprefixer)
├── tsconfig.json                  # JSDoc type-checking config (checkJs: true)
├── package.json                   # Vite + Vitest + jsdom + ApexCharts + Tailwind + axe-core
├── vite.config.js                 # Dev server + bundler + vendor chunks + @/ alias
├── vitest.config.js               # jsdom, globals:true, setupFiles, @/ alias
├── .gitignore                     # node_modules/, dist/, *.log, .wrangler/, .env*
├── .env.example                   # CF_PAGES_PROJECT template
├── LICENSE                        # MIT
├── DECISIONS.md # Spikes arquiteturais (1–6) + F1 + F2 + F4 + F5
├── README.md                      # Este arquivo
├── iniciar.bat                    # Bootstrap Windows (duplo-clique)
├── src/ # ── CÓDIGO-FONTE ──────────────────────────
│ ├── styles/ # ── STYLES (F1) ──────────────────────────
│ │ ├── theme.css # CSS vars semânticas (:root Borgonovi + .dark + 9 theme stubs + tokens)
│ │ └── app.css # Tailwind + custom CSS (PostCSS pipeline, sem dark overrides)
│   ├── domain/                    # Lógica de domínio (funções puras)
│ │ ├── chart.js # mountChart (lifecycle), borgChartDefaults, getCSSVar, palette functions (F1)
│   │   ├── filter.js              # Filtros puros + renderFilterBar
│   │   ├── kpi.js                 # KPI descriptors + computeKPI + renderKPI
│   │   ├── persona.js             # 3 personas + orderKPIsByPersona
│   │   ├── schema.js              # Schema da entidade + measures + thresholds + formats
│   │   ├── storytelling.js        # applyStorytelling (hierarchical/comparative/drilldown)
│   │   └── table.js               # computeView, toggleSort, clampPage, renderTable
│ ├── model/ # Camada de dados + estado
│ │ ├── branding.js # Branding como dado (F5): NAV_ITEMS, VIEW_LABELS, BRANDING_DEFAULTS, REPORTS, STORAGE_PREFIX
│ │ ├── mock.js # 8 obras mock + séries temporais (paridade V7)
│ │ ├── demo.js # 30 obras (8 base + 22 procedurais, ?demo=1)
│ │ ├── store.js # Pub/sub minimal (~32 linhas)
│ │ ├── bus.js # Event bus (~30 linhas)
│ │ ├── settings.js # Settings persistence (load/save/DEFAULTS — branding de branding.js)
│ │ └── ui-state.js # UI persistence — sidebarOpen + theme (STORAGE_PREFIX de branding.js)
│   ├── ui/                        # Componentes de UI (DOM)
│   │   ├── animate.js             # animateNumber, initAnimatedValues
│   │   ├── command-palette.js     # Cmd+K palette
│   │   ├── dark-mode.js           # isDarkMode, toggleDarkMode, initDarkMode
│   │   ├── modal.js               # Fullscreen chart modal + table fullscreen
│   │   ├── reveal.js              # IntersectionObserver reveal-on-scroll
│   │   ├── ripple.js              # Efeito ripple delegado [data-ripple]
│   │   ├── sidebar.js             # mountSidebar, toggleSidebar (reativa ao store)
│   │   └── topbar.js              # mountTopbar
│   └── view/                      # Views (páginas do dashboard)
│       ├── nav.js                 # createViewController (mount/unmount/switch)
│       ├── shared.js              # escape() + showToast()
│       ├── overview.js            # Visão Geral (KPIs + hero + charts)
│       ├── works.js               # Obras (KPIs + tabela + filtros + chart + storytelling)
│       ├── finance.js             # Financeiro (Hero + 3 charts + tabela)
│       ├── operational.js         # Operacional (12 KPIs + heatmap + bar + tabela)
│       ├── land.js                # Loteamentos (Hero + donut + gauge + drawer)
│       ├── upload.js              # Upload (Drag-and-drop CSV + validação)
│       ├── reports.js             # Relatórios (6 cards + preview + download)
│       └── settings.js            # Configurações (lê/escreve via store)
├── test/                          # ── TESTES ────────────────────────────────
│   ├── runner.js                  # Runner mínimo (browser E Vitest)
│   ├── vitest-setup.js            # Polyfills jsdom + ApexCharts stub
│   ├── run.html                   # Browser test runner (85 unit tests)
│   ├── a11y.test.js               # 4 testes axe-core WCAG AA (npm test only)
│   ├── schema.test.js             # 19 testes
│   ├── filter.test.js             # 17 testes
│   ├── table.test.js              # 14 testes
│   ├── kpi.test.js                # 8 testes
│   ├── persona.test.js            # 7 testes
│   ├── nav.test.js                # 6 testes
│   ├── story.test.js              # 6 testes
│   ├── demo.test.js               # 4 testes
│   └── animate.test.js            # 4 testes
└── public/                        # ── ASSETS ESTÁTICOS ──────────────────────
    ├── _headers                   # Cloudflare Pages security headers
    └── _redirects                 # Cloudflare Pages redirects
```

## Princípios

1. **Um arquivo por responsabilidade.** Limite ~400 linhas (esperado: 50–200).
2. **Funções puras para cálculo.** Render é separado.
3. **Mesmo mock que V7.** V8 só acrescenta, nunca diverge.
4. **Native ES modules + Vite.** Dev server com HMR; build de produção com tree-shaking.
5. **AA obrigatório, AAA progressivo.** Não AAA hard de saída. axe-core automatizado.
6. **Zero contratos falsos.** Cada UI que aceita input tem efeito real.
7. **Store como única fonte de verdade.** Views leem/escrevem via store; localStorage é persistence layer.
8. **Zero duplicações.** Utilidades compartilhadas em `src/view/shared.js`.
9. **Zero código órfão.** Toda função exportada é consumida por pelo menos 1 importador.

## Estado das funcionalidades

| Funcionalidade | Status | Detalhe |
|---|---|---|
| Store pub/sub | ✅ | `src/model/store.js` — get/set/subscribe |
| Event bus | ✅ | `src/model/bus.js` — on/emit |
| Settings via store | ✅ | `src/model/settings.js` — load/save; view lê do store |
| UI via store | ✅ | `src/model/ui-state.js` — sidebarOpen + theme |
| Schema + measures | ✅ | `src/domain/schema.js` — 10 measures, thresholds, formats |
| Mock data | ✅ | `src/model/mock.js` (8 obras + séries) + `src/model/demo.js` (30 obras) |
| Filtros puros | ✅ | `src/domain/filter.js` — search, tipo, status, avancoMin, avancoMax |
| Tabela (sort/paginate) | ✅ | `src/domain/table.js` — computeView, toggleSort, clampPage |
| Charts com lifecycle | ✅ | `src/domain/chart.js` — mountChart/destroy, borgChartDefaults |
| KPIs canônicos | ✅ | `src/domain/kpi.js` — 3 KPIs + computeKPI + renderKPI |
| Personas | ✅ | `src/domain/persona.js` — 3 personas com kpiOrder, density |
| Storytelling | ✅ | `src/domain/storytelling.js` — hierarchical/comparative/drilldown |
| View controller | ✅ | `src/view/nav.js` — createViewController com mount/unmount/switch |
| View: Visão Geral | ✅ | KPIs canônicos + hero + charts + dados de mock.js + persona |
| View: Obras | ✅ | KPIs + tabela + filtros + chart condicional + storytelling + persona |
| View: Financeiro | ✅ | Hero Receita + 3 KPIs + 3 charts (waterfall, receita vs meta, treemap) + tabela + filtros |
| View: Operacional | ✅ | 12 KPIs compact + heatmap + bar chart + tabela densa + alertas |
| View: Loteamentos | ✅ | Hero + 3 KPIs + donut + gauge + sparklines + drawer + tabs + tabela |
| View: Upload | ✅ | Drag-and-drop CSV + validação + preview + import — UI completa, dados ainda em mock |
| View: Relatórios | ✅ | 6 cards + preview modal + download HTML + PDF via print |
| View: Configurações | ✅ | Dados do usuário, aparência, sobre — lê/escreve via store |
| Dark mode | ✅ | `src/ui/dark-mode.js` + `.dark` CSS vars em `theme.css` (F1: sem !important) | |
| Animações funcionais | ✅ | `src/ui/animate.js` — animateNumber, initAnimatedValues |
| Motion-reduced toggle | ✅ | CSS `.motion-reduced` (manual) + `@media prefers-reduced-motion` (OS) |
| Reveal-on-scroll | ✅ | `src/ui/reveal.js` + IntersectionObserver |
| Command palette | ✅ | Cmd+K — navegação, personas, storytelling, aparência, reset |
| ApexCharts via npm | ✅ | Empacotado pelo Vite, separado em vendor chunk |
| Tailwind via PostCSS | ✅ | `tailwind.config.js` + `postcss.config.js` + `src/styles/app.css` — cores via CSS vars |
| Acessibilidade automatizada | ✅ | axe-core — 4 testes WCAG AA contra mount() real |
| JSDoc type-checking | ✅ | `tsconfig.json` com `checkJs: true` |
| Chart updateSeries | ✅ | Works view usa update() em vez de destroy+recreate |
| Testes headless | ✅ | 89 passando (85 unit + 4 a11y) em Vitest + jsdom |
| Build de produção | ✅ | `npm run build` → dist/ (HTML 4KB + CSS 47KB + JS app 122KB + vendor 523KB) |
| Demo mode | ✅ | `?demo=1` na URL ativa 30 obras |
| **Theme System (F1)** | ✅ | `src/styles/theme.css` — CSS vars semânticas + .dark + 9 theme stubs + chart/effect tokens |
| **Design Tokens (F2)** | ✅ | `getChartDefaults()` lazy init + Proxy compat + 15 dark utility tokens + motion tokens consolidados |
| **API Manifest (F4)** | ✅ | 3 `.d.ts` (domain/ui/model) + `v8.d.ts` ambient + `sideEffects: false` — 91 exports tipados |
| **Branding como Dado (F5)** | ✅ | `src/model/branding.js` — NAV_ITEMS + VIEW_LABELS + BRANDING_DEFAULTS + REPORTS + STORAGE_PREFIX — trocar vertical = 4 arquivos |
| **F-CONSOLIDATE** | ✅ | Dead code eliminado, layer separation, semantic CSS, audit.cjs, CONTRIBUTING.md, replication proof (vet-vertical) |
| **ETL Real** | ✅ | `etl_v8/main.py` → 43 fontes XLSX → snapshot.json → mock.js hydration — 11/15 campos derivados de dados reais |

## Comparação com V7

| | V7 | V8 |
|---|---|---|
| Tamanho | 1 arquivo, ~3200 linhas | ~28 arquivos, ~50–200 linhas cada |
| Estado | IIFE mutável, vars globais | Store pub/sub explícito |
| KPIs | Hardcoded em HTML | Funções puras + render (consumidos por views) |
| Filtros | Acoplados ao DOM | Funções puras + renderFilterBar |
| Charts | Sem lifecycle (bug fix em V7 final) | Lifecycle obrigatório (mountChart/destroy) |
| Build | Não | Vite (dev + build + HMR + tree-shaking + vendor chunks) |
| Testes | Browser-only | 89 headless (Vitest + axe-core) + browser (run.html) |
| Charts lib | ApexCharts CDN | ApexCharts npm (empacotado, offline) |
| CSS | CDN + inline | PostCSS pipeline (Tailwind purge) |
| Acessibilidade | Manual | axe-core automatizado (WCAG AA) |
| Mock | Hardcoded em `<tr>` | `src/model/mock.js` compartilhável |
| Persona | Não | 3 personas (integralmente consumido) |
| Settings | localStorage direto | Store = única fonte; localStorage = persistence |
| **Temas** | 48 `!important` overrides | CSS vars + `.dark` cascata natural (F1) |
