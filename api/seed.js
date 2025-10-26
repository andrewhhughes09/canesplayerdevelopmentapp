import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Protect endpoint with a secret header
  const seedSecret = process.env.SEED_SECRET;
  const provided = req.headers['x-seed-secret'] || req.query.seed_secret;
  if (!seedSecret || provided !== seedSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Missing Supabase service key or URL in env' });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    // Insert sample team
    await supabase.from('teams').upsert([{ id: '11111111-1111-1111-1111-111111111111', name: 'Sample Hawks' }]);

    // Insert players
    await supabase.from('players').upsert([
      { id: '22222222-2222-2222-2222-222222222222', team_id: '11111111-1111-1111-1111-111111111111', name: 'Evan R.', number: 3, avatar_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=Evan', streak_days: 2 },
      { id: '33333333-3333-3333-3333-333333333333', team_id: '11111111-1111-1111-1111-111111111111', name: 'Malik S.', number: 10, avatar_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=Malik', streak_days: 4 },
      { id: '44444444-4444-4444-4444-444444444444', team_id: '11111111-1111-1111-1111-111111111111', name: 'Diego M.', number: 22, avatar_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=Diego', streak_days: 1 }
    ]);

    // Insert goals
    await supabase.from('goals').upsert([
      { id: '55555555-5555-5555-5555-555555555555', team_id: '11111111-1111-1111-1111-111111111111', player_id: '22222222-2222-2222-2222-222222222222', is_team_goal: false, created_by: null, type: 'Skill', title: 'Improve exit velo to 70+ mph', weekly_target: 3, description: 'Work on tee and front toss' },
      { id: '66666666-6666-6666-6666-666666666666', team_id: '11111111-1111-1111-1111-111111111111', player_id: '33333333-3333-3333-3333-333333333333', is_team_goal: false, created_by: null, type: 'Athletic', title: 'Mobility 2x per week', weekly_target: 2, description: 'Follow mobility routine' },
      { id: '77777777-7777-7777-7777-777777777777', team_id: '11111111-1111-1111-1111-111111111111', player_id: null, is_team_goal: true, created_by: null, type: 'Character', title: 'Wall Ball 100/day', weekly_target: 7, description: 'Daily wall ball challenge' }
    ]);

    // Insert sessions
    await supabase.from('sessions').upsert([
      { id: '88888888-8888-8888-8888-888888888888', player_id: '22222222-2222-2222-2222-222222222222', type: 'Hitting', minutes: 25, note: 'Tee + front toss' },
      { id: '99999999-9999-9999-9999-999999999999', player_id: '33333333-3333-3333-3333-333333333333', type: 'Workout', minutes: 30, note: 'Mobility workout' }
    ]);

    // Insert feed
    await supabase.from('feed').upsert([
      { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', team_id: '11111111-1111-1111-1111-111111111111', author_id: null, type: 'message', text: 'This week: Wall Ball 100/day + 2 mobility sessions!' },
      { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', team_id: '11111111-1111-1111-1111-111111111111', author_id: null, type: 'kudos', text: '👏 Kudos to Evan for staying late to help with tee work!' }
    ]);

    return res.status(200).json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Seed error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
