// Centralized branding data for the dashboard

// Storage key prefix — changes per vertical/brand
export const STORAGE_PREFIX = 'borg';

// User/Company defaults (brand-wide defaults)
export const BRANDING_DEFAULTS = {
  username: 'Reinaldo Silva',
  role: 'Diretor de Obras',
  companyName: 'Construtora Horizonte',
  projectName: 'Horizonte Premium',
  // Polling interval em segundos. 300=5min. 0=desabilitado.
  refreshIntervalSec: 300,
};

// Navigation items (sidebar)
export const NAV_ITEMS = [
  { id: 'overview', label: 'Visão Geral', icon: 'dashboard', group: 'geral' },
  { id: 'works', label: 'Obras', icon: 'construction', group: 'geral' },
  { id: 'finance', label: 'Financeiro', icon: 'payments', group: 'financeiro' },
  { id: 'operational', label: 'Operacional', icon: 'engineering', group: 'obra' },
  { id: 'land', label: 'Loteamentos', icon: 'location_city', group: 'obra' },
  { id: 'upload', label: 'Upload', icon: 'cloud_upload', group: 'sistema' },
  { id: 'reports', label: 'Relatórios', icon: 'summarize', group: 'sistema' },
  { id: 'settings', label: 'Configurações', icon: 'settings', group: 'sistema' }
];

// View labels (per-View metadata used by many exports)
export const VIEW_LABELS = {
  overview: { label: 'Visão Geral', icon: 'dashboard' },
  works: { label: 'Obras', icon: 'construction' },
  finance: { label: 'Financeiro', icon: 'payments' },
  operational: { label: 'Operacional', icon: 'engineering' },
  land: { label: 'Loteamentos', icon: 'location_city' },
  upload: { label: 'Upload', icon: 'cloud_upload' },
  reports: { label: 'Relatórios', icon: 'summarize' },
  settings: { label: 'Configurações', icon: 'settings' }
};

// Report definitions (cards + summaries)
export const REPORTS = [
  { id: 'executive', title: 'Relatório Executivo', subtitle: 'Visão geral do empreendimento', icon: 'analytics', hero: true, description: 'KPIs, receita, custos, margem, obras e loteamentos consolidados em formato PDF.' },
  { id: 'works', title: 'Relatório de Obras', subtitle: 'Detalhamento por obra', icon: 'construction', description: 'Avanço físico/financeiro, cronograma, GAP orçamentário e atrasos por torre.' },
  { id: 'financial', title: 'Relatório Financeiro', subtitle: 'DRE e fluxo de caixa', icon: 'attach_money', description: 'Demonstrativo de resultados, receita vs meta, custos e margem bruta/líquida.' },
  { id: 'operational', title: 'Relatório Operacional', subtitle: 'Recursos e segurança', icon: 'engineering', description: 'Mão de obra, materiais, equipamentos, segurança e qualidade por obra.' },
  { id: 'land', title: 'Relatório de Loteamentos', subtitle: 'Vendas e infraestrutura', icon: 'location_city', description: 'Lotes vendidos, venda média, infra concluída, estoque e progresso por lote.' },
  { id: 'custom', title: 'Relatório Personalizado', subtitle: 'Monte o seu', icon: 'tune', description: 'Selecione seções, período e formato para gerar um relatório sob medida.' }
];

export const REPORT_SUMMARIES = {
  executive: 'Receita acumulada de R$ 87,3M no período, com margem bruta de 19,8% e margem líquida de 14,2%. 14 obras ativas com avanço médio de 53,5%. Atraso médio de 3,4%. 127 lotes vendidos de 200 disponíveis. Infraestrutura 64,3% concluída nos loteamentos.',
  works: 'Torre A lidera com 68% de avanço. Torre C com 31% — atenção à fundação pendente. GAP orçamentário negativo em 3 obras. Dias sem acidente: 47. Mão de obra: 387 colaboradores.',
  financial: 'Receita bruta R$ 94,2M. CPV de R$ 56,4M. EBITDA de R$ 22,7M. Inadimplência em 3,1%. Fluxo de caixa disponível: R$ 2,1M. Venda de unidades abaixo da meta (-5,8%).',
  operational: 'Atividade concentrada às 10h-14h em dias úteis. Cimento: 1.247t em estoque. Aço abaixo do mínimo. Equipamentos com 94% em operação. Qualidade: 97,3% conformidade.',
  land: 'Residencial Parque: 80 lotes, 78% infra. Jardim Europa: 72 lotes, 55% infra. Horizon Hills: 48 lotes, 42% infra. Venda média R$ 285K/lote. Estoque: 73 lotes.',
  custom: 'Relatório personalizado com seções selecionadas pelo usuário. Período e formato configuráveis.'
};

// Sidebar logo/icon (logo header in the drawer)
export const SIDEBAR_LOGO_ICON = 'apartment';
