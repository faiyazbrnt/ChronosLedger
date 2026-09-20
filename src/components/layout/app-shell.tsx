"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Wallet,
  Settings,
  User,
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
          <Brand size="sm" href="/dashboard" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {userSlot}
          </div>
        </header>

        {/* Page Main Content */}
        <main
          id="main-content"
          className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8 focus:outline-none"
          tabIndex={-1}
        >
          {children}
        </main>

        {/* Mobile Bottom Tab Bar (Touch targets ≥ 44px, sticky bottom) */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg px-3 py-1.5 shadow-lg"
          aria-label="Mobile Navigation"
        >
          <div className="flex items-center justify-around">
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
                  compact
                />
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
