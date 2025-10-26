import { supabase } from '../lib/supabase';

export const goalsService = {
  async listGoalsForTeam(teamId) {
    const { data, error } = await supabase
      .from('goals')
      .select(`*, created_by (id, email)`) // keep it simple
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async listGoalsForPlayer(playerId) {
    const { data, error } = await supabase
      .from('goals')
      .select(`*, goal_progress (completed_count, week_start)`)
      .eq('player_id', playerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createGoal(payload) {
    // payload: { team_id, player_id (nullable), is_team_goal, created_by, type, title, description, weekly_target }
    const { data, error } = await supabase
      .from('goals')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async incrementGoalProgress(goalId, playerId, weekStart, max) {
    // Try RPC first for atomic increment
    try {
      const { data, error } = await supabase.rpc('increment_goal_progress', {
        p_goal: goalId,
        p_player: playerId,
        p_week: weekStart,
        p_max: max || 9999,
      });
      if (error) throw error;
      return data;
    } catch (rpcErr) {
      // Fallback to client-side upsert (not atomic). This works if RPC not installed.
      // Read current value
      try {
        const { data: rows, error: selectErr } = await supabase
          .from('goal_progress')
          .select('id, completed_count')
          .eq('goal_id', goalId)
          .eq('player_id', playerId)
          .eq('week_start', weekStart)
          .limit(1)
          .single();

        if (selectErr && selectErr.code !== 'PGRST116') {
          // continue to attempt upsert regardless of select error
        }

        let newCount = 1;
        if (rows && typeof rows.completed_count === 'number') {
          newCount = Math.min((rows.completed_count || 0) + 1, max || 9999);
          // upsert using id to update
          const payload = { id: rows.id, goal_id: goalId, player_id: playerId, week_start: weekStart, completed_count: newCount };
          const { data: upserted, error: upsertErr } = await supabase.from('goal_progress').upsert([payload]).select().single();
          if (upsertErr) throw upsertErr;
          return upserted;
        } else {
          // insert new row
          const { data: inserted, error: insertErr } = await supabase.from('goal_progress').insert([{ goal_id: goalId, player_id: playerId, week_start: weekStart, completed_count: 1 }]).select().single();
          if (insertErr) {
            // possible race - try again by calling incrementGoalProgress recursively once
            const { data: retryData, error: retryErr } = await supabase.rpc('increment_goal_progress', {
              p_goal: goalId,
              p_player: playerId,
              p_week: weekStart,
              p_max: max || 9999,
            });
            if (retryErr) throw retryErr;
            return retryData;
          }
          return inserted;
        }
      } catch (fallbackErr) {
        throw fallbackErr;
      }
    }
  }
};
