import { it, expect } from './runner.js';
import { query } from '../src/domain/query-engine.js';
import { obras } from '../src/model/mock.js';

// Helper to sum a field in an array of objects, safely (ignore non-numeric)
const sumField = (arr, field) => arr.reduce((acc, r) => {
  const v = r[field];
  const n = typeof v === 'number' && !Number.isNaN(v) ? v : 0;
  return acc + n;
}, 0);

// 1) empty data returns empty { rows: [], totals: {} }
it('query: empty data returns empty rows and totals', () => {
  const res = query({ data: [], filters: {}, aggregates: [] });
  expect(res.rows).toEqual([]);
  expect(res.totals).toEqual({});
});

// 2) filter equality single field
it('query: filter equality single field', () => {
  const data = obras.slice(0, 5);
  const res = query({ data, filters: { status: 'Em progresso' } });
  const expected = data.filter((r) => r.status === 'Em progresso');
  expect(res.rows).toEqual(expected);
  expect(res.totals).toEqual({});
});

// 3) filter equality multi (AND)
it('query: filter equality multi (AND)', () => {
  const data = obras.slice(0, 8);
  const res = query({ data, filters: { status: 'Em progresso', tipo: 'Loteamento' } });
  const expected = data.filter(r => r.status === 'Em progresso' && r.tipo === 'Loteamento');
  expect(res.rows).toEqual(expected);
  expect(res.totals).toEqual({});
});

// 4) filter array shorthand (in-operator)
it('query: filter using in-operator shorthand (array)', () => {
  const data = obras.slice(0, 10);
  const res = query({ data, filters: { status: ['Em progresso', 'Atenção'] } });
  const expected = data.filter(r => ['Em progresso','Atenção'].includes(r.status));
  expect(res.rows).toEqual(expected);
  expect(res.totals).toEqual({});
});

// 5) operator gt
it('query: filter operator gt', () => {
  const data = obras;
  const res = query({ data, filters: { avanco: { op: 'gt', value: 60 } } });
  const expected = data.filter(r => typeof r.avanco === 'number' && r.avanco > 60);
  expect(res.rows).toEqual(expected);
  expect(res.totals).toEqual({});
});

// 6) operator gte
it('query: filter operator gte', () => {
  const data = obras;
  const res = query({ data, filters: { avanco: { op: 'gte', value: 68 } } });
  const expected = data.filter(r => typeof r.avanco === 'number' && r.avanco >= 68);
  expect(res.rows).toEqual(expected);
  expect(res.totals).toEqual({});
});

// 7) operator lt
it('query: filter operator lt', () => {
  const data = obras;
  const res = query({ data, filters: { avanco: { op: 'lt', value: 50 } } });
  const expected = data.filter(r => typeof r.avanco === 'number' && r.avanco < 50);
  expect(res.rows).toEqual(expected);
  expect(res.totals).toEqual({});
});

// 8) operator lte
it('query: filter operator lte', () => {
  const data = obras;
  const res = query({ data, filters: { avanco: { op: 'lte', value: 50 } } });
  const expected = data.filter(r => typeof r.avanco === 'number' && r.avanco <= 50);
  expect(res.rows).toEqual(expected);
  expect(res.totals).toEqual({});
});

// 9) operator ne
it('query: filter operator ne', () => {
  const data = obras;
  const res = query({ data, filters: { status: { op: 'ne', value: 'Concluída' } } });
  const expected = data.filter(r => r.status !== 'Concluída');
  expect(res.rows).toEqual(expected);
  expect(res.totals).toEqual({});
});

// 10) between
it('query: filter operator between', () => {
  const data = obras;
  const res = query({ data, filters: { avanco: { op: 'between', value: [60, 75] } } });
  const expected = data.filter(r => typeof r.avanco === 'number' && r.avanco >= 60 && r.avanco <= 75);
  expect(res.rows).toEqual(expected);
  expect(res.totals).toEqual({});
});

// 11) aggregate sum (no groupBy)
it('query: aggregate sum (no groupBy) goes to totals', () => {
  const data = obras;
  const res = query({ data, aggregates: [{ field: 'orcado', op: 'sum' }] });
  const expected = sumField(data, 'orcado');
  expect(res.rows.length).toBe(data.length);
  expect(res.totals).toHaveProperty('orcado_sum', expected);
});

// 12) aggregate avg
it('query: aggregate avg', () => {
  const data = obras;
  const res = query({ data, aggregates: [{ field: 'orcado', op: 'avg' }] });
  const nums = data.map(r => typeof r.orcado === 'number' ? r.orcado : NaN).filter(x => !Number.isNaN(x));
  const expected = nums.length ? nums.reduce((a,b)=>a+b,0)/nums.length : NaN;
  expect(res.totals).toHaveProperty('orcado_avg', expected);
});

// 13) aggregate count
it('query: aggregate count', () => {
  const data = obras;
  const res = query({ data, aggregates: [{ field: 'nome', op: 'count' }] });
  expect(res.totals).toHaveProperty('nome_count', data.length);
});

// 14) min and max
it('query: aggregate min and max', () => {
  const data = obras;
  const res = query({ data, aggregates: [
    { field: 'orcado', op: 'min' },
    { field: 'orcado', op: 'max' },
  ]});
  const nums = data.map(r => r.orcado);
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  expect(res.totals).toHaveProperty('orcado_min', min);
  expect(res.totals).toHaveProperty('orcado_max', max);
});

// 15) groupBy + sum
it('query: groupBy + sum', () => {
  const data = obras;
  const res = query({ data, groupBy: 'tipo', aggregates: [{ field: 'orcado', op: 'sum' }] });
  expect(res.rows.length).toBeGreaterThan(0);
  for (const row of res.rows) {
    expect(row).toHaveProperty('tipo');
    expect(row).toHaveProperty('orcado_sum');
  }
});

// 16) groupBy + multi aggregate
it('query: groupBy + multi aggregate', () => {
  const data = obras;
  const res = query({ data, groupBy: 'tipo', aggregates: [
    { field: 'orcado', op: 'sum' },
    { field: 'avanco', op: 'max' },
  ]});
  expect(res.rows.length).toBeGreaterThan(0);
  for (const row of res.rows) {
    expect(row).toHaveProperty('tipo');
    expect(row).toHaveProperty('orcado_sum');
    expect(row).toHaveProperty('avanco_max');
  }
});

// 17) aggregate as alias
it('query: aggregate as alias', () => {
  const data = obras;
  const res = query({ data, aggregates: [{ field: 'orcado', op: 'sum', as: 'budget' }] });
  expect(res.totals).toHaveProperty('budget');
});

// 18) mock data: filter obras 'Em progresso' + sum orcado
it('query: mock obras filter Em progresso + sum orcado', () => {
  const data = obras;
  const res = query({ data, filters: { status: 'Em progresso' }, aggregates: [{ field: 'orcado', op: 'sum' }] });
  const filtered = data.filter(r => r.status === 'Em progresso');
  const expected = sumField(filtered, 'orcado');
  expect(res.totals).toHaveProperty('orcado_sum', expected);
});

// 19) mock data: groupBy tipo + sum executado
it('query: mock obras groupBy tipo + sum executado', () => {
  const data = obras;
  const res = query({ data, groupBy: 'tipo', aggregates: [{ field: 'executado', op: 'sum' }] });
  expect(res.rows.length).toBeGreaterThan(0);
  for (const row of res.rows) {
    expect(row).toHaveProperty('tipo');
    expect(row).toHaveProperty('executado_sum');
  }
});

// 20) edge: non-existent field filter -> rows rejected
it('query: edge - filter on non-existent field yields no rows', () => {
  const data = obras;
  const res = query({ data, filters: { fooBar: 'x' } });
  expect(res.rows.length).toBe(0);
  expect(res.totals).toEqual({});
});

// 21) edge: aggregate on non-numeric field -> NaN-safe (sum skips non-numeric; avg/min/max NaN when no numeric)
it('query: edge - aggregate on non-numeric field should skip non-numeric', () => {
  const data = obras;
  const res = query({ data, aggregates: [{ field: 'nome', op: 'sum' }] });
  // nome is a string; sum should be 0 (no numeric values found)
  expect(res.totals).toHaveProperty('nome_sum', 0);
});

// 22) edge: groupBy on undefined field → 'undefined' group
it('query: edge - groupBy on undefined field yields "undefined" group', () => {
  const data = [{ a: 1 }];
  const res = query({ data, groupBy: 'bobby' });
  expect(res.rows.length).toBe(1);
  expect(res.rows[0]).toHaveProperty('bobby', 'undefined');
});

// 23) edge: between without array of 2 → throws Error
it('query: between without array of 2 should throw', () => {
  const data = obras;
  expect(() => query({ data, filters: { avanco: { op: 'between', value: [60] } } })).toThrow();
});
