// Shared chart fragment builders (extracted from chart.js)
// Note: This module imports theme helpers directly from chart-theme.js to avoid circular deps.

import { resolveCSSVar, readChartTheme } from './chart-theme.js';
import { GAUGE_WARN_THRESHOLD, GAUGE_GOOD_THRESHOLD } from '../model/constants.js';

/**
 * @param {number|null} val
 * @returns {string}
 */
export const tooltipBRL = (val) => val != null ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '';
export const tooltipPercent = (val) => val != null ? val.toFixed(1) + '%' : '';
export const tooltipInteger = (val) => val != null ? Math.round(val).toLocaleString('pt-BR') : '';
export const getGaugeColor = (v, theme) => {
  const t = theme || readChartTheme();
  return v < GAUGE_WARN_THRESHOLD ? resolveCSSVar(t, '--chart-status-bad', '#ba1a1a') :
  v < GAUGE_GOOD_THRESHOLD ? resolveCSSVar(t, '--chart-status-warn', '#b37c59') :
  resolveCSSVar(t, '--chart-status-good', '#2e7d32');
};

/**
 * @typedef {Object} AvancoObra
 * @property {string} nome
 * @property {number} avanco
 */

/**
 * Cria opções para um bar chart de Avanço por Obra (espelho V7).
 * @param {Array<{nome: string, avanco: number}>} obras
 * @param {Record<string, string>} [theme]
 */
export function buildAvancoBarOptions(obras, theme) {
  const t = theme || readChartTheme();
  return {
    chart: { type: 'bar', height: 320 },
    series: [{ name: 'Avanço', data: obras.map((o) => o.avanco) }],
    xaxis: {
      categories: obras.map((o) => o.nome),
      min: 0, max: 100,
      labels: { formatter: (v) => `${Math.round(Number(v))}%` }
    },
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%', dataLabels: { position: 'top' } } },
    dataLabels: {
      enabled: true,
      formatter: (v) => `${v}%`,
      offsetX: 28,
      style: { colors: [resolveCSSVar(t, '--chart-datalabel', '#0a1f44')], fontSize: '11px', fontWeight: 600 }
    },
    colors: [resolveCSSVar(t, '--chart-categorical-1', '#4c5e86')],
    tooltip: { y: { formatter: (v) => `${v}%` } }
  };
}

/**
 * Opções para o donut "Composição por Tipo" (espelho V7).
 * @param {Array<{name: string, value: number}>} composicao
 */
export function buildComposicaoDonutOptions(composicao) {
  return {
    chart: { type: 'donut', height: 320 },
    series: composicao.map((c) => c.value),
    labels: composicao.map((c) => c.name),
    plotOptions: { donut: { size: '70%' } },
    tooltip: { y: { formatter: tooltipPercent } },
    legend: { position: 'bottom' }
  };
}

/**
 * Opções para a área "Evolução Receita 12 meses" (espelho V7).
 * @param {string[]} meses
 * @param {number[]} receitaMensal
 */
export function buildReceitaAreaOptions(meses, receitaMensal) {
  return {
    chart: { type: 'area', height: 320 },
    dataCurrency: true,
    series: [{ name: 'Receita', data: receitaMensal }],
    xaxis: { categories: meses },
    tooltip: { y: { formatter: tooltipBRL } },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.1 } }
  };
}

/**
 * Opções para o gauge radial (espelho V7).
 * @param {number} percent 0..100
 * @param {string} [label]
 * @param {Record<string, string>} [theme]
 */
export function buildGaugeOptions(percent, label, theme) {
  return {
    chart: { type: 'radialBar', height: 280 },
    series: [percent],
    labels: [label || 'Meta'],
    plotOptions: {
      radialBar: {
        hollow: { size: '65%' },
        dataLabels: { name: { show: true, fontSize: '14px' }, value: { show: true, fontSize: '28px', formatter: (v) => v + '%' } }
      }
    },
    colors: [getGaugeColor(percent, theme)]
  };
}

/**
 * Sparkline genérico (linha pequena sem eixos). Espelho V7.
 * @param {number[]} data
 * @param {string} [color]
 * @param {'line'|'area'} [type]
 * @param {Record<string, string>} [theme]
 */
export function buildSparklineOptions(data, color, type, theme) {
  const t = theme || readChartTheme();
  const opts = {
    chart: { type: type || 'line', height: 40, sparkline: { enabled: true } },
    series: [{ data }],
    stroke: { width: 2, curve: 'smooth' },
    tooltip: { enabled: false },
    colors: [color || resolveCSSVar(t, '--chart-status-good', '#2e7d32')]
  };
  if (type === 'area') opts.fill = { type: 'gradient', gradient: { opacityFrom: 0.5, opacityTo: 0.05 } };
  return opts;
}
