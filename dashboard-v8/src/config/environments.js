/**
 * @fileoverview Environment detection and configuration.
 *
 * Detecta automaticamente o ambiente de execucao (dev/staging/prod)
 * e exporta configuracoes especificas para cada um.
 *
 * Regras de deteccao:
 *   - localhost/127.0.0.1 -> 'development'
 *   - *.pages.dev -> 'staging'
 *   - *.company.com -> 'production'
 *   - outros -> 'production' (fallback seguro)
 *
 * Usado por: auth.js, api.js, telemetry.js
 * Nunca acessa DOM -- puramente baseado em hostname/variaveis.
 */

/**
 * Ambiente detectado.
 * @typedef {'development'|'staging'|'production'} EnvType
 */

/** @type {EnvType} */
let _envCache;

/**
 * Detecta o ambiente baseado no hostname da URL.
 * @param {string} [hostname] - window.location.hostname ou equivalente. Defaults to empty string.
 * @returns {EnvType}
 */
export function detectEnv(hostname) {
  const h = hostname || getDefaultHostname();

  if (h === 'localhost' || h === '127.0.0.1' || h === '') {
    return 'development';
  }

  if (h.endsWith('pages.dev')) {
    return 'staging';
  }

  // Qualquer outro dominio customizado e considerado producao
  return 'production';
}

function getDefaultHostname() {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.hostname;
  }
  return '';
}

/**
 * Retorna o ambiente atual (cached).
 * @returns {EnvType}
 */
export function getEnv() {
  if (!_envCache) {
    _envCache = detectEnv(getDefaultHostname());
  }
  return _envCache;
}

/**
 * Reseta o cache (util em testes).
 */
export function _resetEnv() {
  _envCache = undefined;
}

/**
 * Configuracoes por ambiente.
 * @returns {{
 *   name: string,
 *   apiBase: string,
 *   authRequired: boolean,
 *   mockData: boolean,
 *   debug: boolean,
 *   logLevel: 'verbose'|'warn'|'error',
 *   telemetry: boolean,
 *   healthCheck: boolean,
 * }}
 */
export function getConfig() {
  switch (getEnv()) {
    case 'development':
      return {
        name: 'development',
        apiBase: '/api', // Proxy via Vite dev server
        authRequired: false,       // Login mock
        mockData: true,            // Dados de mock.js
        debug: true,               // Console logs liberados
        logLevel: 'verbose',
        telemetry: false,          // Nao envia metrics
        healthCheck: true,           // Exibe health na UI
      };

    case 'staging':
      return {
        name: 'staging',
        apiBase: 'https://api-staging.company.com',
        authRequired: true,
        mockData: false,
        debug: true,
        logLevel: 'warn',
        telemetry: true,
        healthCheck: true,
      };

    case 'production':
    default:
      return {
        name: 'production',
        apiBase: 'https://api.company.com',
        authRequired: true,
        mockData: false,
        debug: false,
        logLevel: 'error',
        telemetry: true,
        healthCheck: false,
      };
  }
}

/** Alias para getConfig() */
export const getEnvConfig = getConfig;

/**
 * Verificacoes de conveniencia
 */
export function isDev() { return getEnv() === 'development'; }
export function isStaging() { return getEnv() === 'staging'; }
export function isProd() { return getEnv() === 'production'; }
