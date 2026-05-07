// F4: API Manifest — src/domain type declarations
// These types document the public API surface for tree-shaking and IDE support.
// Types are intentionally permissive — JSDoc code without TypeScript can't satisfy strict unions.

// ─── chart.js (core lifecycle + palette) ────────────────────────────────────
export function getCSSVar(name: string, fallback?: string, theme?: any): string;
export function getChartDefaults(theme?: any): any;
export const borgChartDefaults: any;
export function getChartConfig(chartId: string): any;
export function getSequentialPalette(theme?: any): string[];
export function getDivergentPalette(theme?: any): string[];
export { readChartTheme, resolveCSSVar, isThemeDark, CSS_VAR_MAP } from './chart-theme.js';

export interface ChartHandle {
  instance: any | null;
  update(newOptions: any): void;
  updateSeries(series: any[]): void;
  resize(): void;
  destroy(): void;
}

export function mountChart(container: HTMLElement, options: any, theme?: any): ChartHandle;

// ─── chart-fragments.js (extracted builders) ────────────────────────────────
export const tooltipBRL: (val: number | null) => string;
export const tooltipPercent: (val: number | null) => string;
export const tooltipInteger: (val: number | null) => string;
export const getGaugeColor: (v: number, theme?: any) => string;
export function buildAvancoBarOptions(obras: any[], theme?: any): any;
export function buildComposicaoDonutOptions(composicao: any[]): any;
export function buildReceitaAreaOptions(meses: string[], receitaMensal: number[]): any;
export function buildGaugeOptions(percent: number, label?: string, theme?: any): any;
export function buildSparklineOptions(data: number[], color?: string, type?: 'line' | 'area', theme?: any): any;

// ─── filter.js ──────────────────────────────────────────────────────────────
export function applyFilters(obras: any[], state?: any): any[];
export function listTipos(obras: any[]): string[];
export function listStatuses(obras: any[]): string[];
export function emptyFilterState(): any;
export function renderFilterBar(container: HTMLElement, opts: any): void;

// ─── query-engine.js ──────────────────────────────────────────────────────────
export function query(input: { data: any[]; filters?: any; groupBy?: string; aggregates?: any[] }): { rows: any[]; totals: any };

// ─── kpi.js ────────────────────────────────────────────────────────────────────
export const obraKPIs: any[];
export function computeKPI(descriptor: any, data: any[]): any;
export function renderKPI(container: HTMLElement, kpi: any): void;

// ─── persona.js ────────────────────────────────────────────────────────────────
export const personas: any;
export function getPersona(id: string): any;
export function listPersonas(): any[];
export function orderKPIsByPersona(kpis: any[], persona: any): any[];

// ─── schema.js ─────────────────────────────────────────────────────────────────
export const obraSchema: any;

// ─── storytelling.js ───────────────────────────────────────────────────────────
export function applyStorytelling(obras: any[], pattern?: string): any[];

// ─── table.js ──────────────────────────────────────────────────────────────────
export function computeView(data: any[], view?: any): any;
export function statusBadge(status: string): string;
export function renderTable(container: HTMLElement, view: any, columns: any[], options?: any): void;
export function clampPage(target: number, totalPages: number): number;
export function toggleSort(view: any, key: string): any;
export function rowsToCSV(rows: any[], columns: any[]): string;
