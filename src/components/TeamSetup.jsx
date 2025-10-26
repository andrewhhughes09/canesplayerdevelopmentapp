import { useState } from 'react';
import { teamsService } from '../services/teams';
import { LoadingSpinner } from './Loading';

export default function TeamSetup({ onTeamSelected, currentUser }) {
  const [isCreating, setIsCreating] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim() || loading) return;

    setLoading(true);
    setError(null);
    try {
      const team = await teamsService.createTeam(teamName.trim());
      // if we have a logged-in user, add them as coach to the new team
      if (currentUser?.id) {
        try {
          await teamsService.addTeamMember(team.id, currentUser.id, 'coach');
        } catch (e) {
          // non-fatal — still proceed but surface a console warning
          // eslint-disable-next-line no-console
          console.warn('Failed to add team member:', e?.message || e);
        }
      }
      onTeamSelected(team);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border p-6 shadow-sm max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome to 13U Tracker</h2>
        
        <div className="space-y-6">
          {!isCreating ? (
            <div className="space-y-4">
              <button
                onClick={() => setIsCreating(true)}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-white hover:bg-indigo-700"
              >
                Create New Team
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-slate-500">Coming soon</span>
                </div>
              </div>
              <button
                disabled
                className="w-full rounded-xl border px-4 py-3 text-slate-400 cursor-not-allowed"
              >
                Join Existing Team
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-slate-700 mb-1">
                  Team Name
                </label>
                <input
                  id="teamName"
                  type="text"
                  placeholder="Enter team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-rose-600 bg-rose-50 rounded-lg p-3">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 rounded-lg border px-4 py-2 text-slate-700 hover:bg-slate-50"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      Creating...
                    </span>
                  ) : (
                    'Create Team'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}