"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Palette, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { shouldSkipMotion } from "@/lib/motion";

interface ThemeOption {
  id: "light" | "dark" | "golden" | "rose";
  name: string;
  description: string;
  bgHex: string;
  navHex: string;
}

const THEMES: ThemeOption[] = [
  {
    id: "light",
    name: "Light",
    description: "White canvas",
    bgHex: "#FFFFFF",
    navHex: "#131B21",
  },
  {
    id: "dark",
    name: "Dark",
    description: "Black canvas",
    bgHex: "#000000",
    navHex: "#090D11",
  },
  {
    id: "golden",
    name: "Soft Golden Yellow",
    description: "#F1DE9A canvas & #202215 nav",
    bgHex: "#F1DE9A",
    navHex: "#202215",
  },
  {
    id: "rose",
    name: "Dusty Rose",
    description: "#CB8899 canvas & #FAEBD8 nav",
    bgHex: "#CB8899",
    navHex: "#FAEBD8",
  },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close when clicking outside or pressing Escape
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/60 text-foreground opacity-60"
        aria-label="Theme selector (loading)"
        disabled
      >
        <Palette className="h-4 w-4" />
      </button>
    );
  }

  const currentTheme: ThemeOption = THEMES.find((t) => t.id === theme) ?? THEMES[0]!;

  const handleSelectTheme = (newTheme: ThemeOption["id"]) => {
    if (!shouldSkipMotion()) {
      document.documentElement.classList.add("theme-changing");
      window.setTimeout(() => {
        document.documentElement.classList.remove("theme-changing");
      }, 260);
    }
    setTheme(newTheme);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer motion-press motion-theme ${className ?? ""}`}
        aria-label={`Change theme. Current theme is ${currentTheme.name}`}
        title={`Theme: ${currentTheme.name}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="relative flex items-center justify-center h-4 w-4">
          {/* Circular preview swatch of current theme */}
          <span
            className="h-3.5 w-3.5 rounded-full border border-border shadow-xs overflow-hidden flex"
            aria-hidden="true"
          >
            <span
              className="w-1/2 h-full"
              style={{ backgroundColor: currentTheme.bgHex }}
            />
            <span
              className="w-1/2 h-full"
              style={{ backgroundColor: currentTheme.navHex }}
            />
          </span>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="theme-menu-label"
            initial={
              shouldSkipMotion()
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.95, y: -6 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              shouldSkipMotion()
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: -4 }
            }
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-border bg-popover p-1.5 shadow-xl motion-popover"
          >
            <div className="px-3 py-2 border-b border-border/70 mb-1">
              <span
                id="theme-menu-label"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Select Theme
              </span>
            </div>

            <div className="space-y-1">
              {THEMES.map((opt) => {
                const isSelected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectTheme(opt.id)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer motion-press ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Split color swatch preview */}
                      <span
                        className="h-4 w-4 shrink-0 rounded-full border border-border shadow-xs overflow-hidden flex"
                        aria-hidden="true"
                      >
                        <span
                          className="w-1/2 h-full"
                          style={{ backgroundColor: opt.bgHex }}
                        />
                        <span
                          className="w-1/2 h-full"
                          style={{ backgroundColor: opt.navHex }}
                        />
                      </span>

                      <div className="min-w-0">
                        <div className="truncate font-medium">{opt.name}</div>
                        <div
                          className={`text-[10px] truncate ${
                            isSelected
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          {opt.description}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
