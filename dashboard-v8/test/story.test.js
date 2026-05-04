// Testes do storytelling. Cada padrão é função pura.
import { it, expect } from './runner.js';
import { applyStorytelling } from '../src/domain/storytelling.js';
import { obras } from '../src/model/mock.js';

it('applyStorytelling hierarchical preserva ordem original', () => {
  const out = applyStorytelling(obras, 'hierarchical');
  expect(out.map((o) => o.nome)).toEqual(obras.map((o) => o.nome));
});

it('applyStorytelling comparative agrupa por tipo (mesmo tipo fica junto)', () => {
  const out = applyStorytelling(obras, 'comparative');
  const tipos = out.map((o) => o.tipo);
  const groups = {};
  tipos.forEach((t, i) => {
    if (!(t in groups)) groups[t] = { first: i, last: i };
    else groups[t].last = i;
  });
  Object.keys(groups).forEach((t) => {
    const count = tipos.filter((x) => x === t).length;
    expect(groups[t].last - groups[t].first).toBe(count - 1);
  });
});

it('applyStorytelling drilldown ordena por |gap| descendente', () => {
  const out = applyStorytelling(obras, 'drilldown');
  for (let i = 1; i < out.length; i++) {
    const prev = Math.abs(out[i - 1].gap);
    const cur = Math.abs(out[i].gap);
    expect(prev >= cur).toBeTruthy();
  }
  // Primeiro elemento deve ser Loteamento Bosque (|gap|=8.1)
  expect(out[0].nome).toBe('Loteamento Bosque');
});

it('applyStorytelling não muta input', () => {
  const before = JSON.stringify(obras);
  applyStorytelling(obras, 'comparative');
  applyStorytelling(obras, 'drilldown');
  expect(JSON.stringify(obras)).toBe(before);
});

it('applyStorytelling com pattern desconhecido cai em hierarchical', () => {
  const out = applyStorytelling(obras, 'inexistente');
  expect(out.map((o) => o.nome)).toEqual(obras.map((o) => o.nome));
});

it('applyStorytelling aceita 3 patterns válidos', () => {
  // Os 3 patterns suportados são hierarchical, comparative, drilldown
  const patterns = ['hierarchical', 'comparative', 'drilldown'];
  patterns.forEach((p) => {
    const out = applyStorytelling(obras, p);
    expect(out.length).toBe(obras.length);
  });
});
