// Testes do view controller. Valida lifecycle: mount, unmount, switch.
import { it, expect } from './runner.js';
import { createViewController } from '../src/view/nav.js';

function makeView(id) {
  const calls = { mount: 0, unmount: 0 };
  const view = {
    id,
    label: id,
    icon: 'circle',
    mount(host) {
      calls.mount++;
      host.innerHTML = `<div data-view="${id}">${id}</div>`;
      return () => { calls.unmount++; };
    }
  };
  return { view, calls };
}

it('createViewController.show monta a view solicitada', () => {
  const host = document.createElement('div');
  const { view, calls } = makeView('a');
  const ctrl = createViewController(host, [view], {});
  ctrl.show('a');
  expect(calls.mount).toBe(1);
  expect(host.querySelector('[data-view="a"]')).toBeTruthy();
});

it('show de view diferente chama unmount da anterior antes de montar nova', () => {
  const host = document.createElement('div');
  const a = makeView('a');
  const b = makeView('b');
  const ctrl = createViewController(host, [a.view, b.view], {});
  ctrl.show('a');
  ctrl.show('b');
  expect(a.calls.mount).toBe(1);
  expect(a.calls.unmount).toBe(1);
  expect(b.calls.mount).toBe(1);
  expect(b.calls.unmount).toBe(0);
  expect(ctrl.current()).toBe('b');
});

it('show da MESMA view é no-op (não remonta)', () => {
  const host = document.createElement('div');
  const { view, calls } = makeView('a');
  const ctrl = createViewController(host, [view], {});
  ctrl.show('a');
  ctrl.show('a');
  ctrl.show('a');
  expect(calls.mount).toBe(1);
  expect(calls.unmount).toBe(0);
});

it('show de view não registrada loga e não quebra', () => {
  const host = document.createElement('div');
  const { view } = makeView('a');
  const ctrl = createViewController(host, [view], {});
  // Não throws
  ctrl.show('inexistente');
  expect(ctrl.current()).toBe(null);
});

it('destroy chama unmount da view ativa', () => {
  const host = document.createElement('div');
  const { view, calls } = makeView('a');
  const ctrl = createViewController(host, [view], {});
  ctrl.show('a');
  ctrl.destroy();
  expect(calls.unmount).toBe(1);
  expect(ctrl.current()).toBe(null);
});

it('view recebe ctx no mount (segundo argumento)', () => {
  const host = document.createElement('div');
  let receivedCtx = null;
  const view = {
    id: 'x', label: 'x', icon: 'circle',
    mount(h, ctx) { receivedCtx = ctx; return () => {}; }
  };
  const myCtx = { store: 'fake', value: 42 };
  const ctrl = createViewController(host, [view], myCtx);
  ctrl.show('x');
  expect(receivedCtx).toBe(myCtx);
});
