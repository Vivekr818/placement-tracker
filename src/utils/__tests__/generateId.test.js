// Feature: placetrack-react-refactor — generateId unit tests
import { describe, it, expect } from 'vitest';
import { generateId } from '../generateId.js';

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('returns distinct values on consecutive calls', () => {
    const ids = Array.from({ length: 100 }, () => generateId());
    const unique = new Set(ids);
    expect(unique.size).toBe(100);
  });

  it('returns a string even when crypto.randomUUID is unavailable', () => {
    const original = crypto.randomUUID;
    // @ts-ignore
    crypto.randomUUID = undefined;
    try {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    } finally {
      crypto.randomUUID = original;
    }
  });

  it('1000 consecutive calls all produce distinct values', () => {
    const ids = Array.from({ length: 1000 }, () => generateId());
    const unique = new Set(ids);
    expect(unique.size).toBe(1000);
  });
});
