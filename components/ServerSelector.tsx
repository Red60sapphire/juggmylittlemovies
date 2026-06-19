"use client";

import { useState } from "react";
import type { VideoSource } from "@/types";
import { Monitor, Check } from "lucide-react";

interface Props {
  servers: VideoSource[];
  onSelect: (server: VideoSource) => void;
  currentServer: VideoSource;
}

export default function ServerSelector({
  servers,
  onSelect,
  currentServer,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white transition-colors"
      >
        <Monitor className="w-4 h-4" />
        {currentServer.name}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full mt-2 left-0 z-50 w-48 bg-[#15151f] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            {servers.map((server) => (
              <button
                key={server.name}
                onClick={() => {
                  onSelect(server);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors"
              >
                <span className="flex-1 text-white/80">{server.name}</span>
                {currentServer.name === server.name && (
                  <Check className="w-4 h-4 text-purple-500" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
