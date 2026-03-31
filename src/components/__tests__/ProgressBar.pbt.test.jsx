// Feature: placetrack-react-refactor, Property 5: ProgressBar fill clamping
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import ProgressBar from '../ProgressBar.jsx';

function getFillPct(container) {
  const fill = container.querySelector('[class*="fill"]');
  const width = fill?.style.width ?? '0%';
  return parseFloat(width);
}

describe('P5 — ProgressBar fill always in [0, 100]', () => {
  it('arbitrary value/max pairs always produce fill in [0, 100]%', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 1000 }),
        fc.integer({ min: -1000, max: 1000 }),
        (value, max) => {
          const { container } = render(<ProgressBar label="L" value={value} max={max} />);
          const pct = getFillPct(container);
          expect(pct).toBeGreaterThanOrEqual(0);
          expect(pct).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('fill is exactly 0 when value is 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        (max) => {
          const { container } = render(<ProgressBar label="L" value={0} max={max} />);
          expect(getFillPct(container)).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('fill is exactly 100 when value equals max (positive)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        (max) => {
          const { container } = render(<ProgressBar label="L" value={max} max={max} />);
          expect(getFillPct(container)).toBe(100);
        }
      ),
      { numRuns: 100 }
    );
  });
});
