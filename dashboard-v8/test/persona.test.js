// Testes da camada de persona.
import { it, expect } from './runner.js';
import { personas, getPersona, listPersonas, orderKPIsByPersona } from '../src/domain/persona.js';

it('listPersonas retorna 3 ids', () => {
  expect(listPersonas()).toEqual(['exec', 'managerial', 'operational']);
});

it('getPersona retorna descriptor válido para cada id', () => {
  ['exec', 'managerial', 'operational'].forEach((id) => {
    const p = getPersona(id);
    expect(typeof p.label).toBe('string');
    expect(typeof p.density).toBe('string');
    expect(Array.isArray(p.kpiOrder)).toBeTruthy();
  });
});

it('getPersona com id desconhecido retorna managerial (default)', () => {
  expect(getPersona('xyz').label).toBe('Gerencial');
});

it('persona exec tem density low e showTable=false', () => {
  const p = personas.exec;
  expect(p.density).toBe('low');
  expect(p.showTable).toBe(false);
  expect(p.showChart).toBe(true);
});

it('persona operational tem density high e showChart=false', () => {
  const p = personas.operational;
  expect(p.density).toBe('high');
  expect(p.showTable).toBe(true);
  expect(p.showChart).toBe(false);
});

it('orderKPIsByPersona reordena conforme persona.kpiOrder (exec)', () => {
  const kpis = [{ id: 'obras-ativas' }, { id: 'avanco-medio' }, { id: 'atraso-medio' }];
  const ordered = orderKPIsByPersona(kpis, personas.exec);
  // exec.kpiOrder = ['avanco-medio', 'atraso-medio', 'obras-ativas']
  expect(ordered.map((k) => k.id)).toEqual(['avanco-medio', 'atraso-medio', 'obras-ativas']);
});

it('orderKPIsByPersona não muta entrada', () => {
  const kpis = [{ id: 'a' }, { id: 'b' }];
  const before = JSON.stringify(kpis);
  orderKPIsByPersona(kpis, personas.exec);
  expect(JSON.stringify(kpis)).toBe(before);
});
