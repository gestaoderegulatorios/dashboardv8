/**
 * @fileoverview Config Schema - Contrato universal de tipos para dashboards verticais.
 *
 * Cada vertical (RH, Financeiro, Juridico...) e descrita por um VerticalConfig.
 * A camada de views le esse config e nao deve ter logica de negocio.
 *
 * Regras:
 * - Camada config/ NAO acessa DOM diretamente.
 * - Camada config/ NAO importa de view/ nem ui/.
 * - Camada config/ e puramente declarativa + validacao.
 *
 * @version 1.0.0
 */

// ──────────────────────────────────────────────────────────────────────────────
// TIPOS PRIMITIVOS (JSDoc para checkJs:true)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} KPIConfig
 * @property {string} id - identificador único (ex: 'headcount')
 * @property {string} label - texto exibido (ex: 'Headcount Total')
 * @property {string} [icon] - Material Symbols id
 * @property {string} [format] - 'integer'|'currency'|'percent'|'days'
 * @property {string} [computeFrom] - ID do compute em shared registry
 * @property {string} [subtitle] - subtítulo exibido abaixo do valor
 * @property {string} [color] - token de cor ('primary'|'error'|'success'...)
 * @property {'hero'|'standard'} [variant] - estilo visual do card
 * @property {string} [period] - período exibido (ex: 'Mês Atual')
 * @property {string} [unit] - unidade display (ex: 'obras')
 * @property {string} [prefix] - prefixo formatador (ex: 'R$')
 * @property {string} [suffix] - sufixo formatador (ex: '%')
 */

/**
 * @typedef {Object} ChartConfig
 * @property {string} id - identificador único
 * @property {string} type - 'bar'|'donut'|'area'|'radialBar'|'line'
 * @property {string} title - título do card
 * @property {string} [builder] - referência ao builder em shared/ ou vertical-specific
 * @property {string} [seriesKey] - chave dos dados no store
 * @property {Object} [options] - override de opções do chart
 */

/**
 * @typedef {Object} TableColumn
 * @property {string} key - identificador da coluna
 * @property {string} label - texto do header
 * @property {'string'|'number'|'currency'|'date'|'badge'} [type] - renderização
 * @property {boolean} [sortable] - permite ordenação
 * @property {boolean} [exportable] - incluir no CSV
 */

/**
 * @typedef {Object} TableConfig
 * @property {string} id - identificador único
 * @property {string} title - título da tabela
 * @property {string} [dataKey] - chave dos dados no store
 * @property {TableColumn[]} columns - colunas exibidas
 * @property {number} [defaultPageSize] - paginação padrão
 */

/**
 * @typedef {Object} ViewConfig
 * @property {string} id - identificador da view (ex: 'overview', 'works')
 * @property {string} label - título exibido no nav
 * @property {string} icon - Material Symbols id
 * @property {string} [description] - tooltip na nav
 * @property {boolean} [default] - true se é a view default
 * @property {boolean} [requiresAuth] - true se precisa de login
 * @property {string} [role] - role mínimo ('admin'|'manager'|'viewer')
 */

/**
 * @typedef {Object} ThemeOverride
 * @property {string} [primary] - hex ou CSS var (--color-*)
 * @property {string} [surface] - cor base do surface
 * @property {string} [chartPalette] - 'categorical'|'sequential'|'divergent'
 */

/**
 * @typedef {Object} PermissionConfig
 * @property {string} [role] - 'admin' | 'manager' | 'viewer'
 * @property {string[]} [views] - lista de view IDs permitidas
 * @property {string[]} [actions] - 'view'|'export'|'edit'
 * @property {string[]} [apiScopes] - escopos de API permitidos
 */

/**
 * @typedef {Object} VerticalConfig
 * @property {string} id - identificador único da vertical (ex: 'financeiro', 'rh')
 * @property {string} name - nome exibido (ex: 'Financeiro')
 * @property {string} icon - Material Symbols id
 * @property {string} [logo] - path para logo da área
 * @property {string[]} views - lista de view ids suportadas
 * @property {string} defaultView - view padrão ao entrar
 * @property {ViewConfig[]} viewConfig - configuração detalhada das views
 * @property {KPIConfig[]} kpis - KPIs disponíveis nesta vertical
 * @property {ChartConfig[]} charts - charts disponíveis nesta vertical
 * @property {TableConfig[]} tables - tabelas disponíveis nesta vertical
 * @property {PermissionConfig} [permissions] - configuração de acesso
 * @property {ThemeOverride} [theme] - customização de tema
 * @property {string} [apiEndpoint] - endpoint base de API (ex: '/api/v1/rh')
 * @property {boolean} [demoEnabled] - permite ?demo=1
 */

// ──────────────────────────────────────────────────────────────────────────────
// SCHEMA CONSTANTS
// ──────────────────────────────────────────────────────────────────────────────

/** @type {string[]} */
export const ALLOWED_CHART_TYPES = ['bar', 'donut', 'area', 'radialBar', 'line', 'heatmap', 'treemap', 'sparkline'];

/** @type {string[]} */
export const ALLOWED_KPI_FORMATS = ['integer', 'currency', 'percent', 'days', 'number'];

/** @type {string[]} */
export const ALLOWED_ROLES = ['admin', 'manager', 'viewer', 'auditor'];

/** @type {string[]} */
export const ALLOWED_COLORS = ['primary', 'secondary', 'error', 'success', 'warning', 'info', 'tertiary'];

// ──────────────────────────────────────────────────────────────────────────────
// VALIDAÇÃO RUNTIME
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Valida um VerticalConfig completo.
 * Retorna {ok: true} ou {ok: false, errors: string[]}.
 *
 * @param {VerticalConfig} config
 * @returns {{ok: boolean, errors: string[]}}
 */
export function validateVerticalConfig(config) {
  const errors = [];

  if (!config) {
    errors.push('Config é obrigatório');
    return { ok: false, errors };
  }

  // ─── Campos obrigatórios ─────────────────────────────────────────────────
  if (!config.id || typeof config.id !== 'string') errors.push('id: string obrigatório');
  if (!config.name || typeof config.name !== 'string') errors.push('name: string obrigatório');
  if (!config.icon || typeof config.icon !== 'string') errors.push('icon: string obrigatório');

  // ─── Views ─────────────────────────────────────────────────────────────────
  if (!Array.isArray(config.views) || config.views.length === 0) {
    errors.push('views: array não vazio obrigatório');
  }
  if (config.defaultView && !config.views?.includes(config.defaultView)) {
    errors.push(`defaultView '${config.defaultView}' não está em views`);
  }

  // ─── KPIs ─────────────────────────────────────────────────────────────────
  if (Array.isArray(config.kpis)) {
    const idSet = new Set();
    for (const kpi of config.kpis) {
      if (!kpi.id || typeof kpi.id !== 'string') {
        errors.push('kpi.id: string obrigatório');
      } else if (idSet.has(kpi.id)) {
        errors.push(`kpi.id '${kpi.id}' duplicado`);
      } else {
        idSet.add(kpi.id);
      }
      if (!kpi.label) errors.push(`kpi[${kpi.id ?? '?'}].label: obrigatório`);
      if (kpi.format && !ALLOWED_KPI_FORMATS.includes(kpi.format)) {
        errors.push(`kpi[${kpi.id ?? '?'}].format '${kpi.format}' inválido. Esperado: ${ALLOWED_KPI_FORMATS.join(', ')}`);
      }
      if (kpi.color && !ALLOWED_COLORS.includes(kpi.color)) {
        errors.push(`kpi[${kpi.id ?? '?'}].color '${kpi.color}' inválido. Esperado: ${ALLOWED_COLORS.join(', ')}`);
      }
    }
  }

  // ─── Charts ────────────────────────────────────────────────────────────────
  if (Array.isArray(config.charts)) {
    const idSet = new Set();
    for (const chart of config.charts) {
      if (!chart.id || typeof chart.id !== 'string') {
        errors.push('chart.id: string obrigatório');
      } else if (idSet.has(chart.id)) {
        errors.push(`chart.id '${chart.id}' duplicado`);
      } else {
        idSet.add(chart.id);
      }
      if (!chart.type) {
        errors.push(`chart[${chart.id ?? '?'}].type: obrigatório`);
      } else if (!ALLOWED_CHART_TYPES.includes(chart.type)) {
        errors.push(`chart[${chart.id ?? '?'}].type '${chart.type}' inválido. Esperado: ${ALLOWED_CHART_TYPES.join(', ')}`);
      }
    }
  }

  // ─── Tables ───────────────────────────────────────────────────────────────
  if (Array.isArray(config.tables)) {
    for (const tbl of config.tables) {
      if (!tbl.id || typeof tbl.id !== 'string') errors.push('table.id: string obrigatório');
      if (!tbl.title) errors.push(`table[${tbl.id ?? '?'}].title: obrigatório`);
      if (Array.isArray(tbl.columns)) {
        const validTypes = ['string', 'number', 'currency', 'date', 'badge'];
        for (const col of tbl.columns) {
          if (!col.key) errors.push(`table[${tbl.id ?? '?'}].column.key: obrigatório`);
          if (!col.label) errors.push(`table[${tbl.id ?? '?'}].column.label: obrigatório`);
          if (col.type && !validTypes.includes(col.type)) {
            errors.push(`table[${tbl.id ?? '?'}].column.type '${col.type}' inválido`);
          }
        }
      }
    }
  }

  // ─── Permissions ───────────────────────────────────────────────────────────
  if (config.permissions) {
    if (config.permissions.role && !ALLOWED_ROLES.includes(config.permissions.role)) {
      errors.push(`permissions.role '${config.permissions.role}' inválido. Esperado: ${ALLOWED_ROLES.join(', ')}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Validação rápida: retorna true/false sem detalhes.
 * @param {VerticalConfig} config
 * @returns {boolean}
 */
export function isValidVerticalConfig(config) {
  return validateVerticalConfig(config).ok;
}

/** @param {VerticalConfig} config */
export function getDefaultView(config) {
  if (!config.views || config.views.length === 0) return undefined;
  if (config.defaultView && config.views.includes(config.defaultView)) return config.defaultView;
  return config.views[0];
}

/** @param {VerticalConfig} config */
export function getKPIById(config, id) {
  return config.kpis?.find((k) => k.id === id);
}

/** @param {VerticalConfig} config */
export function getChartById(config, id) {
  return config.charts?.find((c) => c.id === id);
}

/** @param {VerticalConfig} config */
export function getTableById(config, id) {
  return config.tables?.find((t) => t.id === id);
}

