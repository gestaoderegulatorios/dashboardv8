// Testes da camada de filtros. Cada filtro = função pura.
import { it, expect } from './runner.js';
import { applyFilters, listTipos, listStatuses, emptyFilterState } from '../src/domain/filter.js';
import { obras } from '../src/model/mock.js';

it('applyFilters sem state retorna todas as 14 obras', () => {
  expect(applyFilters(obras)).toHaveLength(14);
});

it('applyFilters com state vazio retorna todas', () => {
  expect(applyFilters(obras, emptyFilterState())).toHaveLength(14);
});

it('search "Torre A" retorna 1 (case-sensitive de espaço)', () => {
  expect(applyFilters(obras, { search: 'Torre A' })).toHaveLength(1);
});

// "torre" = Torre A, Torre B, Torre C, Torre D, Torre E, Torre F = 6
it('search é case-insensitive: "torre" retorna 6', () => {
  expect(applyFilters(obras, { search: 'torre' })).toHaveLength(6);
});

it('search com whitespace é normalizado', () => {
  expect(applyFilters(obras, { search: ' TORRE ' })).toHaveLength(6);
});

it('search vazio não filtra', () => {
  expect(applyFilters(obras, { search: '' })).toHaveLength(14);
  expect(applyFilters(obras, { search: ' ' })).toHaveLength(14);
});

// Loteamento: Torre B, Res.Parque, Jardim Europa, Horizon, Loteamento Bosque = 5
it('tipo Loteamento retorna 5 obras', () => {
  expect(applyFilters(obras, { tipo: 'Loteamento' })).toHaveLength(5);
});

it('tipo "all" não filtra', () => {
  expect(applyFilters(obras, { tipo: 'all' })).toHaveLength(14);
});

// Em progresso: Torre A, Res.Parque, Horizon, Torre E, Torre F, Galpão, Estação = 7
it('status "Em progresso" retorna 7', () => {
  expect(applyFilters(obras, { status: 'Em progresso' })).toHaveLength(7);
});

it('composição: Loteamento + Em progresso = 2 (Residencial Parque + Horizon)', () => {
  const r = applyFilters(obras, { tipo: 'Loteamento', status: 'Em progresso' });
  expect(r).toHaveLength(2);
  expect(r.map((o) => o.nome).sort()).toEqual(['Horizon Hills', 'Residencial Parque']);
});

// avancoMin 50: 68,55,72,64,82,57,91,73 = 8
it('avancoMin 50 retorna 8 obras', () => {
  expect(applyFilters(obras, { avancoMin: 50 })).toHaveLength(8);
});

// avancoMax 40: 31,38,29,0 = 4
it('avancoMax 40 retorna 4 obras', () => {
  expect(applyFilters(obras, { avancoMax: 40 })).toHaveLength(4);
});

// [40, 60]: Torre B 43, Torre D 55, Torre F 57, Ponte Viária 46 = 4
it('avancoMin + avancoMax compõem range', () => {
  const r = applyFilters(obras, { avancoMin: 40, avancoMax: 60 });
  expect(r).toHaveLength(4);
});

it('filtro impossível retorna []', () => {
  expect(applyFilters(obras, { tipo: 'NãoExiste' })).toHaveLength(0);
});

it('applyFilters não muta original (referência preservada)', () => {
  const before = obras.length;
  const beforeFirst = obras[0].avanco;
  applyFilters(obras, { tipo: 'Comercial', avancoMin: 30 });
  expect(obras.length).toBe(before);
  expect(obras[0].avanco).toBe(beforeFirst);
});

it('listTipos retorna lista única ordenada alfabeticamente', () => {
  expect(listTipos(obras)).toEqual(['Comercial', 'Edifício', 'Infraestrutura', 'Loteamento']);
});

it('listStatuses retorna 5 status únicos', () => {
  const r = listStatuses(obras);
  expect(r).toHaveLength(5);
  expect(r).toContain('Em progresso');
  expect(r).toContain('Atenção');
  expect(r).toContain('Pendente');
  expect(r).toContain('Concluída');
  expect(r).toContain('Planejado');
});
