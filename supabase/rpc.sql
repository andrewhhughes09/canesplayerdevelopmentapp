-- RPC: increment_goal_progress
-- Creates a unique index (if missing) and a plpgsql function that
-- atomically inserts or increments a weekly progress row for a goal.

-- Ensure uniqueness so ON CONFLICT works as intended
CREATE UNIQUE INDEX IF NOT EXISTS idx_goal_progress_unique ON goal_progress(goal_id, player_id, week_start);

CREATE OR REPLACE FUNCTION increment_goal_progress(
  p_goal uuid,
  p_player uuid,
  p_week date,
  p_max int DEFAULT 9999
)
RETURNS SETOF goal_progress
LANGUAGE plpgsql
AS $$
BEGIN
  -- Return the inserted or updated row(s) from goal_progress.
  RETURN QUERY
  INSERT INTO goal_progress (goal_id, player_id, week_start, completed_count)
  VALUES (p_goal, p_player, p_week, 1)
  ON CONFLICT (goal_id, player_id, week_start) DO UPDATE
    SET completed_count = LEAST(goal_progress.completed_count + 1, p_max)
  RETURNING *;
END;
$$;

-- NOTE: Run this file in Supabase SQL editor. Do NOT paste JS files here.
