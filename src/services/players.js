import { supabase } from '../lib/supabase';

export const playersService = {
  async getPlayer(playerId) {
    const { data, error } = await supabase
      .from('players')
      .select(`
        *,
        goals (
          id,
          type,
          title,
          weekly_target,
          goal_progress (
            completed_count,
            week_start
          )
        ),
        sessions (
          id,
          type,
          minutes,
          note,
          created_at
        )
      `)
      .eq('id', playerId)
      .single();

    if (error) throw error;
    return data;
  },

  async createPlayer(teamId, userId, { name, number, avatarUrl }) {
    const { data, error } = await supabase
      .from('players')
      .insert([{
        team_id: teamId,
        user_id: userId,
        name,
        number,
        avatar_url: avatarUrl,
        streak_days: 0
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePlayerStreak(playerId, streakDays) {
    const { data, error } = await supabase
      .from('players')
      .update({ streak_days: streakDays })
      .eq('id', playerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addGoal(playerId, { type, title, weeklyTarget }) {
    const { data, error } = await supabase
      .from('goals')
      .insert([{
        player_id: playerId,
        type,
        title,
        weekly_target: weeklyTarget
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateGoalProgress(goalId, weekStart, completedCount) {
    const { data, error } = await supabase
      .from('goal_progress')
      .upsert({
        goal_id: goalId,
        week_start: weekStart,
        completed_count: completedCount
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addSession(playerId, { type, minutes, note }) {
    const { data, error } = await supabase
      .from('sessions')
      .insert([{
        player_id: playerId,
        type,
        minutes,
        note
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};