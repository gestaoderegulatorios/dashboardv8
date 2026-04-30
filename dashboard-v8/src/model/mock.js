// Mock data — paridade com V7 (linhas exatas da tabela #table-obras).
// Quando V7 e V8 forem comparados lado a lado, este é o single source of truth.
// V8 só ACRESCENTA a este array; não diverge.
//
// F6.6: exports mutáveis (export let) para permitir hidratação via ETL snapshot.
// heroSpark permanece const (métrica derivada de receitaMensal — não está no ETL).

export let obras = [
  { nome: 'Torre A', tipo: 'Edifício', status: 'Em progresso', avanco: 68, orcado: 12000000, executado: 8500000, gap: -3.5, atrasoDias: 2 },
  { nome: 'Torre B', tipo: 'Loteamento', status: 'Atenção', avanco: 43, orcado: 9800000, executado: 4120000, gap: -7.4, atrasoDias: 1 },
  { nome: 'Torre C', tipo: 'Comercial', status: 'Pendente', avanco: 31, orcado: 6700000, executado: 3100000, gap: -2.9, atrasoDias: 0 },
  { nome: 'Torre D', tipo: 'Infraestrutura', status: 'Concluída', avanco: 55, orcado: 15200000, executado: 8600000, gap: 2.1, atrasoDias: 0 },
  { nome: 'Residencial Parque', tipo: 'Loteamento', status: 'Em progresso', avanco: 72, orcado: 8400000, executado: 6048000, gap: 1.2, atrasoDias: 0 },
  { nome: 'Jardim Europa', tipo: 'Loteamento', status: 'Atenção', avanco: 38, orcado: 5600000, executado: 2128000, gap: -5.1, atrasoDias: 3 },
  { nome: 'Horizon Hills', tipo: 'Loteamento', status: 'Em progresso', avanco: 64, orcado: 7200000, executado: 4608000, gap: 0.8, atrasoDias: 0 },
  { nome: 'Ed. Central', tipo: 'Comercial', status: 'Planejado', avanco: 0, orcado: 4500000, executado: 0, gap: 0, atrasoDias: 0 },
  // Obras 9-14: expansão para paridade V7 (V7 tabela tem 14 rows)
  { nome: 'Torre E', tipo: 'Edifício', status: 'Em progresso', avanco: 82, orcado: 14500000, executado: 11890000, gap: 1.5, atrasoDias: 0 },
  { nome: 'Torre F', tipo: 'Edifício', status: 'Em progresso', avanco: 57, orcado: 11300000, executado: 6441000, gap: -4.2, atrasoDias: 2 },
  { nome: 'Loteamento Bosque', tipo: 'Loteamento', status: 'Atenção', avanco: 29, orcado: 6200000, executado: 1798000, gap: -8.1, atrasoDias: 5 },
  { nome: 'Galpão Logístico', tipo: 'Comercial', status: 'Em progresso', avanco: 91, orcado: 8900000, executado: 8100000, gap: 3.7, atrasoDias: 0 },
  { nome: 'Ponte Viária', tipo: 'Infraestrutura', status: 'Atenção', avanco: 46, orcado: 18700000, executado: 8602000, gap: -6.3, atrasoDias: 4 },
  { nome: 'Estação de Tratamento', tipo: 'Infraestrutura', status: 'Em progresso', avanco: 73, orcado: 5100000, executado: 3723000, gap: 0.4, atrasoDias: 0 }
];

// ─── Dados de série temporal (overview) ──────────────────────────────────────
// V7 hardcoda estes arrays no overview. Movidos para mock.js (Fase 4) para
// serem single source of truth. Em V8 puro, viriam de API; aqui documentamos.

export let meses12 = ['Abr/25','Mai/25','Jun/25','Jul/25','Ago/25','Set/25','Out/25','Nov/25','Dez/25','Jan/26','Fev/26','Mar/26'];

export let receitaMensal = [6200000,7100000,7500000,8200000,8600000,9000000,9200000,8800000,9500000,9800000,9400000,8734281];

export let composicaoTipo = [
  { name: 'Edifícios', value: 58 },
  { name: 'Loteamentos', value: 27 },
  { name: 'Comercial', value: 15 }
];

export let margemSpark = [38, 40, 39, 42, 41, 43, 42, 40, 44, 43, 41, 40];

export let heroSpark = receitaMensal.map((v) => Math.round(v / 1000));

export let metaAnualPercent = 72;

// ─── ETL hydration (F6.6) ────────────────────────────────────────────────────
// Called by snapshot.js when ETL data is available at runtime.
// Overwrites mutable exports with real data; heroSpark stays derived.

// ─── ETL→V8 normalization ──────────────────────────────────────────────────
// ETL Python outputs ASCII-only (no accents). V8 canonical values have accents.
// This is the ONLY place where normalization happens — all downstream code
// (schema.js, views, E2E) sees canonical Portuguese.

const STATUS_ETL_TO_V8 = {
  'Atencao': 'Atenção',
  'Concluida': 'Concluída',
  'Em progresso': 'Em progresso',
  'Pendente': 'Pendente',
  'Planejado': 'Planejado',
};

const TIPO_ETL_TO_V8 = {
  'Edificio': 'Edifício',
  'Loteamento': 'Loteamento',
  'Comercial': 'Comercial',
  'Infraestrutura': 'Infraestrutura',
};

const NOME_ETL_TO_V8 = {
  'Galpao Logistico': 'Galpão Logístico',
  'Ponte Viaria': 'Ponte Viária',
  'Estacao de Tratamento': 'Estação de Tratamento',
  'Ed Central': 'Ed. Central',
};

function _normalizeObra(o) {
  return {
    ...o,
    status: STATUS_ETL_TO_V8[o.status] || o.status,
    tipo: TIPO_ETL_TO_V8[o.tipo] || o.tipo,
    nome: NOME_ETL_TO_V8[o.nome] || o.nome,
  };
}

export function _hydrateFromSnapshot(s) {
  obras = s.obras.map(_normalizeObra);
  meses12 = s.meses12;
  receitaMensal = s.receitaMensal;
  composicaoTipo = s.composicaoTipo;
  margemSpark = s.margemSpark;
  metaAnualPercent = s.metaAnualPercent;
  // Recompute heroSpark from updated receitaMensal (derived metric, not in ETL)
  heroSpark = receitaMensal.map((v) => Math.round(v / 1000));
}
