// Domain vocabulary — change this file when switching verticals
// (branding.js handles identity: company name, logo, nav labels)

/** Construction phases — map to your vertical's workflow stages */
export const ETAPAS_OBRA = ['Fundações', 'Estrutura', 'Alvenaria', 'Acabamento', 'Instalações', 'Paisagismo'];

/** Work types — map to your vertical's categories */
export const TIPOS_OBRA = ['Residencial', 'Comercial', 'Loteamento', 'Infraestrutura'];

/** Land/lot terminology */
export const LOTE_TERMS = { lote: 'Lote', quadra: 'Quadra', loteamento: 'Loteamento', infra: 'Infra' };

/** Status labels — used in schema.js enum and UI badges */
export const STATUS_OBRA = { emProgresso: 'Em progresso', atencao: 'Atenção', pendente: 'Pendente', concluida: 'Concluída', planejado: 'Planejado' };

/** Metric labels — used in KPIs and chart axes */
export const METRIC_LABELS = { receita: 'Receita', custo: 'Custo', margem: 'Margem', avanco: 'Avanço', atraso: 'Atraso', obras: 'Obras', lotes: 'Lotes', infra: 'Infra Concluída' };

/** Unit suffixes */
export const UNITS = { currency: 'R$', percent: '%', area: 'm²', volume: 'm³', weight: 't', units: 'un' };

/** Operational materials — vertical-specific inventory */
export const MATERIAIS = ['Cimento', 'Aço', 'Concreto', 'Blocos'];

/** Upload schema labels */
export const UPLOAD_SCHEMA = {
  torreBloco: 'Torre/Bloco',
  avancoPrevisto: 'Avanço Previsto %',
  avancoRealizado: 'Avanço Realizado %',
  custoOrcado: 'Custo Orçado',
  custoExecutado: 'Custo Executado',
  responsavel: 'Responsável'
};
