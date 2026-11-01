"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const syncTheme = () => {
      const darkActive = document.documentElement.classList.contains("dark");
      setIsDark(darkActive);
    };

    syncTheme();
    window.addEventListener("themechange", syncTheme);
    return () => window.removeEventListener("themechange", syncTheme);
  }, []);

  const handleToggle = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);

    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("vf_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("vf_theme", "light");
    }

    // Dispatch global theme change event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("themechange"));
    }
  };

  if (!mounted) {
    return (
      <div className={`h-8 w-20 rounded-xl bg-slate-200/50 dark:bg-white/5 animate-pulse ${className}`} />
    );
  }

  return (
    <button
      onClick={handleToggle}
      type="button"
      aria-label={isDark ? "Switch to Light Mode (Daytime Experience)" : "Switch to Dark Mode (Spider-Verse Night Universe)"}
      title={isDark ? "Switch to Light Mode (Daytime Experience)" : "Switch to Dark Mode (Spider-Verse Night Universe)"}
      className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 border shadow-sm ${
        isDark
          ? "bg-slate-900/80 hover:bg-slate-800 text-sky-300 border-sky-500/30 hover:border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]"
          : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300/80 hover:border-rose-400 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      } ${className}`}
    >
      {isDark ? (
        <>
          <Moon className="w-3.5 h-3.5 text-sky-400 transition-transform duration-300 group-hover:-rotate-12" />
          <span className="font-mono text-[11px] tracking-wide">Night</span>
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-500 transition-transform duration-300 group-hover:rotate-45" />
          <span className="font-mono text-[11px] tracking-wide text-slate-800">Day</span>
        </>
      )}
    </button>
  );
}
