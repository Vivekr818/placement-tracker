// Feature: placetrack-react-refactor, Property 11: generateId produces unique non-empty strings
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateId } from '../generateId.js';

describe('P11 — generateId uniqueness', () => {
  it('N calls all return non-empty strings and all are distinct', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 200 }),
        (n) => {
          const count = n + 1; // at least 1
          const ids = Array.from({ length: count }, () => generateId());
          for (const id of ids) {
            expect(typeof id).toBe('string');
            expect(id.length).toBeGreaterThan(0);
          }
          expect(new Set(ids).size).toBe(count);
        }
      ),
      { numRuns: 100 }
    );
  });
});
