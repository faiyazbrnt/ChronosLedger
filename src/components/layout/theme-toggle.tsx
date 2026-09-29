"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { motion, shouldSkipMotion } from "@/lib/motion";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/60 text-foreground opacity-60"
        aria-label="Toggle theme (loading)"
        disabled
      >
        <Sun className="h-4 w-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => {
        if (!shouldSkipMotion()) {
          document.documentElement.classList.add("theme-changing");
          window.setTimeout(() => document.documentElement.classList.remove("theme-changing"), motion.duration.standard);
        }
        setTheme(isDark ? "light" : "dark");
      }}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer motion-press motion-theme ${className ?? ""}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode (currently ${theme})`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span className="relative h-4 w-4">
        <Sun className={`absolute inset-0 h-4 w-4 motion-theme-icon text-foreground ${isDark ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`} />
        <Moon className={`absolute inset-0 h-4 w-4 motion-theme-icon text-primary ${isDark ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`} />
      </span>
    </button>
  );
}
