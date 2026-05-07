/**
 * @fileoverview Boot adapter - integracao do sistema de verticais com boot.js
 *
 * Recebe todas as views registradas em main.js,
 * detecta a vertical via query param ?vertical=,
 * filtra as views e aplica customizacoes.
 *
 * Zero risco de regressao: boot.js recebe exatamente o mesmo
 * array de views que recebia antes, apenas filtradas.
 */

import { detectVerticalId, getVertical } from './index.js';

/**
 * Filtra views com base na vertical selecionada.
 * Se nenhuma vertical configurada, retorna todas as views.
 *
 * @param {Array} allViews - todas as views registradas em main.js
 * @returns {{views: Array, verticalConfig: import('./schema.js').VerticalConfig|null}}
 */
export function prepareBoot(allViews) {
  const verticalId = detectVerticalId();
  const config = getVertical(verticalId);

  if (!config) {
    // Sem vertical configurada: fallback para todas as views
    return { views: allViews, verticalConfig: null };
  }

  // Filtra views que existem na config da vertical
  const viewIds = new Set(config.views);
  const filtered = allViews.filter((v) => viewIds.has(v.id));

  return { views: filtered, verticalConfig: config };
}
