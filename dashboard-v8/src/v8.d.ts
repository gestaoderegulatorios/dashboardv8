// F4: Global ambient declarations for V8
// Extends built-in types to cover DOM patterns used in JSDoc code.

/** CSS module declarations */
declare module '*.css' {
  const content: string;
  export default content;
}

/** KPIDescriptor — fully permissive for JSDoc code */
type KPIDescriptor = Record<string, any> & { id: string };

/** NavItem type for sidebar */
interface NavItem {
  id: string;
  label: string;
  icon: string;
  group?: string;
  [key: string]: any;
}

/** Window.__V8 global API */
interface Window {
  __V8: {
    store: any;
    on: (event: string, fn: (payload?: any) => void) => void;
    emit: (event: string, payload?: any) => void;
    setPersona: (id: string) => void;
    setView: (id: string) => void;
    setFilter: (k: string, v: any) => void;
    setStory: (p: string) => void;
    toggleSidebar: (store: any) => void;
    toggleDarkMode: (store: any) => void;
    openPalette: () => void;
    reset: () => void;
  };
  __dashboard_health: () => {
    version: string;
    uptime: number;
    errors: number;
    lastError: string;
    viewsMounted: number;
    timestamp: number;
  };
}

/** Element.dataset — TS DOM lib types Element without dataset */
interface Element {
  dataset: DOMStringMap;
}

/** EventTarget extensions for event delegation */
interface EventTarget {
  closest(selector: string): Element | null;
  value: string;
}

/** Event extensions */
interface Event {
  key: string;
}

/** HTMLInputElement extends HTMLElement with value */
interface HTMLElement {
  value: string;
}
