"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getServersForMovie } from "@/lib/servers";
import ServerSelector from "@/components/ServerSelector";
import type { VideoSource } from "@/types";
import { Film } from "lucide-react";
import Link from "next/link";

interface MovieData {
  id: number;
  title: string;
  name?: string;
  backdrop_path: string | null;
}

export default function WatchPage() {
  const params = useParams();
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [servers, setServers] = useState<VideoSource[]>([]);
  const [currentServer, setCurrentServer] = useState<VideoSource | null>(null);

  useEffect(() => {
    const id = parseInt(params.id as string);
    setServers(getServersForMovie(id));
    setCurrentServer(getServersForMovie(id)[0]);

    fetch(`/api/tmdb/movie/${id}`)
      .then((r) => r.json())
      .then(setMovie)
      .catch(() => {});
  }, [params.id]);

  if (!movie || !currentServer) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">
            {movie.title || movie.name}
          </h1>
          <p className="text-sm text-white/40">Now Playing</p>
        </div>
        <ServerSelector
          servers={servers}
          currentServer={currentServer}
          onSelect={setCurrentServer}
        />
      </div>

      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black mb-6">
        <iframe
          key={currentServer.url}
          src={currentServer.url}
          className="w-full h-full"
          allowFullScreen
          referrerPolicy="no-referrer"
          allow="autoplay; fullscreen"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {servers.map((server) => (
          <button
            key={server.name}
            onClick={() => setCurrentServer(server)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              currentServer.name === server.name
                ? "bg-purple-600 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            <Film className="w-3 h-3" />
            {server.name}
          </button>
        ))}
      </div>
    </div>
  );
}
