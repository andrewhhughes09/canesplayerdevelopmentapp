import { supabase } from '../lib/supabase';

export const teamsService = {
  async createTeam(name) {
    const { data, error } = await supabase
      .from('teams')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addTeamMember(teamId, userId, role) {
    const { data, error } = await supabase
      .from('team_members')
      .insert([{ team_id: teamId, user_id: userId, role }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTeam(teamId) {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members (
          user_id,
          role
        ),
        players (
          id,
          name,
          number,
          avatar_url,
          streak_days
        )
      `)
      .eq('id', teamId)
      .single();

    if (error) throw error;
    return data;
  },

  async getUserTeams(userId) {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        role,
        team: teams (
          id,
          name,
          created_at
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }
};