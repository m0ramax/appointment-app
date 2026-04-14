import { describe, it, expect } from 'vitest';
import { PROVIDER_COLORS } from './providerColors';

describe('PROVIDER_COLORS', () => {
  it('has exactly 5 entries', () => {
    expect(PROVIDER_COLORS).toHaveLength(5);
  });

  it('each entry has bg, border, text, and label properties', () => {
    for (const entry of PROVIDER_COLORS) {
      expect(entry).toHaveProperty('bg');
      expect(entry).toHaveProperty('border');
      expect(entry).toHaveProperty('text');
      expect(entry).toHaveProperty('label');
    }
  });

  it('each property is a non-empty string', () => {
    for (const entry of PROVIDER_COLORS) {
      expect(typeof entry.bg).toBe('string');
      expect(entry.bg.length).toBeGreaterThan(0);
      expect(typeof entry.border).toBe('string');
      expect(entry.border.length).toBeGreaterThan(0);
      expect(typeof entry.text).toBe('string');
      expect(entry.text.length).toBeGreaterThan(0);
      expect(typeof entry.label).toBe('string');
      expect(entry.label.length).toBeGreaterThan(0);
    }
  });

  it('all bg values are unique (no duplicate colors)', () => {
    const bgValues = PROVIDER_COLORS.map(entry => entry.bg);
    const uniqueBgValues = new Set(bgValues);
    expect(uniqueBgValues.size).toBe(bgValues.length);
  });
});
