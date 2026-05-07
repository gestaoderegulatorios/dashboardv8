// RBAC - Role-Based Access Control
// Regras de quem pode ver/modificar o que
// Roles: admin > manager > viewer > auditor

/** @typedef {'admin'|'manager'|'viewer'|'auditor'} Role */

/** Hierarquia de roles (maior = mais permissao) */
const ROLE_HIERARCHY = { admin: 4, manager: 3, viewer: 2, auditor: 1 };

/** @type {Record<string, {views: string[], actions: string[]}>} */
const DEFAULT_PERMISSIONS = {
  admin: { views: ['*'], actions: ['view', 'edit', 'delete', 'export', 'admin'] },
  manager: { views: ['overview', 'finance', 'works', 'reports', 'operational', 'land', 'settings'], actions: ['view', 'edit', 'export'] },
  viewer: { views: ['overview', 'finance', 'works', 'operational', 'land'], actions: ['view'] },
  auditor: { views: ['reports', 'finance', 'works'], actions: ['view', 'export'] },
};

/**
 * Verifica se um role tem permissao para uma view
 * @param {Role} role
 * @param {string} viewId
 * @returns {boolean}
 */
export function canAccessView(role, viewId) {
  if (!role) return false;
  const perms = DEFAULT_PERMISSIONS[role];
  if (!perms) return false;
  if (perms.views.includes('*')) return true;
  return perms.views.includes(viewId);
}

/**
 * Verifica se um role pode executar uma acao
 * @param {Role} role
 * @param {string} action - 'view'|'edit'|'delete'|'export'|'admin'
 * @returns {boolean}
 */
export function canPerformAction(role, action) {
  if (!role) return false;
  const perms = DEFAULT_PERMISSIONS[role];
  if (!perms) return false;
  if (perms.actions.includes('*')) return true;
  return perms.actions.includes(action);
}

/**
 * Verifica se role A tem mais permissao que role B
 * @param {Role} roleA
 * @param {Role} roleB
 * @returns {boolean}
 */
export function isHigherRole(roleA, roleB) {
  return (ROLE_HIERARCHY[roleA] || 0) > (ROLE_HIERARCHY[roleB] || 0);
}

/**
 * Retorna todas as views permitidas para um role
 * @param {Role} role
 * @returns {string[]}
 */
export function getAllowedViews(role) {
  if (!role) return [];
  return DEFAULT_PERMISSIONS[role]?.views || [];
}

/**
 * Retorna todas as acoes permitidas para um role
 * @param {Role} role
 * @returns {string[]}
 */
export function getAllowedActions(role) {
  if (!role) return [];
  return DEFAULT_PERMISSIONS[role]?.actions || [];
}

/**
 * Middleware para guard de rotas
 * @param {Role} userRole
 * @param {string} requiredRole
 * @returns {boolean}
 */
export function hasMinimumRole(userRole, requiredRole) {
  if (!userRole || !requiredRole) return false;
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
}
