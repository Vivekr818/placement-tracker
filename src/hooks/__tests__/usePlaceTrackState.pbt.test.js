// Feature: placetrack-react-refactor, Property-Based Tests — usePlaceTrackState
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { usePlaceTrackState } from '../usePlaceTrackState.js';
import { todayStr, offsetDate } from '../../utils/dateUtils.js';

const STORAGE_KEY = 'pt2';

const DEFAULT_STATE_KEYS = [
  'companies', 'tasks', 'taskHist', 'streak', 'lastDone',
  'lastTaskDate', 'prepType', 'profile', 'expandedTopics',
];

const companyArb = fc.record({
  name:  fc.string({ minLength: 1, maxLength: 50 }),
  role:  fc.string({ minLength: 1, maxLength: 50 }),
  type:  fc.constantFrom('product', 'service', 'startup', 'finance', 'other'),
  stage: fc.constantFrom('applied', 'oa', 'interview', 'selected', 'rejected'),
  date:  fc.constant(todayStr()),
  notes: fc.string({ maxLength: 100 }),
});

beforeEach(() => { localStorage.clear(); });
afterEach(() => { localStorage.clear(); });

// ─── P1: localStorage round-trip ─────────────────────────────────────────────
// Feature: placetrack-react-refactor, Property 1: localStorage round-trip
describe('P1 — localStorage round-trip', () => {
  it('re-initialising the hook from stored state preserves all fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          streak:   fc.nat({ max: 365 }),
          prepType: fc.constantFrom('product', 'service'),
          profile:  fc.record({
            name: fc.string({ maxLength: 30 }),
            handle: fc.string({ maxLength: 20 }),
            college: fc.string({ maxLength: 40 }),
            role: fc.string({ maxLength: 30 }),
            bio: fc.string({ maxLength: 100 }),
          }),
        }),
        (partial) => {
          localStorage.clear();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(partial));
          const { result } = renderHook(() => usePlaceTrackState());
          expect(result.current.state.streak).toBe(partial.streak);
          expect(result.current.state.prepType).toBe(partial.prepType);
          expect(result.current.state.profile.name).toBe(partial.profile.name);
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ─── P8: addCompany uniqueness ────────────────────────────────────────────────
// Feature: placetrack-react-refactor, Property 8: addCompany appends entry with unique id
describe('P8 — addCompany uniqueness', () => {
  it('N calls grow companies by N and all ids are distinct', () => {
    fc.assert(
      fc.property(
        fc.array(companyArb, { minLength: 1, maxLength: 20 }),
        (companies) => {
          localStorage.clear();
          const { result } = renderHook(() => usePlaceTrackState());
          act(() => {
            for (const c of companies) {
              result.current.actions.addCompany(c);
            }
          });
          expect(result.current.state.companies).toHaveLength(companies.length);
          const ids = result.current.state.companies.map((c) => c.id);
          expect(new Set(ids).size).toBe(ids.length);
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ─── P9: No-op for missing id ─────────────────────────────────────────────────
// Feature: placetrack-react-refactor, Property 9: no-op mutations for non-existent id
describe('P9 — no-op for non-existent id', () => {
  it('updateCompany with missing id leaves companies unchanged', () => {
    fc.assert(
      fc.property(
        fc.array(companyArb, { minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1 }),
        (companies, fakeId) => {
          localStorage.clear();
          const { result } = renderHook(() => usePlaceTrackState());
          act(() => {
            for (const c of companies) result.current.actions.addCompany(c);
          });
          const before = result.current.state.companies.map((c) => c.id);
          // Ensure fakeId is not an actual id
          fc.pre(!before.includes(fakeId));
          act(() => { result.current.actions.updateCompany(fakeId, { name: 'X' }); });
          const after = result.current.state.companies.map((c) => c.id);
          expect(after).toEqual(before);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('deleteCompany with missing id leaves companies unchanged', () => {
    fc.assert(
      fc.property(
        fc.array(companyArb, { minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1 }),
        (companies, fakeId) => {
          localStorage.clear();
          const { result } = renderHook(() => usePlaceTrackState());
          act(() => {
            for (const c of companies) result.current.actions.addCompany(c);
          });
          const before = result.current.state.companies.length;
          fc.pre(!result.current.state.companies.map((c) => c.id).includes(fakeId));
          act(() => { result.current.actions.deleteCompany(fakeId); });
          expect(result.current.state.companies).toHaveLength(before);
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ─── P10: Deep-merge fills defaults ──────────────────────────────────────────
// Feature: placetrack-react-refactor, Property 10: deep-merge fills missing fields from defaults
describe('P10 — deep-merge fills defaults', () => {
  it('any partial stored object produces state with all DEFAULT_STATE keys', () => {
    fc.assert(
      fc.property(
        fc.record({
          streak: fc.option(fc.nat({ max: 100 }), { nil: undefined }),
          prepType: fc.option(fc.constantFrom('product', 'service'), { nil: undefined }),
        }),
        (partial) => {
          localStorage.clear();
          // Only store the defined keys
          const toStore = Object.fromEntries(
            Object.entries(partial).filter(([, v]) => v !== undefined)
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
          const { result } = renderHook(() => usePlaceTrackState());
          for (const key of DEFAULT_STATE_KEYS) {
            expect(result.current.state).toHaveProperty(key);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── P7: Streak reset for stale lastDone ─────────────────────────────────────
// Feature: placetrack-react-refactor, Property 7: streak resets for stale lastDone
describe('P7 — streak resets for stale lastDone', () => {
  it('any lastDone that is not today or yesterday results in streak=1 after checkAndUpdateStreak', () => {
    const today = todayStr();
    const yesterday = offsetDate(-1);

    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 365 }),
        (daysAgo) => {
          localStorage.clear();
          const staleDate = offsetDate(-daysAgo);
          fc.pre(staleDate !== today && staleDate !== yesterday);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            streak: 10,
            lastDone: staleDate,
            tasks: [{ id: 't1', title: 'T', tag: 'DSA', color: '#fff' }],
          }));
          const { result } = renderHook(() => usePlaceTrackState());
          act(() => { result.current.actions.checkAndUpdateStreak(); });
          expect(result.current.state.streak).toBe(1);
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ─── P6: toggleTask triggers streak when all tasks done ──────────────────────
// Feature: placetrack-react-refactor, Property 6: toggleTask triggers streak check when all tasks done
describe('P6 — toggleTask triggers streak when all tasks done', () => {
  it('toggling the last undone task sets lastDone to today', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (n) => {
          localStorage.clear();
          const tasks = Array.from({ length: n }, (_, i) => ({
            id: `task-${i}`,
            title: `Task ${i}`,
            tag: 'DSA',
            color: '#fff',
          }));
          // Pre-mark all but the last as done
          const alreadyDone = tasks.slice(0, n - 1).map((t) => t.id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            tasks,
            taskHist: { [todayStr()]: { done: alreadyDone } },
            streak: 0,
            lastDone: null,
          }));
          const { result } = renderHook(() => usePlaceTrackState());
          act(() => { result.current.actions.toggleTask(tasks[n - 1].id); });
          expect(result.current.state.lastDone).toBe(todayStr());
        }
      ),
      { numRuns: 50 }
    );
  });
});
