// ETL→V8 normalization — maps ASCII-only Python ETL values to canonical Portuguese.
// Separated from mock.js to keep model layer ETL-agnostic.
// This is the ONLY place where normalization happens — all downstream code
// (schema.js, views, E2E) sees canonical Portuguese.

/** ETL Python outputs ASCII-only (no accents). V8 canonical values have accents. */
export const STATUS_ETL_TO_V8 = {
  'Atencao': 'Atenção',
  'Concluida': 'Concluída',
  'Em progresso': 'Em progresso',
  'Pendente': 'Pendente',
  'Planejado': 'Planejado',
};

export const TIPO_ETL_TO_V8 = {
  'Edificio': 'Clínica',
  'Loteamento': 'Pet Shop',
  'Comercial': 'Laboratório',
  'Infraestrutura': 'Infraestrutura',
};

export const NOME_ETL_TO_V8 = {
  'Galpao Logistico': 'Galpão Logístico',
  'Ponte Viaria': 'Ponte Viária',
  'Estacao de Tratamento': 'Estação de Tratamento',
  'Ed Central': 'Ed. Central',
  'Clinica Centro': 'Clínica Centro',
  'Pet Shop Norte': 'Pet Shop Norte',
  'Lab Diagnostico': 'Lab Diagnóstico',
  'Clinica Sul': 'Clínica Sul',
  'Clinica Jardins': 'Clínica Jardins',
  'Pet Shop Europa': 'Pet Shop Europa',
  'Pet Shop Hills': 'Pet Shop Hills',
  'Clinica Central': 'Clínica Central',
  'Clinica Leste': 'Clínica Leste',
  'Clinica Oeste': 'Clínica Oeste',
  'Pet Shop Bosque': 'Pet Shop Bosque',
  'Lab Veterinario': 'Laboratório Veterinário',
  'Canil Municipal': 'Canil Municipal',
  'Centro de Reabilitacao': 'Centro de Reabilitação',
};

/**
 * Normalize an obra object from ETL (ASCII) to V8 canonical (accented).
 * @param {object} o - obra from snapshot.json
 * @returns {object} obra with canonical Portuguese values
 */
export function normalizeObra(o) {
  return {
    ...o,
    status: STATUS_ETL_TO_V8[o.status] || o.status,
    tipo: TIPO_ETL_TO_V8[o.tipo] || o.tipo,
    nome: NOME_ETL_TO_V8[o.nome] || o.nome,
  };
}
