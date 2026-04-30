// Vitest config — Fase 1 (testes headless via jsdom).
// `globals: true` injeta `it`/`expect`/`describe` no globalThis. test/runner.js
// detecta esses globais e re-exporta em vez de usar a implementação browser local.
// Resultado: arquivos *.test.js continuam usando `import { it, expect } from './runner.js'`
// e funcionam tanto no test/run.html (browser) quanto via `npm test` (vitest).
//
// setupFiles registra polyfills mínimos para que módulos V8 que dependem de
// ResizeObserver / IntersectionObserver / ApexCharts / matchMedia carreguem em jsdom.

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/vitest-setup.js'],
    include: ['test/**/*.test.js'],
    // Mantém ordem determinística — testes V8 são autônomos mas algumas
    // suítes podem mexer em document.body.
    fileParallelism: false,
    // Reporter compacto para terminal.
    reporters: ['default']
  }
});
