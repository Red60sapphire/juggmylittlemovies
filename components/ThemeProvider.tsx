"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const THEMES = ["zinc", "slate", "stone", "neutral", "midnight", "violet", "rose", "ocean", "obsidian"] as const;
type Theme = (typeof THEMES)[number];

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  themes: readonly Theme[];
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "zinc",
  setTheme: () => {},
  themes: THEMES,
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var t=localStorage.getItem('juggm-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
      }}
    />
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("zinc");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("juggm-theme") as Theme | null;
    if (saved && THEMES.includes(saved as any)) {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem("juggm-theme", t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const THEME_CONFIG: Record<Theme, { name: string; dot: string; accent: string }> = {
  zinc: { name: "Zinc", dot: "#a78bfa", accent: "#a78bfa" },
  slate: { name: "Slate", dot: "#7c3aed", accent: "#7c3aed" },
  stone: { name: "Stone", dot: "#d97706", accent: "#d97706" },
  neutral: { name: "Neutral", dot: "#6366f1", accent: "#6366f1" },
  midnight: { name: "Midnight", dot: "#818cf8", accent: "#818cf8" },
  violet: { name: "Violet", dot: "#c084fc", accent: "#c084fc" },
  rose: { name: "Rose", dot: "#f43f5e", accent: "#f43f5e" },
  ocean: { name: "Ocean", dot: "#06b6d4", accent: "#06b6d4" },
  obsidian: { name: "Obsidian", dot: "#8b8cf8", accent: "#8b8cf8" },
};
