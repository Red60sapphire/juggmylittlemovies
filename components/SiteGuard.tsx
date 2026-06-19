"use client";

import { useEffect } from "react";

/**
 * VidZen SiteGuard — DevTools Deterrent v1.0
 * Based on: luizbizzio/siteguard (Apache-2.0)
 * Modified: Blocks streaming instead of clearing page
 */
export default function SiteGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let blocked = false;

    const setBlocked = (state: boolean) => {
      if (blocked === state) return;
      blocked = state;
      window.dispatchEvent(
        new CustomEvent("siteguard-change", { detail: { blocked: state } })
      );
    };

    const detect = () => {
      // 1. Size Check
      const threshold = 160;
      const isWidthDev = window.outerWidth - window.innerWidth > threshold;
      const isHeightDev = window.outerHeight - window.innerHeight > threshold;
      if (isWidthDev || isHeightDev) {
        setBlocked(true);
        return;
      }

      // 2. Debugger/Timing Check
      const start = performance.now();
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        setBlocked(true);
        return;
      }

      setBlocked(false);
    };

    // Run check periodically
    const interval = setInterval(detect, 1000);

    // Also run on resize
    window.addEventListener("resize", detect);

    // Initial check
    detect();

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", detect);
    };
  }, []);

  return null;
}
