// Test runner mínimo. Sem framework. Roda no browser nativo (ES modules).
// Filosofia: cada função pura V8 nasce com >=1 teste (Risco 7 do plano).
// API: it(label, fn), expect(actual).toBe/toEqual/toBeCloseTo/toBeTruthy/toHaveLength.
//
// Fase 1 (Spike 1B): quando rodando sob Vitest com `globals: true`, este
// runner detecta os globais `it`/`expect`/`describe` e re-exporta. Test files
// continuam fazendo `import { it, expect } from './runner.js'` e funcionam em
// AMBOS os ambientes (test/run.html no browser e `npm test` em terminal).

// Detecção de ambiente Vitest (globals: true em vitest.config.js).
const _isVitest =
  typeof globalThis !== 'undefined' &&
  typeof globalThis.it === 'function' &&
  typeof globalThis.expect === 'function';

const _tests = [];

function _localIt(label, fn) {
  _tests.push({ label, fn });
}

function _localDescribe(label, fn) {
  // Descritivo apenas — agrupa via console.group, não muda execução
  if (typeof fn === 'function') fn();
}

export const it = _isVitest ? globalThis.it : _localIt;
export const describe = _isVitest ? (globalThis.describe || _localDescribe) : _localDescribe;
export const expect = _isVitest ? globalThis.expect : _localExpect;

function _localExpect(actual) {
  return {
    toBe(expected) {
      if (!Object.is(actual, expected)) {
        throw new Error(`esperado ${fmt(expected)}, recebido ${fmt(actual)}`);
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`esperado (deep) ${fmt(expected)}, recebido ${fmt(actual)}`);
      }
    },
    toBeCloseTo(expected, precision = 2) {
      const factor = Math.pow(10, precision);
      if (Math.round(actual * factor) !== Math.round(expected * factor)) {
        throw new Error(`esperado ~${expected} (precisão ${precision}), recebido ${actual}`);
      }
    },
    toBeGreaterThan(expected) {
      if (!(actual > expected)) throw new Error(`esperado > ${expected}, recebido ${actual}`);
    },
    toBeLessThan(expected) {
      if (!(actual < expected)) throw new Error(`esperado < ${expected}, recebido ${actual}`);
    },
    toBeTruthy() {
      if (!actual) throw new Error(`esperado truthy, recebido ${fmt(actual)}`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`esperado falsy, recebido ${fmt(actual)}`);
    },
    toHaveLength(n) {
      if (!actual || actual.length !== n) {
        throw new Error(`esperado length ${n}, recebido ${actual ? actual.length : 'null/undefined'}`);
      }
    },
    toContain(item) {
      if (!actual || !actual.includes(item)) {
        throw new Error(`esperado conter ${fmt(item)}, recebido ${fmt(actual)}`);
      }
    }
  };
}

export async function runAll() {
  // Browser-only: vitest gerencia execução próprio. Em vitest, _tests está vazio
  // porque `it` aponta para globalThis.it — esta função fica inerte.
  const results = [];
  for (const t of _tests) {
    try {
      await t.fn();
      results.push({ label: t.label, ok: true });
    } catch (e) {
      results.push({ label: t.label, ok: false, error: e && e.message ? e.message : String(e) });
    }
  }
  const passed = results.filter((r) => r.ok).length;
  const failed = results.length - passed;
  return { results, passed, failed, total: results.length };
}

function fmt(v) {
  try { return JSON.stringify(v); } catch (e) { return String(v); }
}
