"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0B0B0B]">
      {!isMobile && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-h-screen ${
          isMobile ? "ml-0 pb-16" : sidebarCollapsed ? "ml-[80px]" : "ml-[240px]"
        }`}
      >
        <main className="flex-1 px-5 py-4 md:px-6 md:py-6">{children}</main>
      </div>
      {isMobile && (
        <Sidebar
          collapsed={false}
          onToggle={() => {}}
          mobile
        />
      )}
    </div>
  );
}
