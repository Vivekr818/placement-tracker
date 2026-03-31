# Implementation Tasks: PlaceTrack React Refactor

## Phase 1: Project Scaffolding

- [x] 1. Initialise Vite + React project and install dependencies
  - [x] 1.1 Run `npm create vite@latest . -- --template react` to scaffold the project
  - [x] 1.2 Install `fast-check` and `vitest` as dev dependencies
  - [x] 1.3 Configure `vitest` in `vite.config.js` with `environment: 'jsdom'`
  - [x] 1.4 Install `@testing-library/react` and `@testing-library/jest-dom`
  - [x] 1.5 Create directory structure: `src/pages/`, `src/components/`, `src/hooks/`, `src/constants/`, `src/utils/`, `src/styles/`, and test subdirectories
  - [x] 1.6 Delete Vite boilerplate files and placeholder content

- [x] 2. Create global CSS with design tokens
  - [x] 2.1 Create `src/styles/global.css` with all CSS custom properties matching the original
  - [x] 2.2 Add CSS reset and base `body` styles
  - [x] 2.3 Add Google Fonts `@import` for DM Serif Display, DM Mono, and Outfit
  - [x] 2.4 Import `global.css` in `src/main.jsx`

## Phase 2: Utility Modules

- [x] 3. Implement `src/utils/generateId.js`
  - [x] 3.1 Export `generateId()` using `crypto.randomUUID()` as primary implementation
  - [x] 3.2 Add fallback to `Date.now().toString(36) + Math.random().toString(36).slice(2)` when unavailable

- [x] 4. Implement `src/utils/dateUtils.js`
  - [x] 4.1 Export `todayStr()` returning current local date as `YYYY-MM-DD`
  - [x] 4.2 Export `offsetDate(n)` returning the date `n` days from today as `YYYY-MM-DD`
  - [x] 4.3 Export `formatDisplay(dateStr, options?)` parsing with `T00:00:00` suffix and formatting via `toLocaleDateString`

## Phase 3: Constants

- [x] 5. Create `src/constants/stageConfig.js`
  - [x] 5.1 Export `SC` — ordered array of `{ id, label, color }` for all five stages

- [x] 6. Create `src/constants/typeConfig.js`
  - [x] 6.1 Export `TC` — array of `{ id, label, color }` for all five company types

- [x] 7. Create `src/constants/taskPools.js`
  - [x] 7.1 Export `TASK_POOLS` — array of `{ tag, color, tasks: string[] }` covering DSA, System Design, Aptitude, HR, and Core CS

- [x] 8. Create `src/constants/prep.js`
  - [x] 8.1 Export `PREP` — object with `product` and `service` keys, each an array of `{ id, title, subtopics: string[] }` topic objects

## Phase 4: Custom Hook

- [x] 9. Implement `src/hooks/usePlaceTrackState.js`
  - [x] 9.1 Define `STORAGE_KEY = 'pt2'` and `DEFAULT_STATE` covering all schema fields
  - [x] 9.2 Implement lazy `useState` initialiser: parse from localStorage, catch errors, deep-merge with `DEFAULT_STATE`
  - [x] 9.3 Implement `useEffect` writing state to localStorage on every change, wrapped in `try/catch`
  - [x] 9.4 Implement `addCompany(data)` — appends entry with `generateId()` and `todayStr()`
  - [x] 9.5 Implement `updateCompany(id, updates)` — merges updates for matching id, no-op for missing id
  - [x] 9.6 Implement `deleteCompany(id)` — filters out matching id, no-op for missing id
  - [x] 9.7 Implement `toggleTask(taskId)` — toggles taskId in today's done list, auto-calls `checkAndUpdateStreak` when all tasks done
  - [x] 9.8 Implement `regenTasks()` — samples one task per pool with `generateId()`, resets today's `taskHist` entry
  - [x] 9.9 Implement `setPrepType(type)` — sets `prepType` in state
  - [x] 9.10 Implement `toggleTopic(topicId)` — flips `expandedTopics[topicId]` boolean
  - [x] 9.11 Implement `updateProfile(profile)` — replaces `profile` field in state
  - [x] 9.12 Implement `checkAndUpdateStreak()` — skips if tasks empty; compares `lastDone` to today/yesterday; increments, resets, or no-ops; sets `lastDone = todayStr()`
  - [x] 9.13 Return `{ state, actions }` with all base state fields and all nine action functions

## Phase 5: Shared Components

- [x] 10. Implement `StatCard` component
  - [x] 10.1 Create `src/components/StatCard.jsx` accepting `label`, `value`, `color?`, `sub?`, `icon?` props
  - [x] 10.2 Render `label` and `value` always; render `sub` only when provided; render `icon` only when provided
  - [x] 10.3 Create `src/components/StatCard.module.css` with card layout styles; apply `color` as inline style only for dynamic accent

- [x] 11. Implement `ProgressBar` component
  - [x] 11.1 Create `src/components/ProgressBar.jsx` accepting `label`, `value`, `max`, `color?` props
  - [x] 11.2 Compute fill as `Math.min(100, Math.max(0, (value / max) * 100))`
  - [x] 11.3 Apply fill width as inline `style`; all other styles in `src/components/ProgressBar.module.css`

- [x] 12. Implement `Modal` component
  - [x] 12.1 Create `src/components/Modal.jsx` accepting `isOpen`, `onClose`, `title`, `children` props
  - [x] 12.2 Render nothing when `isOpen` is `false`
  - [x] 12.3 Render backdrop and dialog when `isOpen` is `true`; invoke `onClose` on backdrop click
  - [x] 12.4 Implement focus trap cycling Tab/Shift+Tab within the dialog
  - [x] 12.5 Create `src/components/Modal.module.css` with overlay, dialog, and close button styles

- [x] 13. Implement `Toast` component
  - [x] 13.1 Create `src/components/Toast.jsx` accepting `message`, `type`, `onDismiss` props
  - [x] 13.2 Apply distinct CSS classes for `success` vs `warn` types
  - [x] 13.3 Render a close button that calls `onDismiss`
  - [x] 13.4 Create `src/components/Toast.module.css` with positioning and type-variant styles

- [x] 14. Implement `Badge` component
  - [x] 14.1 Create `src/components/Badge.jsx` accepting `icon`, `label`, `desc`, `earned` props
  - [x] 14.2 Always render `icon`, `label`, `desc`; apply `earned`/`unearned` class based on prop
  - [x] 14.3 Create `src/components/Badge.module.css` with earned/unearned visual distinction

- [x] 15. Implement `Sidebar` component
  - [x] 15.1 Create `src/components/Sidebar.jsx` accepting `activePage`, `onNavigate`, `streak` props
  - [x] 15.2 Render brand name/logo at top
  - [x] 15.3 Render nav items for all six PageIds with icons and labels; apply active class to matching item
  - [x] 15.4 Call `onNavigate(pageId)` on item click
  - [x] 15.5 Create `src/components/Sidebar.module.css` with sidebar layout and active-item highlight styles

- [x] 16. Implement `Topbar` component
  - [x] 16.1 Create `src/components/Topbar.jsx` accepting `pageTitle` prop
  - [x] 16.2 Display `pageTitle` as the current page heading
  - [x] 16.3 Display today's date using `formatDisplay(todayStr())`
  - [x] 16.4 Create `src/components/Topbar.module.css` with topbar layout styles

## Phase 6: Pages

- [x] 17. Implement `Dashboard` page
  - [x] 17.1 Create `src/pages/Dashboard.jsx`; call `usePlaceTrackState()` for `state`
  - [x] 17.2 Compute derived values locally: `total`, `interviews`, `offers`, `todayDone`, `recentApps`, `funnelData`
  - [x] 17.3 Render stats row with 4x `<StatCard>`
  - [x] 17.4 Render "Today's Focus" section with pending tasks or empty-state prompt
  - [x] 17.5 Render "Recent Applications" section with last 5 entries
  - [x] 17.6 Render application funnel using `<ProgressBar>` per stage

- [x] 18. Implement `Companies` page
  - [x] 18.1 Create `src/pages/Companies.jsx`; call `usePlaceTrackState()` for `state` and `actions`
  - [x] 18.2 Manage local state: `filterText`, `modalMode`, `editTarget`
  - [x] 18.3 Render toolbar: filter input and "Add Company" button
  - [x] 18.4 Render stage summary `<ProgressBar>` per stage
  - [x] 18.5 Render filterable company table with edit/delete actions; show empty-state when no results
  - [x] 18.6 Render Add `<Modal>` with company form; on submit call `addCompany` then `showToast`
  - [x] 18.7 Render Edit `<Modal>` pre-populated from `editTarget`; on submit call `updateCompany` then `showToast`
  - [x] 18.8 On delete: call `deleteCompany(id)` then `showToast('Company removed', 'warn')`
  - [x] 18.9 Implement inline form validation blocking submit when required fields are empty

- [x] 19. Implement `Tracker` page
  - [x] 19.1 Create `src/pages/Tracker.jsx`; call `usePlaceTrackState()` for `state`
  - [x] 19.2 Compute stage breakdown counts and percentages using `SC`
  - [x] 19.3 Compute type breakdown counts using `TC`
  - [x] 19.4 Render stage breakdown with `<ProgressBar>` per stage
  - [x] 19.5 Render type breakdown with `<ProgressBar>` per type
  - [x] 19.6 Generate 35-day sequence via `offsetDate` and render consistency grid coloured by `taskHist`

- [x] 20. Implement `StudyPath` page
  - [x] 20.1 Create `src/pages/StudyPath.jsx`; call `usePlaceTrackState()` for `state` and `actions`
  - [x] 20.2 Render toggle for "Product-Based" / "Service-Based"; call `setPrepType` on change
  - [x] 20.3 Map over `PREP[state.prepType]` to render topic cards; header click calls `toggleTopic(topic.id)`
  - [x] 20.4 Show expanded subtopics when `expandedTopics[topic.id]` is true

- [x] 21. Implement `DailyTasks` page
  - [x] 21.1 Create `src/pages/DailyTasks.jsx`; call `usePlaceTrackState()` for `state` and `actions`
  - [x] 21.2 Derive `todayDone` from `taskHist[todayStr()]?.done ?? []`
  - [x] 21.3 Render streak badge and "Regenerate Tasks" button
  - [x] 21.4 Render task list with checkboxes; checkbox change calls `toggleTask(task.id)`
  - [x] 21.5 Render 7-day week summary using `offsetDate`
  - [x] 21.6 Render 35-day consistency grid using `offsetDate`

- [x] 22. Implement `Profile` page
  - [x] 22.1 Create `src/pages/Profile.jsx`; call `usePlaceTrackState()` for `state` and `actions`
  - [x] 22.2 Manage local `isEditing` boolean state
  - [x] 22.3 Render profile hero: initials avatar, name, handle, college, role, bio, share link
  - [x] 22.4 Render stats row: total apps, offers, streak
  - [x] 22.5 Compute badge eligibility inline; render `<Badge>` per milestone
  - [x] 22.6 Render edit form when `isEditing`; on submit call `updateProfile` and set `isEditing = false`

## Phase 7: App Shell

- [x] 23. Implement `App.jsx` and `src/main.jsx`
  - [x] 23.1 Create `src/main.jsx` mounting `<App />` into `#root` and importing `global.css`
  - [x] 23.2 Create `src/App.jsx`; call `usePlaceTrackState()` for `state` and `actions`
  - [x] 23.3 Manage local `activePage` (init `'dashboard'`) and `toast` (`null | { message, type }`) state
  - [x] 23.4 Implement `showToast(message, type)`; add `useEffect` to auto-dismiss after 3 seconds
  - [x] 23.5 Define `PAGE_TITLES` map for all six PageIds
  - [x] 23.6 Render app shell: CSS Grid with `<Sidebar>`, `<Topbar>`, `<main>`, and conditional `<Toast>`
  - [x] 23.7 Pass `activePage` and `onNavigate` to `<Sidebar>`; pass `PAGE_TITLES[activePage]` to `<Topbar>`
  - [x] 23.8 Conditionally render active page in `<main>`; pass `showToast` to Companies, DailyTasks, Profile
  - [x] 23.9 Create `src/App.module.css` with `.appShell` (grid 240px + 1fr), `.mainArea` (flex column), `.pageContent` (flex 1, overflow-y auto)

## Phase 8: Tests

- [x] 24. Write utility unit tests
  - [x] 24.1 `src/utils/__tests__/generateId.test.js`: non-empty string; 1000 calls all distinct
  - [x] 24.2 `src/utils/__tests__/dateUtils.test.js`: format, offsetDate, formatDisplay

- [x] 25. Write component unit tests
  - [x] 25.1 `src/components/__tests__/StatCard.test.jsx`
  - [x] 25.2 `src/components/__tests__/ProgressBar.test.jsx`
  - [x] 25.3 `src/components/__tests__/Modal.test.jsx`
  - [x] 25.4 `src/components/__tests__/Toast.test.jsx`

- [x] 26. Write hook unit tests
  - [x] 26.1 Create `src/hooks/__tests__/usePlaceTrackState.test.js`
  - [x] 26.2 Init: returns `DEFAULT_STATE` when localStorage is empty
  - [x] 26.3 Init: deep-merges partial stored object so all fields present
  - [x] 26.4 Init: falls back to `DEFAULT_STATE` on invalid JSON
  - [x] 26.5 `addCompany`: array grows by 1; entry has provided data; `id` non-empty; `added` matches `YYYY-MM-DD`
  - [x] 26.6 `updateCompany`: matching entry updated; non-existent id leaves array unchanged
  - [x] 26.7 `deleteCompany`: matching entry removed; non-existent id leaves array unchanged
  - [x] 26.8 `toggleTask`: taskId added on first call; removed on second call
  - [x] 26.9 `checkAndUpdateStreak`: increments when yesterday; resets when stale; no-op when tasks empty; no-op when already today
  - [x] 26.10 localStorage write: state written to `pt2` after each mutation
  - [x] 26.11 localStorage error: `QuotaExceededError` during write does not throw

- [x] 27. Write property-based tests
  - [x] 27.1 Create `src/hooks/__tests__/usePlaceTrackState.pbt.test.js`
  - [x] 27.2 P1 — localStorage round-trip
  - [x] 27.3 P8 — addCompany uniqueness
  - [x] 27.4 P9 — No-op for missing id
  - [x] 27.5 P10 — Deep-merge fills defaults
  - [x] 27.6 P7 — Streak reset for stale date
  - [x] 27.7 P6 — toggleTask triggers streak
  - [x] 27.8 `src/utils/__tests__/generateId.pbt.test.js` — P11
  - [x] 27.9 `src/utils/__tests__/dateUtils.pbt.test.js` — P12
  - [x] 27.10 `src/components/__tests__/ProgressBar.pbt.test.jsx` — P5
  - [x] 27.11 `src/components/__tests__/StatCard.pbt.test.jsx` — P3
  - [x] 27.12 `src/components/__tests__/Modal.pbt.test.jsx` — P4
  - [x] 27.13 P2 — Navigation sets activePage
