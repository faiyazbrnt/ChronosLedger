import React from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { ThemeToggle } from "@/components/layout";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto relative animate-in fade-in zoom-in-95 duration-200">
      {/* Top Bar with Brand & Theme Toggle */}
      <div className="flex items-center justify-between mb-6 px-1">
        <Link href="/" className="flex items-center gap-2 text-foreground font-bold tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
            <CalendarClock className="h-4 w-4" />
          </div>
          <span>ChronosLedger</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="p-6 sm:p-8 bg-card text-card-foreground rounded-2xl shadow-sm border border-border">
        <div className="mb-6 space-y-1.5 text-center">
          <h1 className="text-2xl font-black tracking-tight text-foreground">{title}</h1>
          {description && <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
