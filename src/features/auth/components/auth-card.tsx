import React from "react";
import { ThemeToggle, Brand } from "@/components/layout";

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
        <Brand size="sm" href="/" />
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
