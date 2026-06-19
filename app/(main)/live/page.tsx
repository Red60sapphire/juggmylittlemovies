"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, Play, Share2, Tv, Clock, Film, Trophy, ExternalLink } from "lucide-react";

interface TimelineEntry {
  start: string;
  stop: string;
  title: string;
  _id: string;
  episode?: {
    name: string;
    rating: string;
    genre: string;
    description: string;
    slug: string;
    season?: number;
    episode?: number;
  };
}

interface Channel {
  id: string;
  name: string;
  number: number;
  slug: string;
  category: string;
  summary: string;
  logo: string;
  timelines: TimelineEntry[];
}

const FLAG_MAP: Record<string, string> = {
  "un": "xx", "gb-eng": "gb", "gb-sct": "gb", "gb-wls": "gb", "gb-nir": "gb",
};

function flagUrl(code: string): string {
  const c = FLAG_MAP[code] || code;
  return `https://flagsapi.com/${c.toUpperCase()}/flat/32.png`;
}

interface WcMatch {
  id: string;
  homeName: string;
  awayName: string;
  homeCode: string;
  awayCode: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  minute: number | null;
  kickoffTs: number;
  group: string;
  venue: string;
  city: string;
}

const CATEGORIES = [
  "Featured", "World Cup", "Binge-worthy", "Movies", "True Crime", "News", "Sports",
  "Reality", "Classics", "Adrenaline & Sci-Fi", "Comedy",
  "Daytime TV & Games", "Explore", "Food", "Kids & Family",
  "Entertainment", "Music", "Anime",
];

const PX_PER_MIN = 2.5;
const HOUR_WIDTH = 60 * PX_PER_MIN;
const START_OFFSET_HOURS = -1;
const END_OFFSET_HOURS = 5;
const TOTAL_HOURS = END_OFFSET_HOURS - START_OFFSET_HOURS;
const TIMELINE_WIDTH = TOTAL_HOURS * 60 * PX_PER_MIN;

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatShortTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false });
}

function getTimelineWindow() {
  const now = new Date();
  const start = new Date(now.getTime() + START_OFFSET_HOURS * 3600000);
  const end = new Date(now.getTime() + END_OFFSET_HOURS * 3600000);
  return { now, start, end };
}

function getBlockStyle(timeline: TimelineEntry, windowStart: Date, windowEnd: Date) {
  const blockStart = new Date(timeline.start).getTime();
  const blockEnd = new Date(timeline.stop).getTime();
  const ws = windowStart.getTime();
  const we = windowEnd.getTime();

  const left = Math.max(0, (blockStart - ws) / 60000 * PX_PER_MIN);
  const right = Math.min(TIMELINE_WIDTH, (blockEnd - ws) / 60000 * PX_PER_MIN);
  const width = Math.max(20, right - left - 2);
  return { left, width };
}

function getNowIndicator(now: Date, windowStart: Date): number {
  return Math.max(0, (now.getTime() - windowStart.getTime()) / 60000 * PX_PER_MIN);
}

function getCurrentProgram(timelines: TimelineEntry[]): TimelineEntry | null {
  const now = new Date().getTime();
  return timelines.find((t) => {
    const s = new Date(t.start).getTime();
    const e = new Date(t.stop).getTime();
    return now >= s && now < e;
  }) || null;
}

export default function LivePage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("Featured");
  const [featuredSlug, setFeaturedSlug] = useState<string | null>(null);
  const [wcData, setWcData] = useState<{ live: WcMatch[]; scheduled: WcMatch[]; streamUrl: string } | null>(null);
  const [wcLoading, setWcLoading] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const catScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/live/epg");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        const chs = data.channels || [];
        setChannels(chs);
        if (chs.length > 0) setFeaturedSlug(chs[0].slug);
      } catch {
        setError("Could not load guide. Try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (activeCategory !== "World Cup" || wcData) return;
    async function fetchWc() {
      setWcLoading(true);
      try {
        const res = await fetch("/api/live/worldcup");
        if (res.ok) {
          const data = await res.json();
          setWcData(data);
        }
      } catch {} finally {
        setWcLoading(false);
      }
    }
    fetchWc();
  }, [activeCategory, wcData]);

  const featuredChannel = useMemo(() => {
    if (!featuredSlug) return channels[0] || null;
    return channels.find((c) => c.slug === featuredSlug) || channels[0] || null;
  }, [channels, featuredSlug]);

  const currentProgram = useMemo(() => {
    if (!featuredChannel) return null;
    return getCurrentProgram(featuredChannel.timelines);
  }, [featuredChannel]);

  const windowTimes = useMemo(() => getTimelineWindow(), []);

  const categories = useMemo(() => {
    const cats = new Set(channels.map((c) => c.category));
    return CATEGORIES.filter((c) => c === "Featured" || c === "World Cup" || cats.has(c));
  }, [channels]);

  const filteredChannels = useMemo(() => {
    if (activeCategory === "Featured") {
      return channels.slice(0, 40);
    }
    return channels.filter((c) => c.category === activeCategory);
  }, [channels, activeCategory]);

  const scrollTimeline = useCallback((direction: "left" | "right") => {
    if (timelineRef.current) {
      const amount = 400;
      timelineRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  }, []);

  const handleShare = useCallback(() => {
    if (!featuredChannel) return;
    const url = `${window.location.origin}/live/${featuredChannel.slug}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setShareToast(true);
    setTimeout(() => setShareToast(false), 1800);
  }, [featuredChannel]);

  if (loading) {
    return (
      <main id="main-content" className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm text-muted">Loading guide...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main id="main-content" className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center text-muted gap-3">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors">Retry</button>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-screen" style={{ background: "radial-gradient(circle at top center, rgba(139,92,246,0.06), transparent 40%), #050505" }}>
      {/* Featured Channel Header */}
      <AnimatePresence mode="wait">
        {featuredChannel && (
          <motion.div
            key={featuredChannel.slug}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-6 md:pt-12 md:pb-10">
              <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                {/* Artwork/Logo area */}
                <div className="w-full md:w-80 lg:w-96 flex-shrink-0">
                  <div className="aspect-video rounded-2xl bg-gradient-to-br from-accent/10 via-surface to-surface border border-white/5 overflow-hidden flex items-center justify-center">
                    {featuredChannel.logo ? (
                      <img src={featuredChannel.logo} alt={featuredChannel.name} className="max-h-24 max-w-[80%] object-contain" />
                    ) : (
                      <Tv className="w-16 h-16 text-white/10" />
                    )}
                  </div>
                  {/* Share button */}
                  <div className="flex items-center gap-2 mt-3">
                    <Link
                      href={`/live/${featuredChannel.slug}`}
                      className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-black font-semibold text-sm rounded-xl transition-all active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      Watch Now
                    </Link>
                    <button onClick={handleShare} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-muted hover:text-white transition-all relative">
                      <Share2 className="w-4 h-4" />
                      {shareToast && (
                        <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] text-accent whitespace-nowrap bg-black/90 px-2 py-0.5 rounded-full shadow-lg animate-in fade-in">Link copied!</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Channel info */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-accent/80 bg-accent/10 px-2.5 py-1 rounded-md">
                      {featuredChannel.category}
                    </span>
                    <span className="text-[11px] text-muted bg-white/5 px-2 py-1 rounded-md font-mono">
                      CH {featuredChannel.number}
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-1">
                    {featuredChannel.name}
                  </h1>
                  {currentProgram && (
                    <>
                      <h2 className="text-base md:text-xl font-semibold text-white/80 mb-1">
                        {currentProgram.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted mb-2">
                        {currentProgram.episode?.rating && (
                          <span className="px-1.5 py-0.5 border border-white/10 rounded text-[10px] font-medium">{currentProgram.episode.rating}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(currentProgram.start)} - {formatTime(currentProgram.stop)}
                        </span>
                        {currentProgram.episode?.genre && (
                          <span className="flex items-center gap-1">
                            <Film className="w-3 h-3" />
                            {currentProgram.episode.genre}
                          </span>
                        )}
                      </div>
                      {currentProgram.episode?.description && (
                        <p className="text-sm text-white/50 line-clamp-2 max-w-2xl leading-relaxed">
                          {currentProgram.episode.description}
                        </p>
                      )}
                    </>
                  )}
                  {!currentProgram && featuredChannel.summary && (
                    <p className="text-sm text-white/50 line-clamp-2 max-w-2xl leading-relaxed mt-2">
                      {featuredChannel.summary}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Navigation */}
      <div className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div
            ref={catScrollRef}
            className="flex items-center gap-1.5 overflow-x-auto py-3 scrollbar-hide"
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-90 flex-shrink-0 ${
                    isActive
                      ? "bg-accent text-black shadow-lg shadow-accent/20"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5"
                  }`}
                >
                  {cat === "World Cup" && <Trophy className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* World Cup View */}
      {activeCategory === "World Cup" ? (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {wcLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : wcData ? (
            <>
              {/* Live match */}
              {wcData.live.length > 0 && wcData.live.map((match) => (
                <div key={match.id} className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Live Now</span>
                  </div>
                  <div className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/5 via-[#0a0a0a] to-[#0a0a0a] overflow-hidden">
                    <div className="aspect-video bg-black relative">
                      <Link
                        href={`/live/worldcup`}
                        className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                      >
                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all group-active:scale-90">
                          <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                        <div className="absolute top-4 left-4 bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-full">
                          <span className="text-xs font-bold text-green-400">{match.minute}&apos;</span>
                        </div>
                      </Link>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img src={flagUrl(match.homeCode)} alt="" className="w-10 h-7 rounded object-cover border border-white/10" />
                          <span className="font-bold text-lg text-white truncate">{match.homeName}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-3xl font-black text-white font-mono">{match.homeScore ?? "-"}</span>
                          <span className="text-sm text-muted">:</span>
                          <span className="text-3xl font-black text-white font-mono">{match.awayScore ?? "-"}</span>
                        </div>
                        <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
                          <span className="font-bold text-lg text-white truncate">{match.awayName}</span>
                          <img src={flagUrl(match.awayCode)} alt="" className="w-10 h-7 rounded object-cover border border-white/10" />
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-3 mt-3 text-xs text-muted">
                        <span>Group {match.group}</span>
                        {match.venue && <><span className="w-1 h-1 rounded-full bg-white/10" /><span>{match.venue}</span></>}
                      </div>
                      <div className="mt-4 flex justify-center">
                        <Link
                          href={`/live/worldcup`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold text-sm rounded-xl transition-all active:scale-90"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          Watch Live
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* No live match */}
              {wcData.live.length === 0 && (
                <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-8 text-center mb-8">
                  <Trophy className="w-12 h-12 text-muted mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white/80 mb-1">No Live Match</h3>
                  <p className="text-sm text-muted">Check back when the next match kicks off</p>
                </div>
              )}

              {/* Upcoming matches */}
              {wcData.scheduled.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-white/80 mb-4">Upcoming Matches</h3>
                  <div className="grid gap-3">
                    {wcData.scheduled.slice(0, 10).map((match) => {
                      const kickoff = new Date(match.kickoffTs * 1000);
                      const now = new Date();
                      const diff = kickoff.getTime() - now.getTime();
                      const hours = Math.floor(diff / 3600000);
                      const mins = Math.floor((diff % 3600000) / 60000);
                      return (
                        <div key={match.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all active:scale-[0.99]">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img src={flagUrl(match.homeCode)} alt="" className="w-7 h-5 rounded object-cover border border-white/10" />
                            <span className="text-sm font-medium text-white/80 truncate">{match.homeName}</span>
                          </div>
                          <div className="text-center flex-shrink-0">
                            <span className="text-xs font-bold text-muted uppercase block">Group {match.group}</span>
                            <span className="text-[10px] text-accent font-mono">{hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}</span>
                          </div>
                          <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
                            <span className="text-sm font-medium text-white/80 truncate">{match.awayName}</span>
                            <img src={flagUrl(match.awayCode)} alt="" className="w-7 h-5 rounded object-cover border border-white/10" />
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-20 text-muted text-sm">
              Could not load World Cup data
            </div>
          )}
        </div>
      ) : (
        /* Timeline TV Guide */
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/80">TV Guide</h2>
            <div className="flex items-center gap-2">
              <p className="text-[11px] text-muted">{filteredChannels.length} channels</p>
              <button
                onClick={() => setActiveCategory("Featured")}
                className="text-[11px] text-accent/70 hover:text-accent transition-colors"
              >
                Show all
              </button>
            </div>
          </div>

          {/* Guide container with sticky channel column */}
          <div className="rounded-2xl border border-white/5 overflow-hidden bg-[#0a0a0a]">
            {/* Timeline header */}
            <div className="flex border-b border-white/5">
              <div className="w-16 md:w-20 flex-shrink-0 bg-[#080808]" />
              <div className="flex-1 overflow-hidden">
                <div className="flex" style={{ width: TIMELINE_WIDTH }}>
                  {Array.from({ length: TOTAL_HOURS }).map((_, i) => {
                    const hourDate = new Date(windowTimes.start.getTime() + i * 3600000);
                    const hourLabel = hourDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false });
                    const isNow = hourDate.getHours() === new Date().getHours();
                    return (
                      <div
                        key={i}
                        className="flex-shrink-0 py-2 px-3 border-r border-white/5 text-[11px] font-medium text-muted"
                        style={{ width: HOUR_WIDTH }}
                      >
                        <span className={isNow ? "text-accent" : ""}>{hourLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Guide body */}
            <div className="relative">
              {/* Channel rows container - vertical scroll */}
              <div className="max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-hide">
                {filteredChannels.map((ch, idx) => (
                  <GuideRow
                    key={ch.id}
                    channel={ch}
                    windowStart={windowTimes.start}
                    windowEnd={windowTimes.end}
                    now={windowTimes.now}
                    featuredSlug={featuredSlug}
                    onSelect={() => setFeaturedSlug(ch.slug)}
                    timelineRef={timelineRef}
                    isAlt={idx % 2 === 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function GuideRow({
  channel,
  windowStart,
  windowEnd,
  now,
  featuredSlug,
  onSelect,
  timelineRef,
  isAlt,
}: {
  channel: Channel;
  windowStart: Date;
  windowEnd: Date;
  now: Date;
  featuredSlug: string | null;
  onSelect: () => void;
  timelineRef: React.RefObject<HTMLDivElement | null>;
  isAlt: boolean;
}) {
  const isFeatured = featuredSlug === channel.slug;
  const nowPos = getNowIndicator(now, windowStart);

  return (
    <Link
      href={`/live/${channel.slug}`}
      className={`flex group border-b border-white/[0.03] transition-colors ${
        isFeatured ? "bg-accent/[0.04]" : isAlt ? "bg-white/[0.01]" : ""
      } hover:bg-white/[0.03]`}
      onClick={(e) => {
        e.preventDefault();
        onSelect();
      }}
    >
      {/* Channel logo - fixed left column */}
      <div className={`w-16 md:w-20 flex-shrink-0 flex items-center justify-center p-2 border-r border-white/5 transition-colors ${
        isFeatured ? "bg-accent/[0.06]" : "bg-[#080808]"
      }`}>
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="max-h-8 max-w-full object-contain opacity-70 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <span className="text-xs font-bold text-white/20 group-hover:text-white/40 transition-colors">
            {channel.number}
          </span>
        )}
      </div>

      {/* Timeline blocks - horizontally scrollable */}
      <div
        ref={timelineRef}
        className="flex-1 overflow-x-auto scrollbar-hide relative"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="relative" style={{ width: TIMELINE_WIDTH, height: 60 }}>
          {/* Now indicator line */}
          <div
            className="absolute top-0 bottom-0 w-px bg-accent/60 z-10 pointer-events-none"
            style={{ left: nowPos }}
          >
            <div className="w-2 h-2 rounded-full bg-accent -ml-[3.5px] -mt-0.5" />
          </div>

          {/* Program blocks */}
          {channel.timelines.map((tl) => {
            const { left, width } = getBlockStyle(tl, windowStart, windowEnd);
            if (width < 10) return null;
            const isNow = new Date(tl.start).getTime() <= now.getTime() && new Date(tl.stop).getTime() > now.getTime();
            return (
              <div
                key={tl._id}
                className={`absolute top-2 bottom-2 rounded-lg px-2.5 py-1.5 flex flex-col justify-center overflow-hidden transition-all cursor-pointer border ${
                  isNow
                    ? "bg-accent/10 border-accent/20 group-hover:bg-accent/15"
                    : "bg-white/[0.04] border-white/[0.05] group-hover:bg-white/[0.08] group-hover:-translate-y-[1px]"
                }`}
                style={{ left, width }}
              >
                <p className={`text-[11px] font-semibold leading-tight truncate ${
                  isNow ? "text-white" : "text-white/80"
                }`}>
                  {tl.title}
                </p>
                <p className="text-[10px] text-muted/70 truncate mt-0.5">
                  {formatShortTime(tl.start)} - {formatShortTime(tl.stop)}
                </p>
              </div>
            );
          })}

          {/* Empty state for no timeline data */}
          {(!channel.timelines || channel.timelines.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] text-white/10">No schedule data</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
