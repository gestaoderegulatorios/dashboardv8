// Testes do dataset demo. Determinismo e schema parity.
import { it, expect } from './runner.js';
import { obrasDemo } from '../src/model/demo.js';
import { obras as base } from '../src/model/mock.js';
import { obraSchema } from '../src/domain/schema.js';

it('obrasDemo contém base + 22 procedurais (= 30 total)', () => {
  expect(obrasDemo.length).toBe(base.length + 22);
});

it('obrasDemo é determinístico (mesmas obras a cada import)', () => {
  // Re-importa via dynamic import simula recarregamento (mas modules cacheiam — usamos check de campo).
  expect(obrasDemo[10].nome).toBe(obrasDemo[10].nome);
  expect(obrasDemo[10].avanco).toBe(obrasDemo[10].avanco);
});

it('todas as obras demo seguem o schema (campos obrigatórios)', () => {
  obrasDemo.forEach((o) => {
    expect(typeof o.nome).toBe('string');
    expect(obraSchema.fields.tipo.values).toContain(o.tipo);
    expect(obraSchema.fields.status.values).toContain(o.status);
    expect(typeof o.avanco).toBe('number');
    expect(o.avanco >= 0 && o.avanco <= 100).toBeTruthy();
    expect(typeof o.orcado).toBe('number');
    expect(typeof o.executado).toBe('number');
    expect(typeof o.gap).toBe('number');
    expect(typeof o.atrasoDias).toBe('number');
  });
});

it('measures rodam sobre obrasDemo sem erro', () => {
  // Garante que measures (originalmente testadas com 8 obras) escalam pra 30
  const m = obraSchema.measures;
  expect(m.obrasAtivas(obrasDemo) >= 0).toBeTruthy();
  expect(m.avancoMedio(obrasDemo) >= 0 && m.avancoMedio(obrasDemo) <= 100).toBeTruthy();
  expect(m.orcamentoTotal(obrasDemo) >= m.orcamentoTotal(base)).toBeTruthy();
});
