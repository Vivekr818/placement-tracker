# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Upcoming Interviews Filter Uses `c.date`
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases — companies with `stage: "interview"` and `date` set to today, tomorrow, or a future date
  - In `src/utils/__tests__/dateUtils.pbt.test.js` (or a new `src/pages/__tests__/Dashboard.pbt.test.jsx`), write a property-based test that:
    - Constructs a mock companies array with entries satisfying `isBugCondition` (stage === "interview", date >= today)
    - Runs the CURRENT (unfixed) filter expression `c.interviewDate >= getTodayStart()` against that array
    - Asserts the result is non-empty (i.e., at least one entry passes the filter)
  - Concrete cases to cover: `date: todayStr()`, `date: offsetDate(1)`, `date: offsetDate(3)`
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS — confirms `c.interviewDate` is always `undefined` so no entries pass
  - Document counterexamples found (e.g., "filter returns [] even when company has stage='interview' and date='2099-01-15'")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Bug-Condition Inputs Are Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe on UNFIXED code: companies with `stage !== "interview"` are excluded from any interview filter result
  - Observe on UNFIXED code: companies with `stage: "interview"` and a past `date` are excluded
  - Observe on UNFIXED code: `recentApps` sort/slice produces the same top-5 regardless of interview stage
  - Observe on UNFIXED code: `funnelData` stage counts are unaffected by the interview filter
  - Write property-based tests in `src/pages/__tests__/Dashboard.pbt.test.jsx`:
    - For all randomly generated company arrays, assert that entries with `stage !== "interview"` never appear in the upcoming-interviews result (from Preservation Requirements 3.4)
    - For all randomly generated company arrays, assert that entries with `stage: "interview"` and a past `date` never appear in the result (Preservation Requirement 2.3)
    - Assert `recentApps` sort order (by `added` desc, slice 5) is identical before and after the fix (Requirement 3.1)
    - Assert `funnelData` stage counts are identical (Requirement 3.2)
  - Write unit tests in `src/utils/__tests__/dateUtils.test.js` asserting `todayStr`, `offsetDate`, and `formatDisplay` return correct results (Requirement 3.5)
  - Run all tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS — confirms baseline behavior to preserve
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix for upcoming interviews filter and UI section

  - [x] 3.1 Add `getTodayStart`, `normalizeDate`, and `getInterviewLabel` to `src/utils/dateUtils.js`
    - `getTodayStart()`: return `new Date()` with hours/minutes/seconds/ms zeroed to midnight local time
    - `normalizeDate(dateStr)`: parse YYYY-MM-DD by appending `T00:00:00`, zero the time, return the `Date`; return `null` if the result is `NaN`
    - `getInterviewLabel(dateStr)`: compute `Math.round((normalizeDate(dateStr) - getTodayStart()) / 86_400_000)` and return `"Today"` (0), `"Tomorrow"` (1), or `` `in ${days} days` `` (anything else)
    - _Bug_Condition: isBugCondition(company) where company.stage.toLowerCase() === "interview" AND normalizeDate(company.date) >= getTodayStart()_
    - _Expected_Behavior: normalizeDate returns a midnight-local Date; getTodayStart returns today at midnight; getInterviewLabel returns one of "Today", "Tomorrow", "in N days"_
    - _Preservation: todayStr, offsetDate, formatDisplay must remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 3.5_

  - [x] 3.2 Fix the `upcomingInterviews` filter in `src/pages/Dashboard.jsx`
    - Add `normalizeDate`, `getTodayStart`, `getInterviewLabel` to the existing import from `../utils/dateUtils.js`
    - Add the `upcomingInterviews` derived array after `recentApps`:
      ```js
      const upcomingInterviews = companies
        .filter(c => {
          if (!c.stage || !c.date) return false;
          if (c.stage.toLowerCase() !== 'interview') return false;
          const d = normalizeDate(c.date);
          if (!d) return false;
          return d >= getTodayStart();
        })
        .sort((a, b) => normalizeDate(a.date) - normalizeDate(b.date));
      ```
    - _Bug_Condition: filter previously used c.interviewDate (always undefined); fix uses c.date_
    - _Expected_Behavior: all companies with stage "interview" and date >= today appear in upcomingInterviews, sorted ascending_
    - _Preservation: recentApps, funnelData, todayTasks, doneTasks derivations are untouched_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.3 Add the "Upcoming Interviews" JSX section to `src/pages/Dashboard.jsx`
    - Insert a new `<section className={styles.section}>` block below the `.columns` div and above the Application Funnel section
    - Render `<h2 className={styles.sectionTitle}>Upcoming Interviews</h2>`
    - When `upcomingInterviews.length === 0`, render `<div className={styles.emptyState}>No upcoming interviews.</div>`
    - Otherwise render a `<ul className={styles.appList}>` with one `<li className={styles.appItem}>` per entry showing:
      - `<span className={styles.appName}>{c.name}</span>`
      - `<span className={styles.appRole}>{c.role}</span>`
      - `<span className={styles.appDate}>{getInterviewLabel(c.date)}</span>`
    - Use only existing CSS classes from `Dashboard.module.css` — no new styles needed
    - _Requirements: 2.1, 2.2_

  - [x] 3.4 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Upcoming Interviews Filter Uses `c.date`
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior; when it passes it confirms the fix is correct
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES — confirms bug is fixed
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Bug-Condition Inputs Are Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all preservation property tests and unit tests from step 2
    - **EXPECTED OUTCOME**: All tests PASS — confirms no regressions in recentApps, funnelData, todayTasks, and dateUtils helpers
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite (`vitest --run`)
  - Confirm Property 1 (bug condition) passes
  - Confirm Property 2 (preservation) passes
  - Confirm all existing dateUtils, StatCard, Modal, ProgressBar, and usePlaceTrackState tests still pass
  - Ask the user if any questions arise
