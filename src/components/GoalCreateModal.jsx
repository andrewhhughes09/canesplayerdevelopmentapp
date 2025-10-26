import { useState } from 'react';
import { goalsService } from '../services/goals';
import { useToast } from './ToastProvider';

export default function GoalCreateModal({ isOpen, onClose, onCreated, teamId, players = [], defaultPlayerId = null, currentUser }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Skill');
  const [weeklyTarget, setWeeklyTarget] = useState(1);
  const [isTeamGoal, setIsTeamGoal] = useState(false);
  const [playerId, setPlayerId] = useState(defaultPlayerId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        team_id: teamId,
        player_id: isTeamGoal ? null : (playerId || defaultPlayerId || null),
        is_team_goal: !!isTeamGoal,
        created_by: currentUser?.id || null,
        type,
        title,
        description: null,
        weekly_target: Number(weeklyTarget) || 0,
      };

      const created = await goalsService.createGoal(payload);
      onCreated && onCreated(created);
      toast.add('Goal created', { type: 'info', ttl: 3000 });
      // reset form
      setTitle('');
      setWeeklyTarget(1);
      setIsTeamGoal(false);
      setPlayerId(defaultPlayerId || '');
      onClose && onClose();
    } catch (err) {
      setError(err?.message || String(err));
      toast.add(err?.message || 'Failed to create goal', { type: 'error', ttl: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Add Goal</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-700 mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border px-3 py-2">
              <option>Skill</option>
              <option>Athletic</option>
              <option>Character</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Weekly target</label>
            <input type="number" min={0} value={weeklyTarget} onChange={(e) => setWeeklyTarget(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </div>

          <div className="flex items-center gap-3">
            <input id="teamGoal" type="checkbox" checked={isTeamGoal} onChange={(e) => setIsTeamGoal(e.target.checked)} />
            <label htmlFor="teamGoal" className="text-sm">Create as team goal</label>
          </div>

          {!isTeamGoal && (
            <div>
              <label className="block text-sm text-slate-700 mb-1">Assign to player</label>
              <select value={playerId} onChange={(e) => setPlayerId(e.target.value)} className="w-full rounded-lg border px-3 py-2">
                <option value="">-- Select player --</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                ))}
              </select>
            </div>
          )}

          {error && <div className="text-sm text-rose-600">{error}</div>}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-3 py-2">Cancel</button>
            <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-3 py-2 text-white">
              {loading ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
