"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#0B0B0B] max-w-[100vw]">
      <div className="hidden md:flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-h-screen pb-[72px] md:pb-0 min-w-0 ${
          sidebarCollapsed ? "md:ml-[80px]" : "md:ml-[240px]"
        }`}
      >
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6 w-full min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <div className="md:hidden">
        <Sidebar collapsed={false} onToggle={() => {}} mobile />
      </div>
    </div>
  );
}
