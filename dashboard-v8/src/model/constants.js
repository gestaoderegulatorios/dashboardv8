// UI and configuration constants — single source of truth for magic numbers.
// F3.4: extracted from scattered files to eliminate magic numbers.

// ─── Auto-refresh (was in auto-refresh.js) ────────────────────────────────
export const REFRESH_MIN_SEC = 30;
export const REFRESH_MAX_SEC = 3600;
export const REFRESH_DEFAULT_SEC = 300;

// ─── Topbar badge (was in topbar.js) ───────────────────────────────────────
export const BADGE_REFRESH_MS = 60000;
export const BADGE_UPDATE_DELAY_MS = 1500;
export const BADGE_INITIAL_DELAY_MS = 1000;

// ─── Chart gauge thresholds (was in chart.js getGaugeColor) ───────────────
export const GAUGE_WARN_THRESHOLD = 40;
export const GAUGE_GOOD_THRESHOLD = 70;

// ─── Finance view (was in finance-fragments.js) ───────────────────────────
export const FINANCE_MARGEM_LIQUIDA_PCT = 14.2;
export const FINANCE_INADIMPLENCIA_PCT = 3.1;
export const FINANCE_FLUXO_CAIXA = 2134890;
export const FINANCE_META_MULTIPLIER = 1.04;
export const FINANCE_META_MINIMA = 9000000;

export const FINANCE_WATERFALL = [
  { label: 'Receita Bruta', value: 94200000 },
  { label: 'CPV', value: -56400000 },
  { label: 'Lucro Bruto', value: 37800000 },
  { label: 'Despesas Oper.', value: -15100000 },
  { label: 'EBITDA', value: 22700000 }
];

export const FINANCE_CUSTOS_TREEMAP = [
  { name: 'Materiais', value: 4500000 },
  { name: 'Mão de Obra', value: 3200000 },
  { name: 'Equipamentos', value: 2100000 },
  { name: 'Terceiros', value: 1800000 },
  { name: 'Administrativo', value: 900000 },
  { name: 'Despesas Gerais', value: 600000 }
];

export const FINANCE_RECEITA_ROWS = [
  { item: 'Venda Unidades', valor: 45200000, meta: 48000000, status: 'atencao' },
  { item: 'Venda Lotes', valor: 28600000, meta: 26000000, status: 'ok' },
  { item: 'Outras Receitas', valor: 13742156, meta: 10000000, status: 'ok' }
];

export const FINANCE_CUSTOS_ROWS = [
  { item: 'Materiais', valor: 4500000, meta: 4200000 },
  { item: 'Mão de Obra', valor: 3200000, meta: 3500000 }
];

export const FINANCE_MARGEM_ROWS = [
  { item: 'Margem Bruta', valor: '19,8%' },
  { item: 'Margem Líquida', valor: '14,2%' }
];

export const FINANCE_SPARK_MARGEM = [22, 24, 23, 25, 24, 27, 26, 25, 28, 27, 26, 27];

// ─── Operational view (was in operational.js) ──────────────────────────────
export const OPS_TOWERS = [
  { id: 'torre-a', label: 'Torre A', value: 78, suffix: '%', color: 'text-primary' },
  { id: 'torre-b', label: 'Torre B', value: 64, suffix: '%', color: 'text-primary' },
  { id: 'torre-c', label: 'Torre C', value: 29, suffix: '%', color: 'text-on-tertiary-container' },
  { id: 'torre-d', label: 'Torre D', value: 55, suffix: '%', color: 'text-primary' }
];

export const OPS_MATERIALS = [
  { id: 'cimento', label: 'Cimento', value: 1247, suffix: ' t' },
  { id: 'aco', label: 'Aço', value: 983, suffix: ' t' },
  { id: 'concreto', label: 'Concreto', value: 4821, suffix: ' m³' },
  { id: 'blocos', label: 'Blocos', value: 127400, suffix: ' un' }
];

export const OPS_KPIS = [
  { id: 'dias-acidente', label: 'Dias s/ acidente', value: 47, suffix: '', color: 'text-green-700' },
  { id: 'turnos', label: 'Turnos ativos', value: 3, suffix: '', color: 'text-primary' },
  { id: 'equip', label: 'Equip. operação', value: 94, suffix: '%', color: 'text-primary' },
  { id: 'qualidade', label: 'Qualidade', value: 97.3, suffix: '%', color: 'text-primary' }
];

export const OPS_HEATMAP_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
export const OPS_HEATMAP_HOURS = ['06h', '08h', '10h', '12h', '14h', '16h', '18h'];

export const OPS_AVANCO_ATIVIDADE = [
  { atividade: 'Fundações', valor: 85 },
  { atividade: 'Estrutura', valor: 62 },
  { atividade: 'Alvenaria', valor: 40 },
  { atividade: 'Acabamento', valor: 18 },
  { atividade: 'Instalações', valor: 55 },
  { atividade: 'Paisagismo', valor: 10 }
];

export const OPS_TABLE_ROWS = [
  { name: 'Fundação Torre A', progress: 78, person: 'João' },
  { name: 'Alvenaria Torre B', progress: 64, person: 'Maria' },
  { name: 'Infra Loteamento Parque', progress: 52, person: 'Carlos' },
  { name: 'Pintura Torre A', progress: 41, person: 'Ana' }
];

export const OPS_ALERTS = [
  { type: 'critical', label: 'Alerta', message: 'Fornada atrasada 4h', bg: 'bg-red-50', border: 'border-red-200', text: 'text-error' },
  { type: 'attention', label: 'Atenção', message: 'Estoque aço abaixo mínimo', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-on-tertiary-container' },
  { type: 'info', label: 'Info', message: 'Entrega cimento amanhã', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' }
];
