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

-- Watch party table
CREATE TABLE IF NOT EXISTS watch_parties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movie_id bigint NOT NULL,
  movie_title text NOT NULL,
  poster_path text,
  backdrop_path text,
  season_number integer,
  episode_number integer,
  is_tv boolean DEFAULT false,
  invite_code text UNIQUE NOT NULL,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'ended')),
  current_time integer DEFAULT 0,
  is_paused boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE watch_parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view watch parties"
  ON watch_parties FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create parties"
  ON watch_parties FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update party"
  ON watch_parties FOR UPDATE
  USING (auth.uid() = host_id);

CREATE POLICY "Host can delete party"
  ON watch_parties FOR DELETE
  USING (auth.uid() = host_id);

CREATE INDEX watch_parties_invite_code_idx ON watch_parties(invite_code);
CREATE INDEX watch_parties_host_idx ON watch_parties(host_id);

-- Watch party members table
CREATE TABLE IF NOT EXISTS watch_party_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id uuid REFERENCES watch_parties(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name text,
  joined_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(party_id, user_id)
);

ALTER TABLE watch_party_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view party members"
  ON watch_party_members FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can join parties"
  ON watch_party_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can leave parties"
  ON watch_party_members FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX watch_party_members_party_idx ON watch_party_members(party_id);
