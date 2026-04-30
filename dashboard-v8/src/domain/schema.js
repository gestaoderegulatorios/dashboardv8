// Schema da entidade Obra. Não é "semantic layer" — é só schema + measures.
// Cabe em uma cabeça, evolui sem cerimônia.

export const obraSchema = {
  name: 'Obra',
  fields: {
    nome: { type: 'string', required: true },
    tipo: { type: 'enum', values: ['Edifício', 'Loteamento', 'Comercial', 'Infraestrutura'], required: true },
    status: { type: 'enum', values: ['Em progresso', 'Atenção', 'Pendente', 'Concluída', 'Planejado'], required: true },
    avanco: { type: 'percent', required: true, range: [0, 100] },
    orcado: { type: 'currency', required: true, currency: 'BRL' },
    executado: { type: 'currency', required: true, currency: 'BRL' },
    gap: { type: 'percent', required: true, range: [-100, 100] },
    atrasoDias: { type: 'number', required: true, min: 0 }
  },

  // Measures: funções puras que derivam KPIs.
  // Cada uma testável em isolamento. Sem efeito colateral.
  measures: {
    obrasAtivas: (obras) => obras.filter((o) => o.status === 'Em progresso' || o.status === 'Atenção').length,

    avancoMedio: (obras) => {
      if (obras.length === 0) return 0;
      const total = obras.reduce((s, o) => s + o.avanco, 0);
      return total / obras.length;
    },

    atrasoMedioPercent: (obras) => {
      if (obras.length === 0) return 0;
      // |GAP| serve como proxy de atraso percentual. Mantém parity com V7.
      const total = obras.reduce((s, o) => s + Math.abs(o.gap), 0);
      return total / obras.length;
    },

    orcamentoTotal: (obras) => obras.reduce((s, o) => s + o.orcado, 0),

    executadoTotal: (obras) => obras.reduce((s, o) => s + o.executado, 0),

    // Margem bruta = (orcado - executado) / orcado. Pondera por tamanho (orcado).
    // Retorna 0 se orcamentoTotal=0. Em pontos percentuais.
    margemBrutaPercent: (obras) => {
      const orc = obras.reduce((s, o) => s + o.orcado, 0);
      if (orc === 0) return 0;
      const exec = obras.reduce((s, o) => s + o.executado, 0);
      return ((orc - exec) / orc) * 100;
    },

    // % de obras com gap negativo (atrasadas) — proxy de saúde de portfolio
    obrasAtrasadasPercent: (obras) => {
      if (obras.length === 0) return 0;
      const atrasadas = obras.filter((o) => o.gap < 0).length;
      return (atrasadas / obras.length) * 100;
    },

    // Distribuição: { Loteamento: 4, Edifício: 1, ... } em count.
    // Útil para donut. Função pura, retorna objeto novo.
    distribuicaoPorTipo: (obras) => obras.reduce((acc, o) => {
      acc[o.tipo] = (acc[o.tipo] || 0) + 1;
      return acc;
    }, {}),

    distribuicaoPorStatus: (obras) => obras.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {})
  },

  // Thresholds: para cores e indicadores. Sem hardcode espalhado.
  thresholds: {
    avancoBom: 60,
    avancoAtencao: 30,
    atrasoCritico: 5, // dias
    gapCritico: 5    // % absoluto
  },

  // Formatters: forma única de exibir cada tipo.
  formats: {
    currency: (v) => v == null ? '' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    percent: (v) => v == null ? '' : `${v.toFixed(1)}%`,
    days: (v) => v == null ? '' : `${v} dia${v === 1 ? '' : 's'}`,
    integer: (v) => v == null ? '' : Math.round(v).toLocaleString('pt-BR')
  }
};
