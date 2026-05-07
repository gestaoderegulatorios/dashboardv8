/**
 * API Client com auth automatico
 * Em DEV: intercepta e retorna mock (sem fetch real)
 * Em STAGING/PROD: adiciona header Authorization automaticamente
 */

import { getAccessToken } from './auth.js';
import { isDev } from '../config/environments.js';

/** @type {string} Base URL da API */
const API_BASE = isDev() ? '/api' : '/api'; // staging/prod usa '/api' como padrao (configure via proxy ou env runtime)

/** Clea para armazenar callbacks de erro */
const errorListeners = new Set();
const requestListeners = new Set();

/**
 * Registra listener para respostas de erro
 * @param {(response: Response, url: string) => void} cb
 */
export function onError(cb) {
  errorListeners.add(cb);
  return () => errorListeners.delete(cb);
}

/**
 * Registra listener para todas as requisicoes (debug/telemetry)
 * @param {{url: string, method: string, status: number}} cb
 */
export function onRequest(cb) {
  requestListeners.add(cb);
  return () => requestListeners.delete(cb);
}

/**
 * Faz requisicao HTTP com auth automatico
 * @param {string} endpoint - path (ex: '/login')
 * @param {{method?: string, body?: any, headers?: Record<string, string>, skipAuth?: boolean}} options
 */
export async function http(endpoint, options = {}) {
  const { method = 'GET', body, headers: customHeaders = {}, skipAuth = false } = options;

  const url = `${API_BASE}${endpoint}`;
  const headers = { ...customHeaders };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  // Content-Type para JSON
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const init = /** @type {RequestInit} */({
    method,
    headers,
    credentials: 'include',
  });

  if (body) {
    init.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(url, init);

  // Notifica listeners de request (debug/telemetry)
  requestListeners.forEach(cb => {
    try { cb({ url, method, status: response.status }); } catch(e) { /* noop */ }
  });

  if (!response.ok) {
    errorListeners.forEach(cb => {
      try { cb(response, url); } catch(e) { /* noop */ }
    });
  }

  return response;
}

/** GET com auth */
export function get(endpoint, options) { return http(endpoint, { ...options, method: 'GET' }); }

/** POST com auth */
export function post(endpoint, options) { return http(endpoint, { ...options, method: 'POST' }); }

/** PUT com auth */
export function put(endpoint, options) { return http(endpoint, { ...options, method: 'PUT' }); }

/** DELETE com auth */
export function del(endpoint, options) { return http(endpoint, { ...options, method: 'DELETE' }); }

/**
 * Retry com exponential backoff (3 tentativas max)
 * @param {string} endpoint
 * @param {{retries?: number, delay?: number}} options
 */
export async function httpWithRetry(endpoint, options = {}) {
  const { retries = 3, delay = 300, ...httpOptions } = options;
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await http(endpoint, httpOptions);
      if (response.ok) return response;
    } catch (err) {
      lastError = err;
    }
    if (i < retries - 1) {
      await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
    }
  }

  throw lastError || new Error(`Request failed after ${retries} attempts`);
}
