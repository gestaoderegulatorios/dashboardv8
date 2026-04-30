// Persona: toggle dinâmico em runtime. Cada persona é um descriptor.
// V8 não hardcoda densidade — UI lê estado e renderiza conforme.
// Resolve a lacuna do V7 onde `density-profiles.md` define 3 personas mas sem implementação.

/**
 * @typedef {Object} PersonaDescriptor
 * @property {string} label
 * @property {string} icon - material-symbols name
 * @property {string} description
 * @property {'low'|'medium'|'high'} density
 * @property {string[]} kpiOrder - ids dos KPIs em ordem de prioridade
 * @property {boolean} showTable
 * @property {boolean} showChart
 * @property {number} defaultPageSize
 */

/** @type {Record<string, PersonaDescriptor>} */
export const personas = {
  exec: {
    label: 'Executivo',
    icon: 'leaderboard',
    description: 'Visão macro, KPIs em destaque, baixa densidade.',
    density: 'low',
    kpiOrder: ['avanco-medio', 'atraso-medio', 'obras-ativas'],
    showTable: false,
    showChart: true,
    defaultPageSize: 5
  },
  managerial: {
    label: 'Gerencial',
    icon: 'dashboard',
    description: 'Equilíbrio entre KPIs e detalhes. Default.',
    density: 'medium',
    kpiOrder: ['obras-ativas', 'avanco-medio', 'atraso-medio'],
    showTable: true,
    showChart: true,
    defaultPageSize: 8
  },
  operational: {
    label: 'Operacional',
    icon: 'engineering',
    description: 'Detalhe máximo, tabela em destaque, alta densidade.',
    density: 'high',
    kpiOrder: ['atraso-medio', 'obras-ativas', 'avanco-medio'],
    showTable: true,
    showChart: false,
    defaultPageSize: 20
  }
};

export function getPersona(id) {
  return personas[id] || personas.managerial;
}

export function listPersonas() {
  return Object.keys(personas);
}

/**
 * Reordena array de KPIs descriptors conforme persona.kpiOrder.
 * Função pura — não muta entrada.
 * @param {Array<{id: string}>} kpis
 * @param {PersonaDescriptor} persona
 */
export function orderKPIsByPersona(kpis, persona) {
  if (!persona || !persona.kpiOrder) return [...kpis];
  const indexMap = new Map(persona.kpiOrder.map((id, i) => [id, i]));
  return [...kpis].sort((a, b) => {
    const ai = indexMap.has(a.id) ? indexMap.get(a.id) : 999;
    const bi = indexMap.has(b.id) ? indexMap.get(b.id) : 999;
    return ai - bi;
  });
}
