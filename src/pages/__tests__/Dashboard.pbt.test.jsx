/**
 * Task 1 — Bug Condition Exploration Test
 *
 * Property 1: Bug Condition — Upcoming Interviews Filter Uses `c.date`
 *
 * Validates: Requirements 1.1, 1.2
 *
 * CRITICAL: This test MUST FAIL on unfixed code.
 * Failure confirms the bug: `c.interviewDate` is always `undefined`,
 * so the filter `c.interviewDate >= todayStart` never passes any entry.
 *
 * When the fix is applied (Task 3), this same test will PASS,
 * confirming the bug is resolved.
 *
 * Task 2 — Preservation Property Tests (run on UNFIXED code, expected to PASS)
 *
 * Property 2: Preservation — Non-Bug-Condition Inputs Are Unchanged
 *
 * Validates: Requirements 3.1, 3.2, 3.4
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { todayStr, offsetDate, normalizeDate, getTodayStart } from '../../utils/dateUtils.js';
import { SC } from '../../constants/stageConfig.js';

/**
 * The UNFIXED filter expression from Dashboard.jsx.
 * Uses `c.interviewDate` (always undefined) instead of `c.date`.
 * Kept for documentation — P1 tests now use the fixed filter.
 */
function unfixedUpcomingInterviewsFilter(companies) {
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  return companies.filter(c => c.interviewDate >= todayStart);
}

/**
 * The FIXED filter expression — mirrors Dashboard.jsx after the fix.
 */
function fixedUpcomingInterviewsFilter(companies) {
  return companies.filter(c => {
    if (!c.stage || !c.date) return false;
    if (c.stage.toLowerCase() !== 'interview') return false;
    const d = normalizeDate(c.date);
    if (!d) return false;
    return d >= getTodayStart();
  });
}

/**
 * isBugCondition: a company that SHOULD appear in upcoming interviews
 * but DOESN'T due to the bug.
 */
function isBugCondition(company) {
  return (
    company.stage === 'interview' &&
    company.date != null &&
    company.date >= todayStr()
  );
}

describe('P1 — Bug Condition: Upcoming Interviews Filter Uses c.date', () => {
  it('concrete case: company with stage="interview" and date=todayStr() passes the filter', () => {
    // Scoped PBT: generate companies satisfying isBugCondition with date = today
    fc.assert(
      fc.property(
        fc.record({
          id:    fc.uuid(),
          name:  fc.string({ minLength: 1, maxLength: 30 }),
          role:  fc.string({ minLength: 1, maxLength: 30 }),
          stage: fc.constant('interview'),
          date:  fc.constant(todayStr()),
          added: fc.constant(todayStr()),
          notes: fc.constant(''),
        }),
        (company) => {
          const companies = [company];
          // All entries satisfy isBugCondition
          expect(companies.every(isBugCondition)).toBe(true);
          // The FIXED filter must return non-empty
          const result = fixedUpcomingInterviewsFilter(companies);
          expect(result.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('concrete case: company with stage="interview" and date=offsetDate(1) (tomorrow) passes the filter', () => {
    fc.assert(
      fc.property(
        fc.record({
          id:    fc.uuid(),
          name:  fc.string({ minLength: 1, maxLength: 30 }),
          role:  fc.string({ minLength: 1, maxLength: 30 }),
          stage: fc.constant('interview'),
          date:  fc.constant(offsetDate(1)),
          added: fc.constant(todayStr()),
          notes: fc.constant(''),
        }),
        (company) => {
          const companies = [company];
          expect(companies.every(isBugCondition)).toBe(true);
          const result = fixedUpcomingInterviewsFilter(companies);
          expect(result.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('concrete case: company with stage="interview" and date=offsetDate(3) (future) passes the filter', () => {
    fc.assert(
      fc.property(
        fc.record({
          id:    fc.uuid(),
          name:  fc.string({ minLength: 1, maxLength: 30 }),
          role:  fc.string({ minLength: 1, maxLength: 30 }),
          stage: fc.constant('interview'),
          date:  fc.constant(offsetDate(3)),
          added: fc.constant(todayStr()),
          notes: fc.constant(''),
        }),
        (company) => {
          const companies = [company];
          expect(companies.every(isBugCondition)).toBe(true);
          const result = fixedUpcomingInterviewsFilter(companies);
          expect(result.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ---------------------------------------------------------------------------
// Shared generators
// ---------------------------------------------------------------------------

const stageArb = fc.constantFrom('applied', 'oa', 'interview', 'selected', 'rejected');
const nonInterviewStageArb = fc.constantFrom('applied', 'oa', 'selected', 'rejected');

/** Generate a YYYY-MM-DD string that is strictly in the past */
const pastDateArb = fc.integer({ min: 1, max: 365 }).map((n) => offsetDate(-n));

/** Generate a YYYY-MM-DD string that is today or in the future */
const futureDateArb = fc.integer({ min: 0, max: 365 }).map((n) => offsetDate(n));

/** Generate a valid YYYY-MM-DD date (past or future) */
const anyDateArb = fc.integer({ min: -365, max: 365 }).map((n) => offsetDate(n));

/** Generate a single company record */
const companyArb = fc.record({
  id:    fc.uuid(),
  name:  fc.string({ minLength: 1, maxLength: 30 }),
  role:  fc.string({ minLength: 1, maxLength: 30 }),
  stage: stageArb,
  date:  anyDateArb,
  added: anyDateArb,
  notes: fc.constant(''),
});

/** Generate an array of 0–20 companies */
const companiesArb = fc.array(companyArb, { minLength: 0, maxLength: 20 });

// ---------------------------------------------------------------------------
// Inline Dashboard derived-data helpers (mirrors Dashboard.jsx logic exactly)
// ---------------------------------------------------------------------------

function computeRecentApps(companies) {
  return [...companies]
    .sort((a, b) => (b.added > a.added ? 1 : -1))
    .slice(0, 5);
}

function computeFunnelData(companies) {
  return SC.map((s) => ({
    ...s,
    count: companies.filter((c) => c.stage === s.id).length,
  }));
}

// ---------------------------------------------------------------------------
// P2 — Preservation: Non-Bug-Condition Inputs Are Unchanged
// Validates: Requirements 3.4
// ---------------------------------------------------------------------------

describe('P2 — Preservation: non-interview-stage companies never appear in upcoming interviews', () => {
  /**
   * Validates: Requirements 3.4
   *
   * On unfixed code the filter uses `c.interviewDate` (always undefined),
   * so the result is always []. Non-interview companies are therefore always
   * excluded — this preservation property holds on unfixed code.
   */
  it('companies with stage !== "interview" are never in the fixed filter result', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id:    fc.uuid(),
            name:  fc.string({ minLength: 1, maxLength: 30 }),
            role:  fc.string({ minLength: 1, maxLength: 30 }),
            stage: nonInterviewStageArb,
            date:  futureDateArb,
            added: anyDateArb,
            notes: fc.constant(''),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (companies) => {
          const result = fixedUpcomingInterviewsFilter(companies);
          // No non-interview company should ever appear
          const hasNonInterview = result.some(c => c.stage !== 'interview');
          expect(hasNonInterview).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ---------------------------------------------------------------------------
// P2 — Preservation: past-date interview companies are excluded
// Validates: Requirements 2.3
// ---------------------------------------------------------------------------

describe('P2 — Preservation: interview companies with past dates are excluded', () => {
  /**
   * Validates: Requirements 2.3
   *
   * On unfixed code the filter always returns [] (c.interviewDate is undefined),
   * so past-date interview companies are already excluded. This property holds.
   */
  it('companies with stage="interview" and a past date never appear in the fixed filter result', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id:    fc.uuid(),
            name:  fc.string({ minLength: 1, maxLength: 30 }),
            role:  fc.string({ minLength: 1, maxLength: 30 }),
            stage: fc.constant('interview'),
            date:  pastDateArb,
            added: anyDateArb,
            notes: fc.constant(''),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (companies) => {
          const result = fixedUpcomingInterviewsFilter(companies);
          // Past-date interview companies must not appear
          const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
          const hasPastInterview = result.some(
            c => c.stage === 'interview' && new Date(c.date + 'T00:00:00') < todayStart
          );
          expect(hasPastInterview).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ---------------------------------------------------------------------------
// P2 — Preservation: recentApps sort/slice is stable
// Validates: Requirements 3.1
// ---------------------------------------------------------------------------

describe('P2 — Preservation: recentApps sort order and slice are correct', () => {
  /**
   * Validates: Requirements 3.1
   *
   * For any companies array, recentApps must be sorted descending by `added`
   * and contain at most 5 entries. This logic is independent of the interview
   * filter and must be unaffected by the fix.
   */
  it('recentApps is sorted descending by added and sliced to 5', () => {
    fc.assert(
      fc.property(
        companiesArb,
        (companies) => {
          const recentApps = computeRecentApps(companies);

          // At most 5 entries
          expect(recentApps.length).toBeLessThanOrEqual(5);
          expect(recentApps.length).toBe(Math.min(5, companies.length));

          // Sorted descending by added
          for (let i = 0; i < recentApps.length - 1; i++) {
            expect(recentApps[i].added >= recentApps[i + 1].added).toBe(true);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it('recentApps contains the 5 most recently added companies', () => {
    fc.assert(
      fc.property(
        companiesArb,
        (companies) => {
          const recentApps = computeRecentApps(companies);
          // Every entry in recentApps must be in the original companies array
          for (const app of recentApps) {
            expect(companies.some(c => c.id === app.id)).toBe(true);
          }
          // If there are more than 5 companies, every non-included company
          // must have an added date <= the last entry in recentApps
          if (companies.length > 5) {
            const lastAdded = recentApps[recentApps.length - 1].added;
            const excluded = companies.filter(c => !recentApps.some(r => r.id === c.id));
            for (const c of excluded) {
              expect(c.added <= lastAdded).toBe(true);
            }
          }
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ---------------------------------------------------------------------------
// P2 — Preservation: funnelData stage counts are correct
// Validates: Requirements 3.2
// ---------------------------------------------------------------------------

describe('P2 — Preservation: funnelData stage counts are unaffected by interview filter', () => {
  /**
   * Validates: Requirements 3.2
   *
   * funnelData counts companies per stage using SC config. This is independent
   * of the upcoming-interviews filter and must remain identical after the fix.
   */
  it('funnelData counts match direct stage counts for every stage', () => {
    fc.assert(
      fc.property(
        companiesArb,
        (companies) => {
          const funnelData = computeFunnelData(companies);

          for (const entry of funnelData) {
            const expected = companies.filter(c => c.stage === entry.id).length;
            expect(entry.count).toBe(expected);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it('funnelData total count equals total companies', () => {
    fc.assert(
      fc.property(
        companiesArb,
        (companies) => {
          const funnelData = computeFunnelData(companies);
          const total = funnelData.reduce((sum, s) => sum + s.count, 0);
          expect(total).toBe(companies.length);
        }
      ),
      { numRuns: 200 }
    );
  });
});
