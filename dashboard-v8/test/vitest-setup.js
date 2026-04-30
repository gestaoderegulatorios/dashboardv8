// Polyfills + mocks para rodar testes V8 em ambiente jsdom (Vitest).
// Não afeta testes em browser (test/run.html) — esses globais já existem nativamente lá.
//
// Princípio: o mínimo necessário para que módulos V8 carreguem sem crashar.
// Comportamento real é validado nos testes de função pura (schema/kpi/filter/table/persona).
// Testes que dependem de comportamento real (ex.: animate.test.js polla rAF) usam o probe
// existente em test/animate.test.js que tolera ambiente onde rAF não dispara como em browser.

// ─── ResizeObserver ──────────────────────────────────────────────────────────
// Usado por chart/chart.js para auto-resize.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    constructor(_callback) { /* noop */ }
    observe(_target) { /* noop */ }
    unobserve(_target) { /* noop */ }
    disconnect() { /* noop */ }
  };
}

// ─── IntersectionObserver ────────────────────────────────────────────────────
// Usado por ui/reveal.js para reveal-on-scroll.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor(callback, options) { this.callback = callback; this.options = options || {}; }
    observe(_target) { /* noop */ }
    unobserve(_target) { /* noop */ }
    disconnect() { /* noop */ }
    takeRecords() { return []; }
    root = null;
    rootMargin = '0px';
    thresholds = [0];
  };
}

// ─── matchMedia ───────────────────────────────────────────────────────────────
// jsdom não implementa matchMedia. Vários módulos V8 consultam para reduced-motion
// e dark-mode preference detection.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},        // legacy API
    removeListener: () => {},     // legacy API
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  });
}

// ─── ApexCharts mock ──────────────────────────────────────────────────────────
// chart/chart.js verifica `window.ApexCharts` e cria instâncias. Em jsdom não
// há SVG render real — fornecemos uma classe stub com a superfície usada por V8:
// constructor(el, opts), render, updateOptions, updateSeries, destroy.
// Testes que precisarem do comportamento real do ApexCharts devem rodar no browser.
// Fase 5.1: ApexCharts agora é npm dep. O import real chega aqui primeiro,
// mas sobrescrevemos com stub leve para jsdom (evita carregar ~500KB de lib).
if (typeof window !== 'undefined') {
  window.ApexCharts = class ApexCharts {
    constructor(el, opts) {
      this.el = el;
      this.opts = opts || {};
      this.w = { config: this.opts };
    }
    render() { return Promise.resolve(); }
    updateOptions(_opts, _redraw, _animate) { return Promise.resolve(); }
    updateSeries(_series, _animate) { return Promise.resolve(); }
    destroy() { /* noop */ }
  };
  // Algumas builds expõem como global também.
  globalThis.ApexCharts = window.ApexCharts;
}

// ─── requestAnimationFrame (defensivo) ───────────────────────────────────────
// jsdom moderno tem rAF, mas garantimos comportamento síncrono-curto para
// que loops de animação não fiquem pendurados em testes headless.
if (typeof globalThis.requestAnimationFrame !== 'function') {
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
}
