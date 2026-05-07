/**
 * @fileoverview Vertical Config: Financeiro
 *
 * Exemplo de como uma área declara seus dashboards, KPIs, charts e tabelas.
 * Esse arquivo é consumido por main.js dinamicamente.
 *
 * @type {import('../schema.js').VerticalConfig}
 * @version 1.0.0
 */

/** @type {import('../schema.js').VerticalConfig} */
export const financeiroConfig = {
  id: 'financeiro',
  name: 'Financeiro',
  icon: 'attach_money',
  views: ['overview', 'works', 'finance', 'reports', 'settings'],
  defaultView: 'finance',
  viewConfig: [
    { id: 'overview', label: 'Visao Geral', icon: 'dashboard', default: false },
    { id: 'works', label: 'Obras', icon: 'construction' },
    { id: 'finance', label: 'Financeiro', icon: 'attach_money' },
    { id: 'reports', label: 'Relatorios', icon: 'description' },
    { id: 'settings', label: 'Configuracoes', icon: 'settings' },
  ],
  kpis: [
    { id: 'receita-total', label: 'Receita Total', format: 'currency', color: 'primary', variant: 'hero', period: 'Mensal' },
    { id: 'custo-total', label: 'Custo Total', format: 'currency', color: 'error' },
    { id: 'margem-liquida', label: 'Margem Liquida', format: 'percent', color: 'success' },
    { id: 'inadimplencia', label: 'Inadimplencia', format: 'percent', color: 'error' },
    { id: 'fluxo-caixa', label: 'Fluxo de Caixa', format: 'currency', color: 'primary' },
  ],
  charts: [
    { id: 'chart-receita-mensal', type: 'area', title: 'Evolucao da Receita', builder: 'buildReceitaAreaOptions', seriesKey: 'receitaMensal' },
    { id: 'chart-custos-treemap', type: 'treemap', title: 'Composicao de Custos', builder: 'buildComposicaoDonutOptions', seriesKey: 'custos' },
    { id: 'chart-meta-anual', type: 'radialBar', title: 'Meta Anual', builder: 'buildGaugeOptions', seriesKey: 'metaAnual' },
  ],
  tables: [
    {
      id: 'tbl-receitas',
      title: 'Receitas por Item',
      columns: [
        { key: 'item', label: 'Item', type: 'string' },
        { key: 'valor', label: 'Valor (R$)', type: 'currency' },
        { key: 'meta', label: 'Meta (R$)', type: 'currency' },
        { key: 'status', label: 'Status', type: 'badge' },
      ],
    },
    {
      id: 'tbl-custos',
      title: 'Custos por Categoria',
      columns: [
        { key: 'categoria', label: 'Categoria', type: 'string' },
        { key: 'valor', label: 'Valor (R$)', type: 'currency' },
        { key: 'meta', label: 'Meta (R$)', type: 'currency' },
      ],
    },
  ],
  permissions: {
    role: 'manager',
    views: ['overview', 'finance', 'reports'],
    actions: ['view', 'export'],
  },
  theme: {
    primary: 'var(--chart-categorical-1)',
    chartPalette: 'categorical',
  },
};

// Default export for dynamic import
export default financeiroConfig;
