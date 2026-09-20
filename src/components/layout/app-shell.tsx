"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Wallet,
  Settings,
  User,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { ModuleNavLink } from "./module-nav-link";
import { Brand } from "@/components/ui/system-logo";

interface AppShellProps {
  children: React.ReactNode;
  userSlot?: React.ReactNode;
}

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "DTR",
    href: "/dtr",
    icon: Clock,
  },
  {
    name: "Budget",
    href: "/budget",
    icon: Wallet,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function AppShell({ children, userSlot }: AppShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() =>
      drawerRef.current?.querySelector<HTMLElement>("button")?.focus()
    );

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const closeAtDesktop = () => {
      if (desktopQuery.matches) setIsMobileMenuOpen(false);
    };

    desktopQuery.addEventListener("change", closeAtDesktop);
    return () => desktopQuery.removeEventListener("change", closeAtDesktop);
  }, []);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar Navigation (Hidden on mobile) */}
      <aside
        className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50 border-r border-border bg-card/60 backdrop-blur-md"
        aria-label="Desktop Navigation"
      >
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Brand Header */}
          <div className="px-6 pb-5 border-b border-border/80 flex items-center">
            <Brand
              size="lg"
              href="/dashboard"
            />
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 flex-1 px-4 space-y-1.5" aria-label="Main Menu">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <ModuleNavLink
                  key={item.name}
                  href={item.href}
                  label={item.name}
                  icon={item.icon}
                  isActive={isActive}
                />
              );
            })}
          </nav>

          {/* Sidebar Footer with Theme Toggle & User Info */}
          <div className="p-4 border-t border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 border border-border">
                  <User className="h-4 w-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-foreground truncate">
                    Account
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Online
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>
            {userSlot && <div className="pt-0.5">{userSlot}</div>}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="sticky top-0 z-40 md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card/85 backdrop-blur-md">
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <Brand size="sm" href="/dashboard" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {userSlot}
          </div>
        </header>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-foreground/25 backdrop-blur-[1px]"
              aria-label="Close navigation menu"
              onClick={closeMobileMenu}
            />
            <div
              ref={drawerRef}
              id="mobile-navigation-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-border bg-card p-4 shadow-2xl animate-in slide-in-from-left duration-200 motion-reduce:animate-none"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <Brand size="sm" href="/dashboard" />
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Close navigation menu"
                  onClick={closeMobileMenu}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <nav className="mt-5 space-y-2" aria-label="Mobile navigation links">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href || pathname?.startsWith(`${item.href}/`);

                  return (
                    <ModuleNavLink
                      key={item.name}
                      href={item.href}
                      label={item.name}
                      icon={item.icon}
                      isActive={isActive}
                      onClick={closeMobileMenu}
                    />
                  );
                })}
              </nav>
              <div className="mt-auto border-t border-border pt-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}

        {/* Page Main Content */}
        <main
          id="main-content"
          className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8 focus:outline-none"
          tabIndex={-1}
        >
          {children}
        </main>

        {/* Mobile Bottom Tab Bar (Touch targets ≥ 44px, sticky bottom) */}
      </div>
    </div>
  );
}
