import React, { useState, useMemo } from "react";

// ------------------------------------------------------------
// 13U Player Development Tracker
// Features:
// - Player Cards with Goals (Skill, Athletic, Character)
// - Quick-add Training Sessions
// - Team Feed (Messages + Kudos)
// - Consistency Leaderboard
// ------------------------------------------------------------

const initialPlayers = [
  {
    id: "p1",
    name: "Evan R.",
    number: 3,
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Evan",
    goals: [
      { id: "g1", type: "Skill", title: "Improve exit velo to 70+ mph", weeklyTarget: 3, completedThisWeek: 1 },
      { id: "g2", type: "Athletic", title: "60-yd dash under 8.5s", weeklyTarget: 2, completedThisWeek: 0 },
      { id: "g3", type: "Character", title: "Encourage a teammate every practice", weeklyTarget: 2, completedThisWeek: 1 },
    ],
    sessions: [{ id: "s1", type: "Hitting", minutes: 25, note: "Tee + front toss", date: new Date().toISOString() }],
    streakDays: 2,
  },
  {
    id: "p2",
    name: "Malik S.",
    number: 10,
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Malik",
    goals: [
      { id: "g4", type: "Skill", title: "Throw 70% strikes (bullpen)", weeklyTarget: 2, completedThisWeek: 1 },
      { id: "g5", type: "Athletic", title: "Mobility 2x per week", weeklyTarget: 2, completedThisWeek: 1 },
      { id: "g6", type: "Character", title: "Stay positive after errors", weeklyTarget: 1, completedThisWeek: 0 },
    ],
    sessions: [],
    streakDays: 4,
  },
  {
    id: "p3",
    name: "Diego M.",
    number: 22,
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Diego",
    goals: [
      { id: "g7", type: "Skill", title: "Barrel control – improve contact %", weeklyTarget: 3, completedThisWeek: 2 },
      { id: "g8", type: "Athletic", title: "Sprint starts + jump height", weeklyTarget: 2, completedThisWeek: 2 },
      { id: "g9", type: "Character", title: "Lead warmups twice this week", weeklyTarget: 1, completedThisWeek: 0 },
    ],
    sessions: [],
    streakDays: 1,
  },
];

const initialFeed = [
  { id: "f1", type: "message", author: "Coach A.", text: "This week: Wall Ball 100/day + 2 mobility sessions!", date: new Date().toISOString() },
  { id: "f2", type: "kudos", author: "Malik", text: "👏 Kudos to Evan for staying late to help with tee work!", date: new Date().toISOString() },
];

export default function App() {
  const [players, setPlayers] = useState(initialPlayers);
  const [selectedId, setSelectedId] = useState(players[0].id);
  const [feed, setFeed] = useState(initialFeed);
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState("message"); // or "kudos"

  const selected = useMemo(() => {
  return players.find(p => p.id === selectedId) || players[0];
}, [players, selectedId]);
  function totalThisWeek(p) {
    return p.goals.reduce((a, g) => a + (g.completedThisWeek || 0), 0);
  }
  function totalTarget(p) {
    return p.goals.reduce((a, g) => a + (g.weeklyTarget || 0), 0);
  }

  function toggleGoalTick(goalId) {
    setPlayers(prev => prev.map(p => {
      if (p.id !== selectedId) return p;
      return {
        ...p,
        goals: p.goals.map(g => g.id === goalId
          ? { ...g, completedThisWeek: Math.min((g.completedThisWeek || 0) + 1, g.weeklyTarget) }
          : g)
      };
    }));
  }

  function addSession() {
    const minutes = 20 + Math.floor(Math.random() * 20);
    const newSession = { id: crypto.randomUUID(), type: "Workout", minutes, note: "Quick-add session", date: new Date().toISOString() };
    setPlayers(prev => prev.map(p => p.id === selectedId ? { ...p, sessions: [newSession, ...p.sessions], streakDays: p.streakDays + 1 } : p));
    setFeed(prev => [{ id: crypto.randomUUID(), type: "message", author: selected.name, text: `Logged a ${minutes} min workout`, date: new Date().toISOString() }, ...prev]);
  }

  function postToFeed() {
    if (!newPost.trim()) return;
    setFeed(prev => [{ id: crypto.randomUUID(), type: postType, author: "You", text: newPost.trim(), date: new Date().toISOString() }, ...prev]);
    setNewPost("");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">13U Player Development</h1>
          <p className="text-slate-600">Winter Training • Ownership • Character</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-xl bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700"
            onClick={addSession}
          >
            + Quick Session
          </button>
          <ResetWeekButton players={players} setPlayers={setPlayers} />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Player List */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Players</h2>
            <ul className="space-y-2">
              {players.map(p => (
                <li key={p.id}>
                  <button
                    onClick={() => setSelectedId(p.id)}
                    className={`w-full rounded-xl border px-3 py-2 text-left transition ${selectedId === p.id ? "border-indigo-500 bg-indigo-50" : "hover:bg-slate-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.avatar} alt={p.name} className="h-9 w-9 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">#{p.number} {p.name}</span>
                          <span className="text-xs text-slate-500">Streak {p.streakDays}d</span>
                        </div>
                        <ProgressBar current={totalThisWeek(p)} total={totalTarget(p)} />
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Player Card */}
        <main className="lg:col-span-2">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <img src={selected.avatar} alt={selected.name} className="h-12 w-12 rounded-full" />
              <div>
                <h2 className="text-xl font-semibold">#{selected.number} {selected.name}</h2>
                <p className="text-slate-600 text-sm">Weekly Progress: {totalThisWeek(selected)} / {totalTarget(selected)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {selected.goals.map(g => (
                <div key={g.id} className="rounded-xl border p-3">
                  <div className="mb-1 text-xs font-semibold text-slate-500">{g.type}</div>
                  <div className="mb-2 font-medium">{g.title}</div>
                  <div className="mb-2 text-sm">Completed: {g.completedThisWeek} / {g.weeklyTarget}</div>
                  <button
                    onClick={() => toggleGoalTick(g.id)}
                    className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Mark +1
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Team Feed */}
        <section className="lg:col-span-1">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Team Feed</h2>
            <div className="mb-3 flex gap-2">
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
                className="rounded-lg border px-2 py-1 text-sm"
              >
                <option value="message">Message</option>
                <option value="kudos">Kudos</option>
              </select>
              <input
                className="flex-1 rounded-lg border px-3 py-2 text-sm"
                placeholder={postType === "kudos" ? "Give a shout-out…" : "Share an update…"}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && postToFeed()}
              />
              <button
                onClick={postToFeed}
                className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Post
              </button>
            </div>
            <ul className="space-y-2 max-h-[28rem] overflow-auto">
              {feed.map(item => (
                <li key={item.id} className={`rounded-lg border p-3 text-sm ${item.type === "kudos" ? "border-amber-300 bg-amber-50" : ""}`}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium">
                      {item.type === "kudos" ? "👏 Kudos" : "💬 Message"} • {item.author}
                    </span>
                    <span className="text-xs text-slate-500">{new Date(item.date).toLocaleString()}</span>
                  </div>
                  <div>{item.text}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <footer className="mt-6 text-center text-xs text-slate-500">
        Built for 13U: simple, visual, and fun. (Front-end only — no login yet)
      </footer>
    </div>
  );
}

// Progress bar helper
function ProgressBar({ current, total }) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100);
  return (
    <div className="mt-1 h-2 w-full rounded-full bg-slate-200">
      <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${pct}%` }} />
    </div>
  );
}

// Reset button helper
function ResetWeekButton({ players, setPlayers }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="relative">
      {!confirming ? (
        <button
          className="rounded-xl border px-4 py-2 text-slate-700 hover:bg-slate-100"
          onClick={() => setConfirming(true)}
        >
          Reset Week
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button className="rounded-lg border px-2 py-1 text-sm" onClick={() => setConfirming(false)}>
            Cancel
          </button>
          <button
            className="rounded-lg bg-rose-600 px-2 py-1 text-sm font-semibold text-white hover:bg-rose-700"
            onClick={() => {
              setPlayers(players.map(p => ({
                ...p,
                goals: p.goals.map(g => ({ ...g, completedThisWeek: 0 })),
              })));
              setConfirming(false);
            }}
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}