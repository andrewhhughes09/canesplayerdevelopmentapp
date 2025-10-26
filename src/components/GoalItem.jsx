import { useState } from 'react';
import { goalsService } from '../services/goals';

export default function GoalItem({ goal, playerId, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const completed = goal.completedThisWeek ?? (goal.goal_progress && goal.goal_progress[0] ? goal.goal_progress[0].completed_count : 0);
  const target = goal.weeklyTarget ?? goal.weekly_target ?? 0;

  const weekStart = (d = new Date()) => {
    // ISO week start (Monday)
    const dt = new Date(d);
    const day = dt.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
    dt.setDate(dt.getDate() + diff);
    return dt.toISOString().slice(0,10);
  };

  const handleMark = async () => {
    if (loading) return;
    if (completed >= target && target > 0) return;
    setLoading(true);
    try {
      const week = weekStart();
      await goalsService.incrementGoalProgress(goal.id, playerId, week, target || 9999);
      onUpdated && onUpdated();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Mark error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border p-3">
      <div className="mb-1 text-xs font-semibold text-slate-500">{goal.type}</div>
      <div className="mb-2 font-medium">{goal.title}</div>
      <div className="mb-2 text-sm">Completed: {completed} / {target}</div>
      <button
        onClick={handleMark}
        disabled={loading || (target > 0 && completed >= target)}
        className={`w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 ${loading ? 'opacity-70' : ''}`}
      >
        {loading ? 'Marking...' : 'Mark +1'}
      </button>
    </div>
  );
}
