// F4: API Manifest — src/model type declarations
// Permissive types — JSDoc code can't satisfy strict unions without TypeScript.

// ─── mock.js
export let obras: any[];
export let meses12: string[];
export let receitaMensal: number[];
export let composicaoTipo: any[];
export let margemSpark: number[];
export let heroSpark: number[];
export let metaAnualPercent: number;
export function _hydrateFromSnapshot(s: any): void;
export function _applyDelta(delta: any): void;

// ─── etl-normalize.js — ETL→V8 value normalization
export const STATUS_ETL_TO_V8: Record<string, string>;
export const TIPO_ETL_TO_V8: Record<string, string>;
export const NOME_ETL_TO_V8: Record<string, string>;
export function normalizeObra(o: any): any;

// ─── snapshot.js (F6.6 → P0: cache API)
export function loadSnapshot(force?: boolean): Promise<void>;
export function getLastSnapshot(): any;
export function getLastFetchTs(): number;
export function resetSnapshotCache(): void;

// ─── demo.js
export const obrasDemo: any[];
export function resolveDataset(): { obras: any[]; isDemo: boolean };

// ─── store.js
export function createStore(initialState: any): any;

// ─── bus.js
export function on(event: string, fn: (payload?: any) => void): void;
export function emit(event: string, payload?: any): void;
export function _reset(): void;

// ─── settings.js
export function loadSettings(): any;
export function saveSettings(settings: any): void;
export const DEFAULTS: any;
export const STORAGE_KEY: string;

// ─── branding.js
export const STORAGE_PREFIX: string;
export const BRANDING_DEFAULTS: any;
export const NAV_ITEMS: any[];
export const VIEW_LABELS: any;
export const REPORTS: any[];
export const REPORT_SUMMARIES: any;
export const SIDEBAR_LOGO_ICON: string;

// ─── ui-state.js
export function loadUIState(): any;
export function saveUIState(ui: any): void;
export const STORAGE_KEY_SIDEBAR: string;
export const STORAGE_KEY_THEME: string;

// ─── snapshot-delta.js
export function diff(prev: any | null, next: any): { added: any[]; modified: any[]; removed: any[]; unchanged: number; seriesChanged: boolean; next: any };
export function hasChanges(delta: any): boolean;
