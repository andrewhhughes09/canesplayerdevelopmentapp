-- 13U Tracker Supabase schema + RLS policies
-- Run this in the Supabase SQL editor (Project -> SQL) or via the supabase CLI.

-- enable uuid generation extension if not already
create extension if not exists "uuid-ossp";

-- Teams table
create table if not exists teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now()
);
alter table teams enable row level security;

-- Team Members
create table if not exists team_members (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text check (role in ('coach', 'player', 'parent')),
  created_at timestamptz default now(),
  unique (team_id, user_id)
);
alter table team_members enable row level security;

-- Players
create table if not exists players (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams on delete cascade,
  user_id uuid references auth.users,
  name text not null,
  number integer,
  avatar_url text,
  streak_days integer default 0,
  created_at timestamptz default now()
);
alter table players enable row level security;

-- Goals (team goals or player goals)
-- If team_goal is true, player_id is null and team_id should be used instead.
create table if not exists goals (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams on delete cascade,
  player_id uuid references players on delete cascade,
  is_team_goal boolean default false,
  created_by uuid references auth.users,
  type text check (type in ('Skill', 'Athletic', 'Character', 'Other')),
  title text not null,
  description text,
  weekly_target integer default 0,
  max_per_player integer,
  active boolean default true,
  created_at timestamptz default now()
);
alter table goals enable row level security;

-- Goal progress (per-player, per-week)
create table if not exists goal_progress (
  id uuid primary key default uuid_generate_v4(),
  goal_id uuid references goals on delete cascade,
  player_id uuid references players on delete cascade,
  week_start date not null,
  completed_count integer default 0,
  created_at timestamptz default now(),
  unique (goal_id, player_id, week_start)
);
alter table goal_progress enable row level security;

-- Sessions
create table if not exists sessions (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid references players on delete cascade,
  type text not null,
  minutes integer not null,
  note text,
  created_at timestamptz default now()
);
alter table sessions enable row level security;

-- Feed
create table if not exists feed (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams on delete cascade,
  author_id uuid references auth.users,
  type text check (type in ('message', 'kudos')),
  text text not null,
  created_at timestamptz default now()
);
alter table feed enable row level security;

-- INDEXES (helpful for queries)
create index if not exists idx_goal_progress_week on goal_progress (week_start);
create index if not exists idx_sessions_player_created on sessions (player_id, created_at desc);
create index if not exists idx_feed_team_created on feed (team_id, created_at desc);

-- ROW LEVEL SECURITY POLICIES

create policy "Teams: members can view" on teams
  for select using (
    exists (
      select 1 from team_members tm where tm.team_id = teams.id and tm.user_id = auth.uid()
    )
  );

create policy "TeamMembers: members can view" on team_members
  for select using (
    exists (
      select 1 from team_members tm where tm.team_id = team_members.team_id and tm.user_id = auth.uid()
    )
  );

create policy "TeamMembers: coaches manage" on team_members
  for all using (
    exists (
      select 1 from team_members tm where tm.team_id = team_members.team_id and tm.user_id = auth.uid() and tm.role = 'coach'
    )
  );

create policy "Players: team members view" on players
  for select using (
    exists (
      select 1 from team_members tm where tm.team_id = players.team_id and tm.user_id = auth.uid()
    )
  );

create policy "Players: player update own" on players
  for update using (
    players.user_id = auth.uid()
  ) with check (
    players.user_id = auth.uid()
  );

create policy "Goals: team members view" on goals
  for select using (
    exists (
      select 1 from team_members tm where tm.team_id = goals.team_id and tm.user_id = auth.uid()
    )
  );

create policy "Goals: insert allowed for team coaches or player owners" on goals
  for insert with check (
    (
      -- team goal insertion: user must be coach of team
      (goals.is_team_goal = true and exists (select 1 from team_members tm where tm.team_id = goals.team_id and tm.user_id = auth.uid() and tm.role = 'coach'))
      or
      -- individual goal insertion: player must be the user (player creating their own) or a coach for that player's team
      (goals.is_team_goal = false and (
        (exists (select 1 from players p where p.id = goals.player_id and p.user_id = auth.uid()))
        or
        (exists (select 1 from players p join team_members tm on tm.team_id = p.team_id where p.id = goals.player_id and tm.user_id = auth.uid() and tm.role = 'coach'))
      ))
    )
  );

create policy "GoalProgress: team members view" on goal_progress
  for select using (
    exists (
      select 1 from goals g join players p on p.id = g.player_id join team_members tm on tm.team_id = p.team_id where g.id = goal_progress.goal_id and tm.user_id = auth.uid()
    )
  );

-- Goal progress: players can insert their own progress (check ensures player owns player_id)
create policy "GoalProgress: player insert own" on goal_progress
  for insert with check (
    exists (
      select 1 from players p where p.id = goal_progress.player_id and p.user_id = auth.uid()
    )
  );

-- Goal progress: players can update their own progress (using restricts which rows are visible for update,
-- with check ensures updated values still belong to the player)
create policy "GoalProgress: player update own" on goal_progress
  for update using (
    exists (
      select 1 from players p where p.id = goal_progress.player_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from players p where p.id = goal_progress.player_id and p.user_id = auth.uid()
    )
  );

create policy "Sessions: team members view" on sessions
  for select using (
    exists (
      select 1 from players p join team_members tm on tm.team_id = p.team_id where p.id = sessions.player_id and tm.user_id = auth.uid()
    )
  );

create policy "Sessions: players insert own" on sessions
  for insert with check (
    exists (
      select 1 from players p where p.id = sessions.player_id and p.user_id = auth.uid()
    )
  );

create policy "Feed: members view" on feed
  for select using (
    exists (
      select 1 from team_members tm where tm.team_id = feed.team_id and tm.user_id = auth.uid()
    )
  );

create policy "Feed: members insert" on feed
  for insert with check (
    exists (
      select 1 from team_members tm where tm.team_id = feed.team_id and tm.user_id = auth.uid()
    ) and auth.uid() = feed.author_id
  );

-- End of init.sql
