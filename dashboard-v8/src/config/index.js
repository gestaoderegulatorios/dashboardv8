/**
 * @fileoverview Vertical Config Loader
 *
 * Registry de todas as verticais disponíveis.
 * Para adicionar uma nova vertical: crie o arquivo em verticals/{nome}.js
 * e importe/exporte aqui.
 *
 * Nota: Não use dynamic import() diretamente no Vite static-site
 * (causa problemas de bundling). Prefira imports estáticos
 * e selecione a vertical em runtime via query param.
 */

import financeiro from './verticals/financeiro.js';
import rh from './verticals/rh.js';

/** @type {Record<string, import('./schema.js').VerticalConfig>} */
export const VERTICALS = {
  financeiro,
  rh,
};

/** @type {string[]} */
export const VERTICAL_IDS = Object.keys(VERTICALS);

/** @param {string} id @returns {import('./schema.js').VerticalConfig|undefined} */
export function getVertical(id) {
  return VERTICALS[id];
}

/** @returns {string} o primeiro id disponível */
export function getDefaultVerticalId() {
  return VERTICAL_IDS[0];
}

/**
 * Detecta a vertical a partir do query param ?vertical=rh
 * Fallback para a default se ausente ou inválido.
 * @param {string} [search] - window.location.search
 * @returns {string} verticalId
 */
export function detectVerticalId(search) {
  const params = new URLSearchParams(search ?? window.location.search);
  const requested = params.get('vertical');
  if (requested && VERTICALS[requested]) return requested;
  return getDefaultVerticalId();
}
