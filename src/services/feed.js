import { supabase } from '../lib/supabase';

export const feedService = {
  async getFeed(teamId, limit = 50) {
    const { data, error } = await supabase
      .from('feed')
      .select(`
        *,
        author:author_id (
          email,
          user_metadata
        )
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async addPost(teamId, authorId, { type, text }) {
    const { data, error } = await supabase
      .from('feed')
      .insert([{
        team_id: teamId,
        author_id: authorId,
        type,
        text
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Subscribe to real-time feed updates
  subscribeToFeed(teamId, callback) {
    return supabase
      .channel(`feed:${teamId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'feed',
        filter: `team_id=eq.${teamId}`
      }, callback)
      .subscribe();
  }
};