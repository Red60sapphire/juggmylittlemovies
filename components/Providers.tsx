"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import MobileHeader from "./MobileHeader";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background max-w-[100vw]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-h-screen min-w-0 ${
          sidebarCollapsed ? "md:ml-[80px]" : "md:ml-[240px]"
        }`}
      >
        {/* Mobile top header */}
        <div className="md:hidden">
          <MobileHeader />
        </div>

        <div className="flex-1 px-4 py-4 md:px-6 md:py-6 w-full min-w-0 pt-20 md:pt-6 pb-24 md:pb-6">
          {children}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}