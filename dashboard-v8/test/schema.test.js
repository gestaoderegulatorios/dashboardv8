// Testes do schema. Cada measure é função pura — fácil testar isoladamente.
import { it, expect } from './runner.js';
import { obraSchema } from '../src/domain/schema.js';
import { obras } from '../src/model/mock.js';

// 14 obras: Em progresso (Torre A, Res. Parque, Horizon, Torre E, Torre F, Galpão, Estação = 7)
//          + Atenção (Torre B, Jardim Europa, Loteamento Bosque, Ponte Viária = 4) = 11
it('schema.measures.obrasAtivas: Em progresso (7) + Atenção (4) = 11', () => {
  expect(obraSchema.measures.obrasAtivas(obras)).toBe(11);
});

// avancoMedio: (68+43+31+55+72+38+64+0+82+57+29+91+46+73)/14 = 749/14 = 53.5
it('schema.measures.avancoMedio: 14 obras, média = 53.5', () => {
  expect(obraSchema.measures.avancoMedio(obras)).toBeCloseTo(53.5, 1);
});

// atrasoMedioPercent: Σ|gap|/14
// |gaps|: 3.5+7.4+2.9+2.1+1.2+5.1+0.8+0+1.5+4.2+8.1+3.7+6.3+0.4 = 47.2
// 47.2/14 = 3.371...
it('schema.measures.atrasoMedioPercent: Σ|gap|/14 = 3.37', () => {
  expect(obraSchema.measures.atrasoMedioPercent(obras)).toBeCloseTo(3.371, 2);
});

// orcadoTotal: 12+9.8+6.7+15.2+8.4+5.6+7.2+4.5+14.5+11.3+6.2+8.9+18.7+5.1 = 134.1M
it('schema.measures.orcamentoTotal: soma = 134.100.000', () => {
  expect(obraSchema.measures.orcamentoTotal(obras)).toBe(134100000);
});

// executadoTotal: 8.5+4.12+3.1+8.6+6.048+2.128+4.608+0+11.89+6.441+1.798+8.1+8.602+3.723 = 77.658M
it('schema.measures.executadoTotal: soma das execuções = 77.658.000', () => {
  expect(obraSchema.measures.executadoTotal(obras)).toBe(77658000);
});

it('measures não quebram com array vazio', () => {
  expect(obraSchema.measures.obrasAtivas([])).toBe(0);
  expect(obraSchema.measures.avancoMedio([])).toBe(0);
  expect(obraSchema.measures.atrasoMedioPercent([])).toBe(0);
  expect(obraSchema.measures.orcamentoTotal([])).toBe(0);
});

it('measures não mutam o array de entrada', () => {
  const before = JSON.stringify(obras);
  obraSchema.measures.obrasAtivas(obras);
  obraSchema.measures.avancoMedio(obras);
  obraSchema.measures.atrasoMedioPercent(obras);
  expect(JSON.stringify(obras)).toBe(before);
});

it('formats.percent: 1 casa decimal com símbolo', () => {
  expect(obraSchema.formats.percent(46.375)).toBe('46.4%');
  expect(obraSchema.formats.percent(0)).toBe('0.0%');
});

it('formats.integer: arredonda e formata pt-BR', () => {
  expect(obraSchema.formats.integer(5.7)).toBe('6');
  expect(obraSchema.formats.integer(1234)).toBe('1.234');
});

it('formats.currency: BRL formatado em pt-BR', () => {
  const out = obraSchema.formats.currency(12000000);
  expect(out.replace(/\s/g, '').toUpperCase().includes('R$12.000.000,00')).toBeTruthy();
});

it('formats lidam com null sem crashar', () => {
  expect(obraSchema.formats.percent(null)).toBe('');
  expect(obraSchema.formats.integer(null)).toBe('');
  expect(obraSchema.formats.currency(null)).toBe('');
});

it('thresholds têm valores razoáveis e ordenados', () => {
  expect(obraSchema.thresholds.avancoBom > obraSchema.thresholds.avancoAtencao).toBeTruthy();
  expect(obraSchema.thresholds.atrasoCritico).toBeGreaterThan(0);
});

// ─── Measures Fase 3 ───────────────────────────────────────────────────────
// margemBrutaPercent: (134.1M - 77.658M)/134.1M * 100 = 56.442M/134.1M * 100 = 42.09%
it('schema.measures.margemBrutaPercent: (orcado-exec)/orcado*100', () => {
  expect(obraSchema.measures.margemBrutaPercent(obras)).toBeCloseTo(42.09, 1);
});

it('margemBrutaPercent retorna 0 com array vazio (sem div/0)', () => {
  expect(obraSchema.measures.margemBrutaPercent([])).toBe(0);
});

// obrasAtrasadasPercent: gap<0 = Torre A(-3.5), Torre B(-7.4), Torre C(-2.9),
// Jardim Europa(-5.1), Torre F(-4.2), Loteamento Bosque(-8.1), Ponte Viária(-6.3) = 7
// 7/14 * 100 = 50%
it('schema.measures.obrasAtrasadasPercent: 7 com gap<0 / 14 = 50%', () => {
  expect(obraSchema.measures.obrasAtrasadasPercent(obras)).toBe(50);
});

it('obrasAtrasadasPercent: array vazio retorna 0', () => {
  expect(obraSchema.measures.obrasAtrasadasPercent([])).toBe(0);
});

// distribuicaoPorTipo: Loteamento(Torre B, Res.Parque, Jardim Europa, Horizon, Loteamento Bosque)=5
// Edifício(Torre A, Torre E, Torre F)=3, Comercial(Torre C, Ed.Central, Galpão)=3, Infraestrutura(Torre D, Ponte, Estação)=3
it('schema.measures.distribuicaoPorTipo conta corretamente', () => {
  const d = obraSchema.measures.distribuicaoPorTipo(obras);
  expect(d.Loteamento).toBe(5);
  expect(d['Edifício']).toBe(3);
  expect(d.Comercial).toBe(3);
  expect(d.Infraestrutura).toBe(3);
});

// distribuicaoPorStatus: Em progresso=7, Atenção=4, Pendente=1, Concluída=1, Planejado=1
it('schema.measures.distribuicaoPorStatus tem todos os 5 status', () => {
  const d = obraSchema.measures.distribuicaoPorStatus(obras);
  expect(d['Em progresso']).toBe(7);
  expect(d['Atenção']).toBe(4);
  expect(d.Pendente).toBe(1);
  expect(d['Concluída']).toBe(1);
  expect(d.Planejado).toBe(1);
});

it('distribuição com array vazio retorna {}', () => {
  expect(obraSchema.measures.distribuicaoPorTipo([])).toEqual({});
  expect(obraSchema.measures.distribuicaoPorStatus([])).toEqual({});
});
