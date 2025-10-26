-- Seed data for 13U Tracker
-- Run this after running init.sql

-- Create a sample team
insert into teams (id, name) values
  ('11111111-1111-1111-1111-111111111111', 'Sample Hawks')
on conflict do nothing;

-- Create sample players (no user_id set yet)
insert into players (id, team_id, name, number, avatar_url, streak_days) values
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Evan R.', 3, 'https://api.dicebear.com/7.x/identicon/svg?seed=Evan', 2),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Malik S.', 10, 'https://api.dicebear.com/7.x/identicon/svg?seed=Malik', 4),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Diego M.', 22, 'https://api.dicebear.com/7.x/identicon/svg?seed=Diego', 1)
on conflict do nothing;

-- Create sample goals (player goals)
insert into goals (id, team_id, player_id, is_team_goal, created_by, type, title, weekly_target, description) values
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', false, null, 'Skill', 'Improve exit velo to 70+ mph', 3, 'Work on tee and front toss'),
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', false, null, 'Athletic', 'Mobility 2x per week', 2, 'Follow mobility routine')
on conflict do nothing;

-- Create sample team-wide goal
insert into goals (id, team_id, is_team_goal, created_by, type, title, weekly_target, description) values
  ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', true, null, 'Character', 'Wall Ball 100/day', 7, 'Daily wall ball challenge')
on conflict do nothing;

-- Sample sessions
insert into sessions (id, player_id, type, minutes, note) values
  ('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', 'Hitting', 25, 'Tee + front toss'),
  ('99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', 'Workout', 30, 'Mobility workout')
on conflict do nothing;

-- Sample feed
insert into feed (id, team_id, author_id, type, text) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', null, 'message', 'This week: Wall Ball 100/day + 2 mobility sessions!'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', null, 'kudos', '👏 Kudos to Evan for staying late to help with tee work!')
on conflict do nothing;

-- Note: author_id and created_by are left null for seeded data. After creating a test user by signing in, you can update team_members and author_id to link real users.
