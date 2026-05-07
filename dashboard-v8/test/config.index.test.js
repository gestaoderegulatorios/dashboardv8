import { describe, it, expect } from 'vitest';
import { VERTICALS, getVertical, getDefaultVerticalId, detectVerticalId } from '../src/config/index.js';
import { validate } from '../src/config/validator.js';

// Mock window.location.search para tests que precisam
function mockSearch(search) {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { search },
  });
}

describe('config/index -- vertical registry', () => {
  it('registra pelo menos financeiro e rh', () => {
    expect(Object.keys(VERTICALS)).toContain('financeiro');
    expect(Object.keys(VERTICALS)).toContain('rh');
  });

  it('getVertical retorna config existente', () => {
    const v = getVertical('financeiro');
    expect(v).toBeDefined();
    expect(v.id).toBe('financeiro');
    expect(v.name).toBe('Financeiro');
  });

  it('getVertical retorna undefined para id inexistente', () => {
    expect(getVertical('inexistente')).toBeUndefined();
  });

  it('getDefaultVerticalId retorna o primeiro id', () => {
    const defaultId = getDefaultVerticalId();
    expect(defaultId).toBe('financeiro'); // financeiro é o primeiro registrado
  });

  it('detectVerticalId usa query param valido', () => {
    mockSearch('?vertical=rh');
    expect(detectVerticalId()).toBe('rh');
  });

  it('detectVerticalId fallback quando query invalido', () => {
    mockSearch('?vertical=inexistente');
    expect(detectVerticalId()).toBe('financeiro');
  });

  it('detectVerticalId fallback quando sem query', () => {
    mockSearch('');
    expect(detectVerticalId()).toBe('financeiro');
  });
});

describe('config/index -- todos os verticals passam em validate', () => {
  for (const [id, config] of Object.entries(VERTICALS)) {
    it(`vertical '${id}' é valido`, () => {
      const result = validate(config);
      if (!result.ok) {
        console.error(`Errors for ${id}:`, result.errors);
      }
      expect(result.ok).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  }
});
