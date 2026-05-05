// F4: API Manifest — src/domain type declarations
// These types document the public API surface for tree-shaking and IDE support.
// Types are intentionally permissive — JSDoc code without TypeScript can't satisfy strict unions.

// ─── chart.js ─────────────────────────────────────────────────────────────────
export function getCSSVar(name: string, fallback?: string): string;
export function getChartDefaults(): any;
export const borgChartDefaults: any;
export function getChartConfig(chartId: string): any;
export function getSequentialPalette(): string[];
export function getDivergentPalette(): string[];
export const tooltipBRL: (val: number | null) => string;
export const tooltipPercent: (val: number | null) => string;
export const tooltipInteger: (val: number | null) => string;
export function getGaugeColor(v: number): string;

export interface ChartHandle {
  instance: any | null;
  update(newOptions: any): void;
  updateSeries(series: any[]): void;
  resize(): void;
  destroy(): void;
}

export function mountChart(container: HTMLElement, options: any): ChartHandle;

export function buildAvancoBarOptions(obras: any[]): any;
export function buildComposicaoDonutOptions(composicao: any[]): any;
export function buildReceitaAreaOptions(meses: string[], receitaMensal: number[]): any;
export function buildGaugeOptions(percent: number, label?: string): any;
export function buildSparklineOptions(data: number[], color?: string, type?: 'line' | 'area'): any;

// ─── filter.js ─────────────────────────────────────────────────────────────────
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
export function downloadCSV(filename: string, csvText: string): void;
