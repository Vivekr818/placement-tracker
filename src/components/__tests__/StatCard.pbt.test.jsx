// Feature: placetrack-react-refactor, Property 3: StatCard renders required and conditional fields
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import StatCard from '../StatCard.jsx';

describe('P3 — StatCard label and value always in DOM; sub iff provided', () => {
  it('label and value always render', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0),
        fc.oneof(fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0), fc.nat({ max: 9999 })),
        (label, value) => {
          const { container } = render(<StatCard label={label} value={value} />);
          const text = container.textContent ?? '';
          expect(text).toContain(String(label));
          expect(text).toContain(String(value));
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('sub renders if and only if provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
        fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0), { nil: undefined }),
        (label, value, sub) => {
          const { container } = render(<StatCard label={label} value={value} sub={sub} />);
          const text = container.textContent ?? '';
          expect(text).toContain(label);
          if (sub !== undefined) {
            expect(text).toContain(sub);
          }
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
