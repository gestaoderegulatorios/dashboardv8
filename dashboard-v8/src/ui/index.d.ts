// F4: API Manifest — src/ui type declarations
// Permissive types — JSDoc code can't satisfy strict unions without TypeScript.

// ─── animate.js
export function animateNumber(el: HTMLElement, target: number, opts?: any): void;
export function initAnimatedValues(root?: any): void;

// ─── command-palette.js
export function registerCommand(cmd: any): void;
export function clearCommands(): void;
export function openPalette(): void;
export function closePalette(): void;
export function initCommandPalette(): void;

// ─── dark-mode.js
export function isDarkMode(): boolean;
export function applyDarkMode(enabled: boolean): void;
export function toggleDarkMode(store: any): void;
export function initDarkMode(store: any): void;

// ─── modal.js
export function openChartFullscreen(chartId: string, title: string): void;
export function closeModal(): void;
export function openTableFullscreen(title: string, tableHTML: string): void;
export function openContentFullscreen(title: string, innerHTML: string): void;
export function initModal(): void;

// ─── reveal.js
export function initReveal(root: HTMLElement): void;

// ─── ripple.js
export function initRipple(): void;

// ─── sidebar.js
export const NAV_ITEMS: any[];
export function renderSidebar(opts?: any): void;
export function mountSidebar(opts: any): void;
export function toggleSidebar(store: any): void;
export function applySidebarState(open: boolean): void;

// ─── topbar.js
export function renderTopbar(opts: any): void;
export function mountTopbar(opts: any): void;
