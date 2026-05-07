import { describe, it, expect } from 'vitest';
import { validate, isValid } from '../src/config/validator.js';
import { ALLOWED_CHART_TYPES, ALLOWED_KPI_FORMATS, ALLOWED_ROLES } from '../src/config/schema.js';

function validConfig(overrides = {}) {
  return {
    id: 'financeiro',
    name: 'Financeiro',
    icon: 'attach_money',
    views: ['overview', 'works'],
    defaultView: 'overview',
    viewConfig: [
      { id: 'overview', label: 'Visao Geral', icon: 'dashboard' },
      { id: 'works', label: 'Obras', icon: 'construction' },
    ],
    kpis: [
      { id: 'obras-ativas', label: 'Obras Ativas', format: 'integer', color: 'primary' },
    ],
    charts: [
      { id: 'receita-mensal', type: 'area', title: 'Receita Mensal' },
    ],
    tables: [
      {
        id: 'tbl-obras',
        title: 'Obras',
        columns: [
          { key: 'nome', label: 'Nome', type: 'string' },
          { key: 'valor', label: 'Valor', type: 'currency' },
        ],
      },
    ],
    permissions: { role: 'viewer', views: ['overview'], actions: ['view'] },
    ...overrides,
  };
}

describe('config/validator -- validate()', () => {
  it('aceita um config minimo valido', () => {
    const result = validate(validConfig());
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejeita config nulo', () => {
    const result = validate(null);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('obrigat');
  });

  it('rejeita config sem id', () => {
    const result = validate(validConfig({ id: undefined }));
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('id: string obrigatorio');
  });

  it('rejeita config sem name', () => {
    const result = validate(validConfig({ name: null }));
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('name: string obrigatorio');
  });

  it('rejeita config sem icon', () => {
    const result = validate(validConfig({ icon: '' }));
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('icon: string obrigatorio');
  });

  it('rejeita config sem views', () => {
    const result = validate(validConfig({ views: [] }));
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('views: array nao vazio obrigatorio');
  });

  it('rejeita defaultView que nao esta em views', () => {
    const result = validate(validConfig({ defaultView: 'nonexistent' }));
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("defaultView 'nonexistent' nao esta em views");
  });

  it('aceita view com defaultView valido', () => {
    const result = validate(validConfig({ defaultView: 'works' }));
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejeita items duplicados em kpis', () => {
    const result = validate(validConfig({
      kpis: [
        { id: 'k1', label: 'K1', format: 'integer' },
        { id: 'k1', label: 'K1 dup', format: 'integer' },
      ],
    }));
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.includes("id 'k1' duplicado"))).toBe(true);
  });

  it('rejeita kpi.format invalido', () => {
    const result = validate(validConfig({
      kpis: [{ id: 'k1', label: 'K1', format: 'invalid_format' }],
    }));
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.includes("format 'invalid_format'"))).toBe(true);
  });

  it('aceita kpi.format valido', () => {
    for (const fmt of ALLOWED_KPI_FORMATS) {
      const result = validate(validConfig({ kpis: [{ id: 'k1', label: 'K1', format: fmt }] }));
      expect(result.ok).toBe(true);
    }
  });

  it('rejeita chart.type invalido', () => {
    const result = validate(validConfig({
      charts: [{ id: 'c1', type: 'invalid_type', title: 'T' }],
    }));
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.includes("'invalid_type'"))).toBe(true);
  });

  it('aceita chart.type valido', () => {
    for (const type of ALLOWED_CHART_TYPES) {
      const result = validate(validConfig({ charts: [{ id: 'c1', type, title: 'T' }] }));
      expect(result.ok).toBe(true);
    }
  });

  it('rejeita table.columns com tipo invalido', () => {
    const result = validate(validConfig({
      tables: [{
        id: 't1',
        title: 'T1',
        columns: [{ key: 'c1', label: 'C1', type: 'invalid' }],
      }],
    }));
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.includes("'invalid'"))).toBe(true);
  });

  it('rejeita table sem title', () => {
    const result = validate(validConfig({
      tables: [{ id: 't1' }],
    }));
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.includes('title'))).toBe(true);
  });

  it('rejeita permissions.role invalido', () => {
    const result = validate(validConfig({
      permissions: { role: 'invalid_role' },
    }));
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.includes("'invalid_role'"))).toBe(true);
  });

  it('valida roles permitidos', () => {
    for (const role of ALLOWED_ROLES) {
      const result = validate(validConfig({ permissions: { role } }));
      expect(result.ok).toBe(true);
    }
  });

  it('valida null-safe para tables', () => {
    const result = validate(validConfig({ tables: null }));
    expect(result.ok).toBe(true);
  });

  it('valida array de views com tipos errados', () => {
    const result = validate(validConfig({ views: [123, true] }));
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.includes('deve ser string'))).toBe(true);
  });
});

describe('config/validator -- isValid()', () => {
  it('retorna true para config valido', () => {
    expect(isValid(validConfig())).toBe(true);
  });

  it('retorna false para config invalido', () => {
    expect(isValid(null)).toBe(false);
    expect(isValid(validConfig({ id: null }))).toBe(false);
  });
});

describe('config/schema -- constantes exported', () => {
  it('ALLOWED_CHART_TYPES nao esta vazio', () => {
    expect(ALLOWED_CHART_TYPES.length).toBeGreaterThan(0);
  });

  it('ALLOWED_KPI_FORMATS nao esta vazio', () => {
    expect(ALLOWED_KPI_FORMATS.length).toBeGreaterThan(0);
  });

  it('ALLOWED_ROLES nao esta vazio', () => {
    expect(ALLOWED_ROLES.length).toBeGreaterThan(0);
  });
});
