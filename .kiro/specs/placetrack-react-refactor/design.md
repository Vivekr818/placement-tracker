# Design Document: PlaceTrack React Refactor

## Overview

PlaceTrack is a campus placement assistant SPA currently implemented as a monolithic HTML file. This refactor migrates it into a structured React project using Vite, decomposing the monolith into reusable components, logical pages, and a single custom hook for state management. All existing UI, functionality, and localStorage data shape (`pt2` key) are preserved exactly. No external UI libraries are introduced.

**Tech stack:** React 18, Vite, CSS Modules, localStorage persistence.

**Key constraints:**
- Single custom hook (`usePlaceTrackState`) owns all state and persistence
- No prop drilling beyond 2 levels
- No derived state stored — always computed at render time
- No inline styles for static layout
- All constants in `src/constants/`, all date/ID logic in `src/utils/`

---

## Architecture

### Annotated File Tree

```
src/
├── main.jsx                        # Vite entry point — mounts <App /> into #root
├── App.jsx                         # Root component: owns activePage, toast state, renders shell
│
├── pages/
│   ├── Dashboard.jsx               # Read-only overview: StatCards, focus, recent, funnel
│   ├── Companies.jsx               # CRUD table: owns filter + modal local state
│   ├── Tracker.jsx                 # Read-only progress: ProgressBars + consistency grid
│   ├── StudyPath.jsx               # Prep roadmap: toggle + expandable topic cards
│   ├── DailyTasks.jsx              # Task checklist + streak calendar + week summary
│   └── Profile.jsx                 # Profile hero + badges + edit form
│
├── components/
│   ├── Sidebar.jsx                 # Left nav: brand, nav items, streak display
│   ├── Sidebar.module.css
│   ├── Topbar.jsx                  # Top bar: page title + today's date
│   ├── Topbar.module.css
│   ├── StatCard.jsx                # Metric card: label, value, optional sub/icon/color
│   ├── StatCard.module.css
│   ├── ProgressBar.jsx             # Ratio bar: label, value, max, optional color
│   ├── ProgressBar.module.css
│   ├── Modal.jsx                   # Overlay dialog: isOpen, onClose, title, children
│   ├── Modal.module.css
│   ├── Toast.jsx                   # Transient notification: message, type, onDismiss
│   ├── Toast.module.css
│   └── Badge.jsx                   # Achievement badge: icon, label, desc, earned
│       Badge.module.css
│
├── hooks/
│   └── usePlaceTrackState.js       # Single hook: state + all action functions
│
├── constants/
│   ├── prep.js                     # PREP — product/service roadmap topic trees
│   ├── taskPools.js                # TASK_POOLS — categorised task pool arrays
│   ├── stageConfig.js              # SC — stage labels, colors, order
│   └── typeConfig.js               # TC — company type labels, colors
│
├── utils/
│   ├── generateId.js               # generateId() — crypto.randomUUID() with fallback
│   └── dateUtils.js                # todayStr(), offsetDate(n), formatDisplay(str, opts)
│
└── styles/
    └── global.css                  # CSS custom properties (design tokens), resets, fonts
```

---

## Component Hierarchy

```
App
├── Sidebar          (activePage, onNavigate, streak)
├── Topbar           (pageTitle, onAddCompany*)          *only on Companies page
├── Toast            (message, type, onDismiss)          — conditional, managed in App
└── [active page]
    │
    ├── Dashboard
    │   ├── StatCard × 4
    │   └── (inline JSX for focus list, recent list, funnel bars)
    │
    ├── Companies
    │   ├── ProgressBar × 1  (stage funnel summary)
    │   ├── Modal (Add)
    │   │   └── [company form JSX as children]
    │   └── Modal (Edit)
    │       └── [company form JSX as children]
    │
    ├── Tracker
    │   ├── ProgressBar × N  (stage breakdown)
    │   ├── ProgressBar × N  (type breakdown)
    │   └── (consistency grid — inline JSX)
    │
    ├── StudyPath
    │   └── (topic cards — inline JSX, sourced from constants/prep.js)
    │
    ├── DailyTasks
    │   └── (task list, streak calendar, week summary — inline JSX)
    │
    └── Profile
        └── Badge × N
```

> Pages call `usePlaceTrackState()` directly. They pass only the specific props each child component needs — never the full state object.

---

## Data Flow

```
localStorage (pt2)
       │
       ▼ (on mount, JSON.parse + deep-merge with defaults)
usePlaceTrackState
       │
       ├── state  ──────────────────────────────────────────────────────────┐
       │   { companies, tasks, taskHist, streak, lastDone,                  │
       │     lastTaskDate, prepType, profile, expandedTopics }              │
       │                                                                    │
       └── actions                                                          │
           { addCompany, updateCompany, deleteCompany,                      │
             toggleTask, regenTasks, setPrepType,                           │
             toggleTopic, updateProfile, checkAndUpdateStreak }             │
                                                                            │
App.jsx                                                                     │
  ├── const { state, actions } = usePlaceTrackState()  ◄───────────────────┘
  ├── activePage (local useState)
  ├── toast (local useState: { message, type } | null)
  │
  ├── passes to Sidebar:   activePage, onNavigate, state.streak
  ├── passes to Topbar:    pageTitle (derived from activePage map)
  ├── passes to Toast:     toast.message, toast.type, onDismiss
  │
  └── renders active Page, passing relevant slices:
      e.g. <Dashboard state={state} actions={actions} showToast={showToast} />

Page (e.g. Dashboard.jsx)
  ├── const { state, actions } = usePlaceTrackState()   ← called directly
  ├── computes derived values locally (never stored)
  └── passes primitive props to leaf components:
      e.g. <StatCard label="Total" value={companies.length} />
           <ProgressBar label="Applied" value={applied} max={total} />
```

**State mutation flow:**
1. User interaction in a Page or Component triggers a callback
2. Page calls the relevant `actions.*` function from the hook
3. Hook applies the mutation via `setState(prev => ...)`
4. React re-renders; hook's `useEffect` writes updated state to localStorage
5. All pages reading that state slice re-render with fresh data

---

## `usePlaceTrackState` Implementation Plan

### File: `src/hooks/usePlaceTrackState.js`

#### Internal Structure

```js
const STORAGE_KEY = 'pt2';

const DEFAULT_STATE = {
  companies: [],
  tasks: [],
  taskHist: {},
  streak: 0,
  lastDone: null,
  lastTaskDate: null,
  prepType: 'product',
  profile: { name: '', handle: '', college: '', role: '', bio: '' },
  expandedTopics: {},
};
```

#### Initialisation (localStorage read)

```
1. Attempt JSON.parse(localStorage.getItem(STORAGE_KEY))
2. If parse fails or result is null → use DEFAULT_STATE
3. Deep-merge parsed value with DEFAULT_STATE so missing fields are filled
4. Pass merged value as useState initial value (lazy initialiser)
```

Deep-merge strategy: for each top-level key in DEFAULT_STATE, if the stored value has that key and it's the same type, use the stored value; otherwise use the default. For nested objects (`profile`, `expandedTopics`, `taskHist`), spread defaults first then overlay stored values.

#### Persistence (localStorage write)

```
useEffect(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {
    // silently swallow quota/security errors (Req 21.3)
  }
}, [state]);
```

#### Action Implementations

| Action | Implementation |
|---|---|
| `addCompany(data)` | `setState(prev => ({ ...prev, companies: [...prev.companies, { ...data, id: generateId(), added: todayStr() }] }))` |
| `updateCompany(id, updates)` | `setState(prev => ({ ...prev, companies: prev.companies.map(c => c.id === id ? { ...c, ...updates } : c) }))` |
| `deleteCompany(id)` | `setState(prev => ({ ...prev, companies: prev.companies.filter(c => c.id !== id) }))` |
| `toggleTask(taskId)` | Read today's done list from `taskHist[todayStr()]?.done ?? []`. Toggle taskId in/out. Write back. If all tasks now done, call `checkAndUpdateStreak()`. |
| `regenTasks()` | Sample N tasks from TASK_POOLS (each with `generateId()`). Reset `taskHist[todayStr()]` to `{ done: [] }`. |
| `setPrepType(type)` | `setState(prev => ({ ...prev, prepType: type }))` |
| `toggleTopic(topicId)` | `setState(prev => ({ ...prev, expandedTopics: { ...prev.expandedTopics, [topicId]: !prev.expandedTopics[topicId] } }))` |
| `updateProfile(profile)` | `setState(prev => ({ ...prev, profile }))` |
| `checkAndUpdateStreak()` | If `tasks` is empty → skip (Req 21.5). Compare `lastDone` to `offsetDate(-1)` and `todayStr()`. If `lastDone === todayStr()` → no-op. If `lastDone === offsetDate(-1)` → increment streak. Otherwise → reset streak to 0. Set `lastDone = todayStr()`. |

#### Return Shape

```js
return {
  state,   // all base fields — no derived values
  actions: {
    addCompany, updateCompany, deleteCompany,
    toggleTask, regenTasks, setPrepType,
    toggleTopic, updateProfile, checkAndUpdateStreak,
  },
};
```

---

## Layout Structure

### App Shell (`App.jsx`)

```
<div class="app-shell">          ← CSS Grid: [sidebar] [main]
  <Sidebar ... />
  <div class="main-area">        ← flex column
    <Topbar ... />
    <main class="page-content">  ← scrollable content area
      {activePage === 'dashboard' && <Dashboard ... />}
      {activePage === 'companies' && <Companies ... />}
      ... etc
    </main>
  </div>
  {toast && <Toast ... />}
</div>
```

**CSS layout (App.module.css or global.css):**
- `.app-shell`: `display: grid; grid-template-columns: 240px 1fr; height: 100vh;`
- `.main-area`: `display: flex; flex-direction: column; overflow: hidden;`
- `.page-content`: `flex: 1; overflow-y: auto; padding: var(--space-lg);`

### Toast Management

`App.jsx` owns `toast` as local state: `const [toast, setToast] = useState(null)`.

`showToast(message, type)` sets the toast. A `useEffect` watching `toast` fires a `setTimeout(3000)` to call `setToast(null)`. The `onDismiss` prop on `<Toast>` also calls `setToast(null)`.

`showToast` is passed as a prop to pages that need it (Companies, DailyTasks, Profile).

---

## Page Internal Structures

### Dashboard (`pages/Dashboard.jsx`)

**State consumed:** `state.companies`, `state.tasks`, `state.taskHist`, `state.streak`

**Derived values computed locally:**
- `total` = `companies.length`
- `interviews` = `companies.filter(c => c.stage === 'interview').length`
- `offers` = `companies.filter(c => c.stage === 'selected').length`
- `todayDone` = `taskHist[todayStr()]?.done.length ?? 0`
- `todayTasks` = tasks (full list, filtered by not-done for focus section)
- `recentApps` = `[...companies].sort by added desc, slice(0, 5)`
- `funnelData` = per-stage counts from SC order

**Sub-sections (inline JSX, no sub-components needed):**
1. Stats row — 4× `<StatCard>`
2. Today's Focus — task list or empty-state prompt (Req 21.2)
3. Recent Applications — last 5 companies as cards/rows
4. Application Funnel — inline bars using `<ProgressBar>` or styled divs

**No mutations, no modal state.**

---

### Companies (`pages/Companies.jsx`)

**State consumed:** `state.companies`
**Actions used:** `addCompany`, `updateCompany`, `deleteCompany`
**Local state:** `filterText`, `modalMode` (`null | 'add' | 'edit'`), `editTarget` (Company | null)

**Structure:**
1. Toolbar row: filter `<input>`, "Add Company" `<button>`
2. Stage summary: `<ProgressBar>` per stage
3. Company table: filtered rows, each with edit/delete actions
4. Empty state: shown when `filteredCompanies.length === 0`
5. `<Modal isOpen={modalMode === 'add'} ...>` — Add form as children
6. `<Modal isOpen={modalMode === 'edit'} ...>` — Edit form as children (pre-populated from `editTarget`)

**Form fields inside Modal children:** name, role, type (select), stage (select), date, notes.

On form submit → call `addCompany` or `updateCompany` → `showToast(...)` → close modal.
On delete → call `deleteCompany(id)` → `showToast('Company removed', 'warn')`.

---

### Tracker (`pages/Tracker.jsx`)

**State consumed:** `state.companies`, `state.taskHist`
**No mutations.**

**Derived values:**
- Stage breakdown: `{ applied, oa, interview, selected, rejected }` counts + percentages
- Type breakdown: `{ product, service, startup, finance, other }` counts
- Consistency grid: 35 days (5 weeks) via `offsetDate(-34)` through `offsetDate(0)`, each day checked against `taskHist`

**Structure:**
1. Stage breakdown section — `<ProgressBar>` per stage (label, value, max=total)
2. Type breakdown section — `<ProgressBar>` per type
3. Consistency grid — 5×7 grid of day cells, colored by completion status

---

### StudyPath (`pages/StudyPath.jsx`)

**State consumed:** `state.prepType`, `state.expandedTopics`
**Actions used:** `setPrepType`, `toggleTopic`
**Constants imported:** `PREP` from `src/constants/prep.js`

**Structure:**
1. Toggle row: "Product-Based" / "Service-Based" buttons
2. Topic list: `PREP[prepType].map(topic => ...)` — each topic card has:
   - Header (clickable → `toggleTopic(topic.id)`)
   - Expanded body (shown when `expandedTopics[topic.id]` is true) — subtopics list

---

### DailyTasks (`pages/DailyTasks.jsx`)

**State consumed:** `state.tasks`, `state.taskHist`, `state.streak`
**Actions used:** `toggleTask`, `regenTasks`, `checkAndUpdateStreak`

**Derived values:**
- `todayDone` = `taskHist[todayStr()]?.done ?? []`
- `weekDays` = `offsetDate(-6)` through `offsetDate(0)` — 7 days
- `weekCompleted` = count of days in weekDays where `taskHist[day]?.done.length > 0`
- Grid dates = 35 days via `offsetDate`

**Structure:**
1. Streak badge + "Regenerate" button
2. Task list — each task: checkbox (checked if `todayDone.includes(task.id)`), title, tag badge
3. Week summary — 7-day mini calendar
4. Consistency grid — 35-day grid (same pattern as Tracker)

---

### Profile (`pages/Profile.jsx`)

**State consumed:** `state.profile`, `state.companies`, `state.streak`, `state.taskHist`
**Actions used:** `updateProfile`
**Local state:** `isEditing` (boolean)

**Derived values (badge eligibility):**
- First application: `companies.length >= 1`
- 10 applications: `companies.length >= 10`
- First offer: `companies.filter(c => c.stage === 'selected').length >= 1`
- 7-day streak: `streak >= 7`
- 30-day streak: `streak >= 30`
- 50 tasks done: `Object.values(taskHist).reduce((s, v) => s + v.done.length, 0) >= 50`

**Structure:**
1. Profile hero: avatar (initials), name, handle, college, role, bio, share link
2. Stats row: total apps, offers, streak
3. Badges grid: `<Badge>` per milestone
4. Edit form (shown when `isEditing`): fields for name, handle, college, role, bio — submit calls `updateProfile`

---

## Utility Module Designs

### `src/utils/generateId.js`

```js
export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
```

Used by: `usePlaceTrackState` → `addCompany`, `regenTasks`.

---

### `src/utils/dateUtils.js`

```js
// Returns current local date as YYYY-MM-DD
export function todayStr() { ... }

// Returns date n days offset from today as YYYY-MM-DD
// offsetDate(-1) → yesterday, offsetDate(1) → tomorrow
export function offsetDate(n) { ... }

// Formats a YYYY-MM-DD string for human display
// e.g. formatDisplay('2025-03-27') → "March 27, 2025"
export function formatDisplay(dateStr, options) { ... }
```

Implementation notes:
- `todayStr()`: `new Date()` → extract year/month/day via `getFullYear`, `getMonth`, `getDate` → zero-pad → join with `-`
- `offsetDate(n)`: construct `new Date()`, call `setDate(getDate() + n)`, then same extraction
- `formatDisplay(dateStr, options)`: parse `dateStr` as `new Date(dateStr + 'T00:00:00')` to avoid UTC offset issues, then call `.toLocaleDateString(undefined, options ?? { year: 'numeric', month: 'long', day: 'numeric' })`

---

## Constants Module Designs

### `src/constants/prep.js`

Exports `PREP` — an object with keys `'product'` and `'service'`, each containing an array of topic objects:

```js
export const PREP = {
  product: [
    { id: 'dsa', title: 'Data Structures & Algorithms', subtopics: [...] },
    { id: 'system-design', title: 'System Design', subtopics: [...] },
    // ...
  ],
  service: [
    { id: 'aptitude', title: 'Aptitude & Reasoning', subtopics: [...] },
    // ...
  ],
};
```

Topic shape: `{ id: string, title: string, subtopics: string[] }`

---

### `src/constants/taskPools.js`

Exports `TASK_POOLS` — an array of task pool objects, each representing a category:

```js
export const TASK_POOLS = [
  { tag: 'DSA', color: '#6366f1', tasks: ['Solve 2 LeetCode mediums', ...] },
  { tag: 'System Design', color: '#0ea5e9', tasks: ['Read one SD article', ...] },
  // ...
];
```

`regenTasks` samples one task per pool (or a fixed N total), assigns `generateId()` to each.

---

### `src/constants/stageConfig.js`

Exports `SC` — ordered array of stage descriptors:

```js
export const SC = [
  { id: 'applied',   label: 'Applied',    color: '#6366f1' },
  { id: 'oa',        label: 'OA',         color: '#f59e0b' },
  { id: 'interview', label: 'Interview',  color: '#0ea5e9' },
  { id: 'selected',  label: 'Selected',   color: '#10b981' },
  { id: 'rejected',  label: 'Rejected',   color: '#ef4444' },
];
```

Used by: Companies table (stage badge colors), Tracker stage breakdown, Dashboard funnel.

---

### `src/constants/typeConfig.js`

Exports `TC` — array of company type descriptors:

```js
export const TC = [
  { id: 'product',  label: 'Product',  color: '#6366f1' },
  { id: 'service',  label: 'Service',  color: '#0ea5e9' },
  { id: 'startup',  label: 'Startup',  color: '#f59e0b' },
  { id: 'finance',  label: 'Finance',  color: '#10b981' },
  { id: 'other',    label: 'Other',    color: '#94a3b8' },
];
```

Used by: Companies table (type badge), Tracker type breakdown.

---

## CSS / Styling Approach

### Design Tokens (`src/styles/global.css`)

All design tokens from the original implementation are preserved as CSS custom properties:

```css
:root {
  /* Colors */
  --color-bg:        #0f172a;
  --color-surface:   #1e293b;
  --color-border:    #334155;
  --color-text:      #f1f5f9;
  --color-muted:     #94a3b8;
  --color-accent:    #6366f1;
  --color-success:   #10b981;
  --color-warn:      #f59e0b;
  --color-danger:    #ef4444;

  /* Spacing */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  32px;

  /* Typography */
  --font-serif: 'DM Serif Display', serif;
  --font-mono:  'DM Mono', monospace;
  --font-sans:  'Outfit', sans-serif;

  /* Radii */
  --radius-sm:  6px;
  --radius-md:  12px;
  --radius-lg:  20px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font-sans); background: var(--color-bg); color: var(--color-text); }
```

### CSS Modules (per component)

Each component has a co-located `.module.css` file. Classes are imported as `styles` and applied via `className={styles.foo}`.

- Static layout, spacing, and typography → CSS Module classes
- Dynamic values (e.g., ProgressBar fill width, badge earned/unearned state) → inline `style={{ width: `${pct}%` }}` or conditional class (`styles.earned` / `styles.unearned`)
- No inline styles for static layout (Req 22.3)

### Font Loading

Google Fonts import in `global.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: localStorage round-trip

*For any* valid state object, writing it to localStorage and then re-initialising the hook should produce a state equal to the original object (modulo deep-merge with defaults for any missing fields).

**Validates: Requirements 3.1, 3.2**

---

### Property 2: Navigation sets activePage

*For any* valid PageId, when the corresponding navigation item is activated, `activePage` should equal that PageId.

**Validates: Requirements 4.4**

---

### Property 3: StatCard renders required and conditional fields

*For any* `label`, `value`, and optional `sub` prop, the rendered StatCard should always contain `label` and `value`, and should contain `sub` if and only if the `sub` prop was provided.

**Validates: Requirements 8.1, 8.3**

---

### Property 4: Modal conditional rendering

*For any* content passed as children, the Modal should render that content when `isOpen` is `true` and should not render it when `isOpen` is `false`.

**Validates: Requirements 10.2**

---

### Property 5: ProgressBar fill clamping

*For any* `value` and `max` inputs (including negative values, zero, and values where `value > max`), the computed fill percentage rendered by ProgressBar should always be within the range [0, 100].

**Validates: Requirements 13.3**

---

### Property 6: toggleTask triggers streak check when all tasks done

*For any* task list of length N ≥ 1, when N−1 tasks are already marked done and the final task is toggled via `toggleTask`, `checkAndUpdateStreak` should be invoked and `lastDone` should be set to today's date string.

**Validates: Requirements 15.5, 20.5**

---

### Property 7: Streak resets for stale lastDone

*For any* `lastDone` value that is neither today's date string nor yesterday's date string, calling `checkAndUpdateStreak` (with a non-empty tasks array) should result in `streak` being set to 0.

**Validates: Requirements 15.6**

---

### Property 8: addCompany appends entry with unique id

*For any* sequence of N calls to `addCompany` with valid company data, the `companies` array should grow by 1 per call, each new entry should contain the provided data, and all generated `id` values across all N entries should be distinct.

**Validates: Requirements 20.1, 20.2**

---

### Property 9: No-op mutations for non-existent id

*For any* `id` string that does not correspond to an existing company entry, calling either `updateCompany(id, updates)` or `deleteCompany(id)` should leave the `companies` array identical to its state before the call.

**Validates: Requirements 20.3, 20.4**

---

### Property 10: Deep-merge fills missing fields from defaults

*For any* partial object stored under the `pt2` localStorage key (missing one or more top-level fields), initialising the hook should produce a state object where every field defined in `DEFAULT_STATE` is present with the correct type.

**Validates: Requirements 21.4**

---

### Property 11: generateId produces unique non-empty strings

*For any* N calls to `generateId()`, all returned values should be non-empty strings and all N values should be mutually distinct.

**Validates: Requirements 24.2, 24.4**

---

### Property 12: Date fields stored in YYYY-MM-DD format

*For any* call to `addCompany`, the resulting `added` and `date` fields stored in state should match the regex `/^\d{4}-\d{2}-\d{2}$/`. Similarly, `lastDone` and `lastTaskDate` when set should match the same format.

**Validates: Requirements 25.1**

---

## Error Handling

### localStorage Errors (Req 21.3)

The `useEffect` that writes to localStorage wraps `localStorage.setItem` in a `try/catch`. Any `QuotaExceededError` or `SecurityError` is silently swallowed. The app continues to function normally with in-memory state for the remainder of the session.

### Invalid / Missing Stored Data (Req 3.4, 21.4)

The lazy initialiser for `useState` in the hook:
1. Calls `JSON.parse(localStorage.getItem('pt2'))` inside a `try/catch`
2. On any error (SyntaxError, null result) → returns `DEFAULT_STATE`
3. On success → deep-merges the parsed object with `DEFAULT_STATE` so all fields are guaranteed present

### Missing taskHist Entry (Req 21.6)

All reads of `taskHist[todayStr()]` use optional chaining: `taskHist[todayStr()]?.done ?? []`. This prevents any `TypeError` when today has no entry.

### Empty Tasks Array (Req 21.5)

`checkAndUpdateStreak` begins with: `if (state.tasks.length === 0) return;` — streak logic is entirely skipped.

### Empty Companies Array (Req 21.1)

The Companies page checks `companies.length === 0` after filtering and renders an empty-state `<div>` with an illustration/message instead of the table.

### Form Validation (Req 10.7)

The company form (inside Modal children) validates required fields (`name`, `role`, `stage`, `type`, `date`) before calling `onSubmit`. If any required field is empty, an inline error message is shown and `onSubmit` is not called.

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. They are complementary:
- Unit tests catch concrete bugs at specific inputs and integration points
- Property tests verify universal correctness across the full input space

### Property-Based Testing

**Library:** [fast-check](https://github.com/dubzzz/fast-check) (JavaScript/TypeScript PBT library)

Each correctness property from the design document maps to exactly one property-based test. Tests run a minimum of 100 iterations each.

Tag format for each test:
```
// Feature: placetrack-react-refactor, Property N: <property_text>
```

**Property test targets:**

| Property | Test description | fast-check arbitraries |
|---|---|---|
| P1: localStorage round-trip | Arbitrary state → write → re-init → compare | `fc.record(...)` matching state schema |
| P2: Navigation sets activePage | Any PageId → navigate → check activePage | `fc.constantFrom(...pageIds)` |
| P3: StatCard rendering | Any label/value/sub → render → check DOM | `fc.string()`, `fc.option(fc.string())` |
| P4: Modal conditional rendering | Any isOpen bool → render → check children | `fc.boolean()` |
| P5: ProgressBar clamping | Any value/max pair → check fill in [0,100] | `fc.integer()`, `fc.float()` |
| P6: toggleTask triggers streak | N tasks, N-1 done, toggle last → check lastDone | `fc.array(fc.record(...))` |
| P7: Streak reset for stale date | Any date not today/yesterday → check streak=0 | `fc.string()` filtered |
| P8: addCompany uniqueness | N calls → check length + distinct ids | `fc.array(fc.record(...))` |
| P9: No-op for missing id | Any non-existent id → check companies unchanged | `fc.string()` |
| P10: Deep-merge defaults | Any partial object → init hook → check all fields | `fc.record(...)` with partial |
| P11: generateId uniqueness | N calls → check all distinct non-empty | `fc.nat({ max: 1000 })` |
| P12: Date format | Any addCompany call → check YYYY-MM-DD regex | `fc.record(...)` |

### Unit Tests

Unit tests focus on:
- Specific examples demonstrating correct behavior (e.g., streak increments from 5 to 6 when lastDone is yesterday)
- Integration between hook actions and localStorage
- Edge cases: empty tasks array skips streak, invalid JSON falls back to defaults, localStorage write error is swallowed
- Component rendering examples: Modal with `isOpen=false` renders nothing, Toast with `type='warn'` has warn class

**Test file locations:**
```
src/
  hooks/__tests__/usePlaceTrackState.test.js
  components/__tests__/StatCard.test.jsx
  components/__tests__/ProgressBar.test.jsx
  components/__tests__/Modal.test.jsx
  components/__tests__/Toast.test.jsx
  utils/__tests__/generateId.test.js
  utils/__tests__/dateUtils.test.js
```

**Test runner:** Vitest (ships with Vite projects)
Run once (no watch): `vitest --run`
