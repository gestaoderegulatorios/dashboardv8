// Vite config — Fase 5 (estabilização).
// Filosofia: Vite serve como dev server + bundler de produção.
// Fase 5.1: ApexCharts agora é npm dep (não CDN). Separado em vendor chunk para cache.
//
// `base: './'` produz paths relativos no build (./assets/... em vez de /assets/...).
// Isso permite servir dist/ a partir de qualquer subdiretório sem configuração extra.

import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './',
  resolve: {
    alias: { '@': '/src' }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: 'index.html',
      output: {
        manualChunks: {
          // ApexCharts é pesado (~500KB) — separar para cache independente
          vendor: ['apexcharts']
        }
      }
    }
  },
  server: {
    port: 5173,
    open: false,
    strictPort: false,
    fs: { allow: ['..'] }
  },
  preview: {
    port: 4173,
    strictPort: false
  }
});
