// Validator — single-purpose module for VerticalConfig runtime validation.
// Separated from schema.js to allow importing schema types without cycle.
// Zero DOM, zero side effects.

import { ALLOWED_CHART_TYPES, ALLOWED_KPI_FORMATS, ALLOWED_ROLES, ALLOWED_COLORS } from './schema.js';

/**
 * Valida um VerticalConfig completo.
 * @param {import('./schema.js').VerticalConfig|null|undefined} config
 * @returns {{ok: boolean, errors: string[]}}
 */
export function validate(config) {
  const errors = [];

  if (!config || typeof config !== 'object') {
    return { ok: false, errors: ['Config é obrigatório e deve ser um objeto'] };
  }

  // -- Campos obrigatórios --
  if (!config.id || typeof config.id !== 'string') errors.push('id: string obrigatorio');
  if (!config.name || typeof config.name !== 'string') errors.push('name: string obrigatorio');
  if (!config.icon || typeof config.icon !== 'string') errors.push('icon: string obrigatorio');

  // -- Views --
  if (!Array.isArray(config.views) || config.views.length === 0) {
    errors.push('views: array nao vazio obrigatorio');
  } else {
    for (let i = 0; i < config.views.length; i++) {
      if (typeof config.views[i] !== 'string') {
        errors.push(`views[${i}]: deve ser string`);
      }
    }
  }

  if (config.defaultView && !config.views?.includes(config.defaultView)) {
    errors.push(`defaultView '${config.defaultView}' nao esta em views`);
  }

  // -- KPIs --
  if (Array.isArray(config.kpis)) {
    const idSet = new Set();
    for (let i = 0; i < config.kpis.length; i++) {
      const kpi = config.kpis[i];
      if (!kpi || typeof kpi !== 'object') {
        errors.push(`kpis[${i}]: deve ser um objeto`);
        continue;
      }
      if (!kpi.id || typeof kpi.id !== 'string') {
        errors.push(`kpis[${i}].id: string obrigatório`);
      } else if (idSet.has(kpi.id)) {
        errors.push(`kpis: id '${kpi.id}' duplicado`);
      } else {
        idSet.add(kpi.id);
      }
      if (!kpi.label) errors.push(`kpis[${i}].label: obrigatorio`);
      if (kpi.format && !ALLOWED_KPI_FORMATS.includes(kpi.format)) {
        errors.push(`kpis[${i}].format '${kpi.format}' invalido`);
      }
      if (kpi.color && !ALLOWED_COLORS.includes(kpi.color)) {
        errors.push(`kpis[${i}].color '${kpi.color}' invalido`);
      }
    }
  }

  // -- Charts --
  if (Array.isArray(config.charts)) {
    const idSet = new Set();
    for (let i = 0; i < config.charts.length; i++) {
      const chart = config.charts[i];
      if (!chart || typeof chart !== 'object') {
        errors.push(`charts[${i}]: deve ser um objeto`);
        continue;
      }
      if (!chart.id || typeof chart.id !== 'string') {
        errors.push(`charts[${i}].id: string obrigatório`);
      } else if (idSet.has(chart.id)) {
        errors.push(`charts: id '${chart.id}' duplicado`);
      } else {
        idSet.add(chart.id);
      }
      if (!chart.type) {
        errors.push(`charts[${i}].type: obrigatorio`);
      } else if (!ALLOWED_CHART_TYPES.includes(chart.type)) {
        errors.push(`charts[${i}].type '${chart.type}' invalido`);
      }
    }
  }

  // -- Tables --
  if (Array.isArray(config.tables)) {
    for (let i = 0; i < config.tables.length; i++) {
      const tbl = config.tables[i];
      if (!tbl || typeof tbl !== 'object') {
        errors.push(`tables[${i}]: deve ser um objeto`);
        continue;
      }
      if (!tbl.id) errors.push(`tables[${i}].id: string obrigatorio`);
      if (!tbl.title) errors.push(`tables[${i}].title: string obrigatorio`);
      if (Array.isArray(tbl.columns)) {
        const validTypes = ['string', 'number', 'currency', 'date', 'badge'];
        for (let j = 0; j < tbl.columns.length; j++) {
          const col = tbl.columns[j];
          if (!col) { errors.push(`tables[${i}].columns[${j}]: null/undefined`); continue; }
          if (!col.key) errors.push(`tables[${i}].columns[${j}].key: obrigatorio`);
          if (!col.label) errors.push(`tables[${i}].columns[${j}].label: obrigatorio`);
          if (col.type && !validTypes.includes(col.type)) {
            errors.push(`tables[${i}].columns[${j}].type '${col.type}' invalido`);
          }
        }
      }
    }
  }

  // -- Permissions --
  if (config.permissions) {
    if (config.permissions.role && !ALLOWED_ROLES.includes(config.permissions.role)) {
      errors.push(`permissions.role '${config.permissions.role}' invalido`);
    }
    if (Array.isArray(config.permissions.views)) {
      for (let i = 0; i < config.permissions.views.length; i++) {
        if (typeof config.permissions.views[i] !== 'string') {
          errors.push(`permissions.views[${i}]: deve ser string`);
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Validação rápida.
 * @param {import('./schema.js').VerticalConfig|null|undefined} config
 * @returns {boolean}
 */
export function isValid(config) {
  return validate(config).ok;
}
