# Requirements Document

## Introduction

PlaceTrack is a campus placement assistant single-page application currently implemented as a monolithic HTML file. This refactoring effort migrates the existing frontend into a clean, scalable React project. The goal is to decompose the monolith into reusable components and logical pages while preserving all existing UI and functionality exactly. State management remains localStorage-based using the existing `pt2` key and data shape. No external UI libraries are introduced.

## Glossary

- **App**: The top-level React application component that owns global state and routing.
- **Page**: A top-level view component rendered based on the active navigation item (Dashboard, Companies, Tracker, StudyPath, DailyTasks, Profile).
- **Component**: A reusable UI unit with a single, well-defined responsibility, receiving data and callbacks via props.
- **State (D)**: The single global state object persisted to localStorage under the key `pt2`. See Requirement 3 for the full schema.
- **Sidebar**: The persistent left-navigation component listing all pages.
- **Topbar**: The persistent top bar displaying the current page title and today's date.
- **Modal**: An overlay dialog used for adding or editing a company entry.
- **Toast**: A transient notification message displayed after user actions.
- **StatCard**: A card component displaying a single numeric metric with a label.
- **ProgressBar**: A visual bar representing a percentage or ratio value.
- **Badge**: A visual indicator of an achievement shown on the Profile page.
- **CSS Module**: A scoped CSS file (`.module.css`) co-located with its component.
- **usePlaceTrackState**: The single custom hook that owns all global state reads, writes, and action functions.
- **PageId**: A string literal union identifying each navigable page: `'dashboard' | 'companies' | 'tracker' | 'prep' | 'tasks' | 'profile'`.
- **Company**: A tracked job application entry — see Requirement 3 for the full type definition.
- **Task**: A daily preparation task entry — see Requirement 3 for the full type definition.
- **Profile**: The user's personal profile object — see Requirement 3 for the full type definition.

---

## Requirements

### Requirement 1: Project Structure

**User Story:** As a developer, I want a well-defined folder structure, so that I can locate and maintain any part of the codebase quickly.

#### Acceptance Criteria

1. THE App SHALL organise source files under a `src/` directory containing at minimum the subdirectories `pages/`, `components/`, `hooks/`, `constants/`, and `styles/`.
2. THE App SHALL place each Page component in `src/pages/` in its own file named after the page (e.g., `Dashboard.jsx`).
3. THE App SHALL place each reusable Component in `src/components/` in its own file named after the component (e.g., `StatCard.jsx`).
4. THE App SHALL co-locate each component's scoped styles in a CSS Module file with the same base name (e.g., `StatCard.module.css`) in the same directory as the component.
5. THE App SHALL expose a single entry point at `src/main.jsx` (or `src/index.jsx`) that mounts the root React component.
6. THE App SHALL place all static data constants (PREP roadmap data, TASK_POOLS, stage config, type config) in `src/constants/` and SHALL NOT define them inside component or page files.

---

### Requirement 2: File Size Constraint

**User Story:** As a developer, I want no single file to be excessively large, so that each file remains readable and maintainable.

#### Acceptance Criteria

1. THE App SHALL ensure no individual source file exceeds 300 lines of code.
2. WHEN a component's JSX and logic together would exceed 300 lines, THE App SHALL split the component into smaller sub-components or extract logic into a custom hook.

---

### Requirement 3: Global State Schema and Persistence

**User Story:** As a user, I want my data to persist across page refreshes, so that I do not lose my tracked applications, tasks, or profile information.

#### Acceptance Criteria

1. THE App SHALL initialise global state by reading the `pt2` key from `localStorage` on first render.
2. WHEN global state changes, THE App SHALL write the updated state object to `localStorage` under the key `pt2`.
3. THE App SHALL expose state and state-update callbacks to child components exclusively via props or the `usePlaceTrackState` hook; no component SHALL access `localStorage` directly.
4. IF the `pt2` key is absent or contains invalid JSON, THEN THE App SHALL initialise state with a defined default value covering all fields.
5. THE State (D) SHALL conform to the following schema:

```
Company {
  id:      string          // UUID
  name:    string
  role:    string
  type:    'product' | 'service' | 'startup' | 'finance' | 'other'
  stage:   'applied' | 'oa' | 'interview' | 'selected' | 'rejected'
  date:    string          // ISO date string (YYYY-MM-DD)
  notes:   string
  added:   string          // ISO date string (YYYY-MM-DD)
}

Task {
  id:    string
  title: string
  tag:   string
  color: string
}

Profile {
  name:    string
  handle:  string
  college: string
  role:    string
  bio:     string
}

State (D) {
  companies:      Company[]
  tasks:          Task[]
  taskHist:       { [dateString: string]: { done: string[] } }
  streak:         number
  lastDone:       string | null   // ISO date string or null
  lastTaskDate:   string | null   // ISO date string or null
  prepType:       'product' | 'service'
  profile:        Profile
  expandedTopics: { [topicId: string]: boolean }
}
```

---

### Requirement 4: Routing / Navigation

**User Story:** As a user, I want to navigate between pages using the sidebar, so that I can access any section of the app without a full page reload.

#### Acceptance Criteria

1. THE App SHALL manage the active page using an `activePage` state variable of type `PageId`, initialised to `'dashboard'`.
2. THE App SHALL pass `activePage` and an `onNavigate` callback down to the Sidebar; no other component SHALL mutate `activePage` directly.
3. THE Sidebar SHALL render a navigation item for each of the six PageIds: `'dashboard'`, `'companies'`, `'tracker'`, `'prep'`, `'tasks'`, and `'profile'`.
4. WHEN a navigation item is clicked, THE App SHALL set `activePage` to the corresponding PageId and render the matching Page component in the main content area.
5. THE Sidebar SHALL visually distinguish the currently active navigation item from inactive items.
6. THE Topbar SHALL display the human-readable name of the currently active page and today's date.
7. THE App SHALL map PageIds to display names as follows: `'dashboard'` → "Dashboard", `'companies'` → "Companies", `'tracker'` → "Tracker", `'prep'` → "Study Path", `'tasks'` → "Daily Tasks", `'profile'` → "Profile".

---

### Requirement 5: Sidebar Component

**User Story:** As a user, I want a persistent sidebar, so that I can navigate to any page at any time.

#### Acceptance Criteria

1. THE Sidebar SHALL accept an `activePage` prop of type `PageId` indicating the currently selected page.
2. THE Sidebar SHALL accept an `onNavigate` callback prop of type `(page: PageId) => void` invoked with the target PageId when a navigation item is clicked.
3. THE Sidebar SHALL render the PlaceTrack brand name or logo at the top.
4. THE Sidebar SHALL render navigation icons and labels for all six pages.

---

### Requirement 6: Topbar Component

**User Story:** As a user, I want a persistent top bar, so that I always know which page I am on and what today's date is.

#### Acceptance Criteria

1. THE Topbar SHALL accept a `pageTitle` prop of type `string` and display it as the current page heading.
2. THE Topbar SHALL display today's date in a human-readable format.
3. THE Topbar SHALL remain visible on all pages without re-mounting.

---

### Requirement 7: Dashboard Page

**User Story:** As a user, I want a dashboard overview, so that I can quickly assess my placement progress at a glance.

#### Acceptance Criteria

1. THE Dashboard SHALL render StatCard components for total applications, interviews scheduled, offers received, and tasks completed today.
2. THE Dashboard SHALL render a "Today's Focus" section listing tasks due or pending for the current day.
3. THE Dashboard SHALL render a "Recent Applications" section showing the most recently added company entries.
4. THE Dashboard SHALL render an application funnel chart visualising the count of applications at each stage.
5. WHEN the underlying state changes, THE Dashboard SHALL reflect updated counts and lists without a page reload.

---

### Requirement 8: StatCard Component

**User Story:** As a developer, I want a reusable StatCard, so that I can display any metric consistently across pages.

#### Acceptance Criteria

1. THE StatCard SHALL accept the following props:
   - `label: string` — the metric name displayed below the value
   - `value: string | number` — the primary metric value displayed prominently
   - `color?: string` — optional accent colour applied to the card
   - `sub?: string` — optional secondary line of text displayed beneath the value
2. THE StatCard SHALL render `label` and `value` in all cases.
3. THE StatCard SHALL render `sub` only WHEN the `sub` prop is provided.
4. THE StatCard SHALL accept an optional `icon` prop and render it when provided.
5. THE StatCard SHALL NOT contain any business logic or state.

---

### Requirement 9: Companies Page

**User Story:** As a user, I want to track job applications in a table, so that I can manage and review all companies I have applied to.

#### Acceptance Criteria

1. THE Companies page SHALL render a filterable table listing all company entries from state.
2. THE Companies page SHALL provide a filter input that, WHEN a value is entered, filters the table rows to those whose company name or role contains the entered value (case-insensitive).
3. THE Companies page SHALL provide an "Add Company" button that, WHEN clicked, opens the Add Company Modal.
4. WHEN a table row's edit action is triggered, THE Companies page SHALL open the Edit Company Modal pre-populated with that entry's data.
5. WHEN a table row's delete action is triggered, THE Companies page SHALL call `deleteCompany(id)` from the hook, remove the corresponding entry from state, and display a Toast notification confirming deletion.
6. THE Companies page SHALL display a ProgressBar or funnel summary reflecting the current stage distribution.

---

### Requirement 10: Modal Component

**User Story:** As a user, I want modal dialogs for adding and editing companies, so that I can manage entries without leaving the current page.

#### Acceptance Criteria

1. THE Modal SHALL accept the following props:
   - `isOpen: boolean` — controls visibility
   - `onClose: () => void` — called when the user dismisses the dialog
   - `title: string` — displayed as the dialog heading
   - `children: ReactNode` — the dialog body content
2. THE Modal SHALL render its content only WHEN `isOpen` is `true`.
3. THE Modal SHALL invoke `onClose` WHEN the user clicks the backdrop or a close button.
4. THE Modal SHALL trap focus within the dialog WHILE it is open.
5. WHEN the Add Company form is submitted with valid data, THE Modal SHALL invoke an `onSubmit` callback prop with the new entry data and close.
6. WHEN the Edit Company form is submitted with valid data, THE Modal SHALL invoke an `onSubmit` callback prop with the updated entry data and close.
7. IF a required form field is empty on submission, THEN THE Modal SHALL display an inline validation message and SHALL NOT invoke `onSubmit`.

---

### Requirement 11: Toast Notification Component

**User Story:** As a user, I want brief notifications after actions, so that I receive confirmation that my changes were saved.

#### Acceptance Criteria

1. THE Toast SHALL accept the following props:
   - `message: string` — the notification text to display
   - `type: 'success' | 'warn'` — controls the visual style of the notification
   - `onDismiss: () => void` — called when the toast is dismissed manually or by timer
2. THE Toast SHALL display `message` when rendered.
3. THE Toast SHALL apply distinct styling based on the `type` prop.
4. WHEN a Toast is displayed, THE App SHALL automatically dismiss it after 3 seconds by invoking `onDismiss`.
5. THE Toast SHALL invoke `onDismiss` when the user manually closes it.

---

### Requirement 12: Tracker / Progress Page

**User Story:** As a user, I want to see my application progress visually, so that I can identify bottlenecks in my job search.

#### Acceptance Criteria

1. THE Tracker page SHALL render stage breakdown bars showing the count and percentage of applications at each stage (Applied, OA, Interview, Offer, Rejected).
2. THE Tracker page SHALL render company-type breakdown bars distinguishing product-based from service-based applications.
3. THE Tracker page SHALL render a consistency grid showing task completion for the last 5 weeks.
4. THE ProgressBar component used on this page SHALL accept `label`, `value`, and `max` props and compute the fill percentage internally.

---

### Requirement 13: ProgressBar Component

**User Story:** As a developer, I want a reusable ProgressBar, so that I can visualise ratios consistently across pages.

#### Acceptance Criteria

1. THE ProgressBar SHALL accept the following props:
   - `label: string` — displayed alongside the bar
   - `value: number` — the current value
   - `max: number` — the maximum value used to compute fill percentage
   - `color?: string` — optional colour applied to the filled portion
2. THE ProgressBar SHALL render a filled bar proportional to `value / max`.
3. THE ProgressBar SHALL clamp the fill to the range [0, 100]% regardless of input values.
4. THE ProgressBar SHALL NOT contain any business logic or state.

---

### Requirement 14: Study Path / Prep Page

**User Story:** As a user, I want a study roadmap, so that I can follow a structured preparation plan for placements.

#### Acceptance Criteria

1. THE StudyPath page SHALL render a toggle allowing the user to switch between "Product-Based" and "Service-Based" roadmaps.
2. WHEN the prep type toggle is changed, THE StudyPath page SHALL call `setPrepType(type)` from the hook and display the corresponding roadmap.
3. THE StudyPath page SHALL render topic cards for each topic in the active roadmap, sourcing roadmap data from `src/constants/`.
4. WHEN a topic card header is clicked, THE StudyPath page SHALL call `toggleTopic(topicId)` from the hook to toggle the expanded state of that topic.
5. WHILE a topic card is expanded, THE StudyPath page SHALL display the topic's subtopics or details.

---

### Requirement 15: Daily Tasks Page

**User Story:** As a user, I want to manage daily tasks and track my streak, so that I stay consistent in my preparation.

#### Acceptance Criteria

1. THE DailyTasks page SHALL render a list of tasks, each with a checkbox indicating completion status.
2. WHEN a task checkbox is toggled, THE DailyTasks page SHALL call `toggleTask(taskId)` from the hook to update the task's completion status in global state.
3. THE DailyTasks page SHALL render a streak calendar showing task completion for each day over the last 5 weeks.
4. THE DailyTasks page SHALL render a week summary showing the number of tasks completed in the current week.
5. WHEN all tasks for the current day are completed, THE DailyTasks page SHALL call `checkAndUpdateStreak()` from the hook, which SHALL increment the streak counter and update `lastDone`.
6. IF the `lastDone` date is not yesterday or today, THEN THE hook SHALL reset the streak counter to 0 on the next task completion.

---

### Requirement 16: Profile Page

**User Story:** As a user, I want to view and edit my profile, so that I can personalise my PlaceTrack experience and share my progress.

#### Acceptance Criteria

1. THE Profile page SHALL display the user's avatar, name, bio, and placement statistics sourced from the `profile` field in global state.
2. THE Profile page SHALL render a list of earned Badge components based on milestones in global state.
3. WHEN the "Edit Profile" button is clicked, THE Profile page SHALL display an edit form pre-populated with current profile data.
4. WHEN the edit form is submitted with valid data, THE Profile page SHALL call `updateProfile(profile)` from the hook and hide the edit form.
5. THE Profile page SHALL display a shareable link or summary that the user can copy.

---

### Requirement 17: Badge Component

**User Story:** As a developer, I want a reusable Badge component, so that achievements can be displayed consistently.

#### Acceptance Criteria

1. THE Badge SHALL accept the following props:
   - `icon: string` — rendered within the badge visual
   - `label: string` — displayed as the badge title
   - `desc: string` — displayed as a short description of the achievement
   - `earned: boolean` — when `true`, applies earned styling; when `false`, applies unearned styling
2. THE Badge SHALL render `label`, `icon`, and `desc` in all cases.
3. THE Badge SHALL apply visually distinct styling to distinguish earned badges from unearned ones based on the `earned` prop.
4. THE Badge SHALL NOT contain any business logic or state.

---

### Requirement 18: Custom Hook for State Management

**User Story:** As a developer, I want a custom hook encapsulating localStorage state logic, so that components remain free of persistence concerns.

#### Acceptance Criteria

1. THE App SHALL provide a `usePlaceTrackState` custom hook that returns the current state `D` and all named action functions.
2. WHEN an action function is called, THE hook SHALL apply the corresponding state mutation, merge the result into the existing state, and persist it to `localStorage`.
3. THE hook SHALL initialise state from `localStorage` on mount and fall back to defaults if the stored value is absent or unparseable.
4. THE hook SHALL be the single location in the codebase that reads from or writes to `localStorage`.

---

### Requirement 19: UI Fidelity

**User Story:** As a user, I want the refactored app to look and behave identically to the original, so that my workflow is not disrupted.

#### Acceptance Criteria

1. THE App SHALL preserve all existing design tokens (colours, font sizes, spacing, border radii) from the original implementation.
2. THE App SHALL reproduce all interactive behaviours present in the original app, including filtering, modal open/close, toast display, streak logic, and topic expansion.
3. THE App SHALL not introduce any new external UI library dependencies.
4. WHEN rendered in a modern browser, THE App SHALL display no visual regressions compared to the original HTML implementation.

---

### Requirement 20: State Action Functions

**User Story:** As a developer, I want a well-defined set of named action functions exposed by the custom hook, so that all state mutations are explicit, predictable, and easy to trace.

#### Acceptance Criteria

1. THE `usePlaceTrackState` hook SHALL expose the following action functions and no component SHALL mutate state by any other means:
   - `addCompany(company: Omit<Company, 'id' | 'added'>): void` — generates a UUID and the current date for `id` and `added`, then appends the entry to `companies`
   - `updateCompany(id: string, updates: Partial<Company>): void` — merges `updates` into the matching Company entry identified by `id`
   - `deleteCompany(id: string): void` — removes the Company entry with the given `id` from `companies`
   - `toggleTask(taskId: string): void` — adds `taskId` to today's `taskHist` done list if absent, or removes it if present
   - `regenTasks(): void` — replaces the current `tasks` array with a freshly sampled set from TASK_POOLS and resets today's `taskHist` entry
   - `setPrepType(type: 'product' | 'service'): void` — sets `prepType` in state
   - `toggleTopic(topicId: string): void` — flips the boolean value of `expandedTopics[topicId]`
   - `updateProfile(profile: Profile): void` — replaces the `profile` field in state with the provided value
   - `checkAndUpdateStreak(): void` — evaluates `lastDone` against today's date and either increments `streak` or resets it to 0, then sets `lastDone` to today
2. WHEN `addCompany` is called, THE hook SHALL generate a unique `id` for the new entry.
3. WHEN `updateCompany` is called with an `id` that does not exist in `companies`, THE hook SHALL leave state unchanged.
4. WHEN `deleteCompany` is called with an `id` that does not exist in `companies`, THE hook SHALL leave state unchanged.
5. WHEN `toggleTask` is called and all tasks for the current day are marked done, THE hook SHALL automatically invoke `checkAndUpdateStreak`.

---

### Requirement 21: Edge Case Handling

**User Story:** As a user, I want the app to handle missing or corrupt data gracefully, so that I never encounter a crash or blank screen due to an unexpected state.

#### Acceptance Criteria

1. WHEN the `companies` array is empty, THE Companies page SHALL display an empty-state illustration or message in place of the table.
2. WHEN today's task list is empty, THE Dashboard "Today's Focus" section SHALL display a prompt directing the user to the Daily Tasks page.
3. IF writing to `localStorage` throws a quota-exceeded or security error, THEN THE hook SHALL silently catch the error and continue without crashing or alerting the user.
4. IF the value read from `localStorage` under `pt2` is missing one or more expected fields, THEN THE hook SHALL deep-merge the stored value with the default state object so that all fields are always present.
5. WHEN `checkAndUpdateStreak` is called and the `tasks` array is empty, THE hook SHALL skip all streak evaluation and leave `streak` and `lastDone` unchanged.
6. IF `taskHist` contains no entry for today, THEN THE hook SHALL treat today's done list as empty rather than throwing an error.

---

### Requirement 22: Architecture Constraints

**User Story:** As a developer, I want enforced architectural boundaries, so that the codebase remains maintainable and scalable as the feature set grows.

#### Acceptance Criteria

1. THE App SHALL ensure that no component other than `App.jsx` owns or directly mutates global state; all mutations SHALL go through the action functions exposed by `usePlaceTrackState`.
2. THE App SHALL ensure that prop drilling does not exceed 2 levels; Page components SHALL call `usePlaceTrackState` directly and pass only the specific props each child component needs.
3. THE App SHALL ensure that no inline styles are used for layout or spacing concerns that belong in CSS Modules; inline styles are permitted only for dynamic values that cannot be expressed statically (e.g., a computed fill width).
4. THE App SHALL ensure that all data constants (PREP roadmap data, TASK_POOLS, stage config, type config) reside in `src/constants/` and are imported where needed rather than defined inside component or page files.
5. THE App SHALL ensure that each component has a single, well-defined responsibility and does not mix data-fetching, business logic, and rendering concerns in the same file.
6. WHEN a new page or component is added, THE App SHALL follow the same folder, naming, and CSS Module conventions established in Requirement 1 without exception.

---

### Requirement 23: Derived State Rule

**User Story:** As a developer, I want all computed values to be derived at render time from base state, so that the stored state stays minimal and there is never a risk of stale or inconsistent derived data.

#### Acceptance Criteria

1. THE App SHALL NOT store any derived value in the global state object `D`; derived values SHALL always be computed from base state at the point of use.
2. THE following values are classified as derived and SHALL be computed, not stored:
   - Total application count — `companies.length`
   - In-pipeline count — `companies.filter(c => c.stage !== 'rejected' && c.stage !== 'selected').length`
   - Per-stage counts — `companies.filter(c => c.stage === s).length` for each stage `s`
   - Per-type counts — `companies.filter(c => c.type === t).length` for each type `t`
   - Today's task completion percentage — `(taskHist[today]?.done.length / tasks.length) * 100`
   - Total tasks ever completed — `Object.values(taskHist).reduce((sum, v) => sum + v.done.length, 0)`
   - Selected company count — `companies.filter(c => c.stage === 'selected').length`
   - Badge eligibility — evaluated inline from `companies`, `streak`, and `taskHist` at render time
3. Page components SHALL compute derived values locally (or via a utility function in `src/utils/`) before passing them as props to child components such as `StatCard` and `ProgressBar`.
4. THE `usePlaceTrackState` hook SHALL NOT expose pre-computed derived values; it SHALL expose only raw base state fields and action functions.

---

### Requirement 24: ID Generation Standard

**User Story:** As a developer, I want all entity IDs to be generated through a single consistent mechanism, so that IDs are unique, predictable, and easy to audit.

#### Acceptance Criteria

1. THE App SHALL generate all entity IDs (Company `id`, Task `id`) using a single helper function located at `src/utils/generateId.js`.
2. THE `generateId` function SHALL use `crypto.randomUUID()` as its primary implementation.
3. IF `crypto.randomUUID()` is unavailable in the runtime environment, THEN `generateId` SHALL fall back to a timestamp-plus-random-suffix string (e.g., `Date.now().toString(36) + Math.random().toString(36).slice(2)`).
4. NO component, page, or hook SHALL generate IDs inline using `Date.now()` or `Math.random()` directly; all ID generation SHALL go through `generateId`.
5. THE `addCompany` action in `usePlaceTrackState` SHALL call `generateId()` to produce the `id` field for each new Company entry.
6. THE `regenTasks` action in `usePlaceTrackState` SHALL call `generateId()` to produce the `id` field for each newly generated Task entry.

---

### Requirement 25: Date Handling Consistency

**User Story:** As a developer, I want all date values to follow a single format and be produced by a single utility, so that date comparisons and storage are consistent throughout the codebase.

#### Acceptance Criteria

1. THE App SHALL store all date values in ISO `YYYY-MM-DD` format (e.g., `"2025-03-27"`); no component or hook SHALL store dates in any other format.
2. THE App SHALL provide a single date utility module at `src/utils/dateUtils.js` exporting the following functions:
   - `todayStr(): string` — returns the current local date as `YYYY-MM-DD`
   - `offsetDate(n: number): string` — returns the date `n` days before (negative) or after (positive) today as `YYYY-MM-DD`
   - `formatDisplay(dateStr: string, options?: Intl.DateTimeFormatOptions): string` — formats a `YYYY-MM-DD` string for human-readable display using `toLocaleDateString`
3. NO component, page, or hook SHALL call `new Date().toISOString().slice(0, 10)` or equivalent inline; all date string generation SHALL go through `todayStr()` or `offsetDate()`.
4. WHEN comparing two date strings (e.g., to check if `lastDone` is yesterday), THE App SHALL compare the `YYYY-MM-DD` strings directly using strict equality or `offsetDate(-1)`, not by constructing `Date` objects inline.
5. THE streak calendar and consistency grid SHALL use `offsetDate` to generate the sequence of past dates rather than computing offsets inline.

---

### Requirement 26: Hook Return Contract

**User Story:** As a developer, I want `usePlaceTrackState` to return a consistent, documented structure, so that every page consumes the hook in the same predictable way.

#### Acceptance Criteria

1. THE `usePlaceTrackState` hook SHALL return a single object with two top-level keys: `state` and `actions`.
2. THE `state` key SHALL contain all base state fields exactly matching the schema defined in Requirement 3:
   `{ companies, tasks, taskHist, streak, lastDone, lastTaskDate, prepType, profile, expandedTopics }`
3. THE `actions` key SHALL contain all named action functions exactly as defined in Requirement 20:
   `{ addCompany, updateCompany, deleteCompany, toggleTask, regenTasks, setPrepType, toggleTopic, updateProfile, checkAndUpdateStreak }`
4. Page components SHALL destructure the hook return as `const { state, actions } = usePlaceTrackState()` and SHALL NOT alias or restructure the return value in a way that obscures its origin.
5. THE hook SHALL NOT return derived values, computed metrics, or UI state (e.g., modal open/close flags); those SHALL remain local to the components that need them.
6. WHEN the hook is called in a component that only needs a subset of state or actions, THE component SHALL destructure only what it needs; unused fields SHALL NOT be passed down as props.

---

### Requirement 27: Page Responsibility Boundaries

**User Story:** As a developer, I want each page to have a clearly defined responsibility boundary, so that logic does not leak into unrelated components and each page remains focused and maintainable.

#### Acceptance Criteria

1. THE Dashboard page (`Dashboard.jsx`) SHALL be responsible for: reading `state.companies`, `state.tasks`, `state.taskHist`, and `state.streak`; computing all derived dashboard metrics locally; and rendering `StatCard`, the Today's Focus task list, the Recent Applications list, and the funnel chart. THE Dashboard SHALL NOT own modal state, handle form submission, or modify `companies` directly.
2. THE Companies page (`Companies.jsx`) SHALL be responsible for: rendering the filterable company table; managing local UI state for the active filter values and which modal is open; and calling `actions.addCompany`, `actions.updateCompany`, and `actions.deleteCompany`. THE Companies page SHALL NOT compute streak values or render task-related UI.
3. THE Tracker page (`Tracker.jsx`) SHALL be responsible for: computing stage and type breakdown counts from `state.companies`; computing the consistency grid from `state.taskHist`; and rendering `ProgressBar` components and the grid. THE Tracker page SHALL NOT mutate any state.
4. THE StudyPath page (`StudyPath.jsx`) SHALL be responsible for: reading `state.prepType` and `state.expandedTopics`; sourcing roadmap data from `src/constants/`; and calling `actions.setPrepType` and `actions.toggleTopic`. THE StudyPath page SHALL NOT render task lists or company data.
5. THE DailyTasks page (`DailyTasks.jsx`) SHALL be responsible for: reading `state.tasks`, `state.taskHist`, and `state.streak`; calling `actions.toggleTask`, `actions.regenTasks`, and `actions.checkAndUpdateStreak`; and rendering the task list, streak calendar, and week summary. THE DailyTasks page SHALL NOT render company data or profile information.
6. THE Profile page (`Profile.jsx`) SHALL be responsible for: reading `state.profile`, `state.companies`, `state.streak`, and `state.taskHist`; managing local UI state for the edit form visibility; calling `actions.updateProfile`; and rendering the profile hero, edit form, share link, and Badge components. THE Profile page SHALL NOT call task or company mutation actions.
7. NO page SHALL import or render another page component; cross-page navigation SHALL be handled exclusively by the `onNavigate` callback passed from `App.jsx`.
