"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0B0B0B]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-h-screen ${
          sidebarCollapsed ? "ml-[80px]" : "ml-[240px]"
        }`}
      >
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
