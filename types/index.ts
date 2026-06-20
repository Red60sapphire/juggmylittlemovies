export interface Movie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  genre_ids?: number[];
}

export interface TMDBResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface VideoSource {
  name: string;
  url: string;
  type: "embed" | "direct";
  sandbox?: boolean;
}

export interface WatchHistory {
  id: string;
  movie_id: number;
  title: string;
  poster_path: string | null;
  progress: number;
  duration: number;
  watched_at: string;
}

export interface WatchlistItem {
  id: string;
  movie_id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  added_at: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Trailer {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface WatchParty {
  id: string;
  host_id: string;
  movie_id: number;
  movie_title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  season_number: number | null;
  episode_number: number | null;
  is_tv: boolean;
  invite_code: string;
  status: "waiting" | "playing" | "ended";
  current_time: number;
  is_paused: boolean;
  created_at: string;
}

export interface WatchPartyMember {
  id: string;
  party_id: string;
  user_id: string;
  display_name: string | null;
  joined_at: string;
}

export interface MovieDetails {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
  status?: string;
  production_companies?: { id: number; name: string; logo_path: string | null }[];
  credits?: { cast: CastMember[] };
  videos?: { results: Trailer[] };
}
