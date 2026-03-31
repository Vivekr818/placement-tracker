// Feature: placetrack-react-refactor, Property 12: date fields stored in YYYY-MM-DD format
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { usePlaceTrackState } from '../../hooks/usePlaceTrackState.js';
import { todayStr, offsetDate } from '../dateUtils.js';

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

beforeEach(() => { localStorage.clear(); });
afterEach(() => { localStorage.clear(); });

describe('P12 — addCompany date fields match YYYY-MM-DD', () => {
  it('added field on every new company matches ISO date format', () => {
    fc.assert(
      fc.property(
        fc.record({
          name:  fc.string({ minLength: 1, maxLength: 30 }),
          role:  fc.string({ minLength: 1, maxLength: 30 }),
          type:  fc.constantFrom('product', 'service', 'startup', 'finance', 'other'),
          stage: fc.constantFrom('applied', 'oa', 'interview', 'selected', 'rejected'),
          date:  fc.constant(todayStr()),
          notes: fc.constant(''),
        }),
        (companyData) => {
          localStorage.clear();
          const { result } = renderHook(() => usePlaceTrackState());
          act(() => { result.current.actions.addCompany(companyData); });
          const added = result.current.state.companies[0].added;
          expect(added).toMatch(ISO_RE);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('offsetDate always returns YYYY-MM-DD', () => {
  it('any integer offset produces a valid ISO date string', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -365, max: 365 }),
        (n) => {
          expect(offsetDate(n)).toMatch(ISO_RE);
        }
      ),
      { numRuns: 200 }
    );
  });
});
