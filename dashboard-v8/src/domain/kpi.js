// KPI module. Cada KPI = função pura + render isolado (espelho V7).
// Variantes: 'hero' (primary-container, white 4xl, sparkline) | 'standard' (surface-container-lowest, primary 2xl, ícone).
// Suporta data-animate-value (animação contador 1200ms via ui/animate.js).

import { obraSchema } from './schema.js';
import { escape } from './escape.js';

/**
 * @typedef {Object} KPIDescriptor
 * @property {string} id
 * @property {string} [label]
 * @property {string} [icon]
 * @property {(data: any[]) => number} [compute]
 * @property {(value: number) => string} [format]
 * @property {string} [subtitle]
 * @property {string} [color]
 * @property {string} [variant]
 * @property {string} [period]
 * @property {string} [unit]
 * @property {string} [prefix]
 * @property {string} [suffix]
 * @property {string} [animateFormat]
 * @property {number} [target]
 * @property {string} [sparklineId]
 */

/** @type {KPIDescriptor[]} */
export const obraKPIs = [
  {
    id: 'obras-ativas',
    label: 'Obras Ativas',
    icon: 'domain',
    compute: obraSchema.measures.obrasAtivas,
    format: obraSchema.formats.integer,
    subtitle: 'obras',
    color: 'primary',
    variant: 'standard'
  },
  {
    id: 'avanco-medio',
    label: 'Avanço Médio',
    icon: 'show_chart',
    compute: obraSchema.measures.avancoMedio,
    format: obraSchema.formats.percent,
    color: 'primary',
    variant: 'standard',
    suffix: '%'
  },
  {
    id: 'atraso-medio',
    label: 'Atraso Médio',
    icon: 'schedule',
    compute: obraSchema.measures.atrasoMedioPercent,
    format: obraSchema.formats.percent,
    subtitle: '12% terceirizados',
    color: 'error',
    variant: 'standard',
    suffix: '%'
  }
];

/**
 * @param {KPIDescriptor} descriptor
 * @param {any[]} data
 */
export function computeKPI(descriptor, data) {
  const value = descriptor.compute(data);
  return { value, formatted: descriptor.format(value), meta: descriptor };
}

/**
 * Renderiza KPI no container fornecido. Estilos = espelho V7.
 * Variantes:
 *  - hero:     col-span amplo, bg-primary-container, white 4xl/5xl + sparkline
 *  - standard: surface-container-lowest, primary 2xl + Material icon
 *
 * @param {HTMLElement} container
 * @param {{ value: number, formatted: string, meta: KPIDescriptor }} kpi
 */
export function renderKPI(container, kpi) {
  const variant = kpi.meta.variant || 'standard';
  if (variant === 'hero') {
    container.innerHTML = renderHero(kpi);
  } else {
    container.innerHTML = renderStandard(kpi);
  }
}

function colorTextClass(color) {
  return {
    primary: 'text-primary',
    error: 'text-error',
    tertiary: 'text-on-tertiary-container',
    success: 'text-green-700'
  }[color || 'primary'];
}

function renderHero(kpi) {
  const target = kpi.meta.target != null ? kpi.meta.target : kpi.value;
  const initial = (kpi.meta.prefix || '') + '0' + (kpi.meta.suffix || '');
  const period = kpi.meta.period ? `<span class="text-[0.6875rem] font-bold text-on-primary-container/70">${escape(kpi.meta.period)}</span>` : '';
  const unit = kpi.meta.unit ? `<span class="text-[0.6875rem] text-white/90 mt-1 inline-block">${escape(kpi.meta.unit)}</span>` : '';
  const sparkline = kpi.meta.sparklineId
    ? `<div id="${escape(kpi.meta.sparklineId)}" class="w-28 h-10" role="img" aria-label="Sparkline de evolução"></div>`
    : '';
  const animateAttrs = `data-animate-value data-target="${target}"${kpi.meta.prefix ? ` data-prefix="${escape(kpi.meta.prefix)}"` : ''}${kpi.meta.suffix ? ` data-suffix="${escape(kpi.meta.suffix)}"` : ''}${kpi.meta.animateFormat ? ` data-format="${escape(kpi.meta.animateFormat)}"` : ''}`;

  return `
    <div class="bg-primary-container border border-outline-variant rounded-xl shadow-sm card-tilt border-glow relative overflow-hidden h-full" role="region" aria-label="${escape(kpi.meta.label)} - KPI Hero" data-kpi="${escape(kpi.meta.id)}">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[0.6875rem] font-bold text-on-primary-container uppercase tracking-wider">${escape(kpi.meta.label)}</span>
        ${period}
      </div>
      <div class="flex items-end justify-between gap-3">
      <div class="min-w-0 flex-1">
        <span class="text-3xl xl:text-4xl font-extrabold tracking-tight text-white block w-full truncate" ${animateAttrs} aria-label="${escape(kpi.meta.label)}">${escape(initial)}</span>
          ${unit}
        </div>
        ${sparkline}
      </div>
    </div>
  `;
}

function renderStandard(kpi) {
  const target = kpi.meta.target != null ? kpi.meta.target : kpi.value;
  const colorCls = colorTextClass(kpi.meta.color);
  const initial = (kpi.meta.prefix || '') + '0' + (kpi.meta.suffix || '');
  const animateAttrs = `data-animate-value data-target="${target}"${kpi.meta.prefix ? ` data-prefix="${escape(kpi.meta.prefix)}"` : ''}${kpi.meta.suffix ? ` data-suffix="${escape(kpi.meta.suffix)}"` : ''}${kpi.meta.animateFormat ? ` data-format="${escape(kpi.meta.animateFormat)}"` : ''}`;
  const iconHTML = kpi.meta.icon
    ? `<span class="material-symbols-outlined text-on-surface-variant" aria-hidden="true">${escape(kpi.meta.icon)}</span>`
    : '';
  const subtitleHTML = kpi.meta.subtitle
    ? `<span class="text-[0.6875rem] font-semibold text-on-surface-variant">${escape(kpi.meta.subtitle)}</span>`
    : '';

  // F9.5: tipografia maior pra KPIs ganharem peso visual (Stitch-like)
  const sizeCls = kpi.meta.id === 'atraso-medio' ? 'text-4xl' : 'text-3xl';
  return `
  <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm card-lift density-pad h-full" role="region" aria-label="${escape(kpi.meta.label)}" data-kpi="${escape(kpi.meta.id)}">
    <div class="flex items-center justify-between mb-2">
      <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">${escape(kpi.meta.label)}</span>
      ${iconHTML}
    </div>
    <div class="flex items-end justify-between gap-2 flex-wrap">
      <span class="${sizeCls} font-extrabold ${colorCls} tabular-nums shrink-0" ${animateAttrs} aria-label="${escape(kpi.meta.label)}">${escape(initial)}</span>
      ${subtitleHTML}
    </div>
  </div>
  `;
}
