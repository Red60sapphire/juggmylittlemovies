-- Run this in Supabase SQL Editor

-- Watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movie_id bigint NOT NULL,
  title text NOT NULL,
  poster_path text,
  vote_average text,
  added_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlist"
  ON watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist"
  ON watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist"
  ON watchlist FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX watchlist_user_idx ON watchlist(user_id);

-- Watch history table
CREATE TABLE IF NOT EXISTS watch_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movie_id bigint NOT NULL,
  title text NOT NULL,
  poster_path text,
  progress integer DEFAULT 0,
  duration integer DEFAULT 0,
  watched_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history"
  ON watch_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON watch_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own history"
  ON watch_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
  ON watch_history FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX watch_history_user_idx ON watch_history(user_id);
