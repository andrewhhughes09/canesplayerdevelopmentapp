import { useState, useEffect } from 'react';
import { goalsService } from '../services/goals';
import { useToast } from './ToastProvider';

export default function GoalItem({ goal, playerId, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const initialCompleted = goal.completedThisWeek ?? (goal.goal_progress && goal.goal_progress[0] ? goal.goal_progress[0].completed_count : 0);
  const [displayedCompleted, setDisplayedCompleted] = useState(initialCompleted);
  const target = goal.weeklyTarget ?? goal.weekly_target ?? 0;

  const weekStart = (d = new Date()) => {
    // ISO week start (Monday)
    const dt = new Date(d);
    const day = dt.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
    dt.setDate(dt.getDate() + diff);
    return dt.toISOString().slice(0,10);
  };

  const toast = useToast();

  useEffect(() => {
    setDisplayedCompleted(initialCompleted);
  }, [initialCompleted]);

  const handleMark = async () => {
    if (loading) return;
    if (displayedCompleted >= target && target > 0) return;
    setLoading(true);
    try {
      const week = weekStart();
      // optimistic UI: increment immediately
      setDisplayedCompleted(c => c + 1);
      await goalsService.incrementGoalProgress(goal.id, playerId, week, target || 9999);
      onUpdated && onUpdated();
      toast.add('Marked +1', { type: 'info', ttl: 2000 });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Mark error', err);
      // rollback optimistic update
      setDisplayedCompleted(c => Math.max(0, c - 1));
      toast.add(err?.message || 'Failed to mark', { type: 'error', ttl: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border p-3">
      <div className="mb-1 text-xs font-semibold text-slate-500">{goal.type}</div>
      <div className="mb-2 font-medium">{goal.title}</div>
      <div className="mb-2 text-sm">Completed: {displayedCompleted} / {target}</div>
      <button
        onClick={handleMark}
        disabled={loading || (target > 0 && displayedCompleted >= target)}
        className={`w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 ${loading ? 'opacity-70' : ''}`}
      >
        {loading ? 'Marking...' : 'Mark +1'}
      </button>
    </div>
  );
}
