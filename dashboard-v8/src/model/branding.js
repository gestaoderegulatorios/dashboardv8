// Centralized branding data for the dashboard

// Storage key prefix — changes per vertical/brand
export const STORAGE_PREFIX = 'vet';

// User/Company defaults (brand-wide defaults)
export const BRANDING_DEFAULTS = {
  username: 'Dra. Ana Costa',
  role: 'Diretora Clínica',
  companyName: 'PetVida Clínica Veterinária',
  projectName: 'PetVida Premium',
};

// Navigation items (sidebar)
export const NAV_ITEMS = [
  { id: 'overview', label: 'Visão Geral', icon: 'dashboard', group: 'geral' },
  { id: 'works', label: 'Atendimentos', icon: 'medical_services', group: 'geral' },
  { id: 'finance', label: 'Financeiro', icon: 'payments', group: 'financeiro' },
  { id: 'operational', label: 'Operacional', icon: 'engineering', group: 'obra' },
  { id: 'land', label: 'Unidades', icon: 'store', group: 'obra' },
  { id: 'upload', label: 'Upload', icon: 'cloud_upload', group: 'sistema' },
  { id: 'reports', label: 'Relatórios', icon: 'summarize', group: 'sistema' },
  { id: 'settings', label: 'Configurações', icon: 'settings', group: 'sistema' }
];

// View labels (per-View metadata used by many exports)
export const VIEW_LABELS = {
  overview: { label: 'Visão Geral', icon: 'dashboard' },
  works: { label: 'Atendimentos', icon: 'medical_services' },
  finance: { label: 'Financeiro', icon: 'payments' },
  operational: { label: 'Operacional', icon: 'engineering' },
  land: { label: 'Unidades', icon: 'store' },
  upload: { label: 'Upload', icon: 'cloud_upload' },
  reports: { label: 'Relatórios', icon: 'summarize' },
  settings: { label: 'Configurações', icon: 'settings' }
};

// Report definitions (cards + summaries)
export const REPORTS = [
  { id: 'executive', title: 'Relatório Executivo', subtitle: 'Visão geral da clínica', icon: 'analytics', hero: true, description: 'KPIs, receita, custos, margem, atendimentos e unidades consolidados em formato PDF.' },
  { id: 'works', title: 'Relatório de Atendimentos', subtitle: 'Detalhamento por unidade', icon: 'medical_services', description: 'Avaliação de atendimentos, tempo de consulta, GAP orçamentário e atrasos por unidade.' },
  { id: 'financial', title: 'Relatório Financeiro', subtitle: 'DRE e fluxo de caixa', icon: 'attach_money', description: 'Demonstrativo de resultados, receita vs meta, custos e margem bruta/líquida.' },
  { id: 'operational', title: 'Relatório Operacional', subtitle: 'Recursos e segurança', icon: 'engineering', description: 'Mão de obra, materiais, equipamentos, segurança e qualidade por ativo.' },
  { id: 'land', title: 'Relatório de Unidades', subtitle: 'Atendimentos e infraestrutura', icon: 'store', description: 'Unidades atendidas, desempenho, infraestrutura concluída e estoque por unidade.' },
  { id: 'custom', title: 'Relatório Personalizado', subtitle: 'Monte o seu', icon: 'tune', description: 'Selecione seções, período e formato para gerar um relatório sob medida.' }
];

export const REPORT_SUMMARIES = {
  executive: 'Receita acumulada de R$ 87,3M no período, com margem bruta de 19,8% e margem líquida de 14,2%. 14 unidades ativas com atendimento médio de 53,5%. Atraso médio de 3,4%. 127 consultas vendidas de 200 disponíveis. Infraestrutura 64,3% concluída nas unidades.',
  works: 'Unidade Centro lidera com 68% de atendimento. Unidade Norte com 31% — atenção à fila pendente. GAP orçamentário negativo em 3 unidades. Dias sem incidente: 47. Mão de obra: 387 colaboradores.',
  financial: 'Receita bruta R$ 94,2M. CPV de R$ 56,4M. EBITDA de R$ 22,7M. Inadimplência em 3,1%. Fluxo de caixa disponível: R$ 2,1M. Consulta de pacientes abaixo da meta (-5,8%).',
  operational: 'Operações concentradas entre 10h-14h em dias úteis. Estoque de materiais médico-veterinários: 1.247 itens. Equipamentos com 94% em operação. Qualidade: 97,3% conformidade.',
  land: 'Clínica Centro: 80 atendimentos, 78% infra. Clínica Jardins: 72 atendimentos, 55% infra. Pet Shop Hills: 48 atendimentos, 42% infra. Consulta média R$ 285K/unidade. Estoque: 73 atendimentos.',
  custom: 'Relatório personalizado com seções selecionadas pelo usuário. Período e formato configuráveis.'
};

// Sidebar logo/icon (logo header in the drawer)
export const SIDEBAR_LOGO_ICON = 'pets';
