// Chart theme bridge (F2.2 — Audit-Fix: Abstraction Leak).
// This is the ONLY module in domain/ that reads CSS Custom Properties from DOM.
// All chart color/theme resolution flows through here, making chart.js testable
// without DOM by injecting a theme object.

/**
 * Read all chart-related CSS Custom Properties from :root.
 * Returns a flat object with resolved values (or fallbacks).
 * Call this ONCE per mount cycle — views pass the result to chart builders.
 * @returns {Record<string, string|boolean>}
 */
export function readChartTheme() {
  if (typeof document === 'undefined' || !document.documentElement) return FALLBACK_THEME;
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  /** @type {Record<string, string|boolean>} */
  const out = {};
  for (const [key, fallback] of Object.entries(CSS_VAR_MAP)) {
    const val = cs.getPropertyValue(key).trim();
    out[key] = val || fallback;
  }
  out._isDark = root.classList.contains('dark');
  return out;
}

/**
 * Resolve a single CSS var from a pre-read theme object.
 * Pure function — no DOM access. Domain-safe.
 * @param {Record<string, string|boolean>} theme
 * @param {string} name CSS variable name (e.g. '--chart-categorical-1')
 * @param {string} [fallback]
 * @returns {string}
 */
export function resolveCSSVar(theme, name, fallback = '') {
  if (theme && typeof theme[name] === 'string') return theme[name];
  return CSS_VAR_MAP[name] || fallback;
}

/**
 * Check if theme object indicates dark mode.
 * @param {Record<string, string|boolean>} theme
 * @returns {boolean}
 */
export function isThemeDark(theme) {
  return theme && theme._isDark === true;
}

// ─── CSS Variable Registry ──────────────────────────────────────────────────
// Single source of truth for all chart CSS vars and their fallbacks.
// When adding new chart tokens to theme.css, register them here.
const CSS_VAR_MAP = {
  '--chart-categorical-1': '#4c5e86',
  '--chart-categorical-2': '#0a1f44',
  '--chart-categorical-3': '#b37c59',
  '--chart-categorical-4': '#ba1a1a',
  '--chart-categorical-5': '#7687b2',
  '--chart-categorical-6': '#585e70',
  '--chart-grid': '#e0e3e5',
  '--chart-axis-label': '#75777f',
  '--chart-axis-border': '#e5e7eb',
  '--chart-legend': '#44464e',
  '--chart-sequential-1': '#d9e2ff',
  '--chart-sequential-2': '#b4c6f4',
  '--chart-sequential-3': '#7687b2',
  '--chart-sequential-4': '#4c5e86',
  '--chart-sequential-5': '#34466d',
  '--chart-sequential-6': '#0a1f44',
  '--chart-divergent-1': '#ba1a1a',
  '--chart-divergent-2': '#e57373',
  '--chart-divergent-3': '#e0e3e5',
  '--chart-divergent-4': '#81c784',
  '--chart-divergent-5': '#2e7d32',
  '--chart-status-bad': '#ba1a1a',
  '--chart-status-warn': '#b37c59',
  '--chart-status-good': '#2e7d32',
  '--chart-datalabel': '#0a1f44'
};

// Fallback theme for SSR/test environments (no DOM)
/** @type {Record<string, string|boolean>} */
const FALLBACK_THEME = { ...CSS_VAR_MAP, _isDark: false };

export { CSS_VAR_MAP, FALLBACK_THEME };
