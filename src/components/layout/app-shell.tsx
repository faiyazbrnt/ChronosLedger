import React from "react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/dashboard" className="font-bold text-lg text-primary tracking-tight">
            DTR &amp; Budget
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
              <Link href="/dashboard" className="hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/dtr" className="hover:text-primary transition-colors">
                DTR
              </Link>
              <Link href="/budget" className="hover:text-primary transition-colors">
                Budget
              </Link>
              <Link href="/settings" className="hover:text-primary transition-colors">
                Settings
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 pb-20 sm:pb-6">
        {children}
      </main>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/90 backdrop-blur-sm flex justify-around py-3 text-xs font-medium">
        <Link href="/dashboard" className="hover:text-primary">
          Dashboard
        </Link>
        <Link href="/dtr" className="hover:text-primary">
          DTR
        </Link>
        <Link href="/budget" className="hover:text-primary">
          Budget
        </Link>
        <Link href="/settings" className="hover:text-primary">
          Settings
        </Link>
      </nav>
    </div>
  );
}
