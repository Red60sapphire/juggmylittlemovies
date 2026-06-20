"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, LogIn, LogOut, X, TrendingUp, UserRound } from "lucide-react";

interface SearchSuggestion {
  id: number;
  title?: string;
  name?: string;
  media_type: string;
  poster_path: string | null;
}

interface SessionUser {
  id: string;
  username: string;
}

export default function Navbar() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [focused, setFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { user: SessionUser | null }) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions((data.results || []).slice(0, 6));
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
      setFocused(false);
      inputRef.current?.blur();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06]">
      <div ref={searchRef} className="relative max-w-md w-full">
        <form onSubmit={handleSubmit}>
          <div
            className={`flex items-center gap-2 bg-white/[0.05] backdrop-blur-xl border rounded-2xl px-4 py-2.5 transition-all ${
              focused
                ? "border-accent/50 bg-white/[0.08] shadow-lg shadow-accent/5"
                : "border-white/[0.08] hover:border-white/20"
            }`}
          >
            <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => { setShowSuggestions(true); setFocused(true); }}
              onKeyDown={handleKeyDown}
              placeholder="Search movies, shows..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(""); setSuggestions([]); }}>
                <X className="w-4 h-4 text-white/30 hover:text-white/60" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex text-[10px] text-white/20 border border-white/[0.08] rounded px-1.5 py-0.5 font-mono">
              ^K
            </kbd>
          </div>
        </form>

        {showSuggestions && query.length >= 2 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-[#0a0a10] backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50">
            {suggestions.length > 0 ? (
              <div>
                <div className="px-4 py-2 text-[11px] text-white/30 uppercase tracking-wider font-semibold">
                  Suggestions
                </div>
                {suggestions.map((s) => (
                  <Link
                    key={`${s.media_type}-${s.id}`}
                    href={`/watch/${s.id}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="w-8 h-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                      {s.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${s.poster_path}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/90 truncate">
                        {s.title || s.name}
                      </p>
                      <p className="text-xs text-white/30 capitalize">{s.media_type}</p>
                    </div>
                  </Link>
                ))}
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-2 px-4 py-3 border-t border-white/[0.06] text-sm text-accent hover:bg-white/[0.04] transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  View all results
                </Link>
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-white/30">
                No results found
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <Link
              href="/watchlist"
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              My List
            </Link>
            <Link
              href="/settings"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] text-sm text-white/70 hover:text-white hover:bg-white/[0.07] transition-colors"
            >
              <UserRound className="w-4 h-4" />
              {user.username}
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white/50 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        ) : authReady ? (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-accent/20"
            >
              <LogIn className="w-4 h-4" />
              Log In
            </Link>
            <Link
              href="/signup"
              className="hidden sm:block px-4 py-2 text-sm text-white/50 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all"
            >
              Sign Up
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
}
