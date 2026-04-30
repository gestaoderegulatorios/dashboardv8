// Testes da camada KPI. computeKPI é puro — fácil testar.
import { it, expect } from './runner.js';
import { obraKPIs, computeKPI } from '../src/domain/kpi.js';
import { obras } from '../src/model/mock.js';

it('obraKPIs tem 3 KPIs canônicos', () => {
  expect(obraKPIs).toHaveLength(3);
  const ids = obraKPIs.map((k) => k.id);
  expect(ids).toEqual(['obras-ativas', 'avanco-medio', 'atraso-medio']);
});

it('cada KPI descriptor tem campos obrigatórios', () => {
  obraKPIs.forEach((k) => {
    expect(typeof k.id).toBe('string');
    expect(typeof k.label).toBe('string');
    expect(typeof k.icon).toBe('string');
    expect(typeof k.compute).toBe('function');
    expect(typeof k.format).toBe('function');
  });
});

// Em progresso(7) + Atenção(4) = 11
it('computeKPI Obras Ativas retorna value=11 e formatted="11"', () => {
  const kpi = computeKPI(obraKPIs[0], obras);
  expect(kpi.value).toBe(11);
  expect(kpi.formatted).toBe('11');
});

// avancoMedio = 53.5% → formatted "53.5%"
it('computeKPI Avanço Médio formatted = "53.5%"', () => {
  const kpi = computeKPI(obraKPIs[1], obras);
  expect(kpi.formatted).toBe('53.5%');
});

// atrasoMedioPercent = 3.4% (1 decimal → 3.4%)
it('computeKPI Atraso Médio formatted = "3.4%"', () => {
  const kpi = computeKPI(obraKPIs[2], obras);
  expect(kpi.formatted).toBe('3.4%');
});

it('computeKPI preserva o descriptor original em meta', () => {
  const kpi = computeKPI(obraKPIs[0], obras);
  expect(kpi.meta.id).toBe('obras-ativas');
  expect(kpi.meta.label).toBe('Obras Ativas');
});

it('computeKPI com array vazio não quebra (graças ao schema)', () => {
  const kpi = computeKPI(obraKPIs[1], []);
  expect(kpi.value).toBe(0);
  expect(kpi.formatted).toBe('0.0%');
});

it('computeKPI é puro: não muta data', () => {
  const before = JSON.stringify(obras);
  computeKPI(obraKPIs[0], obras);
  computeKPI(obraKPIs[1], obras);
  computeKPI(obraKPIs[2], obras);
  expect(JSON.stringify(obras)).toBe(before);
});
