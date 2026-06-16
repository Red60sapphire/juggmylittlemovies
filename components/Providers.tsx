"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0B0B0B]">
      <div className="hidden md:flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-h-screen pb-[72px] md:pb-0 ${
          sidebarCollapsed ? "md:ml-[80px]" : "md:ml-[240px]"
        }`}
      >
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">{children}</main>
      </div>
      <div className="md:hidden">
        <Sidebar collapsed={false} onToggle={() => {}} mobile />
      </div>
    </div>
  );
}
