🧩 13U Player Development App — AI Context Summary

🔍 Purpose

A web-based platform for 13U baseball players to track skills, athleticism, and character development during the off-season.
The app emphasizes ownership, team camaraderie, and fun, while helping coaches and players visualize growth.

🧱 Current State
- Frontend: React + Vite + Tailwind v4
- Hosting: Vercel (deployed & running)
- Data: Currently local state only
- Components: Player Cards, Feed, Session Log, Goal Tracking
- Goal: Replace local state with Supabase backend for persistence, auth, and team data sharing

🧭 Product Vision

Empower players to own their development and coaches to see and celebrate progress.
Designed to scale from one team → many teams.

👥 User Roles

| Role   | Capabilities                                      |
|--------|--------------------------------------------------|
| Coach  | Manage players/goals, moderate feed, post challenges|
| Player | Log sessions/goals, post kudos, view teammates    |
| Parent | Read-only access to feed and progress (optional)  |

🧩 Tech Stack

| Layer    | Tool                                          |
|----------|-----------------------------------------------|
| Frontend | React + Vite + Tailwind                       |
| Backend  | Supabase (Postgres, Auth, Realtime, Storage)  |
| Auth     | Magic links (Supabase)                        |
| Hosting  | Vercel                                        |
| State    | React + localStorage fallback                 |
| Offline  | Vite PWA plugin                              |
| CI/CD    | GitHub → Vercel auto-deploy                  |

🚀 Roadmap Overview

🎯 M1 – Persistence & Auth
- Supabase setup (auth + RLS)
- Magic-link sign-in
- DB tables: teams, team_members, players, goals, goal_progress, sessions, feed
- Replace in-memory state with live reads/writes
- LocalStorage fallback for offline

⚙️ M2 – PWA & Polish
- Manifest + service worker
- Offline read cache and sync banner
- Validation + empty-state UX polish
- Leaderboard streak tracking

🧠 M3 – Coach Tools & Insights
- Add/Edit Player & Goal modals
- Weekly reset + CSV export
- Per-player dashboard
- Email invites for players/parents

🧩 Core Data Model (Supabase)

Core Tables:
- teams
- team_members
- players
- goals
- goal_progress
- sessions
- feed

Relationships:
- Team → Players → Goals → Progress
- Players → Sessions
- Team → Feed (messages/kudos)

⚙️ Service Modules

Each module wraps Supabase calls for clarity and type safety:

```
src/services/
  players.js      // list/create/update
  goals.js        // list/create/tickProgress
  sessions.js     // add/list
  feed.js         // post/list
```

🧠 Acceptance Criteria Examples
- Goal tick: Clicking "Mark +1" increments weekly goal_progress; disables when max reached
- Session add: Adds a sessions row, updates streak
- Feed post: Appears instantly; kudos styled distinctly
- Offline mode: Shows cached data, syncs on reconnect

🧩 Folder Structure

```
src/
 ├── components/      # UI elements (PlayerCard, TeamFeed, Leaderboard)
 ├── hooks/           # useLocalStorage, useAuth
 ├── lib/             # supabase.js
 ├── services/        # data access wrappers
 ├── utils/           # dates, streaks, helpers
 ├── pages/           # Dashboard, PlayerDetail, Login
 └── App.jsx
```

🛡️ Privacy Guardrails
- Show only first name + last initial + jersey number
- Parent consent for player accounts
- Row-Level Security per team
- No PII beyond auth email

🧩 Metrics for Success
- 80% of players log ≥2 sessions per week
- 10+ kudos posts per week
- Coach setup time < 5 minutes
- 90% weekly active players