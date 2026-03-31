# Upcoming Interviews Fix — Bugfix Design

## Overview

The "Upcoming Interviews" section on the Dashboard renders empty because the filter references
`c.interviewDate`, a field that is always `undefined` in the frontend data model. The actual
interview date is stored in `c.date`. The fix corrects the field reference, adds three small
date-utility helpers to `dateUtils.js`, and renders the UI section with company name, role,
and a human-readable time label.

The fix is intentionally minimal: only the filter expression and the new UI section change.
All existing Dashboard sections (Recent Applications, Application Funnel, Today's Focus) are
untouched.

## Glossary

- **Bug_Condition (C)**: A company entry where `stage === "interview"` (case-insensitive) and
  `date` holds a valid date string that is today or in the future — yet the entry is absent
  from the rendered "Upcoming Interviews" list.
- **Property (P)**: For every entry satisfying C, the fixed filter SHALL include it in the
  `upcomingInterviews` array, sorted ascending by date, and the UI SHALL render it with the
  correct time label.
- **Preservation**: All behaviors of the Dashboard that do not involve the upcoming-interviews
  filter must remain byte-for-byte equivalent after the fix.
- **`upcomingInterviews`**: The derived array computed in `Dashboard.jsx` that feeds the
  "Upcoming Interviews" section.
- **`normalizeDate(dateStr)`**: New helper in `dateUtils.js` — parses a YYYY-MM-DD string to
  a `Date` with time zeroed to midnight local time; returns `null` for invalid input.
- **`getTodayStart()`**: New helper in `dateUtils.js` — returns a `Date` for today at
  midnight local time.
- **`getInterviewLabel(dateStr)`**: New helper in `dateUtils.js` — returns `"Today"`,
  `"Tomorrow"`, or `"in N days"` based on the difference between the given date and today.

## Bug Details

### Bug Condition

The bug manifests when a company has `stage === "interview"` and a valid future (or today)
date stored in `c.date`. The Dashboard filter reads `c.interviewDate` instead of `c.date`,
so the condition `c.interviewDate >= getTodayStart()` is always `false` (because
`c.interviewDate` is `undefined`), and no entries ever pass.

**Formal Specification:**
```
FUNCTION isBugCondition(company)
  INPUT: company — a company object from the companies array
  OUTPUT: boolean

  RETURN company.stage IS NOT NULL
         AND company.stage.toLowerCase() === "interview"
         AND company.date IS NOT NULL
         AND normalizeDate(company.date) IS NOT NULL
         AND normalizeDate(company.date) >= getTodayStart()
         AND company IS NOT IN upcomingInterviews_rendered_list
END FUNCTION
```

### Examples

- Company `{ name: "Acme", role: "SWE", stage: "interview", date: "2099-01-15" }` — expected:
  appears in list with label "in N days"; actual (buggy): absent because `c.interviewDate` is
  `undefined`.
- Company `{ name: "Beta", role: "PM", stage: "interview", date: todayStr() }` — expected:
  appears with label "Today"; actual (buggy): absent.
- Company `{ name: "Gamma", role: "DS", stage: "interview", date: offsetDate(1) }` — expected:
  appears with label "Tomorrow"; actual (buggy): absent.
- Company `{ name: "Delta", role: "QA", stage: "applied", date: "2099-06-01" }` — expected:
  NOT in list (wrong stage); this case is unaffected by the bug and must stay excluded.
- Company `{ name: "Epsilon", role: "SWE", stage: "interview", date: "2000-01-01" }` — expected:
  NOT in list (past date); this case is also unaffected and must stay excluded.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- `recentApps` in `Dashboard.jsx` must continue to sort by `c.added` and slice to 5 entries.
- The Application Funnel must continue to count companies per stage using `SC` config.
- Today's Focus must continue to filter tasks by `t.date === today || !t.date` and `t.completed`.
- `todayStr()`, `offsetDate(n)`, and `formatDisplay(dateStr, options)` in `dateUtils.js` must
  return identical results for all inputs.
- Companies with `stage !== "interview"` must never appear in the upcoming interviews list.
- Companies with a past `date` must never appear in the upcoming interviews list.

**Scope:**
All inputs that do NOT satisfy the bug condition (i.e., non-interview stages, past dates,
missing dates, or non-keyboard/non-filter paths) must be completely unaffected by this fix.

## Hypothesized Root Cause

1. **Wrong Field Reference**: `Dashboard.jsx` was written (or copy-pasted) using
   `c.interviewDate` instead of `c.date`. The `interviewDate` field does not exist on the
   frontend company object — it is always `undefined`, so every filter comparison fails.

2. **Missing Date Normalization Helpers**: The codebase has no `normalizeDate` or
   `getTodayStart` utility, so a correct comparison (`d >= todayStart`) could not be written
   cleanly without adding them.

3. **Missing UI Section**: Even if the filter were correct, the JSX for the "Upcoming
   Interviews" section was never added to `Dashboard.jsx`, so nothing would render.

4. **No `getInterviewLabel` Helper**: The human-readable label ("Today", "Tomorrow",
   "in N days") requires a helper that does not yet exist in `dateUtils.js`.

## Correctness Properties

Property 1: Bug Condition — Upcoming Interviews Filter Uses `c.date`

_For any_ company object where `isBugCondition(company)` returns `true` (i.e., stage is
"interview", `c.date` is a valid date string on or after today), the fixed
`upcomingInterviews` filter SHALL include that company in the resulting array, and the UI
SHALL render it with the correct `getInterviewLabel` value.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation — Non-Bug-Condition Inputs Are Unchanged

_For any_ company object where `isBugCondition(company)` returns `false` (wrong stage, past
date, missing date, or `null` normalizeDate result), the fixed filter SHALL produce the same
exclusion result as the original filter, and all other Dashboard sections (Recent
Applications, Funnel, Today's Focus) SHALL behave identically to the pre-fix code.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

**File**: `src/utils/dateUtils.js`

**Additions** (three new exported helpers):

1. **`getTodayStart()`**: Returns `new Date()` with hours/minutes/seconds/ms zeroed to
   midnight local time. Used as the lower bound for the upcoming-interviews filter.

2. **`normalizeDate(dateStr)`**: Parses a YYYY-MM-DD string by appending `T00:00:00` (same
   pattern as the existing `formatDisplay`), zeros the time to midnight, and returns the
   `Date`. Returns `null` if `new Date(dateStr)` produces `NaN`. Used in the filter and in
   `getInterviewLabel`.

3. **`getInterviewLabel(dateStr)`**: Computes `normalizeDate(dateStr) - getTodayStart()`,
   converts to whole days via `Math.round(diff / 86_400_000)`, and returns `"Today"` (0),
   `"Tomorrow"` (1), or `` `in ${days} days` `` (anything else).

---

**File**: `src/pages/Dashboard.jsx`

**Function**: module body (derived data section)

**Specific Changes**:

1. **Import new helpers**: Add `normalizeDate`, `getTodayStart`, `getInterviewLabel` to the
   existing import from `../utils/dateUtils.js`.

2. **Add `upcomingInterviews` derived array**:
   ```
   const upcomingInterviews = companies
     .filter(c => {
       if (!c.stage || !c.date) return false;
       if (c.stage.toLowerCase() !== "interview") return false;
       const d = normalizeDate(c.date);
       if (!d) return false;
       return d >= getTodayStart();
     })
     .sort((a, b) => normalizeDate(a.date) - normalizeDate(b.date));
   ```

3. **Add "Upcoming Interviews" JSX section** below the existing two-column grid and above
   (or after) the Application Funnel, using the existing `.section`, `.sectionTitle`,
   `.appList`, `.appItem`, `.appInfo`, `.appName`, `.appRole`, `.appDate`, and `.emptyState`
   CSS classes so no new styles are needed.

4. **No schema changes**: `c.date` is the existing field; `interview_date` / `interviewDate`
   are never referenced.

## Testing Strategy

### Validation Approach

Two-phase approach: first run exploratory tests against the unfixed code to confirm the root
cause, then verify the fix satisfies both correctness properties.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix.
Confirm or refute the root cause (wrong field reference).

**Test Plan**: Construct a mock `companies` array with entries that satisfy `isBugCondition`,
run the current (unfixed) filter expression, and assert the result is non-empty. The test
will fail on unfixed code, confirming the bug.

**Test Cases**:
1. **Future interview test**: Company with `stage: "interview"`, `date: offsetDate(3)` —
   assert it appears in filtered list (will fail on unfixed code).
2. **Today interview test**: Company with `stage: "interview"`, `date: todayStr()` —
   assert it appears (will fail on unfixed code).
3. **Tomorrow interview test**: Company with `stage: "interview"`, `date: offsetDate(1)` —
   assert it appears (will fail on unfixed code).
4. **Past date edge case**: Company with `stage: "interview"`, `date: offsetDate(-1)` —
   assert it does NOT appear (may pass on unfixed code since undefined < anything is false).

**Expected Counterexamples**:
- The filtered array is empty even when valid interview companies exist.
- Root cause confirmed: `c.interviewDate` is `undefined`, so `undefined >= todayStart` is
  always `false`.

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed filter includes
the company and the label is correct.

**Pseudocode:**
```
FOR ALL company WHERE isBugCondition(company) DO
  result := upcomingInterviews_fixed(companies_containing_company)
  ASSERT company IN result
  ASSERT getInterviewLabel(company.date) IN ["Today", "Tomorrow", "in N days"]
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed filter
produces the same exclusion result as the original, and all other Dashboard sections are
unaffected.

**Pseudocode:**
```
FOR ALL company WHERE NOT isBugCondition(company) DO
  ASSERT upcomingInterviews_original(companies) = upcomingInterviews_fixed(companies)
END FOR

FOR ALL companies_array DO
  ASSERT recentApps_original(companies_array) = recentApps_fixed(companies_array)
  ASSERT funnelData_original(companies_array) = funnelData_fixed(companies_array)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many random company arrays automatically.
- It catches edge cases (empty arrays, all-past dates, mixed stages) that manual tests miss.
- It provides strong guarantees that non-interview-stage logic is unchanged.

**Test Cases**:
1. **Non-interview stage preservation**: Companies with stages `applied`, `selected`,
   `rejected`, etc. must never appear in `upcomingInterviews` before or after the fix.
2. **Past date preservation**: Companies with `stage: "interview"` and past `date` must
   remain excluded.
3. **Recent Applications preservation**: `recentApps` sort/slice logic must be identical.
4. **Funnel preservation**: Stage counts must be identical.
5. **dateUtils helpers preservation**: `todayStr`, `offsetDate`, `formatDisplay` must return
   the same values for all inputs.

### Unit Tests

- Test `normalizeDate` with valid YYYY-MM-DD strings, invalid strings, and `null`/`undefined`.
- Test `getTodayStart` returns a Date with time zeroed.
- Test `getInterviewLabel` for today (0 days), tomorrow (1 day), future (N days), and edge
  cases (negative days if somehow called with past date).
- Test the `upcomingInterviews` filter with: all-future interviews, mixed past/future,
  non-interview stages, missing `date`, invalid `date` strings.

### Property-Based Tests

- Generate random arrays of company objects with arbitrary `stage` and `date` values; assert
  that only entries with `stage === "interview"` and `normalizeDate(date) >= getTodayStart()`
  appear in the filtered result.
- Generate random valid future dates; assert `getInterviewLabel` always returns one of the
  three expected string forms.
- Generate random company arrays; assert `recentApps` sort order is unchanged by the fix
  (preservation property).

### Integration Tests

- Render `<Dashboard>` with a mock state containing interview-stage companies with future
  dates; assert the "Upcoming Interviews" section is visible and shows the correct entries.
- Render `<Dashboard>` with no interview-stage companies; assert the empty state message is
  shown.
- Render `<Dashboard>` and verify the "Recent Applications", "Application Funnel", and
  "Today's Focus" sections render identically to the pre-fix baseline.
