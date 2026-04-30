// Testes da camada de tabela. computeView, toggleSort e clampPage são puras.
import { it, expect } from './runner.js';
const { computeView, toggleSort, clampPage } = await import('../src/domain/table.js?ts=' + Date.now());
import { obras } from '../src/model/mock.js';

it('computeView sem view retorna tudo', () => {
  const v = computeView(obras);
  expect(v.rows).toHaveLength(14);
  expect(v.total).toBe(14);
});

it('computeView com sortKey "avanco" asc ordena ascending', () => {
  const v = computeView(obras, { sortKey: 'avanco', sortDir: 'asc' });
  expect(v.rows[0].avanco).toBe(0);
  expect(v.rows[v.rows.length - 1].avanco).toBe(91);
});

it('computeView com sortDir desc inverte', () => {
  const v = computeView(obras, { sortKey: 'avanco', sortDir: 'desc' });
  expect(v.rows[0].avanco).toBe(91);
  expect(v.rows[v.rows.length - 1].avanco).toBe(0);
});

it('computeView com sortKey "nome" usa localeCompare pt-BR', () => {
  const v = computeView(obras, { sortKey: 'nome', sortDir: 'asc' });
  expect(v.rows[0].nome).toBe('Ed. Central');
});

// 14 obras, pageSize 3 = 5 páginas (3*4=12 + 2 rest = 14)
it('computeView paginate page=1 pageSize=3 retorna 3 linhas, totalPages=5', () => {
  const v = computeView(obras, { page: 1, pageSize: 3 });
  expect(v.rows).toHaveLength(3);
  expect(v.totalPages).toBe(5);
  expect(v.total).toBe(14);
});

it('computeView page=5 pageSize=3 retorna 2 linhas (resto)', () => {
  const v = computeView(obras, { page: 5, pageSize: 3 });
  expect(v.rows).toHaveLength(2);
  expect(v.page).toBe(5);
});

it('computeView é pura: não muta data', () => {
  const before = JSON.stringify(obras);
  computeView(obras, { sortKey: 'avanco', sortDir: 'desc' });
  expect(JSON.stringify(obras)).toBe(before);
});

it('toggleSort: mesma key asc -> desc', () => {
  const v = toggleSort({ sortKey: 'nome', sortDir: 'asc' }, 'nome');
  expect(v.sortDir).toBe('desc');
});

it('toggleSort: mesma key desc -> none (limpa)', () => {
  const v = toggleSort({ sortKey: 'nome', sortDir: 'desc' }, 'nome');
  expect(v.sortKey).toBe(undefined);
});

it('toggleSort: nova key -> asc + page reset', () => {
  const v = toggleSort({ sortKey: 'nome', sortDir: 'desc', page: 3 }, 'avanco');
  expect(v.sortKey).toBe('avanco');
  expect(v.sortDir).toBe('asc');
  expect(v.page).toBe(1);
});

// 14 obras, pageSize 3 = 5 páginas. Pedindo page=99 → clampa para 5.
it('computeView clampa page se filtro reduziu total (page > totalPages)', () => {
  const v = computeView(obras, { page: 99, pageSize: 3 });
  expect(v.page).toBe(5);
  expect(v.rows.length).toBe(2); // Última página tem resto.
});

it('clampPage: dentro do range mantém', () => {
  expect(clampPage(2, 5)).toBe(2);
});
it('clampPage: abaixo de 1 vira 1', () => {
  expect(clampPage(0, 5)).toBe(1);
  expect(clampPage(-3, 5)).toBe(1);
  expect(clampPage(NaN, 5)).toBe(1);
});
it('clampPage: acima do max vira max', () => {
  expect(clampPage(99, 5)).toBe(5);
});
