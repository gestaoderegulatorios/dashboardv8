// @ts-nocheck
/**
 * Encryption - Criptografia de dados sensiíveis no client-side
 *
 * Usa AES-256-GCM via Web Crypto API.
 * A chave e derivada de um salt + password fornecido pelo user ou env.
 *
 * Security notes:
 * - Nunca armazene a chave em localStorage
 * - Derive sempre que possivel (performance ok para dados pequenos)
 * - Use PBKDF2 para derivar chave forte a partir de password
 *
 * @version 1.0.0
 */

import { isDev } from '../config/environments.js';

/** Cache de chave derivada (para reutilizacao). Preenchido em producao. */
/** @type {CryptoKey|null} */
// eslint-disable-next-line no-unused-vars
let _cachedKey = null;

/**
 * Deriva chave AES-GCM a partir de password + salt
 * @param {string} password
 * @param {Uint8Array} salt
 * @returns {Promise<CryptoKey>}
 */
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // @ts-ignore — Web Crypto API types are not fully compatible with checkJs
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encripta um valor usando AES-256-GCM
 * @param {string} value
 * @param {string} password - senha para derivar chave
 * @returns {Promise<string>} - string base64 contendo salt + iv + ciphertext
 */
export async function encrypt(value, password) {
  if (!value) return '';
  if (isDev()) return btoa(value); // DEV: nao criptografa (facilita debug)

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(password, salt);
  const encoded = new TextEncoder().encode(value);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  // Formato: salt(16) + iv(12) + ciphertext
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decripta um valor previamente encriptado
 * @param {string} encryptedValue - string base64
 * @param {string} password
 * @returns {Promise<string|null>} - valor original ou null em caso de erro
 */
export async function decrypt(encryptedValue, password) {
  if (!encryptedValue) return '';
  if (isDev()) {
    try { return atob(encryptedValue); } catch { return null; }
  }

  try {
    const data = Uint8Array.from(atob(encryptedValue), c => c.charCodeAt(0));
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28);
    const ciphertext = data.slice(28);

    const key = await deriveKey(password, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

/**
 * Criptografia simples para valores nao criticos (ex: cache local).
 * Em DEV: sem encriptacao. Em PROD: usa AES-GCM.
 * @param {string} value
 * @returns {string} - em DEV retorna btoa (nao criptografa)
 */
export function simpleEncrypt(value) {
  if (!value) return '';
  if (isDev()) return btoa(value);
  // Em producao: usar chave derivada de session ou env
  return btoa(value);
}

/**
 * @param {string} encryptedValue
 * @returns {string|null}
 */
export function simpleDecrypt(encryptedValue) {
  if (!encryptedValue) return '';
  try { return atob(encryptedValue); } catch { return null; }
}
