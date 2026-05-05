import { it, expect } from './runner.js';
import { diff, hasChanges } from '../src/model/snapshot-delta.js';

function snapshotWith(obras, series) {
  return {
    meta: { total_obras: obras ? obras.length : 0, gerado_em: '2025-01-15' },
    obras: obras || [],
    series: series || {},
  };
}

// 1. prev=null + next with 14 obras → 14 added, seriesChanged=true
it('prev=null + next with 14 obras → 14 added, seriesChanged=true', () => {
  const obras = Array.from({ length: 14 }).map((_, i) => ({
    nome: `Obra ${i + 1}`,
    tipo: 'Tipo',
    status: 'Em progresso',
    avanco: i * 5,
    orcado: 1000000 * (i + 1),
    executado: i * 1000,
    gap: -1,
    atrasoDias: 0,
  }));
  const next = snapshotWith(obras, { meses12: [], receitaMensal: [] });
  const delta = diff(null, next);
  expect(delta.added.length).toBe(14);
  expect(delta.modified.length).toBe(0);
  expect(delta.removed.length).toBe(0);
  expect(delta.unchanged).toBe(0);
  expect(delta.seriesChanged).toBe(true);
  expect(delta.next).toBe(next);
});

// 2. prev = next identical → unchanged count equals obras length, seriesChanged=false
it('prev = next identical → all unchanged, seriesChanged=false', () => {
  const obras = [
    { nome: 'Obra A', tipo: 'Tipo', status: 'Em progresso', avanco: 10, orcado: 1000, executado: 100, gap: 0, atrasoDias: 0 },
    { nome: 'Obra B', tipo: 'Tipo', status: 'Em progresso', avanco: 20, orcado: 2000, executado: 400, gap: 0, atrasoDias: 0 },
  ];
  const prev = snapshotWith(obras, { months: [], receitaMensal: [] });
  const next = snapshotWith(obras, { months: [], receitaMensal: [] });
  const delta = diff(prev, next);
  expect(delta.added.length).toBe(0);
  expect(delta.modified.length).toBe(0);
  expect(delta.removed.length).toBe(0);
  expect(delta.unchanged).toBe(2);
  expect(delta.seriesChanged).toBe(false);
});

// 3. 1 obra added
it('1 obra added', () => {
  const prev = snapshotWith([
    { nome: 'A', tipo: 'Tipo', status: 'Em progresso', avanco: 5, orcado: 100, executado: 5, gap: 0, atrasoDias: 0 },
  ], { receitaMensal: [] });
  const next = snapshotWith([
    { nome: 'A', tipo: 'Tipo', status: 'Em progresso', avanco: 5, orcado: 100, executado: 5, gap: 0, atrasoDias: 0 },
    { nome: 'B', tipo: 'Tipo', status: 'Em progresso', avanco: 0, orcado: 50, executado: 0, gap: 0, atrasoDias: 0 },
  ], { receitaMensal: [] });
  const delta = diff(prev, next);
  expect(delta.added.length).toBe(1);
  expect(delta.modified.length).toBe(0);
  expect(delta.removed.length).toBe(0);
  expect(delta.unchanged).toBe(1);
});

// 4. 1 obra removed
it('1 obra removed', () => {
  const prev = snapshotWith([
    { nome: 'A', tipo: 'Tipo', status: 'Em progresso', avanco: 5, orcado: 100, executado: 5, gap: 0, atrasoDias: 0 },
    { nome: 'B', tipo: 'Tipo', status: 'Em progresso', avanco: 10, orcado: 200, executado: 20, gap: 0, atrasoDias: 0 },
  ], { receitaMensal: [] });
  const next = snapshotWith([
    { nome: 'A', tipo: 'Tipo', status: 'Em progresso', avanco: 5, orcado: 100, executado: 5, gap: 0, atrasoDias: 0 },
  ], { receitaMensal: [] });
  const delta = diff(prev, next);
  expect(delta.added.length).toBe(0);
  expect(delta.modified.length).toBe(0);
  expect(delta.removed.length).toBe(1);
  expect(delta.unchanged).toBe(1);
});

// 5. 1 obra modified (numeric field changed)
it('1 obra modified (numeric field changed)', () => {
  const prev = snapshotWith([
    { nome: 'A', tipo: 'Tipo', status: 'Em progresso', avanco: 5, orcado: 100, executado: 5, gap: 0, atrasoDias: 0 },
  ], {});
  const next = snapshotWith([
    { nome: 'A', tipo: 'Tipo', status: 'Em progresso', avanco: 15, orcado: 100, executado: 5, gap: 0, atrasoDias: 0 },
  ], {});
  const delta = diff(prev, next);
  expect(delta.added.length).toBe(0);
  expect(delta.modified.length).toBe(1);
  expect(delta.removed.length).toBe(0);
  expect(delta.unchanged).toBe(0);
});

// 6. 1 obra modified (status field changed)
it('1 obra modified (status field changed)', () => {
  const prev = snapshotWith([
    { nome: 'A', tipo: 'Tipo', status: 'Em progresso', avanco: 5, orcado: 100, executado: 5, gap: 0, atrasoDias: 0 },
  ], {});
  const next = snapshotWith([
    { nome: 'A', tipo: 'Tipo', status: 'Concluído', avanco: 5, orcado: 100, executado: 5, gap: 0, atrasoDias: 0 },
  ], {});
  const delta = diff(prev, next);
  expect(delta.added.length).toBe(0);
  expect(delta.modified.length).toBe(1);
  expect(delta.removed.length).toBe(0);
  expect(delta.unchanged).toBe(0);
});

// 7. Multiple changes mixed (2 added, 1 removed, 1 modified)
it('multiple changes mixed (2 added, 1 removed, 1 modified)', () => {
  const prev = snapshotWith([
    { nome: 'A', tipo: 'Tipo', status: 'Em progresso', avanco: 5, orcado: 100, executado: 5, gap: 0, atrasoDias: 0 },
    { nome: 'B', tipo: 'Tipo', status: 'Em progresso', avanco: 10, orcado: 200, executado: 20, gap: 0, atrasoDias: 0 },
  ], {});
  const next = snapshotWith([
    { nome: 'A', tipo: 'Tipo', status: 'Em progresso', avanco: 15, orcado: 100, executado: 5, gap: 0, atrasoDias: 0 }, // modified
    { nome: 'B', tipo: 'Tipo', status: 'Em progresso', avanco: 10, orcado: 200, executado: 20, gap: 0, atrasoDias: 0 }, // unchanged
    { nome: 'C', tipo: 'Tipo', status: 'Em progresso', avanco: 0, orcado: 50, executado: 0, gap: 0, atrasoDias: 0 }, // added
    { nome: 'D', tipo: 'Tipo', status: 'Em progresso', avanco: 0, orcado: 60, executado: 0, gap: 0, atrasoDias: 0 }, // added
  ], {});
  const delta = diff(prev, next);
  expect(delta.added.length).toBe(2);
  expect(delta.removed.length).toBe(0);
  expect(delta.modified.length).toBe(1);
  expect(delta.unchanged).toBe(1);
});

// 8. series.receitaMensal changed → seriesChanged=true
it('series.receitaMensal changed → seriesChanged=true', () => {
  const obras = [
    { nome: 'A', tipo: 'Tipo', status: 'Em progresso', avanco: 10, orcado: 100, executado: 10, gap: 0, atrasoDias: 0 },
  ];
  const prev = snapshotWith(obras, { receitaMensal: [100, 200] });
  const next = snapshotWith(obras, { receitaMensal: [150, 200] });
  const delta = diff(prev, next);
  expect(delta.seriesChanged).toBe(true);
});

// 9. Series identical → seriesChanged=false
it('series identical → seriesChanged=false', () => {
  const obras = [
    { nome: 'A', tipo: 'Tipo', status: 'Em progresso', avanco: 10, orcado: 100, executado: 10, gap: 0, atrasoDias: 0 },
  ];
  const prev = snapshotWith(obras, { receitaMensal: [100, 200] });
  const next = snapshotWith(obras, { receitaMensal: [100, 200] });
  const delta = diff(prev, next);
  expect(delta.seriesChanged).toBe(false);
});

// 10. hasChanges true when added>0
it('hasChanges true when added>0', () => {
  const prev = snapshotWith([
    { nome: 'A', tipo: 'Tipo', status: 'Em progresso', avanco: 5, orcado: 100, executado: 5, gap: 0, atrasoDias: 0 },
  ], {});
  const next = snapshotWith([
    { nome: 'A', tipo: 'Tipo', status: 'Em progresso', avanco: 5, orcado: 100, executado: 5, gap: 0, atrasoDias: 0 },
    { nome: 'B', tipo: 'Tipo', status: 'Em progresso', avanco: 0, orcado: 50, executado: 0, gap: 0, atrasoDias: 0 },
  ], {});
  const delta = diff(prev, next);
  expect(hasChanges(delta)).toBe(true);
});

// 11. hasChanges true when seriesChanged
it('hasChanges true when seriesChanged', () => {
  const obras = [
    { nome: 'A', tipo: 'Tipo', status: 'Em progresso', avanco: 10, orcado: 100, executado: 10, gap: 0, atrasoDias: 0 }
  ];
  const prev = snapshotWith(obras, { receitaMensal: [1, 2] });
  const next = snapshotWith(obras, { receitaMensal: [9, 2] });
  const delta = diff(prev, next);
  expect(hasChanges(delta)).toBe(true);
});

// 12. hasChanges false when nothing changed
it('hasChanges false when nothing changed', () => {
  const obras = [
    { nome: 'A', tipo: 'Tipo', status: 'Em progresso', avanco: 10, orcado: 100, executado: 10, gap: 0, atrasoDias: 0 }
  ];
  const prev = snapshotWith(obras, { receitaMensal: [1, 2] });
  const next = snapshotWith(obras, { receitaMensal: [1, 2] });
  const delta = diff(prev, next);
  expect(hasChanges(delta)).toBe(false);
});
