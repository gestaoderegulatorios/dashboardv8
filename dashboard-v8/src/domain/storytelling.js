// Storytelling patterns. Toggle em runtime entre 3 padrões de leitura.
// Cada padrão reordena/filtra dados — não muda o markup das views.
//
// A — Hierárquica (default): mostra do macro → micro. Mantém ordem natural.
// B — Comparativa: agrupa por tipo, ordena por desempenho relativo.
// C — Drill-down: foca nas obras com maior delta (positivo ou negativo).
//
// Função pura: applyStorytelling(obras, pattern) -> obras reordenadas.
// Não muta entrada.

/** @typedef {'hierarchical'|'comparative'|'drilldown'} StoryPattern */

export const storyPatterns = {
  hierarchical: {
    id: 'hierarchical',
    label: 'Hierárquica',
    icon: 'list_alt',
    description: 'Macro → micro, ordem natural. Default.'
  },
  comparative: {
    id: 'comparative',
    label: 'Comparativa',
    icon: 'compare_arrows',
    description: 'Agrupa por tipo, ordena por avanço relativo.'
  },
  drilldown: {
    id: 'drilldown',
    label: 'Drill-down',
    icon: 'troubleshoot',
    description: 'Foca nas obras com maior |GAP| (atenção).'
  }
};

/**
 * Aplica o padrão de storytelling ao array de obras.
 * Pura — não muta input.
 * @param {any[]} obras
 * @param {StoryPattern} pattern
 */
export function applyStorytelling(obras, pattern = 'hierarchical') {
  if (pattern === 'comparative') {
    // Ordena por tipo, depois avanço descendente dentro de cada tipo.
    return [...obras].sort((a, b) => {
      const t = a.tipo.localeCompare(b.tipo, 'pt-BR');
      return t !== 0 ? t : b.avanco - a.avanco;
    });
  }
  if (pattern === 'drilldown') {
    // Ordena por |GAP| descendente (mais críticas primeiro).
    return [...obras].sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
  }
  // hierarchical = ordem natural
  return [...obras];
}
