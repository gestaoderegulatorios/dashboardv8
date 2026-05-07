/**
 * @fileoverview Vertical Config: RH
 *
 * Exemplo de configuração para área de Recursos Humanos.
 * Demonstra como uma nova vertical reutiliza builders e KPIs compartilhados,
 * declarando apenas o que é diferente.
 *
 * @type {import('../schema.js').VerticalConfig}
 * @version 1.0.0
 */

/** @type {import('../schema.js').VerticalConfig} */
export const rhConfig = {
  id: 'rh',
  name: 'Recursos Humanos',
  icon: 'people',
  views: ['overview', 'colaboradores', 'folha', 'turnover', 'settings'],
  defaultView: 'overview',
  viewConfig: [
    { id: 'overview', label: 'Visao Geral', icon: 'dashboard' },
    { id: 'colaboradores', label: 'Colaboradores', icon: 'people' },
    { id: 'folha', label: 'Folha de Pagamento', icon: 'receipt_long' },
    { id: 'turnover', label: 'Turnover', icon: 'trending_up' },
    { id: 'settings', label: 'Configuracoes', icon: 'settings' },
  ],
  kpis: [
    { id: 'headcount', label: 'Headcount', format: 'integer', color: 'primary', variant: 'hero' },
    { id: 'turnover-rate', label: 'Turnover Anual', format: 'percent', color: 'error' },
    { id: 'salario-medio', label: 'Salario Medio', format: 'currency', color: 'primary' },
    { id: 'dias-ate-contratacao', label: 'Dias ate Contratacao', format: 'days', color: 'warning' },
    { id: 'satisfacao', label: 'Satisfacao', format: 'percent', color: 'success' },
  ],
  charts: [
    { id: 'chart-headcount-temporal', type: 'line', title: 'Evolucao do Headcount', builder: 'buildEvolucaoLineOptions', seriesKey: 'headcountTemporal' },
    { id: 'chart-dist-departamento', type: 'donut', title: 'Distribuicao por Departamento', builder: 'buildComposicaoDonutOptions', seriesKey: 'distDepartamento' },
    { id: 'chart-turnover-mensal', type: 'bar', title: 'Turnover Mensal', builder: 'buildAvancoBarOptions', seriesKey: 'turnoverMensal' },
  ],
  tables: [
    {
      id: 'tbl-colaboradores',
      title: 'Colaboradores',
      columns: [
        { key: 'nome', label: 'Nome', type: 'string' },
        { key: 'departamento', label: 'Departamento', type: 'string' },
        { key: 'cargo', label: 'Cargo', type: 'string' },
        { key: 'salario', label: 'Salario (R$)', type: 'currency' },
        { key: 'admissao', label: 'Data Admissao', type: 'date' },
        { key: 'status', label: 'Status', type: 'badge' },
      ],
    },
    {
      id: 'tbl-vagas-abertas',
      title: 'Vagas Abertas',
      columns: [
        { key: 'cargo', label: 'Cargo', type: 'string' },
        { key: 'departamento', label: 'Departamento', type: 'string' },
        { key: 'dias_aberto', label: 'Dias Aberto', type: 'number' },
        { key: 'candidatos', label: 'Candidatos', type: 'number' },
        { key: 'status', label: 'Status', type: 'badge' },
      ],
    },
  ],
  permissions: {
    role: 'viewer',
    views: ['overview', 'colaboradores'],
    actions: ['view'],
  },
  theme: {
    primary: 'var(--chart-categorical-2)',
    chartPalette: 'sequential',
  },
};

export default rhConfig;
