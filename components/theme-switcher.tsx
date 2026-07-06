"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as Theme;
    if (saved) {
      setTheme(saved);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    const root = document.documentElement;
    root.classList.remove("dark");

    if (newTheme !== "light") {
      root.classList.add(newTheme);
    }
  };

  if (!mounted) {
    return (
      <div className="w-16 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" />
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-full bg-zinc-100/80 dark:bg-zinc-850/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 transition-all duration-300">
      <button
        onClick={() => changeTheme("light")}
        className={`p-1.5 rounded-full transition-all duration-200 ${
          theme === "light"
            ? "bg-white text-zinc-900 shadow-sm"
            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        }`}
        title="Light Mode"
        aria-label="Light Mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => changeTheme("dark")}
        className={`p-1.5 rounded-full transition-all duration-200 ${
          theme === "dark"
            ? "bg-zinc-900 dark:bg-zinc-700 text-white shadow-sm"
            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        }`}
        title="Dark Mode"
        aria-label="Dark Mode"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
