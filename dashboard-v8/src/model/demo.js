// Demo dataset. Ativado por ?demo=1 na URL.
// Gera massa maior pra showcase: ~30 obras, distribuídas entre tipos e status.
// Mantém o mesmo schema do mock principal (dataset compartilhável).

import { obras as baseObras } from './mock.js';

/**
 * Gera N obras adicionais procedurais, mantendo distribuição realista.
 * Determinístico (seed-like) — mesmo conjunto a cada chamada.
 */
function generateDemoObras() {
  const tipos = ['Edifício', 'Loteamento', 'Comercial', 'Infraestrutura'];
  const statuses = ['Em progresso', 'Atenção', 'Pendente', 'Concluída', 'Planejado'];
  const prefixos = ['Vila', 'Park', 'Solar', 'Edifício', 'Residencial', 'Setor', 'Quadra', 'Alameda', 'Marina', 'Paragon'];
  const sufixos = ['Aurora', 'Ipanema', 'Atlantic', 'Boa Vista', 'Jardim', 'Beira-Mar', 'Centro', 'Norte', 'Sul', 'Leste'];

  const obras = [];
  for (let i = 0; i < 22; i++) {
    const tipo = tipos[i % tipos.length];
    const status = statuses[(i * 3) % statuses.length];
    const nome = `${prefixos[i % prefixos.length]} ${sufixos[(i * 7) % sufixos.length]} ${i + 1}`;
    const avanco = (i * 13) % 100;
    const orcado = ((i * 113 + 47) % 200 + 30) * 100000;
    // Executado proporcional ao avanco com pequena variação
    const executado = Math.round(orcado * (avanco / 100) * (0.85 + ((i * 17) % 30) / 100));
    // Gap em [-9, 5] determinístico
    const gap = ((i * 19) % 14) - 9;
    const gapRounded = Math.round(gap * 10) / 10;
    const atrasoDias = gap < -3 ? Math.abs(Math.round(gap)) : 0;

    obras.push({
      nome,
      tipo,
      status,
      avanco,
      orcado,
      executado,
      gap: gapRounded,
      atrasoDias
    });
  }
  return obras;
}

const _demoExtra = generateDemoObras();

/**
 * Conjunto demo = base (8) + 22 procedurais = 30 obras.
 */
/** Demo obras dataset (30 obras total). */
export const obrasDemo = [...baseObras, ..._demoExtra];

/**
 * Resolve qual dataset usar baseado em ?demo=1 (URL).
 * @returns {{ obras: any[], isDemo: boolean }}
 */
export function resolveDataset() {
  const isDemo = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('demo') === '1';
  return {
    obras: isDemo ? obrasDemo : baseObras,
    isDemo
  };
}
