# PlaceTrack

A focused placement preparation tool for students — track applications, build consistency, and stay on top of your prep.

**Live Demo** → [placetrack.vercel.app](https://placement-tracker-live.vercel.app) &nbsp;|&nbsp;

---

## Features

**Dashboard**
- At-a-glance stats: total applications, pipeline count, daily streak
- Activity heatmap showing consistency over time
- Quick navigation to all modules

**Applications Tracker**
- Add and manage companies with role, type, and stage
- Pipeline stages: Applied → OA → Interview → Selected / Rejected
- Filter by name or role; visual funnel showing stage distribution

**Study Path**
- Structured roadmaps for product-based and service-based companies
- Week-by-week topic breakdown (DSA, System Design, Aptitude, Verbal)
- Progress tracked per topic

**Daily Tasks**
- Auto-generated daily task sets based on prep type
- Mark tasks complete to maintain your streak
- 28-day consistency calendar

**Profile**
- View personal stats and badges
- Public profile link for sharing with recruiters

**Demo Mode**
- Full app exploration at `/app/demo` — no login required
- Uses local state; no data is persisted

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite) |
| Styling | CSS Modules |
| Auth | Supabase Auth (email/password) |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel |

---

## Architecture

```
/
├── src/
│   ├── components/       # Sidebar, Topbar, Toast, Modal, StatCard, etc.
│   ├── pages/            # Dashboard, Companies, Tracker, StudyPath, DailyTasks, Profile
│   ├── hooks/
│   │   └── usePlaceTrackState.js   # Central state hook — all pages share one instance
│   ├── constants/        # Task pools, stage config, prep data
│   ├── utils/            # Date helpers, ID generation
│   ├── lib/
│   │   └── supabaseClient.js
│   └── styles/
│       └── global.css    # Design tokens, CSS reset
└── index.html            # Landing page (inline) + React mount point
```

**State management** is handled by a single custom hook (`usePlaceTrackState`) instantiated once in `App.jsx` and passed down as props. No external state library is used.

**Routing** is path-based without a router library:
- `/` → Landing page
- `/app` → Authenticated app
- `/app/demo` → Demo mode (unauthenticated)

---

## Authentication Flow

1. User lands on `/` (landing page)
2. Clicks Login → modal opens → Supabase email/password auth
3. On success → redirected to `/app`
4. Session persisted via Supabase's built-in session management
5. Sign out triggers a fade animation, calls `supabase.auth.signOut()`, then redirects to `/app/demo`

Demo mode bypasses auth entirely — `isDemo` prop is passed to `App`, which skips Supabase calls and uses null userId.

---

## Local Setup

**Prerequisites:** Node.js 18+, a Supabase project

```bash
# 1. Clone the repo
git clone https://github.com/Vivekr818/placement-tracker.git
cd placetrack

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Add your Supabase URL and anon key to .env

# 4. Start dev server
npm run dev
```

**.env variables:**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Supabase setup:** Create a `companies` table and a `profiles` table. Row-level security should be enabled with policies scoped to `auth.uid()`.

---

## Key Technical Decisions

- **Single state hook** — all pages share one `usePlaceTrackState` instance to avoid prop drilling and redundant Supabase fetches
- **CSS Modules** — scoped styles per component; no global class conflicts
- **No router library** — path-based routing handled manually to keep the bundle minimal
- **Demo mode** — implemented via a prop rather than a separate app, keeping the codebase unified
- **Landing page inline** — served from `index.html` to avoid an extra route or framework; hidden on `/app` paths via a script tag before paint

---

## Planned Improvements

- [ ] Interview notes per company
- [ ] Notification reminders for daily tasks
- [ ] Export applications to CSV
- [ ] Mobile app (React Native)
- [ ] Collaborative prep rooms

---

## Author

**[Vivek Rajoju]**
[GitHub](https://github.com/your-username) · [LinkedIn](www.linkedin.com/in/vivek-r-3b164831a)

---

> Built during placement season to solve a real problem. Dogfooded throughout.
