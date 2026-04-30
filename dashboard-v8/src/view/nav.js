// Navegação entre views. Funciona como radio-group: uma view ativa por vez.
// Cada view é um descriptor que sabe se montar e desmontar.

/**
 * @typedef {Object} ViewDescriptor
 * @property {string} id
 * @property {string} label
 * @property {string} icon
 * @property {(host: HTMLElement, ctx: object) => () => void} mount
 *   Recebe host e contexto (store, etc). Retorna função de unmount.
 */

/**
 * Cria um controlador de view. Garante que apenas uma view monta por vez.
 * unmount anterior é chamado antes de montar a nova — evita leak.
 *
 * @param {HTMLElement} host
 * @param {ViewDescriptor[]} views
 * @param {object} ctx - injetado em mount(host, ctx)
 */
export function createViewController(host, views, ctx) {
  const map = new Map(views.map((v) => [v.id, v]));
  let currentId = null;
  let currentUnmount = null;

  function show(id) {
    if (!map.has(id)) {
      console.warn('[V8/nav] view não registrada:', id);
      return;
    }
    if (id === currentId) return;
    if (currentUnmount) {
      try { currentUnmount(); } catch (e) { console.error('[V8/nav] unmount error', e); }
      currentUnmount = null;
    }
    host.innerHTML = '';
    currentId = id;
    const desc = map.get(id);
    const unmount = desc.mount(host, ctx);
    currentUnmount = typeof unmount === 'function' ? unmount : null;
  }

  function current() { return currentId; }

  /** Re-monta a view ativa (útil após mudança de tema/dark mode). */
  function remount() {
    const id = currentId;
    if (!id) return;
    if (currentUnmount) {
      try { currentUnmount(); } catch (e) { console.error('[V8/nav] unmount error', e); }
      currentUnmount = null;
    }
    host.innerHTML = '';
    const desc = map.get(id);
    if (!desc) return;
    const unmount = desc.mount(host, ctx);
    currentUnmount = typeof unmount === 'function' ? unmount : null;
  }

  function destroy() {
    if (currentUnmount) {
      try { currentUnmount(); } catch (e) {}
      currentUnmount = null;
    }
    currentId = null;
  }

  return { show, current, remount, destroy, list: views };
}
