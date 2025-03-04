
-- Create the app_usage_leaderboard table
CREATE TABLE IF NOT EXISTS app_usage_leaderboard (
  id TEXT PRIMARY KEY,
  total_minutes INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on total_minutes for faster leaderboard queries
CREATE INDEX IF NOT EXISTS app_usage_leaderboard_total_minutes_idx ON app_usage_leaderboard(total_minutes DESC);

-- Create or replace RLS policies for the table
ALTER TABLE app_usage_leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the leaderboard
CREATE POLICY "Allow public read access to leaderboard" 
  ON app_usage_leaderboard 
  FOR SELECT 
  USING (true);

-- Allow anyone to insert into the leaderboard
CREATE POLICY "Allow users to insert into leaderboard" 
  ON app_usage_leaderboard 
  FOR INSERT 
  WITH CHECK (true);

-- Allow anyone to update the leaderboard
CREATE POLICY "Allow users to update leaderboard" 
  ON app_usage_leaderboard 
  FOR UPDATE 
  USING (true);
